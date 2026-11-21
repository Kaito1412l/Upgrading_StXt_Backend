import type {
  IInventorySummary,
  IProduct,
} from '../../../../database/interfaces';
import type { IPaginationMeta } from '../../../../utils';

export class ApiResponseDto<T> {
  success!: boolean;
  statusCode!: number;
  message!: string;
  data!: T;
}

export class FindAllProductsResponseDto extends ApiResponseDto<IProduct[]> {
  meta!: IPaginationMeta;
}

export class FindProductByIdResponseDto extends ApiResponseDto<IProduct> {}

export class CreateProductResponseDto extends ApiResponseDto<IProduct> {}

export class UpdateProductResponseDto extends ApiResponseDto<IProduct> {}

export class InventorySummaryResponseDto
  extends ApiResponseDto<IInventorySummary> {}

export class DeleteProductDataDto {
  id!: number;
  deleted!: boolean;
}

export class DeleteProductResponseDto extends ApiResponseDto<DeleteProductDataDto> {}