export type { IBaseEntity } from './base-entity.interface';
export {
  CATEGORY_REPOSITORY,
  type CategorySortField,
  type ICategoryPaginationQuery,
  type ICategoryRepository,
} from './category-repository.interface';
export type {
  ICategory,
  ICreateCategoryInput,
  IUpdateCategoryInput,
} from './category.interface';
export {
  PRODUCT_REPOSITORY,
  type IInventorySummary,
  type IProductPaginationQuery,
  type IProductRepository,
  type ProductSortField,
} from './product-repository.interface';
export type {
  ICreateProductInput,
  IProduct,
  IUpdateProductInput,
  IUpdateStockInput,
} from './product.interface';