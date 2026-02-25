# Tashivar B2B Portal - Supabase Database Schema

## Database Tables

### 1. users
Stores all user accounts across different roles
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'admin', 'vendor', 'buyer', 'designer', 'stitching-master', 'vendor-agent', 'buyer-agent'
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  company_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  gstin VARCHAR(20),
  pan VARCHAR(20),
  bank_account_number VARCHAR(50),
  bank_ifsc VARCHAR(20),
  bank_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### 2. products
All products in the marketplace
```sql
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'ready-made', 'fabric'
  sub_category VARCHAR(100),
  vendor_id UUID REFERENCES users(id),
  designer_id UUID REFERENCES users(id),
  stitching_master_id UUID REFERENCES users(id),
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2),
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  hsn_code VARCHAR(20),
  unit VARCHAR(20) DEFAULT 'pcs', -- 'pcs', 'meter', 'kg'
  min_order_quantity INTEGER DEFAULT 1,
  image_url TEXT,
  images JSONB, -- Array of image URLs
  specifications JSONB, -- Product specs like size, color, material
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'active', 'inactive'
  approval_notes TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
```

### 3. inventory
Stock levels and tracking
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(50) REFERENCES products(id),
  location VARCHAR(100) DEFAULT 'main-warehouse',
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock DECIMAL(10,2) DEFAULT 0,
  max_stock DECIMAL(10,2) DEFAULT 0,
  reorder_point DECIMAL(10,2) DEFAULT 0,
  avg_monthly_sales DECIMAL(10,2) DEFAULT 0,
  last_reorder_date TIMESTAMP,
  last_stock_update TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, location)
);

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location);
```

### 4. inventory_transactions
All inventory movements
```sql
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(50) REFERENCES products(id),
  transaction_type VARCHAR(50) NOT NULL, -- 'purchase', 'sale', 'adjustment', 'return', 'damage'
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  reference_type VARCHAR(50), -- 'order', 'purchase-order', 'manual'
  reference_id VARCHAR(100),
  location VARCHAR(100),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inv_trans_product ON inventory_transactions(product_id);
CREATE INDEX idx_inv_trans_type ON inventory_transactions(transaction_type);
CREATE INDEX idx_inv_trans_ref ON inventory_transactions(reference_type, reference_id);
```

### 5. orders
Main orders table
```sql
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  order_number VARCHAR(100) UNIQUE NOT NULL,
  buyer_id UUID REFERENCES users(id),
  buyer_agent_id UUID REFERENCES users(id),
  order_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending-approval',
  -- Status flow: pending-approval -> approved -> forwarded-to-vendor -> 
  --              vendor-processing -> vendor-dispatched -> in-transit-to-warehouse ->
  --              received-at-warehouse -> dispatched-to-buyer -> in-transit-to-buyer -> delivered
  
  subtotal DECIMAL(10,2) NOT NULL,
  total_commission DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2) DEFAULT 0,
  
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'refunded'
  payment_method VARCHAR(50),
  payment_date TIMESTAMP,
  payment_reference VARCHAR(100),
  
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_pincode VARCHAR(10),
  shipping_phone VARCHAR(20),
  
  notes TEXT,
  admin_notes TEXT,
  
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

### 6. order_items
Items in each order
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50) REFERENCES products(id),
  product_name VARCHAR(255),
  product_type VARCHAR(50), -- 'readymade', 'fabric'
  sku VARCHAR(100),
  barcode VARCHAR(100),
  
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  
  vendor_id UUID REFERENCES users(id),
  designer_id UUID REFERENCES users(id),
  stitching_master_id UUID REFERENCES users(id),
  vendor_agent_id UUID REFERENCES users(id),
  
  commission_amount DECIMAL(10,2) DEFAULT 0,
  item_profit DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_vendor ON order_items(vendor_id);
```

### 7. commission_rules
Commission configuration per product/category
```sql
CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id VARCHAR(50) REFERENCES products(id),
  category VARCHAR(50),
  
  vendor_commission_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage', 'fixed'
  vendor_commission_value DECIMAL(10,2) DEFAULT 0,
  
  designer_commission_type VARCHAR(20) DEFAULT 'percentage',
  designer_commission_value DECIMAL(10,2) DEFAULT 0,
  
  stitching_master_commission_type VARCHAR(20) DEFAULT 'percentage',
  stitching_master_commission_value DECIMAL(10,2) DEFAULT 0,
  
  vendor_agent_commission_type VARCHAR(20) DEFAULT 'percentage',
  vendor_agent_commission_value DECIMAL(10,2) DEFAULT 0,
  
  buyer_agent_commission_type VARCHAR(20) DEFAULT 'percentage',
  buyer_agent_commission_value DECIMAL(10,2) DEFAULT 0,
  
  priority INTEGER DEFAULT 0, -- Higher priority rules override lower ones
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comm_rules_product ON commission_rules(product_id);
CREATE INDEX idx_comm_rules_category ON commission_rules(category);
```

### 8. commission_transactions
Actual commission payments
```sql
CREATE TABLE commission_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) REFERENCES orders(id),
  order_item_id UUID REFERENCES order_items(id),
  
  recipient_id UUID REFERENCES users(id),
  recipient_role VARCHAR(50), -- 'vendor', 'designer', 'stitching-master', etc.
  
  commission_type VARCHAR(20), -- 'percentage', 'fixed'
  commission_rate DECIMAL(10,2),
  commission_amount DECIMAL(10,2) NOT NULL,
  
  base_amount DECIMAL(10,2), -- Amount on which commission was calculated
  
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
  payment_date TIMESTAMP,
  payment_reference VARCHAR(100),
  payment_method VARCHAR(50),
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comm_trans_order ON commission_transactions(order_id);
CREATE INDEX idx_comm_trans_recipient ON commission_transactions(recipient_id);
CREATE INDEX idx_comm_trans_status ON commission_transactions(status);
```

### 9. purchase_orders
Purchase orders sent to vendors
```sql
CREATE TABLE purchase_orders (
  id VARCHAR(50) PRIMARY KEY,
  po_number VARCHAR(100) UNIQUE NOT NULL,
  order_id VARCHAR(50) REFERENCES orders(id),
  vendor_id UUID REFERENCES users(id),
  
  po_date TIMESTAMP DEFAULT NOW(),
  expected_delivery_date TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'acknowledged', 'processing', 'dispatched', 'completed', 'cancelled'
  
  total_amount DECIMAL(10,2) NOT NULL,
  
  vendor_notes TEXT,
  admin_notes TEXT,
  
  acknowledged_at TIMESTAMP,
  dispatched_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_po_vendor ON purchase_orders(vendor_id);
CREATE INDEX idx_po_order ON purchase_orders(order_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
```

### 10. warehouse_transactions
Warehouse receiving and dispatching
```sql
CREATE TABLE warehouse_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_type VARCHAR(50) NOT NULL, -- 'receiving', 'dispatching'
  
  order_id VARCHAR(50) REFERENCES orders(id),
  po_id VARCHAR(50) REFERENCES purchase_orders(id),
  
  product_id VARCHAR(50) REFERENCES products(id),
  barcode VARCHAR(100),
  
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  
  location VARCHAR(100),
  bin_location VARCHAR(50),
  
  scanned_by UUID REFERENCES users(id),
  verified_by UUID REFERENCES users(id),
  
  quality_check_status VARCHAR(50), -- 'pending', 'passed', 'failed'
  quality_notes TEXT,
  
  source VARCHAR(100), -- For receiving: vendor name
  destination VARCHAR(100), -- For dispatching: buyer name
  
  tracking_number VARCHAR(100),
  courier_service VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_warehouse_trans_type ON warehouse_transactions(transaction_type);
CREATE INDEX idx_warehouse_trans_order ON warehouse_transactions(order_id);
CREATE INDEX idx_warehouse_trans_product ON warehouse_transactions(product_id);
CREATE INDEX idx_warehouse_trans_barcode ON warehouse_transactions(barcode);
```

### 11. delivery_tracking
Delivery tracking information
```sql
CREATE TABLE delivery_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(50) REFERENCES orders(id),
  tracking_type VARCHAR(50), -- 'vendor-to-warehouse', 'warehouse-to-buyer'
  
  delivery_method VARCHAR(50), -- 'local', 'courier'
  courier_service VARCHAR(100),
  tracking_number VARCHAR(100),
  
  -- For local delivery
  vehicle_number VARCHAR(50),
  driver_name VARCHAR(100),
  driver_phone VARCHAR(20),
  
  pickup_address TEXT,
  delivery_address TEXT,
  
  estimated_delivery_date TIMESTAMP,
  actual_delivery_date TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'picked-up', 'in-transit', 'delivered', 'failed'
  
  tracking_updates JSONB, -- Array of status updates with timestamps
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_delivery_order ON delivery_tracking(order_id);
CREATE INDEX idx_delivery_status ON delivery_tracking(status);
CREATE INDEX idx_delivery_tracking_num ON delivery_tracking(tracking_number);
```

### 12. financial_transactions
All financial movements
```sql
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_type VARCHAR(50) NOT NULL, -- 'sale', 'purchase', 'commission-payment', 'refund'
  
  order_id VARCHAR(50) REFERENCES orders(id),
  
  party_id UUID REFERENCES users(id),
  party_type VARCHAR(50), -- 'buyer', 'vendor', 'designer', etc.
  
  amount DECIMAL(10,2) NOT NULL,
  transaction_direction VARCHAR(10), -- 'credit', 'debit'
  
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  
  description TEXT,
  notes TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fin_trans_type ON financial_transactions(transaction_type);
CREATE INDEX idx_fin_trans_order ON financial_transactions(order_id);
CREATE INDEX idx_fin_trans_party ON financial_transactions(party_id);
CREATE INDEX idx_fin_trans_date ON financial_transactions(created_at);
```

### 13. notifications
System notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'low-stock', 'out-of-stock', 'new-order', 'order-update', 'product-approval', 'general'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  read BOOLEAN DEFAULT false,
  
  action_url VARCHAR(255),
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(read);
CREATE INDEX idx_notif_type ON notifications(type);
CREATE INDEX idx_notif_created ON notifications(created_at);
```

## REST API Endpoints

### Authentication & Users
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users` - List all users (admin only)
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `GET /api/vendors` - List all vendors
- `GET /api/buyers` - List all buyers

### Products
- `GET /api/products` - List all products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PUT /api/products/:id/approve` - Approve product (admin)
- `PUT /api/products/:id/reject` - Reject product (admin)
- `GET /api/products/pending` - Get pending approval products

### Inventory
- `GET /api/inventory` - List all inventory
- `GET /api/inventory/:productId` - Get inventory for product
- `PUT /api/inventory/:productId` - Update inventory levels
- `POST /api/inventory/transaction` - Record inventory transaction
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/stats` - Get inventory statistics

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PUT /api/orders/:id/approve` - Approve order (admin)
- `PUT /api/orders/:id/forward-to-vendor` - Forward to vendor
- `PUT /api/orders/:id/receive-at-warehouse` - Mark received at warehouse
- `PUT /api/orders/:id/dispatch-to-buyer` - Dispatch to buyer
- `GET /api/orders/stats` - Get order statistics

### Purchase Orders
- `GET /api/purchase-orders` - List all POs
- `GET /api/purchase-orders/:id` - Get PO details
- `POST /api/purchase-orders` - Create PO
- `PUT /api/purchase-orders/:id/acknowledge` - Vendor acknowledges PO
- `PUT /api/purchase-orders/:id/dispatch` - Vendor dispatches PO

### Warehouse
- `POST /api/warehouse/receive` - Receive items at warehouse
- `POST /api/warehouse/dispatch` - Dispatch items from warehouse
- `GET /api/warehouse/transactions` - Get warehouse transactions
- `GET /api/warehouse/stats` - Get warehouse statistics
- `POST /api/warehouse/scan` - Scan barcode

### Commission
- `GET /api/commission/rules` - List commission rules
- `GET /api/commission/rules/:id` - Get commission rule
- `POST /api/commission/rules` - Create commission rule
- `PUT /api/commission/rules/:id` - Update commission rule
- `DELETE /api/commission/rules/:id` - Delete commission rule
- `GET /api/commission/transactions` - List commission transactions
- `POST /api/commission/calculate` - Calculate commission for order
- `PUT /api/commission/:id/pay` - Mark commission as paid

### Finance
- `GET /api/finance/summary` - Get financial summary
- `GET /api/finance/transactions` - List transactions
- `GET /api/finance/sales` - Get sales data
- `GET /api/finance/purchases` - Get purchase data
- `GET /api/finance/commissions` - Get commission data
- `POST /api/finance/transaction` - Record financial transaction

### Delivery Tracking
- `GET /api/delivery/:orderId` - Get delivery tracking
- `POST /api/delivery` - Create delivery tracking
- `PUT /api/delivery/:id/update` - Update delivery status
- `GET /api/delivery/:trackingNumber/track` - Track shipment

### Notifications
- `GET /api/notifications` - List user notifications
- `GET /api/notifications/unread` - Get unread notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications` - Create notification

### Analytics & Reports
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/sales` - Sales analytics
- `GET /api/analytics/inventory` - Inventory analytics
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/commission` - Commission report

## Supabase Row Level Security (RLS) Policies

### Example RLS Policies

```sql
-- Users can only view their own data
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Admin can view all data
CREATE POLICY "Admin can view all"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Vendors can only see their own products
CREATE POLICY "Vendors see own products"
ON products FOR SELECT
USING (vendor_id = auth.uid());

-- Admin can see all products
CREATE POLICY "Admin sees all products"
ON products FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## Sample Data Initialization

Use the services to initialize with sample data on first load if database is empty.
