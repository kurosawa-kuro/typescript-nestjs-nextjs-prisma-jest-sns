import {
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';

export abstract class BaseController<T> {
  constructor(private readonly service: any) {}

  @Get()
  async index(): Promise<T[]> {
    return this.service.all();
  }

  @Get(':id')
  async show(@Param('id') id: number): Promise<T> {
    const item = await this.service.findById(id);
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    return item;
  }

  @Post()
  async create(@Body() data: any): Promise<T> {
    return this.service.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
  ): Promise<T> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  async destroy(@Param('id') id: number): Promise<void> {
    return this.service.destroy(id);
  }
}
