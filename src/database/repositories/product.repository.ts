import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  createPaginatedResult,
  IPaginatedResult,
  normalizePaginationQuery,
} from '../../utils/pagination.util';
import { Product } from '../entities/product.entity';
import {
  IInventorySummary,
  IProductPaginationQuery,
  IProductRepository,
  ProductSortField,
} from '../interfaces/product-repository.interface';
import {
  ICreateProductInput,
  IProduct,
  IUpdateProductInput,
} from '../interfaces/product.interface';

export type CreateProductData = ICreateProductInput;
export type UpdateProductData = IUpdateProductInput;

const ALLOWED_SORT_FIELDS: readonly ProductSortField[] = [
  'createdAt',
  'updatedAt',
  'name',
  'price',
  'stock',
];

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  findAll(categoryId?: number): Promise<IProduct[]> {
    return this.repository.find({
      where: categoryId !== undefined ? { categoryId } : undefined,
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findPaginated(
    query: IProductPaginationQuery = {},
  ): Promise<IPaginatedResult<IProduct>> {
    const { page, limit, skip, take, sortOrder } =
      normalizePaginationQuery(query);
    const sortBy: ProductSortField =
      query.sortBy && ALLOWED_SORT_FIELDS.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';

    const qb = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (query.categoryId !== undefined) {
      qb.andWhere('product.category_id = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    const keyword = query.search?.trim();
    if (keyword) {
      qb.andWhere(
        '(product.name LIKE :keyword OR product.description LIKE :keyword OR category.name LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    qb.orderBy(`product.${sortBy}`, sortOrder).skip(skip).take(take);

    const [items, totalItems] = await qb.getManyAndCount();
    return createPaginatedResult(items, totalItems, page, limit);
  }

  findById(id: number): Promise<IProduct | null> {
    return this.repository.findOne({
      where: { id },
      relations: { category: true },
    });
  }

  async create(data: ICreateProductInput): Promise<IProduct> {
    const created = this.repository.create({
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
    });
    const saved = await this.repository.save(created);
    const full = await this.findById(saved.id);
    return full ?? saved;
  }

  async update(
    id: number,
    data: IUpdateProductInput,
  ): Promise<IProduct | null> {
    const product = await this.repository.findOne({ where: { id } });
    if (!product) {
      return null;
    }

    const updated = this.repository.merge(product, data);
    await this.repository.save(updated);
    return this.findById(id);
  }

  updateStock(id: number, stock: number): Promise<IProduct | null> {
    return this.update(id, { stock });
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  async getSummary(): Promise<IInventorySummary> {
    const raw = await this.repository
      .createQueryBuilder('product')
      .select('COUNT(product.id)', 'totalProductTypes')
      .addSelect('COALESCE(SUM(product.stock), 0)', 'totalStock')
      .getRawOne<{ totalProductTypes: string; totalStock: string }>();

    return {
      totalProductTypes: Number(raw?.totalProductTypes ?? 0),
      totalStock: Number(raw?.totalStock ?? 0),
    };
  }
}