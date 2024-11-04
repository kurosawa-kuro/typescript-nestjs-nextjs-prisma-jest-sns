import { Module } from '@nestjs/common';
import { MicropostController } from './micropost.controller';
import { MicropostService } from './micropost.service';
import { PrismaService } from '@/core/database/prisma.service';

@Module({
  controllers: [MicropostController],
  providers: [MicropostService, PrismaService],
  exports: [MicropostService],
})
export class MicropostModule {}
