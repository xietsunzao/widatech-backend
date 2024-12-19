# Invoice Management System API

A RESTful API service for managing invoices and products built with TypeScript, Express, and Prisma.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh) v1.1.38
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: MySQL
- **Testing**: Bun Test
- **Validation**: Zod
- **File Processing**: XLSX

## Features

- CRUD operations for Invoices and Products
- Excel file import for bulk invoice creation
- Data validation
- Pagination support
- Detailed error handling
- Unit testing

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd widatech-testcode
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
# Create .env file
cp .env.example .env

# Configure your database connection
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
```

4. Run database migrations:
```bash
bunx prisma migrate dev
```

5. Start the server:
```bash
bun dev
```

## API Endpoints

### Products

#### Get All Products
```http
GET /api/products
```

Response:
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "qty": 10,
      "total_cogs": 1000,
      "total_price": 1500,
      "created_at": "2024-01-19T06:23:42.000Z",
      "updated_at": "2024-01-19T06:23:42.000Z"
    }
  ]
}
```

#### Get Product by ID
```http
GET /api/product/:id
```

Response:
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Product Name",
    "qty": 10,
    "total_cogs": 1000,
    "total_price": 1500,
    "created_at": "2024-01-19T06:23:42.000Z",
    "updated_at": "2024-01-19T06:23:42.000Z"
  }
}
```

#### Create Product
```http
POST /api/product
```

Request Body:
```json
{
  "name": "New Product",
  "qty": 10,
  "total_cogs": 1000,
  "total_price": 1500
}
```

#### Update Product
```http
PUT /api/product/:id
```

Request Body:
```json
{
  "name": "Updated Product",
  "qty": 15,
  "total_cogs": 1200,
  "total_price": 1800
}
```

#### Delete Product
```http
DELETE /api/product/:id
```

### Invoices

#### Get All Invoices
```http
GET /api/invoices?page=1&limit=10
```

Response:
```json
{
  "success": true,
  "message": "Invoices fetched successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "invoice_no": "INV-001",
        "invoice_date": "2024-01-19T06:23:42.000Z",
        "customer_name": "John Doe",
        "salesperson": "Jane Smith",
        "payment_type": "CASH",
        "notes": "Sample note",
        "created_at": "2024-01-19T06:23:42.000Z",
        "updated_at": "2024-01-19T06:23:42.000Z",
        "products": [...]
      }
    ],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "summary": {
      "total_profit": 5000,
      "total_cash_transactions": 75
    }
  }
}
```

#### Get Invoice by ID
```http
GET /api/invoice/:id
```

Response:
```json
{
  "success": true,
  "message": "Invoice fetched successfully",
  "data": {
    "id": 1,
    "invoice_no": "INV-001",
    "invoice_date": "2024-01-19T06:23:42.000Z",
    "customer_name": "John Doe",
    "salesperson": "Jane Smith",
    "payment_type": "CASH",
    "notes": "Sample note",
    "created_at": "2024-01-19T06:23:42.000Z",
    "updated_at": "2024-01-19T06:23:42.000Z",
    "products": [...],
    "summary": {
      "total_profit": 500,
      "is_cash_transaction": true
    }
  }
}
```

#### Create Invoice
```http
POST /api/invoice
```

Request Body:
```json
{
  "invoice_no": "INV-001",
  "customer_name": "John Doe",
  "salesperson": "Jane Smith",
  "payment_type": "CASH",
  "notes": "Sample note",
  "products": [
    {
      "product_id": 1
    }
  ]
}
```

#### Update Invoice
```http
PUT /api/invoice/:id
```

Request Body:
```json
{
  "invoice_no": "INV-001",
  "customer_name": "John Doe Updated",
  "salesperson": "Jane Smith",
  "payment_type": "CREDIT",
  "notes": "Updated note",
  "products": [
    {
      "product_id": 2
    }
  ]
}
```

#### Delete Invoice
```http
DELETE /api/invoice/:id
```

#### Import Invoices from Excel
```http
POST /api/invoice/import
```

Request:
- Method: POST
- Content-Type: multipart/form-data
- Body: file (Excel file)

Response Success:
```json
{
  "success": true,
  "message": "Import successful",
  "data": {
    "imported_count": 10
  }
}
```

Response Error:
```json
{
  "success": false,
  "message": "Import completed with errors",
  "errors": [
    {
      "invoice_no": "INV-001",
      "errors": ["Invalid product data"]
    }
  ],
  "imported_count": 5
}
```

## Running Tests

```bash
bun test
```

## License

[MIT](LICENSE)
