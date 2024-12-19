import { Invoice } from '@prisma/client';

export type InvoiceModel = Invoice | null;

export type Invoices = Invoice[];

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedInvoices {
    data: Invoice[];
    meta: PaginationMeta;
}

export interface InvoiceSummary {
    total_profit: number;
    total_cash_transactions: number;
}

export interface InvoiceDetailSummary {
    total_profit: number;
    is_cash_transaction: boolean;
}

export interface ImportError {
    invoice_no: string;
    errors: string[];
}

export interface ImportResult {
    success: boolean;
    message: string;
    errors?: ImportError[];
    imported_count?: number;
}

export interface ExcelInvoice {
    invoice_no: string;
    customer_name: string;
    salesperson: string;
    payment_type: 'CASH' | 'CREDIT';
    notes?: string;
}

export interface ExcelProduct {
    invoice_no: string;
    item: string;
    quantity: number;
    total_cogs: number;
    total_price: number;
}