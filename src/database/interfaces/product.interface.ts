import { IBaseEntity } from './base-entity.interface';
import { ICategory } from './category.interface';

export interface IProduct extends IBaseEntity {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number;
  category?: ICategory;
}

export interface ICreateProductInput {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  categoryId: number;
}

export type IUpdateProductInput = Partial<ICreateProductInput>;

export interface IUpdateStockInput {
  stock: number;
}