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