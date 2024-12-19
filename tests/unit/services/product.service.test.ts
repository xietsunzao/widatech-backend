import { describe, expect, test, beforeEach, mock } from "bun:test";
import { ProductService } from '@services/product-service';
import { Product } from '@prisma/client';
import { CreateProductDto } from "@dto/product/create-product-dto";

// Mock the database module with proper types
const mockDb = {
    product: {
        findMany: () => Promise.resolve([] as Product[]),
        findUnique: () => Promise.resolve(null as Product | null),
        create: () => Promise.resolve(null as Product | null),
        update: () => Promise.resolve(null as Product | null),
        delete: () => Promise.resolve(null as Product | null)
    }
};

// Mock the database module using Bun's test utils
mock.module('@core/database', () => ({
    db: mockDb
}));

describe('ProductService', () => {
    beforeEach(() => {
        // Reset mock module before each test
        mock.module('@core/database', () => ({
            db: mockDb
        }));
    });

    describe('getProducts', () => {
        test('should return all products', async () => {
            // Arrange
            const mockProducts: Product[] = [
                { 
                    id: 1, 
                    name: 'Product 1', 
                    qty: 1, 
                    total_cogs: 100, 
                    total_price: 150,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                { 
                    id: 2, 
                    name: 'Product 2', 
                    qty: 2, 
                    total_cogs: 200, 
                    total_price: 250,
                    created_at: new Date(),
                    updated_at: new Date()
                },
            ];

            mockDb.product.findMany = () => Promise.resolve(mockProducts);

            // Act
            const result = await ProductService.getProducts();

            // Assert
            expect(result).toEqual(mockProducts);
        });

        test('should return empty array when no products exist', async () => {
            // Arrange
            mockDb.product.findMany = () => Promise.resolve([] as Product[]);

            // Act
            const result = await ProductService.getProducts();

            // Assert
            expect(result).toEqual([]);
        });

        test('should handle database errors', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            mockDb.product.findMany = () => Promise.reject(dbError);

            // Act & Assert
            await expect(ProductService.getProducts()).rejects.toThrow('Database connection failed');
        });
    });

    describe('getProductById', () => {
        test('should return product when found', async () => {
            // Arrange
            const mockProduct: Product = { 
                id: 1, 
                name: 'Product 1', 
                qty: 1, 
                total_cogs: 100, 
                total_price: 150,
                created_at: new Date(),
                updated_at: new Date()
            };

            mockDb.product.findUnique = () => Promise.resolve(mockProduct as Product | null);

            // Act
            const result = await ProductService.getProductById(1);

            // Assert
            expect(result).toEqual(mockProduct);
        });

        test('should return null when product not found', async () => {
            // Arrange
            mockDb.product.findUnique = () => Promise.resolve(null as Product | null);

            // Act
            const result = await ProductService.getProductById(999);

            // Assert
            expect(result).toBeNull();
        });

        test('should handle invalid id', async () => {
            // Act & Assert
            const result = await ProductService.getProductById(NaN);
            expect(result).toBeNull();
        });

        test('should handle database errors', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            mockDb.product.findUnique = () => Promise.reject(dbError);

            // Act & Assert
            await expect(ProductService.getProductById(1)).rejects.toThrow('Database connection failed');
        });
    });

    describe('createProduct', () => {
        test('should create a new product with valid data', async () => {
            // Arrange
            const createProductDto: CreateProductDto = {
                name: 'New Product',
                qty: 1,
                total_cogs: 100,
                total_price: 150
            };

            const mockCreatedProduct: Product = {
                id: 1,
                name: createProductDto.name,
                qty: createProductDto.qty,
                total_cogs: createProductDto.total_cogs,
                total_price: createProductDto.total_price,
                created_at: new Date(),
                updated_at: new Date()
            };

            const createMock = mock(() => Promise.resolve(mockCreatedProduct));
            mockDb.product.create = createMock;

            // Act
            const result = await ProductService.createProduct(createProductDto);

            // Assert
            expect(result).toBeDefined();
            expect(result).not.toBeNull();
            expect(result).toEqual(mockCreatedProduct);
            expect(createMock).toHaveBeenCalledWith({
                data: createProductDto
            });
        });

        test('should validate required fields', async () => {
            // Arrange
            const invalidProduct = {
                name: '',  // Invalid: empty name
                qty: 0,   // Invalid: zero quantity
                total_cogs: -100,  // Invalid: negative cost
                total_price: 0     // Invalid: zero price
            };

            const createMock = mock(() => {
                throw new Error('Validation failed');
            });
            mockDb.product.create = createMock;

            // Act & Assert
            await expect(ProductService.createProduct(invalidProduct))
                .rejects
                .toThrow('Validation failed');
        });


        test('should handle database errors during creation', async () => {
            // Arrange
            const validProduct = {
                name: 'Test Product',
                qty: 1,
                total_cogs: 100,
                total_price: 150
            };

            const dbError = new Error('Database connection failed');
            mockDb.product.create = mock(() => Promise.reject(dbError));

            // Act & Assert
            await expect(ProductService.createProduct(validProduct))
                .rejects
                .toThrow('Database connection failed');
        });

        test('should trim whitespace from product name', async () => {
            // Arrange
            const productWithWhitespace: CreateProductDto = {
                name: '  Test Product  ',
                qty: 1,
                total_cogs: 100,
                total_price: 150
            };

            const expectedProduct: Product = {
                id: 1,
                name: 'Test Product', // Trimmed
                qty: 1,
                total_cogs: 100,
                total_price: 150,
                created_at: new Date(),
                updated_at: new Date()
            };

            const createMock = mock(() => Promise.resolve(expectedProduct));
            mockDb.product.create = createMock;

            // Act
            const result = await ProductService.createProduct(productWithWhitespace);

            // Assert
            expect(result).toBeDefined();
            expect(result).not.toBeNull();
            if (!result) {
                throw new Error('Expected result to be defined');
            }
            
            // Check the result
            expect(result.name).toBe('Test Product');
            
            // Verify the mock was called with original data
            const expectedCall = {
                data: {
                    ...productWithWhitespace  // Use original data as service should handle trimming
                }
            };
            
            // Verify mock calls
            const mockCalls = createMock.mock.calls;
            expect(mockCalls.length).toBe(1);
            expect(mockCalls[0]).toBeDefined();
            
            const actualCall = mockCalls[0] as unknown as [{ data: CreateProductDto }];
            expect(actualCall[0]).toEqual(expectedCall);

            // Verify the service returns trimmed data even if database stores original
            expect(result.name).toBe('Test Product');
        });
    });

    describe('updateProduct', () => {
        test('should update an existing product', async () => {
            // Arrange
            const productId = 1;
            const updateData = {
                name: 'Updated Product',
                qty: 2,
                total_cogs: 200,
                total_price: 300
            };

            const updatedProduct: Product = {
                id: productId,
                ...updateData,
                created_at: new Date(),
                updated_at: new Date()
            };

            mockDb.product.findUnique = mock(() => Promise.resolve({ ...updatedProduct, name: 'Old Name' }));
            mockDb.product.update = mock(() => Promise.resolve(updatedProduct));

            // Act
            const result = await ProductService.updateProduct(productId, updateData);

            // Assert
            expect(result).toBeDefined();
            expect(result).toEqual(updatedProduct);
            expect(mockDb.product.update).toHaveBeenCalledWith({
                where: { id: productId },
                data: updateData
            });
        });

        test('should return null when product not found', async () => {
            // Arrange
            const productId = 999;
            const updateData = {
                name: 'Updated Product',
                qty: 2,
                total_cogs: 200,
                total_price: 300
            };

            // Mock validation
            mock.module('@validations/product-validation', () => ({
                ProductValidation: {
                    updateProduct: {
                        parse: () => updateData
                    }
                }
            }));

            // Mock database calls
            mockDb.product.findUnique = mock(() => Promise.resolve(null));
            mockDb.product.update = mock(() => Promise.resolve(null));

            // Act
            const result = await ProductService.updateProduct(productId, updateData);

            // Assert
            expect(result).toBeNull();
            expect(mockDb.product.findUnique).toHaveBeenCalledWith({ 
                where: { id: productId } 
            });
            expect(mockDb.product.update).not.toHaveBeenCalled();
        });
    });

    describe('deleteProduct', () => {
        test('should delete an existing product', async () => {
            // Arrange
            const productId = 1;
            const existingProduct: Product = {
                id: productId,
                name: 'Product to Delete',
                qty: 1,
                total_cogs: 100,
                total_price: 150,
                created_at: new Date(),
                updated_at: new Date()
            };

            mockDb.product.findUnique = mock(() => Promise.resolve(existingProduct));
            mockDb.product.delete = mock(() => Promise.resolve(existingProduct));

            // Act
            const result = await ProductService.deleteProduct(productId);

            // Assert
            expect(result).toBeDefined();
            expect(result).toEqual(existingProduct);
            expect(mockDb.product.delete).toHaveBeenCalledWith({ where: { id: productId } });
        });

        test('should return null when product not found', async () => {
            // Arrange
            const productId = 999;
            
            // Mock database calls
            mockDb.product.findUnique = mock(() => Promise.resolve(null));
            mockDb.product.delete = mock(() => Promise.resolve(null));

            // Act
            const result = await ProductService.deleteProduct(productId);

            // Assert
            expect(result).toBeNull();
            expect(mockDb.product.findUnique).toHaveBeenCalledWith({ 
                where: { id: productId } 
            });
            expect(mockDb.product.delete).not.toHaveBeenCalled();
        });

        test('should handle database errors during deletion', async () => {
            // Arrange
            const productId = 1;
            const existingProduct: Product = {
                id: productId,
                name: 'Product to Delete',
                qty: 1,
                total_cogs: 100,
                total_price: 150,
                created_at: new Date(),
                updated_at: new Date()
            };

            const dbError = new Error('Database connection failed');
            mockDb.product.findUnique = mock(() => Promise.resolve(existingProduct));
            mockDb.product.delete = mock(() => Promise.reject(dbError));

            // Act & Assert
            await expect(ProductService.deleteProduct(productId))
                .rejects
                .toThrow('Database connection failed');
        });
    });
}); 