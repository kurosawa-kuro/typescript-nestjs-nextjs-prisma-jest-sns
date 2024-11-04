import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CategoryWithMicroposts } from '../../shared/types/micropost.types';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // カテゴリー作成
  async create(data: { name: string }): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  async findAll() {
    return this.prisma.category.findMany();
  }

  async findOne(id: number): Promise<CategoryWithMicroposts> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        microposts: {
          include: {
            micropost: {
              include: {
                _count: {
                  select: {
                    likes: true,
                    views: true
                  }
                },
                user: {
                  include: {
                    profile: {
                      select: {
                        avatarPath: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!category) throw new NotFoundException();

    return {
      id: category.id,
      name: category.name,
      microposts: category.microposts.map(relation => ({
        id: relation.micropost.id,
        title: relation.micropost.title,
        imagePath: relation.micropost.imagePath || '',
        createdAt: relation.micropost.createdAt.toISOString(),
        updatedAt: relation.micropost.updatedAt.toISOString(),
        likesCount: relation.micropost._count.likes,
        viewsCount: relation.micropost._count.views,
        isLiked: false,
        user: {
          id: relation.micropost.user.id,
          name: relation.micropost.user.name,
          profile: {
            avatarPath: relation.micropost.user.profile?.avatarPath || 'default_avatar.png'
          }
        }
      }))
    };
  }
} 