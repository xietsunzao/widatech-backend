import type { Request, Response } from 'express';
import { ProductService } from '@services/product-service';
import { ResponseHelper } from '@helpers/response.helper';
import { CreateProductDto } from '@dto/product/create-product-dto';
import { UpdateProductDto } from '@dto/product/update-product.dto';
import { Validator } from '@core/validator';

export class ProductController {

    // get all products
    static async getProducts(req: Request, res: Response): Promise<void> {
        try {
            const products = await ProductService.getProducts();
            res.json(ResponseHelper.success(products, "Products retrieved successfully"));
        } catch (error) {
            res.status(500).json(ResponseHelper.error("Error retrieving products", error));
        }
    }
    
    // get product by id
    static async getProductById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const product = await ProductService.getProductById(id);
            
            if (!product) {
                res.status(404).json(ResponseHelper.notFound("Product not found"));
                return;
            }
            res.json(ResponseHelper.success(product, "Product retrieved successfully"));
        } catch (error) {
            res.status(500).json(ResponseHelper.error("Error retrieving product", error));
        }
    }

    // create a product
    static async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = req.body as CreateProductDto;
            const createdProduct = await ProductService.createProduct(product);
            res.json(ResponseHelper.success(createdProduct, "Product created successfully"));
        } catch (error) {
            Validator.handleError(error, res);
        }
    }

    // update a product
    static async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const product = req.body as UpdateProductDto;
            const existingProduct = await ProductService.checkProductExists(id);
            if (!existingProduct) {
                res.status(404).json(ResponseHelper.notFound("Product not found"));
                return;
            }
            const updatedProduct = await ProductService.updateProduct(id, product);
            res.json(ResponseHelper.success(updatedProduct, "Product updated successfully"));
        } catch (error) {
            Validator.handleError(error, res);
        }
    }

    // delete a product
    static async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const existingProduct = await ProductService.checkProductExists(id);
            if (!existingProduct) {
                res.status(404).json(ResponseHelper.notFound("Product not found"));
                return;
            }
            const deletedProduct = await ProductService.deleteProduct(id);
            res.json(ResponseHelper.success(deletedProduct, "Product deleted successfully"));
        } catch (error) {
            Validator.handleError(error, res);
        }
    }
}