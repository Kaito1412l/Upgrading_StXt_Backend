import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CATEGORY_REPOSITORY,
  PRODUCT_REPOSITORY,
  type ICategoryRepository,
  type ICreateProductInput,
  type IInventorySummary,
  type IProduct,
  type IProductPaginationQuery,
  type IProductRepository,
  type IUpdateProductInput,
} from '../../../database/interfaces';
import type { IPaginatedResult } from '../../../utils';
import {
  CreateProductDto,
  DeleteProductDataDto,
  UpdateProductDto,
  UpdateProductStockDto,
} from './dto';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  findAll(
    query: IProductPaginationQuery = {},
  ): Promise<IPaginatedResult<IProduct>> {
    return this.productRepository.findPaginated(query);
  }

  async findById(id: number): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  getSummary(): Promise<IInventorySummary> {
    return this.productRepository.getSummary();
  }

  async create(payload: CreateProductDto): Promise<IProduct> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Request body must be a JSON object');
    }

    const categoryId = await this.ensureCategoryExists(payload.categoryId);
    const input: ICreateProductInput = {
      name: this.validateName(payload.name),
      description: this.validateDescription(payload.description),
      price: this.validatePrice(payload.price),
      stock: this.validateStock(payload.stock),
      categoryId,
    };

    return this.productRepository.create(input);
  }

  async update(id: number, payload: UpdateProductDto): Promise<IProduct> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Request body must be a JSON object');
    }

    const input: IUpdateProductInput = {};

    if (payload.name !== undefined) {
      input.name = this.validateName(payload.name);
    }
    if (payload.description !== undefined) {
      input.description = this.validateDescription(payload.description);
    }
    if (payload.price !== undefined) {
      input.price = this.validatePrice(payload.price);
    }
    if (payload.stock !== undefined) {
      input.stock = this.validateStock(payload.stock);
    }
    if (payload.categoryId !== undefined) {
      input.categoryId = await this.ensureCategoryExists(payload.categoryId);
    }

    const updated = await this.productRepository.update(id, input);
    if (!updated) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return updated;
  }

  async updateStock(
    id: number,
    payload: UpdateProductStockDto,
  ): Promise<IProduct> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Request body must be a JSON object');
    }

    const stock = this.validateStock(payload.stock);
    const updated = await this.productRepository.updateStock(id, stock);
    if (!updated) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return updated;
  }

  async remove(id: number): Promise<DeleteProductDataDto> {
    const deleted = await this.productRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return { id, deleted: true };
  }

  private async ensureCategoryExists(categoryId: unknown): Promise<number> {
    const id = Number(categoryId);
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('categoryId must be a positive integer');
    }

    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return id;
  }

  private validateName(name: unknown): string {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestException('name must be a non-empty string');
    }

    const trimmed = name.trim();
    if (trimmed.length > 150) {
      throw new BadRequestException('name must not exceed 150 characters');
    }

    return trimmed;
  }

  private validateDescription(
    description: unknown,
  ): string | null | undefined {
    if (description === undefined || description === null) {
      return description;
    }

    if (typeof description !== 'string') {
      throw new BadRequestException('description must be a string or null');
    }

    return description;
  }

  private validatePrice(price: unknown): number {
    const num = Number(price);
    if (!Number.isFinite(num) || num < 0) {
      throw new BadRequestException('price must be a non-negative number');
    }

    return num;
  }

  private validateStock(stock: unknown): number {
    const num = Number(stock);
    if (!Number.isInteger(num) || num < 0) {
      throw new BadRequestException('stock must be a non-negative integer');
    }

    return num;
  }
}