import { Column, Entity, OneToMany } from 'typeorm';
import { ICategory } from '../interfaces/category.interface';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity({ name: 'categories' })
export class Category extends BaseEntity implements ICategory {
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];
}