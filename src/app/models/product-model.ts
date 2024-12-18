import { Product } from '@prisma/client';

// Define a type alias for a single product
export type ProductModel = Product | null;

// Define a type for product collection
export type Products = Product[];