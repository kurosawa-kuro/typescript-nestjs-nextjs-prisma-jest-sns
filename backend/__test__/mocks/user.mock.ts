import { UserInfo, UserWithProfile, UserDetails } from '../../src/shared/types/user.types';

export const mockUser: UserWithProfile = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword123',
  createdAt: new Date(),
  updatedAt: new Date(),
  userRoles: ["general"],
  profile: {
    avatarPath: '',
  },
};

export const mockCreatedUser: UserDetails = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  userRoles: ["general"],
  profile: { avatarPath: 'default_avatar.png' },
  isFollowing: false,
};

export const mockUserInfo: UserInfo = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  userRoles: ["general"],
  profile: {
    avatarPath: "kevin_avatar.png",
  },
};

export const createMockUser = (overrides: Partial<UserWithProfile> = {}): UserWithProfile => ({
  ...mockUser,
  ...overrides,
});

export const createMockUserInfo = (overrides: Partial<UserInfo> = {}): UserInfo => ({
  ...mockUserInfo,
  ...overrides,
});
