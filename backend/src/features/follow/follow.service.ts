import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  private async findFollowRelation(followerId: number, followedId: number) {
    return this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId: followedId },
      },
    });
  }

  private async createFollowRelation(followerId: number, followedId: number) {
    return this.prisma.follow.create({
      data: { followerId, followingId: followedId },
    });
  }

  private async deleteFollowRelation(followerId: number, followedId: number) {
    return this.prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId: followedId },
      },
    });
  }

  async follow(
    followerId: number,
    followedId: number,
  ): Promise<Partial<User>[]> {
    const existingFollow = await this.findFollowRelation(
      followerId,
      followedId,
    );

    if (!existingFollow) {
      await this.createFollowRelation(followerId, followedId);
    }

    return this.getFollowing(followerId);
  }

  async unfollow(
    followerId: number,
    followedId: number,
  ): Promise<Partial<User>[]> {
    const existingFollow = await this.findFollowRelation(
      followerId,
      followedId,
    );

    if (existingFollow) {
      await this.deleteFollowRelation(followerId, followedId);
    }

    return this.getFollowing(followerId);
  }

  async getFollowers(userId: number): Promise<Partial<User>[]> {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatarPath: true,
              },
            },
          },
        },
      },
    });

    return followers.map(({ follower }) => follower);
  }

  async getFollowing(userId: number): Promise<Partial<User>[]> {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                avatarPath: true,
              },
            },
          },
        },
      },
    });

    return following.map(({ following }) => following);
  }

  async isFollowing(followerId: number, followedId: number): Promise<boolean> {
    const follow = await this.findFollowRelation(followerId, followedId);
    return !!follow;
  }
}
