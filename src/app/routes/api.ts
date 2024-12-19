import express from 'express';
import { ProductController } from '@controllers/product-controller';
import { InvoiceController } from '@controllers/invoice-controller';

export const api = express.Router();

// use API
api.get("/api/products", ProductController.getProducts);
api.get("/api/product/:id", ProductController.getProductById);
api.post("/api/product", ProductController.createProduct);
api.put("/api/product/:id", ProductController.updateProduct);
api.delete("/api/product/:id", ProductController.deleteProduct);

api.get("/api/invoices", InvoiceController.getInvoices);
api.get("/api/invoice/:id", InvoiceController.getInvoiceById);
api.post("/api/invoice", InvoiceController.createInvoice);
api.put("/api/invoice/:id", InvoiceController.updateInvoice);
api.delete("/api/invoice/:id", InvoiceController.deleteInvoice);
