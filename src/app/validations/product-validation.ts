import { ZodType, z } from "zod";

export class ProductValidation {
    // create a schema for the product
    static readonly createProduct: ZodType = z.object({
        name: z.string().nonempty().min(5),
        qty: z.number().positive().min(1),
        total_cogs: z.number().positive(),
        total_price: z.number().positive()
    });
    
    // update a product
    static readonly updateProduct: ZodType = z.object({
        name: z.string().nonempty().min(5),
        qty: z.number().positive().min(1),
        total_cogs: z.number().positive(),
        total_price: z.number().positive()
    });

}