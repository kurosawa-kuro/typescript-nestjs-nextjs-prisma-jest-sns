import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DevelopService } from './develop.service';
import { Public } from '@/features/auth/decorators/public.decorator';

// カスタムデコレータを作成
function DevelopmentOrTestOnly() {
  return UseGuards(DevelopmentOrTestGuard);
}

// カスタムガードを作成
class DevelopmentOrTestGuard {
  canActivate() {
    /* istanbul ignore next */
    if (
      process.env.NODE_ENV !== 'development' &&
      process.env.NODE_ENV !== 'test'
    ) {
      throw new Error(
        'This operation can only be performed in the development or test environment.',
      );
    }

    /* istanbul ignore next */
    return true;
  }
}

@Controller('develop')
export class DevelopController {
  constructor(private developService: DevelopService) {}

  @Post('reset_db')
  @Public()
  @HttpCode(HttpStatus.OK)
  @DevelopmentOrTestOnly()
  async resetDb() {
    return this.developService.resetDb();
  }

  @Post('demo_user_login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @DevelopmentOrTestOnly()
  async demoUserLogin() {
    return { message: 'demo_user_login.' };
  }
}
