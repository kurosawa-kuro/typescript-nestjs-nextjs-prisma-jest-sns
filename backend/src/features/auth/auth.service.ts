import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto, UserInfo } from '@/shared/types/user.types';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'JWT_SECRET';
  }

  // Authentication methods
  async register(
    data: RegisterDto,
  ): Promise<{ token: string; user: UserInfo }> {
    const user = await this.userService.create(data);
    const token = await this.signToken(user);
    return { token, user };
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user: UserInfo }> {
    const user = await this.userService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = await this.signToken(user);
    return { token, user };
  }

  async logout(res: Response) {
    this.clearTokenCookie(res);
    return { message: 'Logout successful' };
  }

  async getUserFromToken(
    request: Request,
    isOptional = false,
  ): Promise<UserInfo | null> {
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      if (isOptional) {
        return null;
      }
      throw new UnauthorizedException('No token provided');
    }

    try {
      return await this.verifyToken(token);
    } catch (error) {
      if (isOptional) {
        return null;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  // Token management methods
  private async signToken(payload: UserInfo): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.jwtSecret,
      expiresIn: '1d',
    });
  }

  private async verifyToken(token: string): Promise<UserInfo> {
    return await this.jwtService.verifyAsync<UserInfo>(token, {
      secret: this.jwtSecret,
    });
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    return (
      request.cookies['jwt'] || request.headers.authorization?.split(' ')[1]
    );
  }

  setTokenCookie(res: Response, token: string): void {
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
  }

  clearTokenCookie(res: Response): void {
    res.clearCookie('jwt');
  }
}
