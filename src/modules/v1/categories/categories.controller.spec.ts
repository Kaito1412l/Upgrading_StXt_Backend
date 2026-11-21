import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  CreateCategoryResponseDto,
  DeleteCategoryResponseDto,
  FindAllCategoriesQueryDto,
  FindAllCategoriesResponseDto,
  FindCategoryByIdResponseDto,
  UpdateCategoryDto,
  UpdateCategoryResponseDto,
} from './dto';

@Controller('v1/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(
    @Query() query: FindAllCategoriesQueryDto,
  ): Promise<FindAllCategoriesResponseDto> {
    const result = await this.categoriesService.findAll(query);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Categories retrieved successfully',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindCategoryByIdResponseDto> {
    const category = await this.categoriesService.findById(id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Category retrieved successfully',
      data: category,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreateCategoryDto,
  ): Promise<CreateCategoryResponseDto> {
    const category = await this.categoriesService.create(body);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Category created successfully',
      data: category,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
  ): Promise<UpdateCategoryResponseDto> {
    const category = await this.categoriesService.update(id, body);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Category updated successfully',
      data: category,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteCategoryResponseDto> {
    const data = await this.categoriesService.remove(id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Category deleted successfully',
      data,
    };
  }
}