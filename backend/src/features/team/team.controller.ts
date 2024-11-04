import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { Team, Prisma } from '@prisma/client';
import { BaseController } from '@/core/common/base.controller';
import { Public } from '@/features/auth/decorators/public.decorator';

@Controller('teams')
export class TeamController extends BaseController<Team> {
  constructor(private readonly teamService: TeamService) {
    super(teamService);
  }

  @Public()
  @Get()
  override async index(): Promise<Team[]> {
    return this.teamService.all();
  }

  @Post()
  override async create(@Body() data: Prisma.TeamCreateInput): Promise<Team> {
    return this.teamService.create(data);
  }

  @Put(':id/privacy')
  async updateTeamPrivacy(
    @Param('id', ParseIntPipe) id: number,
    @Body('isPrivate') isPrivate: boolean,
  ): Promise<Team> {
    return this.teamService.updateTeamPrivacy(id, isPrivate);
  }

  @Post(':id/members')
  async addMember(
    @Param('id', ParseIntPipe) teamId: number,
    @Body('userId', ParseIntPipe) userId: number,
  ): Promise<Team> {
    return this.teamService.addMember(teamId, userId);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id', ParseIntPipe) teamId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Team> {
    return this.teamService.removeMember(teamId, userId);
  }
}
