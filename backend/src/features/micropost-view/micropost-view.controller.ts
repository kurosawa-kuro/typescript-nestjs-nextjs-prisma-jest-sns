import { Controller, Post, Param, Ip } from '@nestjs/common';
import { MicropostViewService } from './micropost-view.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('micropost-views')
export class MicropostViewController {
  constructor(private readonly micropostViewService: MicropostViewService) {}

  @Public()
  @Post(':micropostId')
  async recordView(
    @Param('micropostId') micropostId: string,
    @Ip() ipAddress: string,
  ) {
    console.log('recordView');
    console.log(micropostId);
    console.log(ipAddress);
    return this.micropostViewService.recordView(+micropostId, ipAddress);
  }
}
