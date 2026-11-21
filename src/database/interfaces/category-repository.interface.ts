import {
  IPaginatedResult,
  IPaginationQuery,
} from '../../utils/pagination.util';
import {
  ICategory,
  ICreateCategoryInput,
  IUpdateCategoryInput,
} from './category.interface';

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');

export type CategorySortField = 'createdAt' | 'updatedAt' | 'name';

export interface ICategoryPaginationQuery extends IPaginationQuery {
  search?: string;
  sortBy?: CategorySortField;
}

export interface ICategoryRepository {
  findAll(): Promise<ICategory[]>;
  findPaginated(
    query?: ICategoryPaginationQuery,
  ): Promise<IPaginatedResult<ICategory>>;
  findById(id: number): Promise<ICategory | null>;
  create(data: ICreateCategoryInput): Promise<ICategory>;
  update(id: number, data: IUpdateCategoryInput): Promise<ICategory | null>;
  remove(id: number): Promise<boolean>;
}