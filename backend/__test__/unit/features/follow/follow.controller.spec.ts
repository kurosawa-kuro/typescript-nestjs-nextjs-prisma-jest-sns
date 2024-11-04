import { Test, TestingModule } from '@nestjs/testing';
import { FollowController } from '@/features/follow/follow.controller';
import { FollowService } from '@/features/follow/follow.service';
import { AuthGuard } from '@/features/auth/guards/auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('FollowController', () => {
  let followController: FollowController;
  let followService: FollowService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowController],
      providers: [
        {
          provide: FollowService,
          useValue: {
            follow: jest.fn(),
            unfollow: jest.fn(),
            getFollowers: jest.fn(),
            getFollowing: jest.fn(),
            isFollowing: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { id: 1 }; // Mock user
          return true;
        },
      })
      .compile();

    followController = module.get<FollowController>(FollowController);
    followService = module.get<FollowService>(FollowService);
  });

  describe('follow', () => {
    it('should call followService.follow with correct parameters', async () => {
      const followedId = '2';
      const mockResult = [{ id: 2, name: 'Followed User' }];
      (followService.follow as jest.Mock).mockResolvedValue(mockResult);

      const result = await followController.follow({ id: 1 }, followedId);

      expect(followService.follow).toHaveBeenCalledWith(1, parseInt(followedId));
      expect(result).toEqual(mockResult);
    });
  });

  describe('unfollow', () => {
    it('should call followService.unfollow with correct parameters', async () => {
      const followedId = '2';
      const mockResult = [];
      (followService.unfollow as jest.Mock).mockResolvedValue(mockResult);

      const result = await followController.unfollow({ id: 1 }, followedId);

      expect(followService.unfollow).toHaveBeenCalledWith(1, parseInt(followedId));
      expect(result).toEqual(mockResult);
    });
  });

  describe('getFollowers', () => {
    it('should call followService.getFollowers with correct parameters', async () => {
      const userId = '1';
      const mockResult = [{ id: 2, name: 'Follower User' }];
      (followService.getFollowers as jest.Mock).mockResolvedValue(mockResult);

      const result = await followController.getFollowers(userId);

      expect(followService.getFollowers).toHaveBeenCalledWith(parseInt(userId));
      expect(result).toEqual(mockResult);
    });
  });

  describe('getFollowing', () => {
    it('should call followService.getFollowing with correct parameters', async () => {
      const userId = '1';
      const mockResult = [{ id: 2, name: 'Following User' }];
      (followService.getFollowing as jest.Mock).mockResolvedValue(mockResult);

      const result = await followController.getFollowing(userId);

      expect(followService.getFollowing).toHaveBeenCalledWith(parseInt(userId));
      expect(result).toEqual(mockResult);
    });
  });

  describe('isFollowing', () => {
    it('should call followService.isFollowing with correct parameters', async () => {
      const followedId = '2';
      const mockResult = true;
      (followService.isFollowing as jest.Mock).mockResolvedValue(mockResult);

      const result = await followController.isFollowing({ id: 1 }, followedId);

      expect(followService.isFollowing).toHaveBeenCalledWith(1, parseInt(followedId));
      expect(result).toEqual(mockResult);
    });
  });
});
