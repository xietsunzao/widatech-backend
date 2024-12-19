import { ZodType, z } from "zod";
import { db } from "@core/database";

export class InvoiceValidation {
    static readonly createInvoice = z.object({
        invoice_no: z.string()
            .nonempty("Invoice number is required")
            .min(3, "Invoice number must be at least 3 characters")
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
            .min(3, "Customer name must be at least 3 characters")
            .max(100, "Customer name must not exceed 100 characters"),
        
        salesperson: z.string()
            .nonempty("Salesperson name is required")
            .min(3, "Salesperson name must be at least 3 characters")
            .max(100, "Salesperson name must not exceed 100 characters"),
        
        payment_type: z.enum(['CASH', 'CREDIT'], {
            errorMap: () => ({ message: "Payment type must be either CASH or CREDIT" })
        }),
        
        notes: z.string()
            .optional(),
        
        products: z.array(
            z.object({
                product_id: z.number()
                    .int("Product ID must be an integer")
                    .positive("Product ID must be positive")
            })
        ).nonempty("At least one product is required")
    });
}
