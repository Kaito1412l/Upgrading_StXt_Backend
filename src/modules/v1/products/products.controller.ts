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
import {
  CreateProductDto,
  CreateProductResponseDto,
  DeleteProductResponseDto,
  FindAllProductsQueryDto,
  FindAllProductsResponseDto,
  FindProductByIdResponseDto,
  InventorySummaryResponseDto,
  UpdateProductDto,
  UpdateProductResponseDto,
  UpdateProductStockDto,
} from './dto';
import { ProductsService } from './products.service';

@Controller('v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('summary')
  async getSummary(): Promise<InventorySummaryResponseDto> {
    const data = await this.productsService.getSummary();

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Inventory summary retrieved successfully',
      data,
    };
  }

  @Get()
  async findAll(
    @Query() query: FindAllProductsQueryDto,
  ): Promise<FindAllProductsResponseDto> {
    const result = await this.productsService.findAll(query);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Products retrieved successfully',
      data: result.items,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FindProductByIdResponseDto> {
    const product = await this.productsService.findById(id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Product retrieved successfully',
      data: product,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: CreateProductDto,
  ): Promise<CreateProductResponseDto> {
    const product = await this.productsService.create(body);

    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Product created successfully',
      data: product,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ): Promise<UpdateProductResponseDto> {
    const product = await this.productsService.update(id, body);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Product updated successfully',
      data: product,
    };
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductStockDto,
  ): Promise<UpdateProductResponseDto> {
    const product = await this.productsService.updateStock(id, body);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Product stock updated successfully',
      data: product,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DeleteProductResponseDto> {
    const data = await this.productsService.remove(id);

    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Product deleted successfully',
      data,
    };
  }
}