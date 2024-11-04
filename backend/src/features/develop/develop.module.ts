import { Module } from '@nestjs/common';
import { DevelopController } from './develop.controller';
import { DevelopService } from './develop.service';
import { PrismaService } from '@/core/database/prisma.service';

@Module({
  controllers: [DevelopController],
  providers: [DevelopService, PrismaService],
})
export class DevelopModule {}
