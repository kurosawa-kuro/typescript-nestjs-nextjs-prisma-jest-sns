import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@/features/auth/guards/auth.guard';
import { AuthService } from '@/features/auth/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getUserFromToken: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get(Reflector);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: jest.Mocked<ExecutionContext>;

    beforeEach(() => {
      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;
    });

    it('should allow access for public routes', async () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      authService.getUserFromToken.mockResolvedValue(null);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow access for authenticated general user on non-admin route', async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(false).mockReturnValueOnce(false);
      authService.getUserFromToken.mockResolvedValue({ 
        id: 1, 
        userRoles: ['general'], 
        name: 'Test User', 
        email: 'test@example.com',
        profile: {
          avatarPath: '/path/to/avatar.jpg',
        },
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException for general user on admin route', async () => {
      reflector.getAllAndOverride
        .mockReturnValueOnce(false)  // isPublic
        .mockReturnValueOnce(false)  // isOptional
        .mockReturnValueOnce(true);  // isAdmin

      authService.getUserFromToken.mockResolvedValue({ 
        id: 1, 
        userRoles: ['general'], 
        name: 'Test User', 
        email: 'test@example.com',
        profile: {
          avatarPath: '/path/to/avatar.jpg',
        },
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Admin access required'
      );
    });

    it('should throw UnauthorizedException for read_only_admin on admin route', async () => {
      reflector.getAllAndOverride
        .mockReturnValueOnce(false)  // isPublic
        .mockReturnValueOnce(false)  // isOptional
        .mockReturnValueOnce(true);  // isAdmin

      authService.getUserFromToken.mockResolvedValue({ 
        id: 2, 
        userRoles: ['read_only_admin'], 
        name: 'Read Only Admin', 
        email: 'readonly@example.com',
        profile: {
          avatarPath: '/path/to/avatar.jpg',
        },
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Admin access required'
      );
    });

    it('should allow access for admin user on admin route', async () => {
      reflector.getAllAndOverride
        .mockReturnValueOnce(false)  // isPublic
        .mockReturnValueOnce(false)  // isOptional
        .mockReturnValueOnce(true);  // isAdmin

      authService.getUserFromToken.mockResolvedValue({ 
        id: 3, 
        userRoles: ['admin'], 
        name: 'Admin User', 
        email: 'admin@example.com',
        profile: {
          avatarPath: '/path/to/avatar.jpg',
        },
      });

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });
});
