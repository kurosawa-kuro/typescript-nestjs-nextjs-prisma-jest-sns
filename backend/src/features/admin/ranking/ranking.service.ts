import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class RankingService {
  constructor(private prisma: PrismaService) {}

  // マイクロポストのランキングを取得
  async getMicropostRanking() {
    const microposts = await this.prisma.micropost.findMany({
      select: {
        id: true,
        title: true,
        imagePath: true,
        createdAt: true,
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
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // レスポンスの形式を変換
    return microposts.map((post) => ({
      ...post,
      likesCount: post._count.likes,
      _count: undefined, // _countプロパティを削除
    }));
  }

  async getMostViewRanking() {
    const microposts = await this.prisma.micropost.findMany({
      select: {
        id: true,
        title: true,
        imagePath: true,
        viewCount: true,
        createdAt: true,
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
          select: {
            views: true,
          },
        },
      },
      orderBy: {
        views: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    // レスポンスの形式を変換
    return microposts.map((post) => ({
      ...post,
      viewsCount: post._count.views,
      _count: undefined, // _countプロパティを削除
    }));
  }

  async getCategoryRanking() {
    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            microposts: true,
          },
        },
        microposts: {
          select: {
            micropost: {
              select: {
                id: true,
                title: true,
                imagePath: true,
                createdAt: true,
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
          },
          take: 3, // 各カテゴリの最新投稿を3件まで取得
          orderBy: {
            micropost: {
              createdAt: 'desc',
            },
          },
        },
      },
      orderBy: {
        microposts: {
          _count: 'desc',
        },
      },
      take: 10, // 上位10カテゴリを取得
    });

    // レスポンスの形式を変換
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      postCount: category._count.microposts,
      recentPosts: category.microposts.map(({ micropost }) => micropost),
      _count: undefined,
    }));
  }
}
