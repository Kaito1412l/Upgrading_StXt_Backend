import {
  IPaginatedResult,
  IPaginationQuery,
} from '../../utils/pagination.util';
import {
  ICreateProductInput,
  IProduct,
  IUpdateProductInput,
} from './product.interface';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export type ProductSortField =
  | 'createdAt'
  | 'updatedAt'
  | 'name'
  | 'price'
  | 'stock';

export interface IProductPaginationQuery extends IPaginationQuery {
  categoryId?: number;
  search?: string;
  sortBy?: ProductSortField;
}

export interface IInventorySummary {
  totalProductTypes: number;
  totalStock: number;
}

export interface IProductRepository {
  findAll(categoryId?: number): Promise<IProduct[]>;
  findPaginated(
    query?: IProductPaginationQuery,
  ): Promise<IPaginatedResult<IProduct>>;
  findById(id: number): Promise<IProduct | null>;
  create(data: ICreateProductInput): Promise<IProduct>;
  update(id: number, data: IUpdateProductInput): Promise<IProduct | null>;
  updateStock(id: number, stock: number): Promise<IProduct | null>;
  remove(id: number): Promise<boolean>;
  getSummary(): Promise<IInventorySummary>;
}