import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserInfo } from '@/shared/types/user.types';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserInfo => {
    const request = ctx.switchToHttp().getRequest();
    // console.log('createParamDecorator request.user', request.user);
    return request.user;
  },
);
