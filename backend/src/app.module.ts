import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './core/database/prisma.module';
import { UserModule } from './features/user/user.module';
import { MicropostModule } from './features/micropost/micropost.module';
import { DevelopModule } from './features/develop/develop.module';
import { AuthModule } from './features/auth/auth.module';
import { AuthGuard } from './features/auth/guards/auth.guard';
import { TestController } from './features/test/test.controller';
import { JwtModule } from '@nestjs/jwt';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './core/logger/winston.config';
import { AllExceptionFilter } from './core/filters/all-exception.filter';
import { FollowModule } from './features/follow/follow.module';
import { TeamModule } from './features/team/team.module';
import { LikeModule } from './features/like/like.module';
import { CommentModule } from './features/comment/comment.module';
import { RankingModule } from './features/admin/ranking/ranking.module';
import { MicropostViewModule } from './features/micropost-view/micropost-view.module';
import { CategoryModule } from './features/category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    WinstonModule.forRoot(winstonConfig),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
    UserModule,
    MicropostModule,
    DevelopModule,
    AuthModule,
    FollowModule,
    TeamModule,
    LikeModule,
    CommentModule,
    RankingModule,
    CategoryModule,
    MicropostViewModule,
  ],
  controllers: [TestController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}
