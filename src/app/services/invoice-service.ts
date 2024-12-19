import { InvoiceModel, PaginatedInvoices } from '@models/invoice-model';
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

    // get invoices with pagination and products
    static async getInvoicesWithPagination(page: number = 1, limit: number = 10): Promise<PaginatedInvoices> {
        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Get total count of invoices
        const total = await db.invoice.count();

        // Get paginated invoices
        const invoices = await db.invoice.findMany({
            skip,
            take: limit,
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

        // Calculate total pages
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
            }
        }
    }

    // get invoice by id with products
    static async getInvoiceById(id: number): Promise<InvoiceModel> {
        return db.invoice.findUnique({
            where: { id: id },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    // check invoice exist
    static async checkInvoiceExists(id: number): Promise<boolean> {
        if (isNaN(id)) return false;
        return await this.getInvoiceById(id) !== null;
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