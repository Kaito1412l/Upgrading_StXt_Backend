import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './data-source';
import { Category } from './entities/category.entity';
import { Product } from './entities/product.entity';
import {
  CATEGORY_REPOSITORY,
  PRODUCT_REPOSITORY,
} from './interfaces';
import { CategoryRepository } from './repositories/category.repository';
import { ProductRepository } from './repositories/product.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([Category, Product]),
  ],
  providers: [
    CategoryRepository,
    {
      provide: CATEGORY_REPOSITORY,
      useExisting: CategoryRepository,
    },
    ProductRepository,
    {
      provide: PRODUCT_REPOSITORY,
      useExisting: ProductRepository,
    },
  ],
  exports: [
    TypeOrmModule,
    CategoryRepository,
    CATEGORY_REPOSITORY,
    ProductRepository,
    PRODUCT_REPOSITORY,
  ],
})
export class DatabaseModule {}