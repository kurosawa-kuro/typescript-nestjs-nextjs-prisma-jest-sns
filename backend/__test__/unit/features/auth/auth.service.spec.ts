import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/features/auth/auth.service';
import { UserService } from '@/features/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { RegisterDto, LoginDto, UserDetails } from '@/shared/types/user.types';
import { mockUser, mockUserInfo } from '../../../mocks/user.mock';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockToken = 'mock_token';
  const mockSecret = 'JWT_SECRET';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: createMockUserService() },
        { provide: JwtService, useValue: createMockJwtService() },
        { provide: ConfigService, useValue: createMockConfigService() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    setupCommonMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should return a token and user info', async () => {
      const mockRegisterDto: RegisterDto = { 
        name: 'Test User', 
        email: 'test@example.com',
        password: 'password123',
      };
  
      userService.create.mockResolvedValue(mockUser);
  
      const result = await service.register(mockRegisterDto);
  
      expect(result).toEqual({
        token: mockToken,
        user: mockUser
      });
      expect(userService.create).toHaveBeenCalledWith(mockRegisterDto);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        mockUser,
        {
          secret: mockSecret,
          expiresIn: '1d'
        }
      );
    });
  });

  describe('login', () => {
    it('should return access token if credentials are valid', async () => {
      const mockCredentials: LoginDto = { email: 'test@example.com', password: 'password123' };

      userService.validateUser.mockResolvedValue(mockUser);

      userService.mapUserToUserInfo.mockReturnValue(mockUserDetails);

      const result = await service.login(mockCredentials);

      expect(result).toEqual({
        token: mockToken,
        user: mockUser
      });
      expect(userService.validateUser).toHaveBeenCalledWith(mockCredentials.email, mockCredentials.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        mockUser,
        {
          secret: mockSecret,
          expiresIn: '1d'
        }
      );
    });

    it('should throw BadRequestException for invalid credentials', async () => {
      const mockCredentials = { email: 'invalid@example.com', password: 'wrongpassword' };
      userService.validateUser.mockResolvedValue(null);

      await expect(service.login(mockCredentials)).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('should clear the jwt cookie and return a success message', async () => {
      const mockResponse = { clearCookie: jest.fn() } as unknown as Response;

      const result = await service.logout(mockResponse);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('jwt');
    });
  });

  describe('getUserFromToken', () => {
    it('should return user info from a valid token', async () => {
      const mockRequest = createMockRequest({ jwt: 'valid_token' });

      jwtService.verifyAsync.mockResolvedValue(mockUserInfo);

      const result = await service.getUserFromToken(mockRequest);

      expect(result).toEqual(mockUserInfo);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid_token', { secret: mockSecret });
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const mockRequest = createMockRequest({});

      await expect(service.getUserFromToken(mockRequest)).rejects.toThrow('No token provided');
    });

    describe('with optional auth', () => {
      it('should return null when no token is provided and isOptional is true', async () => {
        const mockRequest = createMockRequest({});
        
        const result = await service.getUserFromToken(mockRequest, true);
        
        expect(result).toBeNull();
      });

      it('should return null when token is invalid and isOptional is true', async () => {
        const mockRequest = createMockRequest({ jwt: 'invalid_token' });
        jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

        const result = await service.getUserFromToken(mockRequest, true);

        expect(result).toBeNull();
      });

      it('should return user info when valid token is provided and isOptional is true', async () => {
        const mockRequest = createMockRequest({ jwt: 'valid_token' });
        jwtService.verifyAsync.mockResolvedValue(mockUserInfo);

        const result = await service.getUserFromToken(mockRequest, true);

        expect(result).toEqual(mockUserInfo);
      });
    });

    describe('with required auth', () => {
      it('should throw UnauthorizedException when no token is provided and isOptional is false', async () => {
        const mockRequest = createMockRequest({});

        await expect(service.getUserFromToken(mockRequest, false)).rejects.toThrow('No token provided');
      });

      it('should throw UnauthorizedException when token is invalid and isOptional is false', async () => {
        const mockRequest = createMockRequest({ jwt: 'invalid_token' });
        jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

        await expect(service.getUserFromToken(mockRequest, false)).rejects.toThrow('Invalid token');
      });
    });
  });

  describe('setTokenCookie', () => {
    it('should set a JWT cookie', () => {
      const mockResponse = { cookie: jest.fn() } as unknown as Response;

      service.setTokenCookie(mockResponse, mockToken);

      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', mockToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      jwtService.verifyAsync.mockResolvedValue(mockUserInfo);

      const result = await service['verifyToken'](mockToken);

      expect(result).toEqual(mockUserInfo);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken, { secret: mockSecret });
    });

    it('should throw an error for an invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service['verifyToken']('invalid_token')).rejects.toThrow('Invalid token');
    });
  });

  describe('extractTokenFromRequest', () => {
    it('should extract token from cookies', () => {
      const mockRequest = createMockRequest({ jwt: 'cookie_token' });

      const result = service['extractTokenFromRequest'](mockRequest);

      expect(result).toBe('cookie_token');
    });

    it('should extract token from Authorization header', () => {
      const mockRequest = createMockRequest({}, { authorization: 'Bearer header_token' });

      const result = service['extractTokenFromRequest'](mockRequest);

      expect(result).toBe('header_token');
    });

    it('should return undefined if no token is found', () => {
      const mockRequest = createMockRequest({});

      const result = service['extractTokenFromRequest'](mockRequest);

      expect(result).toBeUndefined();
    });
  });

  // Helper functions
  function createMockUserService() {
    return {
      create: jest.fn(),
      validateUser: jest.fn(),
      mapUserToUserInfo: jest.fn(),
    };
  }

  function createMockJwtService() {
    return {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
  }

  function createMockConfigService() {
    return {
      get: jest.fn(),
    };
  }

  function setupCommonMocks() {
    userService.mapUserToUserInfo.mockReturnValue(mockUserDetails);
    jwtService.signAsync.mockResolvedValue(mockToken);
    configService.get.mockReturnValue(mockSecret);
  }


  function createMockRequest(cookies = {}, headers = {}): Request {
    return {
      cookies,
      headers,
    } as unknown as Request;
  }
});

const mockUserDetails: UserDetails = {
  ...mockUserInfo,
  createdAt: new Date(),
  updatedAt: new Date(),
};
