import type { ICategory } from '../../../../database/interfaces';
import type { IPaginationMeta } from '../../../../utils';

export class ApiResponseDto<T> {
  success!: boolean;
  statusCode!: number;
  message!: string;
  data!: T;
}

export class FindAllCategoriesResponseDto extends ApiResponseDto<ICategory[]> {
  meta!: IPaginationMeta;
}

export class FindCategoryByIdResponseDto extends ApiResponseDto<ICategory> {}

export class CreateCategoryResponseDto extends ApiResponseDto<ICategory> {}

export class UpdateCategoryResponseDto extends ApiResponseDto<ICategory> {}

export class DeleteCategoryDataDto {
  id!: number;
  deleted!: boolean;
}

export class DeleteCategoryResponseDto extends ApiResponseDto<DeleteCategoryDataDto> {}