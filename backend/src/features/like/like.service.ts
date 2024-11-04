import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Like } from '@prisma/client';

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  async create(micropostId: number, userId: number): Promise<Like> {
    try {
      return await this.prisma.like.create({
        data: {
          user: { connect: { id: userId } },
          micropost: { connect: { id: micropostId } },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('User has already liked this micropost');
      }
      throw error;
    }
  }

  async remove(micropostId: number, userId: number): Promise<Like> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_micropostId: {
          userId: userId,
          micropostId: micropostId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    return this.prisma.like.delete({
      where: {
        id: like.id,
      },
    });
  }

  async getLikeCount(micropostId: number): Promise<number> {
    return this.prisma.like.count({
      where: { micropostId },
    });
  }

  async hasUserLiked(micropostId: number, userId: number): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_micropostId: {
          userId: userId,
          micropostId: micropostId,
        },
      },
    });
    return !!like;
  }
}
