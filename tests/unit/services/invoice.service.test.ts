import { describe, expect, test, beforeEach, mock } from "bun:test";
import { InvoiceService } from '@services/invoice-service';
import { Invoice } from '@prisma/client';

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
}); 