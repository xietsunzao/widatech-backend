import { ProductModel } from '@models/product-model';
import { db } from '@core/database';
import { Validator } from '@core/validator';
import { ProductValidation } from '@validations/product-validation';
import { CreateProductDto } from '@dto/product/create-product-dto';
import { UpdateProductDto } from '@dto/product/update-product.dto';

export class ProductService {

    static async getProducts(): Promise<ProductModel[]> {
        return db.product.findMany();
    }

    static async getProductById(id: number): Promise<ProductModel> {
        return db.product.findUnique({
            where: {
                id: id
            }
        });
    }

    static async checkProductExists(id: number): Promise<boolean> {
        // check id first
        if (isNaN(id)) return false;
        return await this.getProductById(id) !== null;
    }

    static async createProduct(product: CreateProductDto): Promise<ProductModel> {
        const validatedData = Validator.validate(ProductValidation.createProduct, product);
        return db.product.create({
            data: validatedData
        });
    }   

    static async updateProduct(id: number, product: UpdateProductDto): Promise<ProductModel> {     
        const validatedData = Validator.validate(ProductValidation.updateProduct, product);
        return db.product.update({
            where: { id: id },
            data: validatedData
        });
    }

    static async deleteProduct(id: number): Promise<ProductModel> {
        return db.product.delete({
            where: { id: id }
        });
    }
}