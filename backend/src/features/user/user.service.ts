import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import { BaseService } from '@/core/common/base.service';
import * as bcrypt from 'bcryptjs';
import {
  UserWithoutPassword,
  UserInfo,
  UserDetails,
} from '@/shared/types/user.types';

@Injectable()
export class UserService extends BaseService<
  UserWithoutPassword,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput
> {
  protected entityName = 'User';

  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  protected getRepository() {
    return this.prisma.user;
  }

  // ユーザー作成と認証
  override async create(data: Prisma.UserCreateInput): Promise<UserInfo> {
    try {
      const { password, ...userData } = data;
      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: await this.hashPassword(password),
          userRoles: {
            create: {
              role: {
                connectOrCreate: {
                  where: { name: 'general' },
                  create: { name: 'general' },
                },
              },
            },
          },
        },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      return this.mapUserToUserInfo(this.mapUserToUserWithRoles(user));
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserInfo | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        profile: true,
      },
    });

    if (user && (await this.verifyPassword(password, user.password))) {
      return this.mapUserToUserInfo({
        ...this.mapUserToUserWithRoles(user),
        profile: user.profile,
      });
    }

    return null;
  }

  // ユーザー情報取得
  override async all(): Promise<UserDetails[]> {
    return this.prisma.user
      .findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              avatarPath: true,
            },
          },
          userRoles: {
            select: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      })
      .then((users) =>
        users.map((user) => ({
          ...user,
          profile: { avatarPath: user.profile?.avatarPath || 'default_avatar.png' },
          userRoles: user.userRoles.map((ur) => ur.role.name),
        })),
      );
  }

  async findByIdWithRelations(
    id: number,
    currentUserId: number,
  ): Promise<UserWithoutPassword & { userRoles: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        profile: {
          select: {
            avatarPath: true,
          },
        },
        followers: {
          where: {
            followerId: currentUserId,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      userRoles: user.userRoles.map((ur) => ur.role.name),
    };
  }

  async findAllWithFollowStatus(currentUserId: number): Promise<UserDetails[]> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: currentUserId },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            avatarPath: true,
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        followers: {
          where: {
            followerId: currentUserId,
          },
        },
      },
    });

    return users.map(
      (user): UserDetails => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        userRoles: user.userRoles.map((ur) => ur.role.name),
        profile: { avatarPath: user.profile?.avatarPath || 'default_avatar.png' },
        isFollowing: user.followers.length > 0,
      }),
    );
  }

  // ユーザー情報更新
  async updateAvatar(id: number, filename: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.profile) {
      await this.prisma.userProfile.update({
        where: { userId: id },
        data: { avatarPath: filename },
      });
    } else {
      await this.prisma.userProfile.create({
        data: {
          userId: id,
          avatarPath: filename,
        },
      });
    }
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async updateUserRoles(
    userId: number,
    roleNames: string[],
    action: 'add' | 'remove'
  ): Promise<UserDetails> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 指定された名前のロールが存在するか確認
    const roles = await this.prisma.role.findMany({
      where: { name: { in: roleNames } }
    });

    if (roles.length !== roleNames.length) {
      throw new BadRequestException('One or more roles do not exist');
    }

    if (action === 'add') {
      // 新しい権限を追加
      await Promise.all(
        roles.map(role =>
          this.prisma.userRole.upsert({
            where: {
              userId_roleId: { userId, roleId: role.id }
            },
            create: { userId, roleId: role.id },
            update: {}
          })
        )
      );
    } else {
      // 指定された権限を削除
      await this.prisma.userRole.deleteMany({
        where: {
          userId,
          roleId: { in: roles.map(r => r.id) }
        }
      });
    }

    return this.findByIdWithRelationsAndFollowStatus(userId, null);
  }

  async getUserRoles(userId: number): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: { role: true }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.userRoles.map(ur => ur.role.name);
  }

  async getAvailableRoles(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  // フォロー関連
  async follow(
    followerId: number,
    followingId: number,
  ): Promise<UserDetails[]> {
    // Check if the follow relationship already exists
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      // Create the follow relationship if it doesn't exist
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
    }

    // Return the updated user list with follow status
    return this.findAllWithFollowStatus(followerId);
  }

  async unfollow(
    followerId: number,
    followingId: number,
  ): Promise<UserDetails[]> {
    // Check if the follow relationship exists
    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // Delete the follow relationship if it exists
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
    }

    // Return the updated user list with follow status
    return this.findAllWithFollowStatus(followerId);
  }

  async getFollowers(
    userId: number,
    currentUserId: number,
  ): Promise<UserDetails[]> {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            profile: {
              select: {
                avatarPath: true,
              },
            },
            userRoles: {
              select: {
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const followerIds = followers.map((f) => f.follower.id);
    const followedByCurrentUser = await this.prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: followerIds },
      },
    });

    const followedByCurrentUserSet = new Set(
      followedByCurrentUser.map((f) => f.followingId),
    );

    return followers.map(
      (follow): UserDetails => ({
        id: follow.follower.id,
        name: follow.follower.name,
        email: follow.follower.email,
        createdAt: follow.follower.createdAt,
        updatedAt: follow.follower.updatedAt,
        userRoles: follow.follower.userRoles.map((ur) => ur.role.name),
        profile: {
          avatarPath: follow.follower.profile?.avatarPath || 'default_avatar.png',
        },
        isFollowing: followedByCurrentUserSet.has(follow.follower.id),
      }),
    );
  }

  async getFollowing(userId: number): Promise<UserDetails[]> {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            profile: {
              select: {
                avatarPath: true,
              },
            },
            userRoles: {
              select: {
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return following.map(
      (follow): UserDetails => ({
        id: follow.following.id,
        name: follow.following.name,
        email: follow.following.email,
        createdAt: follow.following.createdAt,
        updatedAt: follow.following.updatedAt,
        userRoles: follow.following.userRoles.map((ur) => ur.role.name),
        profile: {
          avatarPath: follow.following.profile?.avatarPath || 'default_avatar.png',
        },
        isFollowing: true, // フォローしているユーザーのリストなので、常にtrueになります
      }),
    );
  }

  // ヘルパーメソッド
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private mapUserToUserWithRoles(
    user: any,
  ): UserWithoutPassword & { userRoles: Role[] } {
    const { password: _, userRoles, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      userRoles: userRoles.map((ur) => ur.role),
    };
  }

  mapUserToUserInfo(
    user: UserWithoutPassword & {
      userRoles: Role[];
      profile?: { avatarPath?: string };
    },
  ): UserDetails {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: { avatarPath: user.profile?.avatarPath || 'default_avatar.png' },
      userRoles: user.userRoles.map((role) => role.name),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isFollowing: false, // Add a default value or determine it based on context
    };
  }

  async findByIdWithRelationsAndFollowStatus(
    id: number,
    currentUserId?: number,  // nullableに変更
  ): Promise<UserDetails> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
        profile: {
          select: {
            avatarPath: true,
          },
        },
        // currentUserIdが存在する場合のみfollowersを含める
        ...(currentUserId && {
          followers: {
            where: {
              followerId: currentUserId,
            },
          },
        }),
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      userRoles: user.userRoles.map((ur) => ur.role.name),
      profile: { avatarPath: user.profile?.avatarPath || 'default_avatar.png' },
      // followersが存在する場合のみチェック
      isFollowing: user.followers ? user.followers.length > 0 : false,
    };
  }
}
