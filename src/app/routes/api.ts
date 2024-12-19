import express from 'express';
import { ProductController } from '@controllers/product-controller';
import { InvoiceController } from '@controllers/invoice-controller';
import multer from 'multer';
import { ResponseHelper } from '@helpers/response.helper';

export const api = express.Router();

// Configure multer for Excel files
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

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

api.post("/api/invoice/import", (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            next(err); // Pass to error handler
            return;
        }
        // Proceed with controller if no upload errors
        InvoiceController.importInvoiceFromExcel(req, res).catch(next);
    });
});