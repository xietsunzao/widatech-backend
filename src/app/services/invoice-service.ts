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
import * as XLSX from 'xlsx';

interface ImportError {
    invoice_no: string;
    errors: string[];
}

interface ImportResult {
    success: boolean;
    message: string;
    errors?: ImportError[];
    imported_count?: number;
}

interface ExcelInvoice {
    invoice_no: string;
    customer_name: string;
    salesperson: string;
    payment_type: 'CASH' | 'CREDIT';
    notes?: string;
}

interface ExcelProduct {
    invoice_no: string;
    item: string;
    quantity: number;
    total_cogs: number;
    total_price: number;
}

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

    static async importInvoice(file: Express.Multer.File): Promise<ImportResult> {
        try {
            const workbook = XLSX.read(file.buffer);
            const invoiceSheet = workbook.Sheets[workbook.SheetNames[0]];
            const productSheet = workbook.Sheets[workbook.SheetNames[1]];
            
            // Convert to JSON with header row mapping
            const invoices = XLSX.utils.sheet_to_json<ExcelInvoice>(invoiceSheet, {
                raw: false,
                dateNF: 'yyyy-mm-dd',
                header: ['invoice_no', 'customer_name', 'salesperson', 'payment_type', 'notes'],
                range: 1
            });
            
            const products = XLSX.utils.sheet_to_json<{
                invoice_no: string;
                item: string;
                quantity: string;
                total_cogs: string;
                total_price: string;
            }>(productSheet, {
                raw: false,
                header: ['invoice_no', 'item', 'quantity', 'total_cogs', 'total_price'],
                range: 1
            });

            // Group products by invoice_no
            const productsByInvoice = new Map<string, Array<ExcelProduct>>();
            
            for (const rawProduct of products) {
                const quantity = Number(rawProduct.quantity);
                const total_cogs = Number(rawProduct.total_cogs);
                const total_price = Number(rawProduct.total_price);

                if (!productsByInvoice.has(rawProduct.invoice_no)) {
                    productsByInvoice.set(rawProduct.invoice_no, []);
                }

                productsByInvoice.get(rawProduct.invoice_no)?.push({
                    invoice_no: rawProduct.invoice_no,
                    item: rawProduct.item,
                    quantity,
                    total_cogs,
                    total_price
                });
            }
            
            const errors: ImportError[] = [];
            const validInvoices = new Map<string, ExcelInvoice & { products: ExcelProduct[] }>();

            // Helper function to format validation errors
            const formatValidationError = (error: unknown): string[] => {
                if (error instanceof Error) {
                    try {
                        const parsed = JSON.parse(error.message);
                        if (parsed.errors) {
                            return parsed.errors.map((err: any) => 
                                `${err.field}: ${err.message}`
                            );
                        }
                        return [error.message];
                    } catch {
                        return [error.message];
                    }
                }
                return [String(error)];
            };

            // Check for existing invoice numbers
            const existingInvoiceNos = await db.invoice.findMany({
                where: {
                    invoice_no: {
                        in: [...new Set(invoices.map(inv => inv.invoice_no))]
                    }
                },
                select: {
                    invoice_no: true
                }
            });

            const existingInvoiceSet = new Set(existingInvoiceNos.map(inv => inv.invoice_no));

            // Validate invoices and their products together
            for (const invoice of invoices) {
                try {
                    if (existingInvoiceSet.has(invoice.invoice_no)) {
                        errors.push({
                            invoice_no: invoice.invoice_no,
                            errors: ["Invoice number already exists in the system"]
                        });
                        continue;
                    }

                    const cleanedInvoice = Object.fromEntries(
                        Object.entries(invoice).map(([key, value]) => [
                            key,
                            value === '' ? undefined : value
                        ])
                    );

                    await Validator.validateAsync(
                        InvoiceValidation.importInvoice.invoice, 
                        cleanedInvoice
                    );

                    const invoiceProducts = productsByInvoice.get(invoice.invoice_no) || [];
                    
                    // Validate all products for this invoice
                    for (const product of invoiceProducts) {
                        await Validator.validateAsync(
                            InvoiceValidation.importInvoice.product,
                            product
                        );
                    }

                    validInvoices.set(invoice.invoice_no, {
                        ...invoice,
                        products: invoiceProducts
                    });
                } catch (error) {
                    errors.push({
                        invoice_no: invoice.invoice_no || 'Unknown',
                        errors: formatValidationError(error)
                    });
                }
            }

            // Save valid invoices with their products
            if (validInvoices.size > 0) {
                await db.$transaction(async (prisma) => {
                    for (const [_, invoice] of validInvoices) {
                        // Double-check for race conditions
                        const existingInvoice = await prisma.invoice.findUnique({
                            where: { invoice_no: invoice.invoice_no }
                        });

                        if (existingInvoice) {
                            errors.push({
                                invoice_no: invoice.invoice_no,
                                errors: ["Invoice number already exists in the system"]
                            });
                            continue;
                        }

                        await prisma.invoice.create({
                            data: {
                                invoice_no: invoice.invoice_no,
                                invoice_date: new Date(),
                                customer_name: invoice.customer_name,
                                salesperson: invoice.salesperson,
                                payment_type: 'CASH',
                                notes: invoice.notes,
                                products: {
                                    create: invoice.products.map((product) => ({
                                        product: {
                                            create: {
                                                name: product.item,
                                                qty: product.quantity,
                                                total_cogs: product.total_cogs,
                                                total_price: product.total_price
                                            }
                                        }
                                    }))
                                }
                            }
                        });
                    }
                });
            }

            return {
                success: errors.length === 0,
                message: errors.length === 0 ? "Import completed successfully" : "Import completed with errors",
                errors: errors.length > 0 ? errors : undefined,
                imported_count: validInvoices.size
            };

        } catch (error) {
            return {
                success: false,
                message: "Import failed",
                errors: [{
                    invoice_no: "System",
                    errors: [(error as Error).message]
                }]
            };
        }
    }
}