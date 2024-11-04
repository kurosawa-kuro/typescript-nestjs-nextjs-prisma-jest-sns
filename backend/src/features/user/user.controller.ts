import {
  Controller,
  Get,
  Put,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Post,
  Delete,
  Body,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { BaseController } from '@/core/common/base.controller';
import { Public } from '@/features/auth/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig, multerOptions } from '@/core/common/multer-config';
import {
  UserDetails,
  UserInfo,
} from '@/shared/types/user.types';
import { User as UserDecorator } from '@/features/auth/decorators/user.decorator';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { createObjectCsvWriter } from 'csv-writer';
import * as path from 'path';
import * as fs from 'fs';

@Controller('users')
export class UserController extends BaseController<UserDetails> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  // 全ユーザー一覧を取得（パスワード除く）
  @Public()
  @Get()
  async index(): Promise<UserDetails[]> {
    return this.userService.all();
  }

  // 利用可能な全ての権限を取得
  @Get('available-roles')
  async getAvailableRoles(): Promise<Role[]> {
    return this.userService.getAvailableRoles();
  }

  // フォロー状態を含む全ユーザー一覧を取得
  @Get('with-follow-status')
  async getCurrentUserAndAllUsers(
    @UserDecorator() currentUser: UserInfo,
  ): Promise<UserDetails[]> {
    return this.userService.findAllWithFollowStatus(currentUser.id as number);
  }

  // エクスポートエンドポイントを他のルートより前に配置
  @Get('export-csv')
  async exportUsers(@Res() res: Response) {
    try {
      const users = await this.userService.all();
      
      // tempディレクトリが存在しない場合は作成
      const tempDir = path.resolve('temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      // CSVのヘッダーを定義
      const csvWriter = createObjectCsvWriter({
        path: path.resolve('temp/users.csv'),
        header: [
          { id: 'id', title: 'ID' },
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'roles', title: 'Roles' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'updatedAt', title: 'Updated At' }
        ]
      });

      // データを整形
      const records = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.userRoles.join(', '), // 配列を文字列に変換
        createdAt: new Date(user.createdAt).toISOString(),
        updatedAt: new Date(user.updatedAt).toISOString()
      }));

      // CSVファイルを作成
      await csvWriter.writeRecords(records);

      // ファイルをダウンロード
      res.download(
        path.resolve('temp/users.csv'),
        `users_${new Date().toISOString().split('T')[0]}.csv`,
        (err) => {
          if (err) {
            console.error('Error downloading file:', err);
          }
          // ファイルを削除
          try {
            fs.unlinkSync(path.resolve('temp/users.csv'));
          } catch (e) {
            console.error('Error deleting temporary file:', e);
          }
        }
      );
    } catch (error) {
      console.error('Error exporting users:', error);
      throw new InternalServerErrorException('Error exporting users');
    }
  }

  // 特定ユーザーのフォロワーリストを取得
  @Get(':id/followers')
  async getFollowers(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser: UserInfo,
  ): Promise<UserDetails[]> {
    return this.userService.getFollowers(id, currentUser.id);
  }

  // 特定ユーザーのフォロー中ユーザーリストを取得
  @Get(':id/following')
  async getFollowing(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserDetails[]> {
    return this.userService.getFollowing(id);
  }

  // 特定ユーザーの詳細情報を取得（パスワード除く、ロール情報含む）ログインユーザーとのフォロー状態も含む
  @Public()
  @Get(':id')
  async show(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser?: UserInfo,
  ): Promise<UserDetails> {
    return this.userService.findByIdWithRelationsAndFollowStatus(
      id,
      currentUser?.id,
    );
  }

  // ユーザーのアバター画像を更新
  @Public()
  @Put(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', { ...multerConfig, ...multerOptions }),
  )
  async updateAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    return this.userService.updateAvatar(id, file.filename);
  }

  // ユーザーをフォローし、更新された全ユーザーリストを返す
  @Post(':id/follow')
  async follow(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser: UserInfo,
  ): Promise<UserDetails[]> {
    return this.userService.follow(currentUser.id, id);
  }

  // ユーザーのフォローを解除し、更新された全ユーザーリストを返す
  @Delete(':id/follow')
  async unfollow(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() currentUser: UserInfo,
  ): Promise<UserDetails[]> {
    return this.userService.unfollow(currentUser.id, id);
  }

  // ユーザーの権限を更新（追加/削除）
  @Put(':id/roles')
  async updateUserRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { roles: string[], action: 'add' | 'remove' }
  ): Promise<UserDetails> {
    return this.userService.updateUserRoles(id, data.roles, data.action);
  }

  // ユーザーの現在の権限を取得
  @Get(':id/roles')
  async getUserRoles(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<string[]> {
    return this.userService.getUserRoles(id);
  }
}
