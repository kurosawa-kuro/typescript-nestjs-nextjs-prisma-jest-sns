import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { Team, Prisma } from '@prisma/client';
import { BaseService } from '@/core/common/base.service';

@Injectable()
export class TeamService extends BaseService<
  Team,
  Prisma.TeamCreateInput,
  Prisma.TeamUpdateInput,
  Prisma.TeamWhereUniqueInput,
  Prisma.TeamWhereInput
> {
  protected entityName = 'Team';

  constructor(protected prisma: PrismaService) {
    super(prisma);
  }

  protected getRepository() {
    return this.prisma.team;
  }

  // Create (C)
  override async create(data: Prisma.TeamCreateInput): Promise<Team> {
    try {
      return await this.prisma.team.create({
        data,
        include: {
          members: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        throw new BadRequestException('Team name already exists');
      }
      throw error;
    }
  }

  // Read (R)
  override async all(): Promise<Team[]> {
    const teams = await this.prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: {
                  select: {
                    avatarPath: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return teams.map((team) => ({
      ...team,
      members: team.members.map((member) => ({
        ...member.user,
        joinedAt: member.joinedAt,
      })),
    })) as Team[];
  }

  // Update (U)
  async updateTeamPrivacy(id: number, isPrivate: boolean): Promise<Team> {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return this.prisma.team.update({
      where: { id },
      data: { description: isPrivate ? 'Private team' : undefined },
    });
  }

  // Delete (D)
  // Using the default destroy method from BaseService

  // Team Member operations
  async addMember(
    teamId: number,
    userId: number,
  ): Promise<Team & { members: any[] }> {
    // Check if the member already exists in the team
    const existingMember = await this.prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this team');
    }

    const result = await this.prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          create: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: {
                  select: {
                    avatarPath: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      ...result,
      members: result.members.map((member) => ({
        ...member.user,
        joinedAt: member.joinedAt,
      })),
    };
  }

  async removeMember(
    teamId: number,
    userId: number,
  ): Promise<Team & { members: any[] }> {
    const result = await this.prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          delete: {
            userId_teamId: {
              userId,
              teamId,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profile: {
                  select: {
                    avatarPath: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      ...result,
      members: result.members.map((member) => ({
        ...member.user,
        joinedAt: member.joinedAt,
      })),
    };
  }
}
