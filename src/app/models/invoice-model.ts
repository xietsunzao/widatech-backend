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