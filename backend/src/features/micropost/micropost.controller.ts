import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MicropostService } from './micropost.service';
import { DetailedMicropost } from '@/shared/types/micropost.types';
import { User } from '@/features/auth/decorators/user.decorator';
import { UserInfo } from '@/shared/types/user.types';
import { multerConfig, multerOptions } from '@/core/common/multer-config';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';

@Controller('microposts')
export class MicropostController {
  constructor(private readonly micropostService: MicropostService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      ...multerConfig,
      ...multerOptions,
    }),
  )
  async create(
    @Body() data: { title: string; categoryIds: string },
    @UploadedFile() image: Express.Multer.File,
    @User() currentUser: UserInfo,
  ): Promise<DetailedMicropost> {
    const categoryIds = JSON.parse(data.categoryIds) as number[];
    
    return this.micropostService.create({
      title: data.title,
      imagePath: image ? image.filename : null,
      userId: currentUser.id,
      categoryIds: categoryIds
    });
  }

  // マイクロポスト一覧取得  search デフォルトは作成日時、ソートでいいね、mostViewの多い順に表示依頼
  @OptionalAuth()
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('sortBy') sortBy: 'likes' | 'mostView' | 'date' = 'date'
  ): Promise<DetailedMicropost[]> {
    return this.micropostService.all(search, sortBy);
  }

  @OptionalAuth()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @User() currentUser?: UserInfo,
  ): Promise<DetailedMicropost> {
    const micropost = await this.micropostService.findById(+id, currentUser?.id);
    if (!micropost) {
      throw new NotFoundException(`Micropost with ID ${id} not found`);
    }
    return micropost;
  }

  // 特定のユーザーのマイクロポスト一覧取得
  @OptionalAuth()
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<DetailedMicropost[]> {
    return this.micropostService.findByUserId(+userId);
  }
}
