import express from 'express';
import { ProductController } from '@controllers/product-controller';

export const api = express.Router();

// use API

api.get("/api/products", ProductController.getProducts);
api.get("/api/product/:id", ProductController.getProductById);
api.post("/api/product", ProductController.createProduct);
api.put("/api/product/:id", ProductController.updateProduct);
api.delete("/api/product/:id", ProductController.deleteProduct);


