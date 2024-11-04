import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';

@Injectable()
export class MicropostViewService {
  constructor(private readonly prisma: PrismaService) {}

  async recordView(micropostId: number, ipAddress: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // まずマイクロポストの存在を確認
        const micropost = await tx.micropost.findUnique({
          where: { id: micropostId },
        });

        if (!micropost) {
          throw new NotFoundException(
            `Micropost with ID ${micropostId} not found`,
          );
        }

        // 既存の閲覧記録を確認
        const existingView = await tx.micropostView.findUnique({
          where: {
            micropostId_ipAddress: {
              micropostId,
              ipAddress,
            },
          },
        });

        // 新しい閲覧の場合のみ記録
        if (!existingView) {
          await tx.micropostView.create({
            data: {
              micropostId,
              ipAddress,
            },
          });

          await tx.micropost.update({
            where: { id: micropostId },
            data: { viewCount: { increment: 1 } },
          });

          return { success: true, message: 'View recorded successfully' };
        }

        return { success: true, message: 'View already recorded' };
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Failed to record view:', error);
      return { success: false, error: 'Failed to record view' };
    }
  }

  async getViewCount(micropostId: number): Promise<number> {
    const count = await this.prisma.micropostView.count({
      where: { micropostId },
    });
    return count;
  }
}
