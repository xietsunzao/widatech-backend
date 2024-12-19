import { describe, expect, test, beforeEach } from "bun:test";
import { ProductService } from '@services/product-service';
import { Product } from '@prisma/client';

// Mock the database module
const mockDb = {
    product: {
        findMany: () => Promise.resolve([] as Product[])
    }
};

// Mock the database module using Bun's test utils
import { mock } from 'bun:test';
mock.module('@core/database', () => ({
    db: mockDb
}));

describe('ProductService', () => {
    beforeEach(() => {
        // Reset the mock implementation
        mockDb.product.findMany = () => Promise.resolve([] as Product[]);
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
}); 