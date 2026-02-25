# Tashivar B2B Portal - REST API Documentation

**Version:** 1.0.0  
**Base URL:** `https://api.tashivar.com/v1`  
**Authentication:** JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Product Management](#product-management)
4. [Order Management](#order-management)
5. [Inventory Management](#inventory-management)
6. [Warehouse Management](#warehouse-management)
7. [Finance Management](#finance-management)
8. [Commission Management](#commission-management)
9. [Vendor Management](#vendor-management)
10. [Buyer Management](#buyer-management)
11. [Dashboard & Analytics](#dashboard--analytics)
12. [Error Codes](#error-codes)

---

## Authentication

### POST `/auth/login`
User login with credentials

**Request Body:**
```json
{
  "email": "admin@tashivar.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "USR-ADMIN-001",
      "name": "Admin",
      "email": "admin@tashivar.com",
      "role": "admin",
      "permissions": [
        "view_overview",
        "manage_orders",
        "manage_products",
        "manage_inventory",
        "manage_warehouse",
        "view_finance",
        "manage_commission",
        "manage_users",
        "manage_vendors",
        "manage_buyers"
      ]
    }
  }
}
```

### POST `/auth/register`
Register new user (Admin only)

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "password": "password123",
  "role": "vendor",
  "businessName": "John's Fashion House",
  "location": "Mumbai, Maharashtra"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "USR-1234567890-abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "vendor",
    "status": "active"
  },
  "message": "User registered successfully"
}
```

### POST `/auth/refresh-token`
Refresh JWT token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/auth/logout`
Logout user

**Headers:**
```
Authorization: Bearer {token}
```

---

## User Management

### GET `/users`
Get all users (Admin only)

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `role` (optional): Filter by role (admin, vendor, shop-owner, designer, stitching-master, vendor-agent, buyer-agent)
- `status` (optional): Filter by status (active, inactive, suspended)
- `search` (optional): Search by name, email, phone
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "USR-ADMIN-001",
        "name": "Admin",
        "email": "admin@tashivar.com",
        "phone": "+91 98765 00000",
        "role": "admin",
        "status": "active",
        "permissions": ["view_overview", "manage_orders", "..."],
        "createdAt": "2026-01-15T10:30:00Z",
        "lastLogin": "2026-01-23T09:15:00Z",
        "businessName": null,
        "location": null
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### GET `/users/:id`
Get user by ID

**Headers:**
```
Authorization: Bearer {token}
```

### PUT `/users/:id`
Update user

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "+91 98765 99999",
  "businessName": "Updated Fashion House",
  "location": "Delhi, India",
  "status": "active",
  "permissions": ["view_overview", "manage_products"]
}
```

### DELETE `/users/:id`
Delete user (Admin only, cannot delete admin users)

**Headers:**
```
Authorization: Bearer {token}
```

### PATCH `/users/:id/status`
Toggle user status (activate/deactivate/suspend)

**Request Body:**
```json
{
  "status": "suspended"
}
```

### GET `/users/:id/permissions`
Get user permissions

### PUT `/users/:id/permissions`
Update user permissions (Admin only)

**Request Body:**
```json
{
  "permissions": [
    "view_overview",
    "manage_products",
    "view_orders"
  ]
}
```

---

## Product Management

### POST `/products`
Add new product (Vendor/Designer role)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
name: "Designer Silk Saree"
type: "readymade"
category: "saree"
subcategory: "silk-saree"
description: "Premium Banarasi silk saree"
costPrice: 2500
suggestedPrice: 4500
minimumOrderQuantity: 10
fabric: "Pure Silk"
color: "Royal Blue"
size: "Free Size"
occasion: "Wedding, Party"
images: [File, File, File]
designerId: "USR-DES-001" (optional)
stitchingMasterId: "USR-STM-001" (optional)
customizable: true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "PRD-1737629400-xyz",
    "name": "Designer Silk Saree",
    "type": "readymade",
    "vendor": "By Tashivar",
    "actualVendorId": "USR-VENDOR-123",
    "costPrice": 2500,
    "suggestedPrice": 4500,
    "status": "pending",
    "images": [
      "https://storage.tashivar.com/products/img1.jpg"
    ],
    "createdAt": "2026-01-23T10:30:00Z"
  },
  "message": "Product submitted for approval"
}
```

### GET `/products`
Get all products

**Query Parameters:**
- `type` (optional): readymade, fabric
- `status` (optional): pending, approved, rejected, active, inactive
- `category` (optional): saree, salwar, lehenga, kurti, etc.
- `vendor` (optional): Filter by vendor ID
- `search` (optional): Search by name, SKU
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "PRD-1737629400-xyz",
        "sku": "TSH-SAR-001",
        "name": "Designer Silk Saree",
        "type": "readymade",
        "category": "saree",
        "vendor": "By Tashivar",
        "actualVendorId": "USR-VENDOR-123",
        "costPrice": 2500,
        "suggestedPrice": 4500,
        "stock": 150,
        "status": "approved",
        "images": ["url1", "url2"],
        "rating": 4.5,
        "reviews": 23,
        "createdAt": "2026-01-23T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 20,
      "totalPages": 6
    }
  }
}
```

### GET `/products/:id`
Get product details

### PUT `/products/:id`
Update product (Vendor/Admin)

### DELETE `/products/:id`
Delete product (Admin only)

### PATCH `/products/:id/approve`
Approve product (Admin only)

**Request Body:**
```json
{
  "status": "approved",
  "finalPrice": 4500,
  "commissionRate": 18,
  "notes": "Excellent quality product"
}
```

### PATCH `/products/:id/reject`
Reject product (Admin only)

**Request Body:**
```json
{
  "reason": "Quality does not meet standards",
  "notes": "Please resubmit with better images"
}
```

### GET `/products/:id/commission`
Get product commission structure

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "PRD-1737629400-xyz",
    "costPrice": 2500,
    "sellingPrice": 4500,
    "totalCommission": 450,
    "commissionRate": 18,
    "distribution": [
      {
        "party": "Vendor",
        "role": "vendor",
        "percentage": 70,
        "amount": 315,
        "userId": "USR-VENDOR-123",
        "name": "John Doe",
        "phone": "+91 98765 43210"
      },
      {
        "party": "Stitching Master",
        "role": "stitching-master",
        "percentage": 30,
        "amount": 135,
        "userId": "USR-STM-001",
        "name": "Ram Kumar",
        "phone": "+91 98765 11111"
      }
    ]
  }
}
```

---

## Order Management

### POST `/orders`
Create new order (Shop Owner/Buyer Agent)

**Request Body:**
```json
{
  "customerId": "USR-SHOP-001",
  "customerName": "ABC Fashion Store",
  "customerPhone": "+91 98765 11111",
  "shippingAddress": {
    "addressLine1": "123 MG Road",
    "addressLine2": "Near City Mall",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "items": [
    {
      "productId": "PRD-1737629400-xyz",
      "productName": "Designer Silk Saree",
      "quantity": 50,
      "price": 4500,
      "customization": {
        "size": "L",
        "color": "Red",
        "notes": "Gold border required"
      }
    }
  ],
  "paymentMethod": "upi",
  "notes": "Urgent delivery required"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "ORD-1737629500-abc",
    "orderNumber": "TSH-ORD-2026-001",
    "customerId": "USR-SHOP-001",
    "customerName": "ABC Fashion Store",
    "status": "pending",
    "paymentStatus": "pending",
    "totalAmount": 225000,
    "itemCount": 50,
    "createdAt": "2026-01-23T11:00:00Z",
    "estimatedDelivery": "2026-02-05T00:00:00Z"
  },
  "message": "Order created successfully"
}
```

### GET `/orders`
Get all orders

**Query Parameters:**
- `status` (optional): pending, processing, manufacturing, ready, dispatched, delivered, cancelled
- `paymentStatus` (optional): pending, paid, refunded
- `customerId` (optional): Filter by customer
- `vendorId` (optional): Filter by vendor (for vendor dashboard)
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `search` (optional): Search by order number, customer name
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "ORD-1737629500-abc",
        "orderNumber": "TSH-ORD-2026-001",
        "customerId": "USR-SHOP-001",
        "customerName": "ABC Fashion Store",
        "customerPhone": "+91 98765 11111",
        "status": "processing",
        "paymentStatus": "paid",
        "totalAmount": 225000,
        "itemCount": 50,
        "items": [
          {
            "productId": "PRD-1737629400-xyz",
            "productName": "Designer Silk Saree",
            "quantity": 50,
            "price": 4500,
            "total": 225000
          }
        ],
        "shippingAddress": {
          "addressLine1": "123 MG Road",
          "city": "Mumbai",
          "state": "Maharashtra",
          "pincode": "400001"
        },
        "createdAt": "2026-01-23T11:00:00Z",
        "estimatedDelivery": "2026-02-05T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### GET `/orders/:id`
Get order details

### PUT `/orders/:id`
Update order

### PATCH `/orders/:id/status`
Update order status

**Request Body:**
```json
{
  "status": "manufacturing",
  "notes": "Production started",
  "estimatedCompletion": "2026-01-30T00:00:00Z"
}
```

### PATCH `/orders/:id/payment-status`
Update payment status

**Request Body:**
```json
{
  "paymentStatus": "paid",
  "paymentMethod": "upi",
  "transactionId": "TXN123456789",
  "paidAmount": 225000,
  "paidAt": "2026-01-23T12:00:00Z"
}
```

### POST `/orders/:id/dispatch`
Dispatch order

**Request Body:**
```json
{
  "trackingNumber": "DTDC123456789",
  "carrier": "DTDC",
  "dispatchDate": "2026-01-25T10:00:00Z",
  "estimatedDelivery": "2026-01-30T00:00:00Z",
  "notes": "Dispatched via express delivery"
}
```

### POST `/orders/:id/cancel`
Cancel order

**Request Body:**
```json
{
  "reason": "Customer request",
  "refundAmount": 225000,
  "notes": "Full refund processed"
}
```

### GET `/orders/:id/tracking`
Get order tracking details

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1737629500-abc",
    "orderNumber": "TSH-ORD-2026-001",
    "status": "dispatched",
    "trackingNumber": "DTDC123456789",
    "carrier": "DTDC",
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2026-01-23T11:00:00Z",
        "description": "Order placed"
      },
      {
        "status": "processing",
        "timestamp": "2026-01-23T12:30:00Z",
        "description": "Payment confirmed, order processing"
      },
      {
        "status": "manufacturing",
        "timestamp": "2026-01-24T09:00:00Z",
        "description": "Manufacturing in progress"
      },
      {
        "status": "dispatched",
        "timestamp": "2026-01-25T10:00:00Z",
        "description": "Order dispatched"
      }
    ],
    "estimatedDelivery": "2026-01-30T00:00:00Z"
  }
}
```

---

## Inventory Management

### GET `/inventory`
Get inventory overview

**Query Parameters:**
- `type` (optional): readymade, fabric
- `status` (optional): in-stock, low-stock, out-of-stock
- `warehouse` (optional): Filter by warehouse
- `search` (optional): Search products
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProducts": 120,
      "totalStock": 15234,
      "lowStockItems": 8,
      "outOfStockItems": 3,
      "totalValue": 45670000
    },
    "inventory": [
      {
        "productId": "PRD-1737629400-xyz",
        "sku": "TSH-SAR-001",
        "productName": "Designer Silk Saree",
        "type": "readymade",
        "currentStock": 150,
        "minStock": 50,
        "maxStock": 500,
        "status": "in-stock",
        "warehouse": "WH-MUM-001",
        "costPrice": 2500,
        "totalValue": 375000,
        "lastRestocked": "2026-01-20T10:00:00Z",
        "movements": {
          "last30Days": {
            "in": 200,
            "out": 50
          }
        }
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 20,
      "totalPages": 6
    }
  }
}
```

### GET `/inventory/:productId`
Get inventory details for specific product

### POST `/inventory/stock-in`
Add stock (restock)

**Request Body:**
```json
{
  "productId": "PRD-1737629400-xyz",
  "quantity": 100,
  "warehouseId": "WH-MUM-001",
  "batchNumber": "BATCH-2026-001",
  "expiryDate": null,
  "supplierInvoice": "INV-2026-001",
  "notes": "New stock arrival from vendor"
}
```

### POST `/inventory/stock-out`
Reduce stock (manual adjustment)

**Request Body:**
```json
{
  "productId": "PRD-1737629400-xyz",
  "quantity": 10,
  "warehouseId": "WH-MUM-001",
  "reason": "damaged",
  "notes": "Damaged during inspection"
}
```

### POST `/inventory/transfer`
Transfer stock between warehouses

**Request Body:**
```json
{
  "productId": "PRD-1737629400-xyz",
  "quantity": 50,
  "fromWarehouse": "WH-MUM-001",
  "toWarehouse": "WH-DEL-001",
  "notes": "Transfer to Delhi warehouse"
}
```

### GET `/inventory/movements`
Get stock movement history

**Query Parameters:**
- `productId` (optional)
- `warehouseId` (optional)
- `type` (optional): in, out, transfer
- `startDate`, `endDate`
- `page`, `limit`

### GET `/inventory/alerts`
Get low stock and out-of-stock alerts

**Response:**
```json
{
  "success": true,
  "data": {
    "lowStock": [
      {
        "productId": "PRD-1737629400-xyz",
        "productName": "Designer Silk Saree",
        "currentStock": 45,
        "minStock": 50,
        "deficit": 5
      }
    ],
    "outOfStock": [
      {
        "productId": "PRD-1737629401-abc",
        "productName": "Cotton Kurti",
        "currentStock": 0,
        "minStock": 30
      }
    ]
  }
}
```

---

## Warehouse Management

### GET `/warehouses`
Get all warehouses

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "WH-MUM-001",
      "name": "Mumbai Main Warehouse",
      "code": "MUM-WH-01",
      "location": {
        "address": "Plot 123, MIDC Area",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "country": "India"
      },
      "capacity": 50000,
      "currentOccupancy": 15234,
      "occupancyPercentage": 30.47,
      "status": "active",
      "manager": {
        "id": "USR-MGR-001",
        "name": "Manager Name",
        "phone": "+91 98765 00001"
      },
      "createdAt": "2025-12-01T00:00:00Z"
    }
  ]
}
```

### POST `/warehouses`
Create new warehouse (Admin only)

**Request Body:**
```json
{
  "name": "Delhi Warehouse",
  "code": "DEL-WH-01",
  "location": {
    "address": "Industrial Area, Sector 18",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "country": "India"
  },
  "capacity": 30000,
  "managerId": "USR-MGR-002"
}
```

### GET `/warehouses/:id`
Get warehouse details

### PUT `/warehouses/:id`
Update warehouse

### DELETE `/warehouses/:id`
Delete warehouse

### GET `/warehouses/:id/inventory`
Get inventory in specific warehouse

### POST `/warehouses/:id/barcode-scan`
Process barcode scan

**Request Body:**
```json
{
  "barcode": "TSH-PRD-1737629400-xyz",
  "action": "in",
  "quantity": 10,
  "notes": "New stock arrival"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "PRD-1737629400-xyz",
    "productName": "Designer Silk Saree",
    "sku": "TSH-SAR-001",
    "previousStock": 140,
    "newStock": 150,
    "action": "in",
    "quantity": 10,
    "timestamp": "2026-01-23T14:00:00Z"
  },
  "message": "Stock updated successfully"
}
```

### GET `/warehouses/:id/movements`
Get warehouse stock movements

---

## Finance Management

### GET `/finance/overview`
Get financial overview

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `period` (optional): today, week, month, quarter, year

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 15750000,
      "totalCommission": 850000,
      "pendingPayments": 450000,
      "paidCommissions": 400000,
      "netProfit": 14900000
    },
    "revenueByPeriod": [
      {
        "period": "2026-01",
        "revenue": 15750000,
        "orders": 45,
        "commission": 850000
      }
    ],
    "topProducts": [
      {
        "productId": "PRD-1737629400-xyz",
        "productName": "Designer Silk Saree",
        "revenue": 2250000,
        "unitsSold": 500,
        "commission": 120000
      }
    ],
    "revenueByCategory": [
      {
        "category": "saree",
        "revenue": 8500000,
        "percentage": 54
      },
      {
        "category": "salwar",
        "revenue": 4200000,
        "percentage": 27
      }
    ]
  }
}
```

### GET `/finance/transactions`
Get all financial transactions

**Query Parameters:**
- `type` (optional): revenue, commission, refund
- `status` (optional): pending, completed, cancelled
- `startDate`, `endDate`
- `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "TXN-1737629600-abc",
        "type": "revenue",
        "orderId": "ORD-1737629500-abc",
        "orderNumber": "TSH-ORD-2026-001",
        "amount": 225000,
        "status": "completed",
        "paymentMethod": "upi",
        "transactionDate": "2026-01-23T12:00:00Z",
        "description": "Payment for order TSH-ORD-2026-001"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8
    }
  }
}
```

### GET `/finance/reports`
Generate financial reports

**Query Parameters:**
- `reportType`: sales, commission, profit-loss, tax
- `startDate`, `endDate`
- `format` (optional): json, pdf, excel

### POST `/finance/transactions/:id/process`
Process pending transaction

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Payment processed successfully"
}
```

---

## Commission Management

### GET `/commission/rules`
Get all commission rules

**Response:**
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "COMM-RULE-001",
        "productId": "PRD-1737629400-xyz",
        "productName": "Designer Silk Saree",
        "productType": "readymade",
        "totalCommissionPercentage": 18,
        "parties": [
          {
            "role": "vendor",
            "userId": "USR-VENDOR-123",
            "name": "John Doe",
            "phone": "+91 98765 43210",
            "percentage": 70,
            "amount": 315
          },
          {
            "role": "stitching-master",
            "userId": "USR-STM-001",
            "name": "Ram Kumar",
            "phone": "+91 98765 11111",
            "percentage": 30,
            "amount": 135
          }
        ]
      }
    ]
  }
}
```

### GET `/commission/rules/:productId`
Get commission rule for specific product

### POST `/commission/rules`
Create commission rule (Admin only)

**Request Body:**
```json
{
  "productId": "PRD-1737629400-xyz",
  "totalCommissionPercentage": 18,
  "parties": [
    {
      "role": "vendor",
      "userId": "USR-VENDOR-123",
      "percentage": 70
    },
    {
      "role": "stitching-master",
      "userId": "USR-STM-001",
      "percentage": 30
    }
  ]
}
```

### PUT `/commission/rules/:id`
Update commission rule

### DELETE `/commission/rules/:id`
Delete commission rule

### GET `/commission/transactions`
Get commission transactions

**Query Parameters:**
- `status` (optional): pending, paid
- `partyId` (optional): Filter by party/user
- `orderId` (optional): Filter by order
- `startDate`, `endDate`
- `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "COMM-TXN-001",
        "orderId": "ORD-1737629500-abc",
        "orderNumber": "TSH-ORD-2026-001",
        "productId": "PRD-1737629400-xyz",
        "productName": "Designer Silk Saree",
        "quantity": 50,
        "totalCommission": 22500,
        "parties": [
          {
            "userId": "USR-VENDOR-123",
            "role": "vendor",
            "name": "John Doe",
            "phone": "+91 98765 43210",
            "amount": 15750,
            "percentage": 70,
            "status": "pending"
          },
          {
            "userId": "USR-STM-001",
            "role": "stitching-master",
            "name": "Ram Kumar",
            "phone": "+91 98765 11111",
            "amount": 6750,
            "percentage": 30,
            "status": "paid"
          }
        ],
        "createdAt": "2026-01-23T11:00:00Z"
      }
    ],
    "pagination": {
      "total": 85,
      "page": 1,
      "limit": 20,
      "totalPages": 5
    }
  }
}
```

### POST `/commission/transactions/:id/pay`
Mark commission as paid

**Request Body:**
```json
{
  "partyUserId": "USR-VENDOR-123",
  "paymentMethod": "bank-transfer",
  "transactionId": "BANK-TXN-123456",
  "notes": "Payment processed via NEFT"
}
```

### GET `/commission/summary`
Get commission summary

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCommission": 850000,
    "pendingCommission": 450000,
    "paidCommission": 400000,
    "byParty": [
      {
        "userId": "USR-VENDOR-123",
        "name": "John Doe",
        "role": "vendor",
        "totalCommission": 315000,
        "pending": 150000,
        "paid": 165000
      }
    ],
    "byMonth": [
      {
        "month": "2026-01",
        "total": 850000,
        "pending": 450000,
        "paid": 400000
      }
    ]
  }
}
```

### GET `/commission/default-rates`
Get default commission rates

**Response:**
```json
{
  "success": true,
  "data": {
    "fabric": {
      "rate": 12,
      "distribution": [
        {
          "role": "vendor",
          "percentage": 100
        }
      ]
    },
    "readymade": {
      "rate": 18,
      "distribution": [
        {
          "role": "vendor",
          "percentage": 70
        },
        {
          "role": "stitching-master",
          "percentage": 30
        },
        {
          "role": "designer",
          "percentage": 0
        }
      ]
    }
  }
}
```

### PUT `/commission/default-rates`
Update default commission rates (Admin only)

---

## Vendor Management

### GET `/vendors`
Get all vendors

**Query Parameters:**
- `status` (optional): active, inactive, pending, suspended
- `category` (optional): Filter by product category specialty
- `search` (optional)
- `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "vendors": [
      {
        "id": "USR-VENDOR-123",
        "name": "John Doe",
        "businessName": "John's Fashion House",
        "email": "john@example.com",
        "phone": "+91 98765 43210",
        "location": "Mumbai, Maharashtra",
        "status": "active",
        "rating": 4.5,
        "totalProducts": 45,
        "activeProducts": 42,
        "totalOrders": 150,
        "totalRevenue": 6750000,
        "totalCommission": 450000,
        "pendingCommission": 120000,
        "joinedDate": "2025-11-15T00:00:00Z",
        "categories": ["saree", "salwar", "lehenga"]
      }
    ],
    "pagination": {
      "total": 35,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

### GET `/vendors/:id`
Get vendor details

### GET `/vendors/:id/products`
Get vendor's products

### GET `/vendors/:id/orders`
Get vendor's orders

### GET `/vendors/:id/commission`
Get vendor's commission details

### GET `/vendors/:id/analytics`
Get vendor performance analytics

**Response:**
```json
{
  "success": true,
  "data": {
    "vendorId": "USR-VENDOR-123",
    "performance": {
      "totalProducts": 45,
      "activeProducts": 42,
      "approvalRate": 93.33,
      "totalOrders": 150,
      "completedOrders": 142,
      "cancelledOrders": 8,
      "averageRating": 4.5,
      "totalRevenue": 6750000,
      "totalCommission": 450000
    },
    "salesByMonth": [
      {
        "month": "2026-01",
        "orders": 25,
        "revenue": 1125000,
        "commission": 75000
      }
    ],
    "topProducts": [
      {
        "productId": "PRD-1737629400-xyz",
        "productName": "Designer Silk Saree",
        "unitsSold": 500,
        "revenue": 2250000
      }
    ]
  }
}
```

### PATCH `/vendors/:id/status`
Update vendor status

---

## Buyer Management

### GET `/buyers`
Get all buyers (Shop Owners)

**Query Parameters:**
- `status` (optional)
- `search` (optional)
- `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "buyers": [
      {
        "id": "USR-SHOP-001",
        "name": "ABC Fashion Store",
        "email": "abc@store.com",
        "phone": "+91 98765 11111",
        "businessName": "ABC Fashion Store",
        "location": "Delhi, India",
        "status": "active",
        "totalOrders": 25,
        "completedOrders": 23,
        "totalSpent": 5625000,
        "averageOrderValue": 225000,
        "joinedDate": "2025-10-01T00:00:00Z",
        "creditLimit": 1000000,
        "availableCredit": 500000
      }
    ],
    "pagination": {
      "total": 28,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

### GET `/buyers/:id`
Get buyer details

### GET `/buyers/:id/orders`
Get buyer's order history

### GET `/buyers/:id/analytics`
Get buyer analytics

### PATCH `/buyers/:id/credit-limit`
Update buyer's credit limit (Admin only)

**Request Body:**
```json
{
  "creditLimit": 1500000,
  "notes": "Increased limit based on payment history"
}
```

---

## Dashboard & Analytics

### GET `/dashboard/overview`
Get dashboard overview based on user role

**Response (Admin):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalRevenue": 15750000,
      "totalOrders": 45,
      "activeProducts": 120,
      "totalUsers": 85,
      "pendingCommissions": 450000
    },
    "recentOrders": [
      {
        "id": "ORD-1737629500-abc",
        "orderNumber": "TSH-ORD-2026-001",
        "customer": "ABC Fashion Store",
        "amount": 225000,
        "status": "processing",
        "createdAt": "2026-01-23T11:00:00Z"
      }
    ],
    "pendingApprovals": {
      "products": 5,
      "vendors": 2
    },
    "lowStockAlerts": 8,
    "charts": {
      "revenueByMonth": [...],
      "ordersByStatus": [...],
      "topCategories": [...]
    }
  }
}
```

### GET `/dashboard/analytics`
Get detailed analytics

**Query Parameters:**
- `period`: today, week, month, quarter, year, custom
- `startDate`, `endDate` (for custom period)
- `metrics`: revenue, orders, products, users, commission

### GET `/dashboard/notifications`
Get user notifications

**Response:**
```json
{
  "success": true,
  "data": {
    "unread": 5,
    "notifications": [
      {
        "id": "NOTIF-001",
        "type": "order",
        "title": "New Order Received",
        "message": "Order TSH-ORD-2026-001 has been placed",
        "link": "/orders/ORD-1737629500-abc",
        "read": false,
        "createdAt": "2026-01-23T11:00:00Z"
      },
      {
        "id": "NOTIF-002",
        "type": "product",
        "title": "Product Approval Required",
        "message": "5 products pending approval",
        "link": "/products?status=pending",
        "read": false,
        "createdAt": "2026-01-23T10:30:00Z"
      }
    ]
  }
}
```

### PATCH `/dashboard/notifications/:id/read`
Mark notification as read

---

## Error Codes

### Standard HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

### Custom Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {
      "field": "email"
    }
  }
}
```

### Application Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Invalid token |
| `AUTH_004` | Insufficient permissions |
| `USER_001` | User not found |
| `USER_002` | Email already exists |
| `USER_003` | Phone already exists |
| `PROD_001` | Product not found |
| `PROD_002` | Insufficient stock |
| `PROD_003` | Product already approved |
| `ORD_001` | Order not found |
| `ORD_002` | Cannot cancel order |
| `ORD_003` | Invalid order status transition |
| `INV_001` | Insufficient inventory |
| `INV_002` | Invalid warehouse |
| `COMM_001` | Commission rule not found |
| `COMM_002` | Invalid distribution percentage |
| `PAY_001` | Payment failed |
| `PAY_002` | Already paid |

---

## Rate Limiting

- **Public endpoints**: 100 requests per 15 minutes
- **Authenticated endpoints**: 1000 requests per 15 minutes
- **Admin endpoints**: 5000 requests per 15 minutes

**Rate Limit Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1737629700
```

---

## Webhooks

### Available Webhook Events

- `order.created`
- `order.status_changed`
- `order.cancelled`
- `product.approved`
- `product.rejected`
- `payment.completed`
- `commission.paid`
- `inventory.low_stock`

### Webhook Payload Format

```json
{
  "event": "order.created",
  "timestamp": "2026-01-23T11:00:00Z",
  "data": {
    "orderId": "ORD-1737629500-abc",
    "orderNumber": "TSH-ORD-2026-001",
    "customerId": "USR-SHOP-001",
    "totalAmount": 225000
  }
}
```

---

## Data Models

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'shop-owner' | 'vendor' | 'designer' | 'stitching-master' | 'vendor-agent' | 'buyer-agent';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  businessName?: string;
  location?: string;
  createdAt: string;
  lastLogin?: string;
}
```

### Product Model
```typescript
interface Product {
  id: string;
  sku: string;
  name: string;
  type: 'readymade' | 'fabric';
  category: string;
  subcategory?: string;
  description: string;
  vendor: string; // Always "By Tashivar"
  actualVendorId: string;
  costPrice: number;
  suggestedPrice: number;
  minimumOrderQuantity: number;
  images: string[];
  specifications: {
    fabric?: string;
    color?: string;
    size?: string;
    occasion?: string;
  };
  stock: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  rating?: number;
  reviews?: number;
  createdAt: string;
  updatedAt: string;
}
```

### Order Model
```typescript
interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'processing' | 'manufacturing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
}
```

---

## Support

For API support and questions:
- **Email**: api-support@tashivar.com
- **Documentation**: https://docs.tashivar.com/api
- **Status Page**: https://status.tashivar.com
