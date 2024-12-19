import type { Request, Response } from 'express';
import { ResponseHelper } from '@helpers/response.helper';
import { InvoiceService } from '@services/invoice-service';
import { CreateInvoiceDto } from '@dto/invoice/create-invoice-dto';
import { UpdateInvoiceDto } from '@dto/invoice/update-invoice-dto';
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
            // check invoice exist
            const existingInvoice = await InvoiceService.checkInvoiceExists(id);
            if (!existingInvoice) {
                res.status(404).json(ResponseHelper.notFound("Invoice not found"));
                return;
            }
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

    static async updateInvoice(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const data: UpdateInvoiceDto = req.body;
            // check invoice exist
            const existingInvoice = await InvoiceService.checkInvoiceExists(id);
            if (!existingInvoice) {
                res.status(404).json(ResponseHelper.notFound("Invoice not found"));
                return;
            }
            const invoice = await InvoiceService.updateInvoice(id, data);

            res.status(200).json(ResponseHelper.success(invoice, "Invoice updated successfully"));
        } catch (error) {
            Validator.handleError(error, res);
        }
    }

    static async deleteInvoice(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            // check invoice exist
            const existingInvoice = await InvoiceService.checkInvoiceExists(id);
            if (!existingInvoice) {
                res.status(404).json(ResponseHelper.notFound("Invoice not found"));
                return;
            }
            const invoice = await InvoiceService.deleteInvoice(id);
            res.status(200).json(ResponseHelper.success(invoice, "Invoice deleted successfully"));
        } catch (error) {
            Validator.handleError(error, res);
        }
    }

}