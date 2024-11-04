import { Test, TestingModule } from '@nestjs/testing';
import { FollowService } from '@/features/follow/follow.service';
import { PrismaService } from '@/core/database/prisma.service';

describe('FollowService', () => {
  let followService: FollowService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        {
          provide: PrismaService,
          useValue: {
            follow: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    followService = module.get<FollowService>(FollowService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('follow', () => {
    it('should create a new follow relation if it does not exist', async () => {
      const mockFollower = { id: 1, name: 'Follower' };
      const mockFollowed = { id: 2, name: 'Followed' };

      (prismaService.follow.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.follow.create as jest.Mock).mockResolvedValue({ followerId: 1, followingId: 2 });
      (prismaService.follow.findMany as jest.Mock).mockResolvedValue([{ following: mockFollowed }]);

      const result = await followService.follow(mockFollower.id, mockFollowed.id);

      expect(prismaService.follow.findUnique).toHaveBeenCalled();
      expect(prismaService.follow.create).toHaveBeenCalled();
      expect(result).toEqual([mockFollowed]);
    });

    it('should not create a new follow relation if it already exists', async () => {
      const mockFollower = { id: 1, name: 'Follower' };
      const mockFollowed = { id: 2, name: 'Followed' };

      (prismaService.follow.findUnique as jest.Mock).mockResolvedValue({ followerId: 1, followingId: 2 });
      (prismaService.follow.findMany as jest.Mock).mockResolvedValue([{ following: mockFollowed }]);

      const result = await followService.follow(mockFollower.id, mockFollowed.id);

      expect(prismaService.follow.findUnique).toHaveBeenCalled();
      expect(prismaService.follow.create).not.toHaveBeenCalled();
      expect(result).toEqual([mockFollowed]);
    });
  });

  describe('unfollow', () => {
    it('should delete the follow relation if it exists', async () => {
      const mockFollower = { id: 1, name: 'Follower' };
      const mockFollowed = { id: 2, name: 'Followed' };

      (prismaService.follow.findUnique as jest.Mock).mockResolvedValue({ followerId: 1, followingId: 2 });
      (prismaService.follow.delete as jest.Mock).mockResolvedValue({ followerId: 1, followingId: 2 });
      (prismaService.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await followService.unfollow(mockFollower.id, mockFollowed.id);

      expect(prismaService.follow.findUnique).toHaveBeenCalled();
      expect(prismaService.follow.delete).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should not delete the follow relation if it does not exist', async () => {
      const mockFollower = { id: 1, name: 'Follower' };
      const mockFollowed = { id: 2, name: 'Followed' };

      (prismaService.follow.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.follow.findMany as jest.Mock).mockResolvedValue([]);

      const result = await followService.unfollow(mockFollower.id, mockFollowed.id);

      expect(prismaService.follow.findUnique).toHaveBeenCalled();
      expect(prismaService.follow.delete).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getFollowers', () => {
    it('should return an array of followers', async () => {
      const mockUser = { id: 1, name: 'User' };
      const mockFollowers = [
        { follower: { id: 2, name: 'Follower 1', email: 'follower1@example.com', profile: { avatarPath: 'avatar1.jpg' } } },
        { follower: { id: 3, name: 'Follower 2', email: 'follower2@example.com', profile: { avatarPath: 'avatar2.jpg' } } },
      ];

      (prismaService.follow.findMany as jest.Mock).mockResolvedValue(mockFollowers);

      const result = await followService.getFollowers(mockUser.id);

      expect(prismaService.follow.findMany).toHaveBeenCalledWith({
        where: { followingId: mockUser.id },
        select: {
          follower: {
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
      });
      expect(result).toEqual(mockFollowers.map(({ follower }) => follower));
    });
  });
});
