export interface CreateInvoiceDto {
    invoice_no: string;
    customer_name: string;
    salesperson: string;
    payment_type: 'CASH' | 'CREDIT';
    notes?: string;
    products: {
        product_id: number;
    }[];
}