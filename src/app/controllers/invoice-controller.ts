import type { Request, Response } from 'express';
import { ResponseHelper } from '@helpers/response.helper';
import { InvoiceService } from '@services/invoice-service';
import { CreateInvoiceDto } from '@dto/invoice/create-invoice-dto';
import { Validator } from '@core/validator';

export class InvoiceController {

    static async getInvoices(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const result = await InvoiceService.getInvoicesWithPagination(page, limit);
            res.status(200).json(ResponseHelper.success(result, "Invoices fetched successfully"));
        } catch (error) {
            res.status(500).json(ResponseHelper.error("Internal server error", error));
        }
    }

    static async getInvoiceById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const invoice = await InvoiceService.getInvoiceById(id);
            res.status(200).json(ResponseHelper.success(invoice, "Invoice fetched successfully"));
        } catch (error) {
            res.status(500).json(ResponseHelper.error("Internal server error", error));
        }
    }

    static async createInvoice(req: Request, res: Response) {
        try {
            const data: CreateInvoiceDto = req.body;
            const invoice = await InvoiceService.createInvoice(data);
            res.status(201).json(ResponseHelper.success(invoice, "Invoice created successfully"));
        } catch (error) {
            Validator.handleError(error, res);
        }
    }
}
