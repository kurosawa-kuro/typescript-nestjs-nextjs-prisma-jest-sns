import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '@/features/user/user.service';
import { PrismaService } from '@/core/database/prisma.service';
import { UserWithoutPassword, UserInfo, UserDetails } from '@/shared/types/user.types';
import { User, Prisma, Role } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { mockCreatedUser } from '../../../mocks/user.mock';

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            userProfile: {
              create: jest.fn(),
              update: jest.fn(),
            },
            // Add this new mock for the follow model
            follow: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
            role: {
              findMany: jest.fn(),
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            userRole: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              upsert: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  // Existing tests...

  describe('create', () => {
    it('should create a new user', async () => {
      const mockUserData: Prisma.UserCreateInput = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockCreatedUser,
        userRoles: [{ role: { name: 'general' } }],
      });

      const result = await userService.create(mockUserData);

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        userRoles: ['general'],
        profile: {
          avatarPath: 'default_avatar.png',
        },
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        isFollowing: false,
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      const mockUserData: Prisma.UserCreateInput = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      (prismaService.user.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      await expect(userService.create(mockUserData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('all', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: [{ role: { name: 'general' } }],
          profile: { avatarPath: 'avatar.jpg' },
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          userRoles: [{ role: { name: 'admin' } }],
          profile: { avatarPath: 'avatar.jpg' },
        },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.all();

      expect(result).toEqual([
        {
          id: 1,
          name: 'User 1',
          email: 'user1@example.com',
          userRoles: ['general'],
          profile: {
            avatarPath: 'avatar.jpg',
          },
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          userRoles: ['admin'],
          profile: {
            avatarPath: 'avatar.jpg',
          },
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);
    });
  });

  describe('validateUser', () => {
    it('should return user info if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await userService['hashPassword']('password123'),
        avatarPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: { name: 'general' } }],
        profile: { avatarPath: null },
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: {
          avatarPath: 'default_avatar.png',
        },
        userRoles: ['general'],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        isFollowing: false,
      });
    });

    it('should return null if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await userService.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: await userService['hashPassword']('correctpassword'),
        avatarPath: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [{ role: { name: 'general' } }],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: { avatarPath: 'old-avatar.jpg' },
      };

      const updatedUser = {
        ...mockUser,
        profile: { avatarPath: 'new-avatar.jpg' },
      };

      (prismaService.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);

      (prismaService.userProfile.update as jest.Mock).mockResolvedValue({ avatarPath: 'new-avatar.jpg' });

      const result = await userService.updateAvatar(1, 'new-avatar.jpg');

      expect(result).toEqual(updatedUser);
      expect(prismaService.userProfile.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: { avatarPath: 'new-avatar.jpg' },
      });
    });

    it('should create profile if it doesn\'t exist', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: null,
      };

      const updatedUser = {
        ...mockUser,
        profile: { avatarPath: 'new-avatar.jpg' },
      };

      (prismaService.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);

      (prismaService.userProfile.create as jest.Mock).mockResolvedValue({ avatarPath: 'new-avatar.jpg' });

      const result = await userService.updateAvatar(1, 'new-avatar.jpg');

      expect(result).toEqual(updatedUser);
      expect(prismaService.userProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          avatarPath: 'new-avatar.jpg',
        },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateAvatar(999, 'new-avatar.jpg')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUserRole', () => {
    it('should add admin role to user', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: { avatarPath: null },
        userRoles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the role that will be added
      const mockRole = { id: 2, name: 'admin' };

      // Important: Mock role.findMany to return the requested role
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.role.findMany as jest.Mock).mockResolvedValue([mockRole]); // This line is crucial
      
      // Mock the userRole creation
      (prismaService.userRole.upsert as jest.Mock).mockResolvedValue({
        userId: 1,
        roleId: 2,
      });

      // Mock the final user lookup
      const mockUpdatedUser = {
        ...mockUser,
        userRoles: [{ role: { name: 'admin' } }],
        profile: { avatarPath: null },
      };
      (prismaService.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUpdatedUser);

      const result = await userService.updateUserRoles(1, ['admin'], 'add');

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: { avatarPath: 'default_avatar.png' },
        userRoles: ['admin'],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        isFollowing: false,
      });
    });

    it('should remove admin role from user', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: { avatarPath: null },
        userRoles: [{ role: { name: 'admin' } }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the role that will be removed
      const mockRole = { id: 2, name: 'admin' };

      // Important: Mock role.findMany to return the requested role
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prismaService.role.findMany as jest.Mock).mockResolvedValue([mockRole]); // This line is crucial

      // Mock the userRole deletion
      (prismaService.userRole.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Mock the final user lookup
      const mockUpdatedUser = {
        ...mockUser,
        userRoles: [],
        profile: { avatarPath: null },
      };
      (prismaService.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockUpdatedUser);

      const result = await userService.updateUserRoles(1, ['admin'], 'remove');

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        profile: { avatarPath: 'default_avatar.png' },
        userRoles: [],
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        isFollowing: false,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateUserRoles(999, ['admin'], 'add')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllWithFollowStatus', () => {
    it('should return all users with follow status', async () => {
      const mockUsers = [
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: { avatarPath: 'avatar2.jpg' },
          userRoles: [{ role: { name: 'user' } }],
          followers: [{ followerId: 1 }],
        },
        {
          id: 3,
          name: 'User 3',
          email: 'user3@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: { avatarPath: null },
          userRoles: [{ role: { name: 'admin' } }],
          followers: [],
        },
      ];

      (prismaService.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const result = await userService.findAllWithFollowStatus(1);

      expect(result).toEqual([
        {
          id: 2,
          name: 'User 2',
          email: 'user2@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          profile: { avatarPath: 'avatar2.jpg' },
          userRoles: ['user'],
          isFollowing: true,
        },
        {
          id: 3,
          name: 'User 3',
          email: 'user3@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          profile: { avatarPath: 'default_avatar.png' },
          userRoles: ['admin'],
          isFollowing: false,
        },
      ]);
    });
  });

  describe('follow', () => {
    it('should create a follow relationship and return updated user list', async () => {
      const mockFollow = { followerId: 1, followingId: 2 };
      (prismaService.follow.findUnique as jest.Mock).mockResolvedValue(null);
      (prismaService.follow.create as jest.Mock).mockResolvedValue(mockFollow);
      
      const mockUpdatedUserList: UserDetails[] = [{
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: ['user'],
        profile: { avatarPath: 'default_avatar.png' },
        isFollowing: true
      }];
      jest.spyOn(userService, 'findAllWithFollowStatus').mockResolvedValue(mockUpdatedUserList);

      const result = await userService.follow(1, 2);

      expect(prismaService.follow.create).toHaveBeenCalledWith({ data: mockFollow });
      expect(result).toEqual(mockUpdatedUserList);
    });
  });

  describe('unfollow', () => {
    it('should remove a follow relationship and return updated user list', async () => {
      const mockFollow = { followerId: 1, followingId: 2 };
      (prismaService.follow.findUnique as jest.Mock).mockResolvedValue(mockFollow);
      (prismaService.follow.delete as jest.Mock).mockResolvedValue(mockFollow);
      
      const mockUpdatedUserList: UserDetails[] = [{
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: ['user'],
        profile: { avatarPath: 'default_avatar.png' },
        isFollowing: false
      }];
      jest.spyOn(userService, 'findAllWithFollowStatus').mockResolvedValue(mockUpdatedUserList);

      const result = await userService.unfollow(1, 2);

      expect(prismaService.follow.delete).toHaveBeenCalledWith({
        where: { followerId_followingId: mockFollow },
      });
      expect(result).toEqual(mockUpdatedUserList);
    });
  });

  describe('getFollowers', () => {
    it('should return followers with follow status', async () => {
      const mockFollowers = [
        {
          follower: {
            id: 2,
            name: 'Follower 1',
            email: 'follower1@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: { avatarPath: 'follower1.jpg' },
            userRoles: [{ role: { name: 'user' } }],
          },
        },
      ];

      (prismaService.follow.findMany as jest.Mock).mockResolvedValueOnce(mockFollowers);
      (prismaService.follow.findMany as jest.Mock).mockResolvedValueOnce([{ followingId: 2 }]);

      const result = await userService.getFollowers(1, 3);

      expect(result).toEqual([
        {
          id: 2,
          name: 'Follower 1',
          email: 'follower1@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          profile: { avatarPath: 'follower1.jpg' },
          userRoles: ['user'],
          isFollowing: true,
        },
      ]);
    });
  });

  describe('getFollowing', () => {
    it('should return following users', async () => {
      const mockFollowing = [
        {
          following: {
            id: 2,
            name: 'Following 1',
            email: 'following1@example.com',
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: { avatarPath: 'following1.jpg' },
            userRoles: [{ role: { name: 'user' } }],
          },
        },
      ];

      (prismaService.follow.findMany as jest.Mock).mockResolvedValue(mockFollowing);

      const result = await userService.getFollowing(1);

      expect(result).toEqual([
        {
          id: 2,
          name: 'Following 1',
          email: 'following1@example.com',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          profile: { avatarPath: 'following1.jpg' },
          userRoles: ['user'],
          isFollowing: true,
        },
      ]);
    });
  });

  describe('findByIdWithRelationsAndFollowStatus', () => {
    it('should return user details with follow status', async () => {
      const mockUser = {
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: { avatarPath: 'avatar2.jpg' },
        userRoles: [{ role: { name: 'user' } }],
        followers: [{ followerId: 1 }],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findByIdWithRelationsAndFollowStatus(2, 1);

      expect(result).toEqual({
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        profile: { avatarPath: 'avatar2.jpg' },
        userRoles: ['user'],
        isFollowing: true,
        followers: [{ followerId: 1 }], // Include this line
      });
    });
  });

  describe('findByIdWithRelations', () => {
    it('should return user with relations', async () => {
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
        userRoles: [
          {
            role: {
              name: 'user',
            },
          },
        ],
        profile: {
          avatarPath: 'avatar.jpg',
        },
        followers: [
          {
            followerId: 2,
          },
        ],
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findByIdWithRelations(1, 2);

      expect(result).toEqual({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        userRoles: ['user'],
        profile: {
          avatarPath: 'avatar.jpg',
        },
        followers: [
          {
            followerId: 2,
          },
        ],
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          userRoles: {
            include: {
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
          profile: {
            select: {
              avatarPath: true,
            },
          },
          followers: {
            where: {
              followerId: 2,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.findByIdWithRelations(999, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
