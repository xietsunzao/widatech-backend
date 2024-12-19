import {
    InvoiceModel,
    PaginatedInvoices,
    InvoiceSummary,
    InvoiceDetailSummary
} from '@models/invoice-model';
import { db } from '@core/database';
import { Validator } from '@core/validator';
import { CreateInvoiceDto } from '@dto/invoice/create-invoice-dto';
import { UpdateInvoiceDto } from '@dto/invoice/update-invoice-dto';
import { InvoiceValidation } from '@validations/invoice-validation';

export class InvoiceService {
    // get all invoices with their products
    static async getInvoices(): Promise<InvoiceModel[]> {
        return db.invoice.findMany({
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    // get invoices with pagination, products, and summary
    static async getInvoicesWithPagination(
        page: number = 1,
        limit: number = 10,
        date?: string
    ): Promise<PaginatedInvoices & { summary: InvoiceSummary }> {
        const skip = (page - 1) * limit;

        // Create date filter if provided
        const dateFilter = date ? {
            invoice_date: {
                gte: new Date(date),
                lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
            }
        } : {};

        // Get total count of invoices
        const total = await db.invoice.count({ where: dateFilter });

        // Get paginated invoices with products
        const invoices = await db.invoice.findMany({
            skip,
            take: limit,
            where: dateFilter,
            orderBy: {
                id: 'desc'
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // Calculate summary
        const summary = await db.invoice.findMany({
            where: dateFilter,
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        }).then(allInvoices => {
            return allInvoices.reduce((acc, invoice) => {
                // Calculate profit for this invoice
                const invoiceProfit = invoice.products.reduce((profit, item) => {
                    return profit + (
                        (item.product.total_price - item.product.total_cogs) * 1 
                    );
                }, 0);

                // Count cash transactions
                const isCashTransaction = invoice.payment_type === 'CASH';

                return {
                    total_profit: acc.total_profit + invoiceProfit,
                    total_cash_transactions: acc.total_cash_transactions + (isCashTransaction ? 1 : 0)
                };
            }, {
                total_profit: 0,
                total_cash_transactions: 0
            });
        });

        const totalPages = Math.ceil(total / limit);

        return {
            data: invoices,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            summary
        };
    }
    

    // get invoice by id with products and summary
    static async getInvoiceById(id: number): Promise<InvoiceModel & { summary: InvoiceDetailSummary }> {
        const invoice = await db.invoice.findUnique({
            where: { id },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!invoice) {
            throw new Error("Invoice not found");
        }

        // Calculate summary for single invoice
        const summary: InvoiceDetailSummary = {
            total_profit: invoice.products.reduce((profit, item) => {
                return profit + (
                    (item.product.total_price - item.product.total_cogs) * 1 // Multiply by quantity if needed
                );
            }, 0),
            is_cash_transaction: invoice.payment_type === 'CASH'
        };

        return {
            ...invoice,
            summary
        };
    }

    // check invoice exist
    static async checkInvoiceExists(id: number): Promise<boolean> {
        if (isNaN(id)) return false;
        const invoice = await db.invoice.findUnique({ where: { id } });
        return invoice !== null;
    }

    // create invoice
    static async createInvoice(data: CreateInvoiceDto): Promise<InvoiceModel> {
        const validatedData = await Validator.validateAsync(InvoiceValidation.createInvoice, data);

        return db.invoice.create({
            data: {
                invoice_no: validatedData.invoice_no,
                invoice_date: new Date(),
                customer_name: validatedData.customer_name,
                salesperson: validatedData.salesperson,
                payment_type: validatedData.payment_type,
                notes: validatedData.notes,
                products: {
                    create: validatedData.products.map((product: { product_id: number }) => ({
                        product: {
                            connect: {
                                id: product.product_id
                            }
                        }
                    }))
                }
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    // update invoice with products
    static async updateInvoice(id: number, data: UpdateInvoiceDto): Promise<InvoiceModel> {
        const validatedData = await Validator.validateAsync(InvoiceValidation.updateInvoice(id), data);

        // First, delete all existing product relationships
        await db.invoiceHasProducts.deleteMany({
            where: {
                invoice_id: id
            }
        });

        // Then update invoice and create new product relationships
        return db.invoice.update({
            where: { id },
            data: {
                invoice_no: validatedData.invoice_no,
                customer_name: validatedData.customer_name,
                salesperson: validatedData.salesperson,
                payment_type: validatedData.payment_type,
                notes: validatedData.notes,
                products: {
                    create: validatedData.products?.map(product => ({
                        product: {
                            connect: {
                                id: product.product_id
                            }
                        }
                    }))
                }
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    // delete invoice
    static async deleteInvoice(id: number): Promise<InvoiceModel> {
        // First, delete all product relationships
        await db.invoiceHasProducts.deleteMany({
            where: {
                invoice_id: id
            }
        });

        // Then delete the invoice
        return db.invoice.delete({
            where: { id },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }
}