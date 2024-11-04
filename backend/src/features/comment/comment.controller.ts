import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment } from '@prisma/client';
import { AuthGuard } from '@/features/auth/guards/auth.guard';
import { User } from '@/features/auth/decorators/user.decorator';

@Controller('microposts/:micropostId/comments')
@UseGuards(AuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(
    @Param('micropostId') micropostId: string,
    @Body() commentData: Pick<Comment, 'content'>,
    @User() user: { id: number },
  ): Promise<Comment> {
    return this.commentService.create({
      content: commentData.content,
      micropost: { connect: { id: Number(micropostId) } },
      user: { connect: { id: user.id } },
    });
  }

  @Get()
  async findAll(@Param('micropostId') micropostId: string): Promise<Comment[]> {
    return this.commentService.findAll(Number(micropostId));
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() commentData: Pick<Comment, 'content'>,
    @User() user: { id: number },
  ): Promise<Comment> {
    return this.commentService.update(Number(id), commentData, user.id);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @User() user: { id: number },
  ): Promise<Comment> {
    return this.commentService.remove(Number(id), user.id);
  }
}
