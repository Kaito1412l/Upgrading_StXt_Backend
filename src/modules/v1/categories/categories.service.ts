import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CATEGORY_REPOSITORY,
  type ICategory,
  type ICategoryPaginationQuery,
  type ICategoryRepository,
  type ICreateCategoryInput,
  type IUpdateCategoryInput,
} from '../../../database/interfaces';
import type { IPaginatedResult } from '../../../utils';
import {
  CreateCategoryDto,
  DeleteCategoryDataDto,
  UpdateCategoryDto,
} from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  findAll(
    query: ICategoryPaginationQuery = {},
  ): Promise<IPaginatedResult<ICategory>> {
    return this.categoryRepository.findPaginated(query);
  }

  async findById(id: number): Promise<ICategory> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  create(payload: CreateCategoryDto): Promise<ICategory> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Request body must be a JSON object');
    }

    const input: ICreateCategoryInput = {
      name: this.validateName(payload.name),
      description: this.validateDescription(payload.description),
    };

    return this.categoryRepository.create(input);
  }

  async update(id: number, payload: UpdateCategoryDto): Promise<ICategory> {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Request body must be a JSON object');
    }

    const input: IUpdateCategoryInput = {};

    if (payload.name !== undefined) {
      input.name = this.validateName(payload.name);
    }
    if (payload.description !== undefined) {
      input.description = this.validateDescription(payload.description);
    }

    const updated = await this.categoryRepository.update(id, input);
    if (!updated) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return updated;
  }

  async remove(id: number): Promise<DeleteCategoryDataDto> {
    const deleted = await this.categoryRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return { id, deleted: true };
  }

  private validateName(name: unknown): string {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new BadRequestException('name must be a non-empty string');
    }

    const trimmed = name.trim();
    if (trimmed.length > 100) {
      throw new BadRequestException('name must not exceed 100 characters');
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
}