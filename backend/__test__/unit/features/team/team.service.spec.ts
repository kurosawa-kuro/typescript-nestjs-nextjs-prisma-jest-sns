import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from '@/features/team/team.service';
import { PrismaService } from '@/core/database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserService } from '@/features/user/user.service';

describe('TeamService', () => {
  let teamService: TeamService;
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        UserService,
        {
          provide: PrismaService,
          useValue: {
            team: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            teamMember: {
              create: jest.fn(),
              findUnique: jest.fn(), // Add this line
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    teamService = module.get<TeamService>(TeamService);
    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('createTeam', () => {
    it('should create a new team', async () => {
      const mockTeam = { id: 1, name: 'Test Team' }; // ownerId を削除
      (prismaService.team.create as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamService.create({ name: 'Test Team' });

      expect(prismaService.team.create).toHaveBeenCalledWith({
        data: { name: 'Test Team' }, // ownerId を削除
        include: { members: true }, // include を追加
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe('getTeam', () => {
    it('should return a team if it exists', async () => {
      const mockTeam = { id: 1, name: 'Test Team', ownerId: 1 };
      (prismaService.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamService.findById(1);

      expect(prismaService.team.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockTeam);
    });
  });

  describe('all', () => {
    it('should return all teams', async () => {
      const mockTeams = [
        { id: 1, name: 'Test Team', members: [] }, // members を追加
        { id: 2, name: 'Test Team 2', members: [] }, // members を追加
      ];

      (prismaService.team.findMany as jest.Mock).mockResolvedValue(mockTeams);

      const result = await teamService.all();

      expect(result).toEqual(mockTeams);
    });
  });

  describe('updateTeamPrivacy', () => {
    it('should update team privacy', async () => {
      const mockTeam = { id: 1, name: 'Test Team', description: 'Private team' };
      (prismaService.team.findUnique as jest.Mock).mockResolvedValue(mockTeam);
      (prismaService.team.update as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamService.updateTeamPrivacy(1, true);

      expect(prismaService.team.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaService.team.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { description: 'Private team' },
      });
      expect(result).toEqual(mockTeam);
    });

    it('should throw NotFoundException if team does not exist', async () => {
      (prismaService.team.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(teamService.updateTeamPrivacy(1, true)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMember', () => {
    it('should add a member to the team', async () => {
      const mockTeam = { id: 1, name: 'Test Team', members: [] };
      const updatedTeam = {
        ...mockTeam,
        members: [
          {
            id: 2,
            name: 'User',
            email: 'user@example.com',
            profile: { avatarPath: 'path/to/avatar' },
            joinedAt: new Date(),
          },
        ],
      };

      (prismaService.teamMember.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.team.update as jest.Mock).mockResolvedValue({
        ...mockTeam,
        members: [
          {
            user: {
              id: 2,
              name: 'User',
              email: 'user@example.com',
              profile: { avatarPath: 'path/to/avatar' },
            },
            joinedAt: new Date(),
          },
        ],
      });

      const result = await teamService.addMember(1, 2);

      expect(result).toEqual(updatedTeam);
    });

    it('should throw BadRequestException if user is already a member', async () => {
      const existingMember = { userId: 2, teamId: 1 };
      (prismaService.teamMember.findUnique as jest.Mock).mockResolvedValue(existingMember);

      await expect(teamService.addMember(1, 2)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeMember', () => {
    it('should remove a member from the team', async () => {
      const mockTeam = { id: 1, name: 'Test Team', members: [{ user: { id: 2, name: 'User', email: 'user@example.com', profile: { avatarPath: 'path/to/avatar' } }, joinedAt: new Date() }] };
      const updatedTeam = { ...mockTeam, members: [] };

      (prismaService.team.update as jest.Mock).mockResolvedValue(updatedTeam);

      const result = await teamService.removeMember(1, 2);

      expect(prismaService.team.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          members: {
            delete: {
              userId_teamId: {
                userId: 2,
                teamId: 1,
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
      expect(result).toEqual(updatedTeam);
    });
  });
});
