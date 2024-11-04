import { UserController } from '@/features/user/user.controller';
import { UserService } from '@/features/user/user.service';
import { setupTestModule, createMockService } from '../../test-utils';
import { mockUser } from '../../../mocks/user.mock';
import { UserDetails, UserInfo } from '@/shared/types/user.types';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const mockUserService = createMockService([
      'create',
      'all',
      'updateAvatar',
      'findAllWithFollowStatus',
      'getFollowers',
      'getFollowing',
      'findByIdWithRelationsAndFollowStatus',
      'follow',
      'unfollow',
      'updateUserRoles'
    ]);
    const module = await setupTestModule(
      [UserController],
      [{ provide: UserService, useValue: mockUserService }],
    );

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUserDetails: UserDetails = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: ['general'],
        profile: { avatarPath: 'default_avatar.png' },
        isFollowing: false,
      };

      const createUserDto = {
        name: mockUserDetails.name,
        email: mockUserDetails.email,
        password: 'password123',
      };

      jest.spyOn(userService, 'create').mockResolvedValue(mockUserDetails);

      expect(await controller.create(createUserDto)).toBe(mockUserDetails);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('index', () => {
    it('should return an array of users', async () => {
      const expectedResult: UserDetails[] = [
        {
          ...mockUser,
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: ['general'],
          profile: { avatarPath: 'default_avatar.png' },
          isFollowing: false,
        },
      ];

      jest.spyOn(userService, 'all').mockResolvedValue(expectedResult);

      expect(await controller.index()).toBe(expectedResult);
      expect(userService.all).toHaveBeenCalled();
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar', async () => {
      const userId = 1;
      const filename = 'new-avatar.jpg';
      const mockFile = {
        filename: filename,
      } as Express.Multer.File;

      const updatedUser: UserDetails & { password: string } = {
        ...mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: ['general'],
        profile: { avatarPath: filename },
        isFollowing: false,
        password: 'mockPassword',
      };

      jest.spyOn(userService, 'updateAvatar').mockResolvedValue(updatedUser);

      const result = await controller.updateAvatar(userId, mockFile);

      expect(result).toEqual(updatedUser);
      expect(userService.updateAvatar).toHaveBeenCalledWith(userId, filename);
    });

    it('should throw an error if file is not provided', async () => {
      const userId = 1;

      await expect(controller.updateAvatar(userId, undefined)).rejects.toThrow();
    });
  });

  describe('getCurrentUserAndAllUsers', () => {
    it('should return users with follow status', async () => {
      const currentUser: UserInfo = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        userRoles: ['general']
      };
      const expectedUsers: UserDetails[] = [
        { ...mockUser, isFollowing: true },
        { ...mockUser, id: 2, isFollowing: false }
      ];

      jest.spyOn(userService, 'findAllWithFollowStatus').mockResolvedValue(expectedUsers);

      const result = await controller.getCurrentUserAndAllUsers(currentUser);
      expect(result).toEqual(expectedUsers);
      expect(userService.findAllWithFollowStatus).toHaveBeenCalledWith(currentUser.id);
    });
  });

  describe('getFollowers', () => {
    it('should return followers for a user', async () => {
      const userId = 1;
      const currentUser: UserInfo = {
        id: 2,
        email: 'test@example.com',
        name: 'Test User',
        userRoles: ['general']
      };
      const expectedFollowers: UserDetails[] = [
        { ...mockUser, id: 2, isFollowing: true }
      ];

      jest.spyOn(userService, 'getFollowers').mockResolvedValue(expectedFollowers);

      const result = await controller.getFollowers(userId, currentUser);
      expect(result).toEqual(expectedFollowers);
      expect(userService.getFollowers).toHaveBeenCalledWith(userId, currentUser.id);
    });
  });

  describe('getFollowing', () => {
    it('should return following users', async () => {
      const userId = 1;
      const expectedFollowing: UserDetails[] = [
        { ...mockUser, id: 2, isFollowing: true }
      ];

      jest.spyOn(userService, 'getFollowing').mockResolvedValue(expectedFollowing);

      const result = await controller.getFollowing(userId);
      expect(result).toEqual(expectedFollowing);
      expect(userService.getFollowing).toHaveBeenCalledWith(userId);
    });
  });

  describe('show', () => {
    it('should return user details with follow status', async () => {
      const userId = 1;
      const currentUser: UserInfo = {
        id: 2,
        email: 'test@example.com',
        name: 'Test User',
        userRoles: ['general']
      };
      const expectedUser: UserDetails = { ...mockUser, isFollowing: true };

      jest.spyOn(userService, 'findByIdWithRelationsAndFollowStatus').mockResolvedValue(expectedUser);

      const result = await controller.show(userId, currentUser);
      expect(result).toEqual(expectedUser);
      expect(userService.findByIdWithRelationsAndFollowStatus).toHaveBeenCalledWith(userId, currentUser.id);
    });

    it('should return user details without follow status when no current user', async () => {
      const userId = 1;
      const expectedUser: UserDetails = { ...mockUser, isFollowing: false };

      jest.spyOn(userService, 'findByIdWithRelationsAndFollowStatus').mockResolvedValue(expectedUser);

      const result = await controller.show(userId, undefined);
      expect(result).toEqual(expectedUser);
      expect(userService.findByIdWithRelationsAndFollowStatus).toHaveBeenCalledWith(userId, undefined);
    });
  });

  describe('follow/unfollow', () => {
    it('should follow a user', async () => {
      const userId = 1;
      const currentUser: UserInfo = {
        id: 2,
        email: 'test@example.com',
        name: 'Test User',
        userRoles: ['general']
      };
      const expectedUsers: UserDetails[] = [
        { ...mockUser, isFollowing: true }
      ];

      jest.spyOn(userService, 'follow').mockResolvedValue(expectedUsers);

      const result = await controller.follow(userId, currentUser);
      expect(result).toEqual(expectedUsers);
      expect(userService.follow).toHaveBeenCalledWith(currentUser.id, userId);
    });

    it('should unfollow a user', async () => {
      const userId = 1;
      const currentUser: UserInfo = {
        id: 2,
        email: 'test@example.com',
        name: 'Test User',
        userRoles: ['general']
      };
      const expectedUsers: UserDetails[] = [
        { ...mockUser, isFollowing: false }
      ];

      jest.spyOn(userService, 'unfollow').mockResolvedValue(expectedUsers);

      const result = await controller.unfollow(userId, currentUser);
      expect(result).toEqual(expectedUsers);
      expect(userService.unfollow).toHaveBeenCalledWith(currentUser.id, userId);
    });
  });

  describe('admin management', () => {
    it('should add admin role', async () => {
      const userId = 1;
      const expectedUser: UserDetails = {
        ...mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: ['general', 'admin']
      };

      jest.spyOn(userService, 'updateUserRoles').mockResolvedValue(expectedUser);

      const result = await controller.updateUserRoles(userId, { roles: ['admin'], action: 'add' });
      expect(result).toEqual(expectedUser);
    });

    it('should remove admin role', async () => {
      const userId = 1;
      const expectedUser: UserDetails = { ...mockUser, userRoles: ['general'] };

      jest.spyOn(userService, 'updateUserRoles').mockResolvedValue(expectedUser);

      const result = await controller.updateUserRoles(userId, { roles: ['admin'], action: 'remove' });
      expect(result).toEqual(expectedUser);
    });
  });
});
