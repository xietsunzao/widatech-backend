import { ZodType, z } from "zod";
import { db } from "@core/database";

export class InvoiceValidation {
    static readonly createInvoice = z.object({
        invoice_no: z.string()
            .nonempty("Invoice number is required")
            .min(1, "Invoice number must be at least 1 characters")
            .superRefine(async (invoice_no, ctx) => {
                const existingInvoice = await db.invoice.findFirst({
                    where: { invoice_no }
                });
                if (existingInvoice) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Invoice number must be unique",
                    });
                    return false;
                }
                return true;
            }),

        customer_name: z.string()
            .nonempty("Customer name is required")
            .min(2, "Customer name must be at least 2 characters"),

        salesperson: z.string()
            .nonempty("Salesperson name is required")
            .min(2, "Salesperson name must be at least 2 characters"),

        payment_type: z.enum(['CASH', 'CREDIT'], {
            errorMap: () => ({ message: "Payment type must be either CASH or CREDIT" })
        }),

        notes: z.string()
            .min(5, "Notes must be at least 5 characters")
            .optional(),

        products: z.array(
            z.object({
                product_id: z.number()
                    .int("Product ID must be an integer")
                    .positive("Product ID must be positive")
            })
        ).nonempty("At least one product is required")
    });

    static readonly updateInvoice = (invoiceId: number) => z.object({
        invoice_no: z.string()
            .nonempty("Invoice number is required")
            .min(1, "Invoice number must be at least 1 characters")
            .superRefine(async (invoice_no, ctx) => {
                const existingInvoice = await db.invoice.findFirst({
                    where: {
                        invoice_no,
                        NOT: {
                            id: invoiceId
                        }
                    }
                });
                if (existingInvoice) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Invoice number must be unique",
                    });
                    return false;
                }
                return true;
            }),

        customer_name: z.string()
            .nonempty("Customer name is required")
            .min(2, "Customer name must be at least 2 characters"),

        salesperson: z.string()
            .nonempty("Salesperson name is required")
            .min(2, "Salesperson name must be at least 2 characters"),

        payment_type: z.enum(['CASH', 'CREDIT'], {
            errorMap: () => ({ message: "Payment type must be either CASH or CREDIT" })
        }),

        notes: z.string()
            .min(5, "Notes must be at least 5 characters")
            .optional(),

        products: z.array(
            z.object({
                product_id: z.number()
                    .int("Product ID must be an integer")
                    .positive("Product ID must be positive")
            })
        ).optional()
    });

    static readonly importInvoice = {
        invoice: z.object({
            invoice_no: z.string()
                .nonempty("Invoice number is required")
                .min(1, "Invoice number must be at least 1 characters"),
            customer_name: z.string()
                .nonempty("Customer name is required")
                .min(2, "Customer name must be at least 2 characters"),
            salesperson: z.string()
                .nonempty("Salesperson name is required")
                .min(2, "Salesperson name must be at least 2 characters"),
            notes: z.string()
                .min(5, "Notes must be at least 5 characters")
                .optional()
        }),
        
        product: z.object({
            invoice_no: z.string()
                .nonempty("Invoice number is required"),
            item: z.string()
                .nonempty("Item name is required")
                .min(5, "Item name must be at least 5 characters"),
            quantity: z.number()
                .int("Quantity must be an integer")
                .positive("Quantity must be positive")
                .min(1, "Quantity must be at least 1"),
            total_cogs: z.number()
                .positive("Total COGS must be positive"),
            total_price: z.number()
                .positive("Total price must be positive")
        })
    };
}
