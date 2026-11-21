import {
  ArgumentsHost,
  BadRequestException,
  ExecutionContext,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CATEGORY_REPOSITORY,
  ICategory,
  ICategoryRepository,
  IProduct,
  IProductRepository,
  PRODUCT_REPOSITORY,
} from '../../../database/interfaces';
import {
  createPaginatedResult,
  HttpExceptionFilter,
  normalizePaginationQuery,
  RateLimiterGuard,
} from '../../../utils';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController (v1)', () => {
  let controller: ProductsController;
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;

  const sampleCategory: ICategory = {
    id: 1,
    name: 'Elektronik',
    description: 'Perangkat keras',
    createdAt: new Date('2026-11-19T00:00:00.000Z'),
    updatedAt: new Date('2026-11-19T00:00:00.000Z'),
    deletedAt: null,
  };

  const sampleProduct: IProduct = {
    id: 1,
    name: 'Keyboard Mechanical',
    description: 'Switch tactile wireless',
    price: 450000,
    stock: 20,
    categoryId: 1,
    category: sampleCategory,
    createdAt: new Date('2026-11-19T00:00:00.000Z'),
    updatedAt: new Date('2026-11-19T00:00:00.000Z'),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockProductRepository = {
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStock: jest.fn(),
      remove: jest.fn(),
      getSummary: jest.fn(),
    };

    mockCategoryRepository = {
      findAll: jest.fn(),
      findPaginated: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: PRODUCT_REPOSITORY,
          useValue: mockProductRepository,
        },
        {
          provide: CATEGORY_REPOSITORY,
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  describe('getSummary', () => {
    it('returns inventory summary of product types and total stock', async () => {
      mockProductRepository.getSummary.mockResolvedValue({
        totalProductTypes: 4,
        totalStock: 85,
      });

      const response = await controller.getSummary();

      expect(response).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Inventory summary retrieved successfully',
        data: {
          totalProductTypes: 4,
          totalStock: 85,
        },
      });
    });
  });

  describe('findAll', () => {
    it('returns paginated products with metadata', async () => {
      const paginated = createPaginatedResult([sampleProduct], 15, 2, 5);
      mockProductRepository.findPaginated.mockResolvedValue(paginated);

      const response = await controller.findAll({
        page: 2,
        limit: 5,
        categoryId: 1,
        search: 'keyboard',
      });

      expect(response).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Products retrieved successfully',
        data: [sampleProduct],
        meta: {
          page: 2,
          limit: 5,
          totalItems: 15,
          totalPages: 3,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      });
    });

    it('normalizes invalid pagination query defaults', () => {
      expect(
        normalizePaginationQuery({ page: '0', limit: '999', sortOrder: 'asc' }),
      ).toEqual({
        page: 1,
        limit: 100,
        skip: 0,
        take: 100,
        sortOrder: 'ASC',
      });
    });
  });

  describe('findById', () => {
    it('returns product when found', async () => {
      mockProductRepository.findById.mockResolvedValue(sampleProduct);

      const response = await controller.findById(sampleProduct.id);

      expect(response).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Product retrieved successfully',
        data: sampleProduct,
      });
    });

    it('throws NotFoundException when product is missing', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(controller.findById(sampleProduct.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('creates a product and returns CREATED response', async () => {
      mockCategoryRepository.findById.mockResolvedValue(sampleCategory);
      mockProductRepository.create.mockResolvedValue(sampleProduct);

      const response = await controller.create({
        name: '  Keyboard Mechanical  ',
        description: 'Switch tactile wireless',
        price: 450000,
        stock: 20,
        categoryId: 1,
      });

      expect(response).toEqual({
        success: true,
        statusCode: HttpStatus.CREATED,
        message: 'Product created successfully',
        data: sampleProduct,
      });
    });

    it('throws BadRequestException when stock is negative', async () => {
      mockCategoryRepository.findById.mockResolvedValue(sampleCategory);

      await expect(
        controller.create({
          name: 'Mouse',
          price: 100000,
          stock: -3,
          categoryId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update & updateStock', () => {
    it('updates product fields', async () => {
      const updated: IProduct = { ...sampleProduct, name: 'Keyboard Pro' };
      mockProductRepository.update.mockResolvedValue(updated);

      const response = await controller.update(sampleProduct.id, {
        name: 'Keyboard Pro',
      });

      expect(response.data.name).toBe('Keyboard Pro');
      expect(response.statusCode).toBe(HttpStatus.OK);
    });

    it('updates product stock when non-negative', async () => {
      const updated: IProduct = { ...sampleProduct, stock: 35 };
      mockProductRepository.updateStock.mockResolvedValue(updated);

      const response = await controller.updateStock(sampleProduct.id, {
        stock: 35,
      });

      expect(response.data.stock).toBe(35);
    });

    it('throws BadRequestException when updating stock to negative value', async () => {
      await expect(
        controller.updateStock(sampleProduct.id, { stock: -1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('soft deletes product and returns deleted status', async () => {
      mockProductRepository.remove.mockResolvedValue(true);

      const response = await controller.remove(sampleProduct.id);

      expect(response).toEqual({
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Product deleted successfully',
        data: {
          id: sampleProduct.id,
          deleted: true,
        },
      });
    });
  });

  describe('RateLimiterGuard', () => {
    it('allows requests within limit and blocks when exceeded', () => {
      const guard = new RateLimiterGuard({ ttlMs: 60_000, max: 2 });
      const headers = new Map<string, string>();

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ ip: '127.0.0.1' }),
          getResponse: () => ({
            setHeader: (name: string, value: string) => {
              headers.set(name, value);
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
      expect(guard.canActivate(context)).toBe(true);
      expect(headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(() => guard.canActivate(context)).toThrow(HttpException);
    });
  });

  describe('HttpExceptionFilter', () => {
    it('formats validation array errors and unknown errors uniformly', () => {
      const filter = new HttpExceptionFilter();
      let capturedStatus = 0;
      let capturedBody: unknown;

      const host = {
        switchToHttp: () => ({
          getRequest: () => ({ url: '/v1/products' }),
          getResponse: () => ({
            status: (code: number) => {
              capturedStatus = code;
              return {
                json: (body: unknown) => {
                  capturedBody = body;
                },
              };
            },
          }),
        }),
      } as unknown as ArgumentsHost;

      filter.catch(
        new BadRequestException(['name should not be empty']),
        host,
      );
      expect(capturedStatus).toBe(HttpStatus.BAD_REQUEST);
      expect(capturedBody).toMatchObject({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: ['name should not be empty'],
        path: '/v1/products',
      });

      filter.catch(new Error('unexpected crash'), host);
      expect(capturedStatus).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(capturedBody).toMatchObject({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: '/v1/products',
      });
    });
  });
});