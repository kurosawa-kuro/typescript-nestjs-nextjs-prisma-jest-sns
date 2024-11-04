import { Module } from '@nestjs/common';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { PrismaModule } from '@/core/database/prisma.module';
import { AuthModule } from '@/features/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FollowController],
  providers: [FollowService],
  exports: [FollowService],
})
export class FollowModule {}
