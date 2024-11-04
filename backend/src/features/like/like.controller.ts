import { Controller, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { LikeService } from './like.service';
import { AuthGuard } from '@/features/auth/guards/auth.guard';
import { User } from '@/features/auth/decorators/user.decorator';

@Controller('microposts/:micropostId/likes')
@UseGuards(AuthGuard)
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Post()
  async create(
    @Param('micropostId') micropostId: string,
    @User() user: { id: number },
  ) {
    return this.likeService.create(Number(micropostId), user.id);
  }

  @Delete()
  async remove(
    @Param('micropostId') micropostId: string,
    @User() user: { id: number },
  ) {
    return this.likeService.remove(Number(micropostId), user.id);
  }
}
