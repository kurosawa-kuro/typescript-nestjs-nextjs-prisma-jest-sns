import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // PrismaModule は @Global() なのでここでのインポートは不要
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
