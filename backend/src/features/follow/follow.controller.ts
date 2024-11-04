import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('follow')
@UseGuards(AuthGuard)
export class FollowController {
  constructor(private followService: FollowService) {}

  @Post(':id')
  async follow(@User() user, @Param('id') followedId: string) {
    return this.followService.follow(user.id, parseInt(followedId));
  }

  @Delete(':id')
  async unfollow(@User() user, @Param('id') followedId: string) {
    return this.followService.unfollow(user.id, parseInt(followedId));
  }

  @Get('followers/:id')
  async getFollowers(@Param('id') userId: string) {
    return this.followService.getFollowers(parseInt(userId));
  }

  @Get('following/:id')
  async getFollowing(@Param('id') userId: string) {
    return this.followService.getFollowing(parseInt(userId));
  }

  @Get('is-following/:id')
  async isFollowing(@User() user, @Param('id') followedId: string) {
    return this.followService.isFollowing(user.id, parseInt(followedId));
  }
}
