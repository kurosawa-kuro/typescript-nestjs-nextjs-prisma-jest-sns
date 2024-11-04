import { Test, TestingModule } from '@nestjs/testing';
import { TeamController } from '@/features/team/team.controller';
import { TeamService } from '@/features/team/team.service';
import { Prisma } from '@prisma/client';

describe('TeamController', () => {
  let teamController: TeamController;
  let teamService: TeamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        {
          provide: TeamService,
          useValue: {
            all: jest.fn(),
            create: jest.fn(),
            updateTeamPrivacy: jest.fn(),
            addMember: jest.fn(),
            removeMember: jest.fn(),
          },
        },
      ],
    }).compile();

    teamController = module.get<TeamController>(TeamController);
    teamService = module.get<TeamService>(TeamService);
  });

  describe('index', () => {
    it('should return all teams', async () => {
      const mockTeams = [{ id: 1, name: 'Test Team' }];
      (teamService.all as jest.Mock).mockResolvedValue(mockTeams);

      const result = await teamController.index();

      expect(result).toEqual(mockTeams);
      expect(teamService.all).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new team', async () => {
      const mockTeam = { id: 1, name: 'New Team' };
      const createInput: Prisma.TeamCreateInput = { name: 'New Team' };
      (teamService.create as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamController.create(createInput);

      expect(result).toEqual(mockTeam);
      expect(teamService.create).toHaveBeenCalledWith(createInput);
    });
  });

  describe('updateTeamPrivacy', () => {
    it('should update team privacy', async () => {
      const mockTeam = { id: 1, name: 'Test Team', description: 'Private team' };
      (teamService.updateTeamPrivacy as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamController.updateTeamPrivacy(1, true);

      expect(result).toEqual(mockTeam);
      expect(teamService.updateTeamPrivacy).toHaveBeenCalledWith(1, true);
    });
  });

  describe('addMember', () => {
    it('should add a member to the team', async () => {
      const mockTeam = { id: 1, name: 'Test Team', members: [] };
      (teamService.addMember as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamController.addMember(1, 2);

      expect(result).toEqual(mockTeam);
      expect(teamService.addMember).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('removeMember', () => {
    it('should remove a member from the team', async () => {
      const mockTeam = { id: 1, name: 'Test Team', members: [] };
      (teamService.removeMember as jest.Mock).mockResolvedValue(mockTeam);

      const result = await teamController.removeMember(1, 2);

      expect(result).toEqual(mockTeam);
      expect(teamService.removeMember).toHaveBeenCalledWith(1, 2);
    });
  });
});

