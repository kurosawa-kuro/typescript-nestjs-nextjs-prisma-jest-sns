import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service'; // パスを修正
import { Comment, Prisma } from '@prisma/client';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return this.prisma.comment.create({ data });
  }

  async findAll(micropostId: number): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { micropostId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: number,
    data: Prisma.CommentUpdateInput,
    userId: number,
  ): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }
    return this.prisma.comment.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, userId: number): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
