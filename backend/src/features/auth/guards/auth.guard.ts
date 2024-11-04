import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_ADMIN_KEY } from '../decorators/admin.decorator';
import { OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context)) {
      return true;
    }

    const isOptional = this.isOptionalAuthRoute(context);
    const request = context.switchToHttp().getRequest();
    const user = await this.authService.getUserFromToken(request, isOptional);

    if (!user && !isOptional) {
      throw new UnauthorizedException('Access token not found or invalid');
    }

    if (user) {
      request['user'] = user;

      if (this.isAdminRoute(context) && !user.userRoles.includes('admin')) {
        throw new UnauthorizedException('Admin access required');
      }
    }

    return true;
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private isAdminRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private isOptionalAuthRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(OPTIONAL_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
