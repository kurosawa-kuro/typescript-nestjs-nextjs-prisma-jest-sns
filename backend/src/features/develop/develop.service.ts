import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { seed } from '../../../prisma/seed';

@Injectable()
export class DevelopService {
  constructor(private prisma: PrismaService) {}

  async resetDb() {
    await seed();
    return { message: 'Database has been reset.' };
  }
}
