import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/database/prisma.module';
import { AuthModule } from '@/features/auth/auth.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
