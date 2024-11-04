import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@/features/auth/auth.controller';
import { AuthService } from '@/features/auth/auth.service';
import { Response } from 'express';
import { UserInfo } from '@/shared/types/user.types';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  const mockToken = 'mockToken';
  const mockUser = { id: 1, name: 'Test User' };

  const mockResponse = () => ({
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue({ token: mockToken, user: mockUser }),
            login: jest.fn().mockResolvedValue({ token: mockToken, user: mockUser }),
            logout: jest.fn().mockResolvedValue({ message: 'User logged out successfully' }),
            me: jest.fn().mockImplementation((user) => user),
            setTokenCookie: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return user data', async () => {
      const mockUserData = { name: 'testuser', email: 'test@example.com', password: 'password123' };
      const response = mockResponse();
      const result = await authController.register(mockUserData, response);

      expect(authService.register).toHaveBeenCalledWith(mockUserData);
      expect(authService.setTokenCookie).toHaveBeenCalledWith(response, mockToken);
      expect(result).toEqual({ message: 'Registration successful', token: mockToken, user: mockUser });
    });
  });

  describe('login', () => {
    it('should call authService.login and return user data', async () => {
      const mockLoginData = { email: 'test@example.com', password: 'password123' };
      const response = mockResponse();
      const result = await authController.login(mockLoginData, response);

      expect(authService.login).toHaveBeenCalledWith(mockLoginData);
      expect(authService.setTokenCookie).toHaveBeenCalledWith(response, mockToken);
      expect(result).toEqual({ message: 'Login successful', token: mockToken, user: mockUser });
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return success message', async () => {
      const response = mockResponse();
      const result = await authController.logout(response);

      expect(authService.logout).toHaveBeenCalledWith(response);
      expect(result).toEqual({ message: 'User logged out successfully' });
    });
  });

  describe('me', () => {
    it('should return user information', async () => {
      const mockUserInfo: UserInfo = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        userRoles: ['general'],
        profile: {
          avatarPath: '/path/to/avatar.jpg',
        },
      };
      const result = await authController.me(mockUserInfo);

      expect(result).toEqual(mockUserInfo);
    });
  });
});
