import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IProduct } from '../interfaces/product.interface';
import { BaseEntity } from './base.entity';
import { Category } from './category.entity';

@Entity({ name: 'products' })
export class Product extends BaseEntity implements IProduct {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price!: number;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ name: 'category_id', type: 'int' })
  categoryId!: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category;
}