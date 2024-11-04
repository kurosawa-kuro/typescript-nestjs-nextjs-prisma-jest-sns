import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Category, Micropost, Prisma, User, UserProfile } from '@prisma/client';
import {
  DetailedMicropost,
  Comment,
  BasicMicropost
} from '@/shared/types/micropost.types';

@Injectable()
export class MicropostService {
  constructor(private prisma: PrismaService) {}

  private readonly micropostInclude = {
    user: {
      select: {
        id: true,
        name: true,
        profile: {
          select: {
            avatarPath: true,
          },
        },
      },
    },
    _count: {
      select: { likes: true, views: true },
    },
    comments: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                avatarPath: true,
              },
            },
          },
        },
      },
    },
    categories: {
      include: {
        category: true,
      },
    },
  };

  private transformToDetailedMicropost(micropost: any, currentUserId?: number): DetailedMicropost {
    const basicMicropost: BasicMicropost = {
      id: micropost.id,
      title: micropost.title,
      imagePath: micropost.imagePath,
      createdAt: micropost.createdAt.toISOString(),
      updatedAt: micropost.updatedAt.toISOString(),
    };

    return {
      ...basicMicropost,
      likesCount: micropost._count.likes,
      viewsCount: micropost._count.views,
      isLiked: currentUserId ? micropost.likes?.length > 0 : undefined,
      user: {
        id: micropost.user.id,
        name: micropost.user.name,
      },
      comments: micropost.comments.map((comment) => this.transformToComment(comment)),
      categories: micropost.categories.map(({ category }) => ({
        id: category.id,
        name: category.name,
      })),
    };
  }

  private transformToComment(comment: any): Comment {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      user: {
        id: comment.user.id,
        name: comment.user.name,
        profile: {
          avatarPath: comment.user.profile?.avatarPath
        }
      }
    };
  }

  async create(data: { title: string; userId: number; imagePath: string | null; categoryIds: number[] }): Promise<DetailedMicropost> {
    const micropost = await this.prisma.micropost.create({
      data: {
        title: data.title,
        imagePath: data.imagePath,
        user: { connect: { id: data.userId } },
        categories: {
          create: data.categoryIds.map(id => ({
            category: { connect: { id } }
          }))
        }
      },
      include: this.micropostInclude,
    });

    return this.transformToDetailedMicropost(micropost);
  }

  async all(
    search?: string, 
    sortBy: 'likes' | 'mostView' | 'date' = 'date'
  ): Promise<DetailedMicropost[]> {
    let microposts = await this.prisma.micropost.findMany({
      where: search ? {
        title: { contains: search, mode: 'insensitive' }
      } : undefined,
      include: this.micropostInclude,
      orderBy: (() => {
        switch (sortBy) {
          case 'likes':
            return {
              likes: {
                _count: 'desc'
              }
            };
          case 'mostView':
            return {
              views: {
                _count: 'desc'
              }
            };
          default:
            return { createdAt: 'desc' };
        }
      })(),
    });

    // データベースでのソートが機能しない場合のフォールバック
    if (sortBy === 'likes') {
      microposts = microposts.sort((a, b) => b._count.likes - a._count.likes);
    } else if (sortBy === 'mostView') {
      microposts = microposts.sort((a, b) => b._count.views - a._count.views);
    }

    return microposts.map(micropost => this.transformToDetailedMicropost(micropost));
  }

  async findById(id: number, currentUserId?: number): Promise<DetailedMicropost | null> {
    const micropost = await this.prisma.micropost.findUnique({
      where: { id },
      include: {
        ...this.micropostInclude,
        likes: currentUserId ? {
          where: { userId: currentUserId },
          select: { userId: true },
        } : false,
      },
    });

    if (!micropost) return null;
    return this.transformToDetailedMicropost(micropost, currentUserId);
  }

  async destroy(id: number): Promise<Micropost> {
    try {
      return await this.prisma.micropost.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Micropost with ID ${id} not found`);
      }
      throw error;
    }
  }

  async findByUserId(userId: number): Promise<DetailedMicropost[]> {
    const microposts = await this.prisma.micropost.findMany({
      where: { userId },
      include: this.micropostInclude,
      orderBy: { createdAt: 'desc' },
    });

    return microposts.map(micropost => this.transformToDetailedMicropost(micropost));
  }
}
