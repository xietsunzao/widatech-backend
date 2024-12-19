import { describe, expect, test, beforeEach, mock } from "bun:test";
import { InvoiceService } from '@services/invoice-service';
import { Invoice } from '@prisma/client';
import { InvoiceDetailSummary } from '@models/invoice-model';

// Mock the database module with proper types
const mockDb = {
    invoice: {
        findMany: () => Promise.resolve([] as Invoice[]),
        findUnique: () => Promise.resolve(null as Invoice | null),
        create: () => Promise.resolve(null as Invoice | null),
        update: () => Promise.resolve(null as Invoice | null),
        delete: () => Promise.resolve(null as Invoice | null)
    }
};

// Mock the database module using Bun's test utils
mock.module('@core/database', () => ({
    db: mockDb
}));

describe('InvoiceService', () => {
    beforeEach(() => {
        // Reset mock module before each test
        mock.module('@core/database', () => ({
            db: mockDb
        }));
    });

    describe('getInvoices', () => {
        test('should return all invoices', async () => {
            // Arrange
            const mockInvoices: Invoice[] = [
                {
                    id: 1,
                    invoice_no: 'INV-001',
                    invoice_date: new Date(),
                    customer_name: 'John Doe',
                    salesperson: 'Jane Smith',
                    payment_type: 'CASH',
                    notes: 'Test note',
                    created_at: new Date(),
                    updated_at: new Date()
                },
                {
                    id: 2,
                    invoice_no: 'INV-002',
                    invoice_date: new Date(),
                    customer_name: 'Jane Doe',
                    salesperson: 'John Smith',
                    payment_type: 'CREDIT',
                    notes: null,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ];

            mockDb.invoice.findMany = () => Promise.resolve(mockInvoices);

            // Act
            const result = await InvoiceService.getInvoices();

            // Assert
            expect(result).toEqual(mockInvoices);
        });

        test('should return empty array when no invoices exist', async () => {
            // Arrange
            mockDb.invoice.findMany = () => Promise.resolve([]);

            // Act
            const result = await InvoiceService.getInvoices();

            // Assert
            expect(result).toEqual([]);
        });

        test('should handle database errors', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            mockDb.invoice.findMany = () => Promise.reject(dbError);

            // Act & Assert
            await expect(InvoiceService.getInvoices())
                .rejects
                .toThrow('Database connection failed');
        });
    });

    describe('getInvoiceById', () => {
        test('should return invoice when found', async () => {
            // Arrange
            const mockInvoice: Invoice = {
                id: 1,
                invoice_no: 'INV-001',
                invoice_date: new Date(),
                customer_name: 'John Doe',
                salesperson: 'Jane Smith',
                payment_type: 'CASH',
                notes: 'Test note',
                created_at: new Date(),
                updated_at: new Date()
            };

            const mockInvoiceWithProducts = {
                ...mockInvoice,
                products: [{
                    product: {
                        total_price: 150,
                        total_cogs: 100
                    }
                }]
            };

            const expectedResponse = {
                ...mockInvoiceWithProducts,
                summary: {
                    total_profit: 50, // (150 - 100) * 1
                    is_cash_transaction: true
                }
            };

            mockDb.invoice.findUnique = () => Promise.resolve(mockInvoiceWithProducts);

            // Act
            const result = await InvoiceService.getInvoiceById(1);

            // Assert
            expect(result).toEqual(expectedResponse);
        });

        test('should throw error when invoice not found', async () => {
            // Arrange
            mockDb.invoice.findUnique = () => Promise.resolve(null);

            // Act & Assert
            await expect(InvoiceService.getInvoiceById(999))
                .rejects
                .toThrow('Invoice not found');
        });

        test('should handle database errors', async () => {
            // Arrange
            const dbError = new Error('Database connection failed');
            mockDb.invoice.findUnique = () => Promise.reject(dbError);

            // Act & Assert
            await expect(InvoiceService.getInvoiceById(1))
                .rejects
                .toThrow('Database connection failed');
        });
    });
}); 