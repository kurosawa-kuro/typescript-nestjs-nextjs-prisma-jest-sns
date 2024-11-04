import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryWithMicroposts } from '../../shared/types/micropost.types';
import { Category } from '@prisma/client';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CategoryWithMicroposts> {
    return this.categoryService.findOne(+id);
  }

  @Post()
  create(@Body() data: { name: string }): Promise<Category> {
    return this.categoryService.create(data);
  }
} 