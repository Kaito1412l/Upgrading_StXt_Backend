import { IBaseEntity } from './base-entity.interface';

export interface ICategory extends IBaseEntity {
  name: string;
  description: string | null;
}

export interface ICreateCategoryInput {
  name: string;
  description?: string | null;
}

export type IUpdateCategoryInput = Partial<ICreateCategoryInput>;