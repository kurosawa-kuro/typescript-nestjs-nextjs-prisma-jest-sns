import { Module } from '@nestjs/common';
import { MicropostViewService } from './micropost-view.service';
import { MicropostViewController } from './micropost-view.controller';
import { PrismaModule } from '@/core/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MicropostViewController],
  providers: [MicropostViewService],
  exports: [MicropostViewService],
})
export class MicropostViewModule {}
