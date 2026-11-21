import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import {
  createPaginatedResult,
  IPaginatedResult,
  normalizePaginationQuery,
} from '../../utils/pagination.util';
import { Category } from '../entities/category.entity';
import {
  CategorySortField,
  ICategoryPaginationQuery,
  ICategoryRepository,
} from '../interfaces/category-repository.interface';
import {
  ICategory,
  ICreateCategoryInput,
  IUpdateCategoryInput,
} from '../interfaces/category.interface';

export type CreateCategoryData = ICreateCategoryInput;
export type UpdateCategoryData = IUpdateCategoryInput;

const ALLOWED_SORT_FIELDS: readonly CategorySortField[] = [
  'createdAt',
  'updatedAt',
  'name',
];

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  findAll(): Promise<ICategory[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findPaginated(
    query: ICategoryPaginationQuery = {},
  ): Promise<IPaginatedResult<ICategory>> {
    const { page, limit, skip, take, sortOrder } =
      normalizePaginationQuery(query);
    const sortBy: CategorySortField =
      query.sortBy && ALLOWED_SORT_FIELDS.includes(query.sortBy)
        ? query.sortBy
        : 'createdAt';

    const keyword = query.search?.trim();
    let where: FindOptionsWhere<Category> | FindOptionsWhere<Category>[] | undefined;

    if (keyword) {
      where = [
        { name: Like(`%${keyword}%`) },
        { description: Like(`%${keyword}%`) },
      ];
    }

    const [items, totalItems] = await this.repository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip,
      take,
    });

    return createPaginatedResult(items, totalItems, page, limit);
  }

  findById(id: number): Promise<ICategory | null> {
    return this.repository.findOne({ where: { id } });
  }

  create(data: ICreateCategoryInput): Promise<ICategory> {
    const category = this.repository.create({
      name: data.name,
      description: data.description ?? null,
    });
    return this.repository.save(category);
  }

  async update(
    id: number,
    data: IUpdateCategoryInput,
  ): Promise<ICategory | null> {
    const category = await this.repository.findOne({ where: { id } });
    if (!category) {
      return null;
    }

    const updatedCategory = this.repository.merge(category, data);
    return this.repository.save(updatedCategory);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }
}