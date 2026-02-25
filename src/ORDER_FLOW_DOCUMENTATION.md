# Tashivar B2B Portal - Complete Order Flow Documentation

## 🔄 NEW ORDER FLOW (Admin-Centric with Two-Stage Tracking)

### Overview
The order flow starts with **Admin approval** and involves **two separate tracking stages**:
1. **Purchase Order Tracking**: Vendor → Admin Warehouse
2. **Sales Order Tracking**: Admin Warehouse → Buyer/Retailer

---

## 📋 ORDER STATUS FLOW

### 1. **PENDING-APPROVAL** 🟠
- **Trigger**: Buyer places order
- **Owner**: Admin
- **Action Required**: Admin reviews and approves order
- **Details**:
  - Buyer has selected products and completed payment
  - Admin reviews order details, pricing, and buyer information
  - Admin can approve or reject

### 2. **APPROVED** ✅
- **Trigger**: Admin approves order
- **Owner**: Admin
- **Action Required**: Create Purchase Order (PO) and forward to vendor
- **Details**:
  - Order is approved for processing
  - Admin prepares to create PO for vendor
  - Commission structure is confirmed

### 3. **FORWARDED-TO-VENDOR** 📋
- **Trigger**: Admin sends PO to vendor
- **Owner**: Vendor
- **Action Required**: Vendor accepts and processes PO
- **PO Details Include**:
  - PO Number (e.g., PO-2025-001)
  - Product details and quantities
  - Expected delivery date to warehouse
  - Preferred delivery method (Courier/Transport)
  - Special instructions/notes
- **Tracking**: Purchase Order Tracking initiated

### 4. **VENDOR-PROCESSING** 🔧
- **Trigger**: Vendor accepts PO
- **Owner**: Vendor
- **Action Required**: Vendor prepares products for dispatch
- **Details**:
  - Vendor confirms PO receipt
  - Products are being manufactured/packed
  - Vendor prepares shipping details

### 5. **VENDOR-DISPATCHED** 🚚 (Stage 1 Tracking Starts)
- **Trigger**: Vendor dispatches to Admin warehouse
- **Owner**: In Transit
- **Action Required**: None (tracking in progress)
- **Purchase Order Tracking Details**:
  - **If Courier**:
    - Courier service name (Delhivery, BlueDart, etc.)
    - Tracking ID
    - Real-time tracking updates via API
  - **If Transport/Vehicle**:
    - Vehicle number
    - Driver name and phone
    - Manual tracking updates
  - Dispatch date from vendor
  - Expected delivery to warehouse
  - Tracking updates at each checkpoint

### 6. **IN-TRANSIT-TO-WAREHOUSE** 🚛
- **Trigger**: Products shipped from vendor
- **Owner**: In Transit
- **Action Required**: Monitor tracking
- **Details**:
  - Active tracking of shipment
  - Real-time location updates
  - ETA to warehouse displayed
  - Admin can track progress

### 7. **RECEIVED-AT-WAREHOUSE** 🏢
- **Trigger**: Admin marks as received
- **Owner**: Admin
- **Action Required**: Admin to dispatch to buyer
- **Receive Details Captured**:
  - Received date and time
  - Received by (person name)
  - Condition (Good/Damaged/Partial)
  - Quality check notes
  - Photos of received goods (optional)
- **Purchase Order Tracking Complete** ✅

### 8. **DISPATCHED-TO-BUYER** 🚚 (Stage 2 Tracking Starts)
- **Trigger**: Admin dispatches from warehouse to buyer
- **Owner**: In Transit
- **Action Required**: None (tracking in progress)
- **Sales Order Tracking Details**:
  - **If Courier/Shiprocket**:
    - Courier service name
    - Tracking ID (auto-generated via Shiprocket API)
    - Real-time tracking via third-party
  - **If Local Delivery**:
    - Vehicle number
    - Driver name and phone
    - Manual tracking updates
  - Dispatch date from warehouse
  - Expected delivery to buyer
  - Delivery address and contact
  - Special delivery instructions

### 9. **IN-TRANSIT-TO-BUYER** 🚛
- **Trigger**: Products shipped to buyer
- **Owner**: In Transit
- **Action Required**: Monitor tracking
- **Details**:
  - Active tracking of shipment
  - Real-time location updates
  - ETA to buyer displayed
  - Buyer can track via tracking ID

### 10. **DELIVERED** ✅ 
- **Trigger**: Buyer receives products
- **Owner**: Complete
- **Action Required**: None
- **Delivery Confirmation**:
  - Delivered date and time
  - Received by buyer (name/signature)
  - Delivery photos (optional)
  - Buyer feedback
- **Sales Order Tracking Complete** ✅
- **Order Lifecycle Complete** 🎉

---

## 🔍 TWO-STAGE TRACKING SYSTEM

### **Stage 1: Purchase Order Tracking (Vendor → Admin Warehouse)**

**Purpose**: Track products from vendor to admin warehouse

**Information Captured**:
```
{
  "poNumber": "PO-2025-001",
  "vendorId": "VEN-001",
  "vendorName": "Fashion Creations",
  "deliveryMethod": "courier" | "transport",
  
  // For Courier
  "courierService": "Delhivery",
  "trackingId": "DELH123456789",
  
  // For Transport
  "vehicleNumber": "MH02 AB 1234",
  "driverName": "Ramesh Kumar",
  "driverPhone": "+91 98765 00001",
  
  "dispatchDate": "2025-01-15",
  "expectedDelivery": "2025-01-18",
  "receivedDate": "2025-01-18",
  "receivedBy": "John Doe",
  "condition": "good" | "damaged" | "partial",
  "notes": "All items in perfect condition",
  
  "trackingUpdates": [
    {
      "status": "Dispatched from Vendor",
      "time": "2025-01-15 10:00 AM",
      "location": "Vendor Facility, Mumbai"
    },
    {
      "status": "In Transit",
      "time": "2025-01-15 03:00 PM",
      "location": "Mumbai Central Hub"
    },
    {
      "status": "Arrived at Warehouse",
      "time": "2025-01-18 11:00 AM",
      "location": "Tashivar Warehouse, Mumbai"
    }
  ]
}
```

**Visibility**: Admin & Vendor

---

### **Stage 2: Sales Order Tracking (Admin Warehouse → Buyer)**

**Purpose**: Track products from admin warehouse to buyer/retailer

**Information Captured**:
```
{
  "orderId": "ORD-2025-156",
  "buyerId": "BUY-001",
  "buyerName": "Kumar Fashion Hub",
  "deliveryAddress": "123, Fashion Street, Mumbai, Maharashtra - 400001",
  "buyerPhone": "+91 98765 43210",
  "deliveryMethod": "courier" | "local",
  
  // For Courier/Shiprocket
  "courierService": "BlueDart",
  "trackingId": "BD987654321", // Auto-generated via Shiprocket
  
  // For Local Delivery
  "vehicleNumber": "MH03 CD 5678",
  "driverName": "Suresh Patil",
  "driverPhone": "+91 98765 00002",
  
  "dispatchDate": "2025-01-18",
  "expectedDelivery": "2025-01-20",
  "deliveredDate": "2025-01-20",
  "deliveredTo": "Store Manager",
  "notes": "Delivered at back entrance as requested",
  
  "trackingUpdates": [
    {
      "status": "Dispatched from Warehouse",
      "time": "2025-01-18 02:00 PM",
      "location": "Tashivar Warehouse, Mumbai"
    },
    {
      "status": "Out for Delivery",
      "time": "2025-01-20 09:00 AM",
      "location": "Local Delivery Hub"
    },
    {
      "status": "Delivered",
      "time": "2025-01-20 03:30 PM",
      "location": "Kumar Fashion Hub"
    }
  ]
}
```

**Visibility**: Admin, Buyer, and Vendor (limited)

---

## 👥 ROLE-BASED ACTIONS

### **Admin Actions**:
1. **Approve Order** (pending-approval → approved)
2. **Forward to Vendor** (approved → forwarded-to-vendor)
   - Create PO number
   - Set expected delivery date
   - Add vendor instructions
3. **Mark Received** (in-transit-to-warehouse → received-at-warehouse)
   - Record receiver details
   - Inspect and note condition
   - Upload photos
4. **Dispatch to Buyer** (received-at-warehouse → dispatched-to-buyer)
   - Choose delivery method
   - Enter courier/driver details
   - Set expected delivery date
5. **View Complete Tracking**
   - Monitor both PO and SO tracking
   - Real-time updates from APIs
   - Manual entry for local deliveries

### **Vendor Actions**:
1. **View PO** (forwarded-to-vendor)
   - See order details and requirements
   - View expected delivery date
2. **Accept PO** (forwarded-to-vendor → vendor-processing)
3. **Dispatch Products** (vendor-processing → vendor-dispatched)
   - Enter courier/transport details
   - Provide tracking information
   - Add dispatch notes
4. **Update Tracking** (vendor-dispatched, in-transit-to-warehouse)
   - Add checkpoints for transport
   - Update estimated arrival

### **Buyer Actions**:
1. **Place Order** (creates pending-approval)
2. **View Order Status**
   - See current status
   - View sales order tracking (after dispatch to buyer)
   - Cannot see purchase order tracking
3. **Track Delivery**
   - Real-time tracking via tracking ID
   - Receive notifications
4. **Confirm Receipt** (optional)

---

## 🚚 DELIVERY METHOD OPTIONS

### **Option 1: Courier Service (Recommended for Long Distance)**
**Advantages**:
- Professional tracking
- Insurance coverage
- Faster delivery
- Automated tracking updates

**Details Captured**:
- Courier service name (Delhivery, BlueDart, DTDC, Ecom Express)
- Tracking ID (auto-generated via API)
- Automated status updates
- Real-time location tracking
- ETA calculations

**Integration**: Shiprocket API for unified courier management

---

### **Option 2: Local Delivery/Transport (For Nearby/Bulk)**
**Advantages**:
- Cost-effective for local
- Direct control
- Flexible timing
- Personal touch

**Details Captured**:
- Vehicle number (e.g., MH02 AB 1234)
- Driver name
- Driver phone number
- Manual tracking updates by admin/driver

---

## 🔔 NOTIFICATIONS & ALERTS

### **Admin Notifications**:
- New order placed (pending approval)
- Vendor dispatched to warehouse
- Products received at warehouse
- Delivery completed to buyer

### **Vendor Notifications**:
- New PO received
- Expected delivery reminder
- Products received at warehouse confirmation

### **Buyer Notifications**:
- Order approved by admin
- Order dispatched from warehouse
- Out for delivery
- Delivered successfully

---

## 📊 TRACKING VISIBILITY MATRIX

| Status | Admin | Vendor | Buyer |
|--------|-------|--------|-------|
| pending-approval | ✅ Full | ❌ No | ✅ Basic |
| approved | ✅ Full | ❌ No | ✅ Basic |
| forwarded-to-vendor | ✅ Full | ✅ PO Details | ✅ Basic |
| vendor-processing | ✅ Full | ✅ Full | ✅ Basic |
| vendor-dispatched | ✅ PO Tracking | ✅ PO Tracking | ✅ Basic |
| in-transit-to-warehouse | ✅ PO Tracking | ✅ PO Tracking | ✅ Basic |
| received-at-warehouse | ✅ Full | ✅ Confirmation | ✅ Basic |
| dispatched-to-buyer | ✅ Full | ✅ Notification | ✅ SO Tracking |
| in-transit-to-buyer | ✅ SO Tracking | ✅ Notification | ✅ SO Tracking |
| delivered | ✅ Full | ✅ Summary | ✅ Full |

**Legend**:
- ✅ Full: Complete access to all details
- ✅ PO/SO Tracking: Access to Purchase/Sales Order tracking
- ✅ Basic: Order status and basic details
- ✅ Notification: Status updates only
- ❌ No: No visibility

---

## 🎯 KEY FEATURES

1. **Two-Stage Tracking**: Separate tracking for PO fulfillment and buyer delivery
2. **Real-Time Updates**: Automatic tracking via courier APIs
3. **Manual Entry**: Support for local/transport deliveries
4. **Role-Based Access**: Different views for Admin, Vendor, Buyer
5. **Complete Audit Trail**: Every action recorded with timestamp
6. **Quality Control**: Inspection at warehouse receipt
7. **Flexible Delivery**: Multiple courier options + local delivery
8. **Notifications**: Automated alerts at each stage
9. **Commission Tracking**: Linked to order completion
10. **Financial Integration**: Order value flows to accounting

---

## 🔧 TECHNICAL INTEGRATION

### **Shiprocket API Integration** (For Courier Services)
```javascript
// Create shipment when dispatching to buyer
POST /api/shiprocket/create-shipment
{
  "order_id": "ORD-2025-156",
  "courier_id": 1, // Delhivery
  "pickup_location": "Tashivar Warehouse",
  "buyer_details": {...},
  "products": [...]
}

// Response includes tracking_id
{
  "shipment_id": "123456",
  "tracking_id": "DELH987654321",
  "courier": "Delhivery",
  "expected_delivery": "2025-01-20"
}

// Get real-time tracking
GET /api/shiprocket/track/{tracking_id}
{
  "status": "in_transit",
  "current_location": "Mumbai Hub",
  "tracking_updates": [...]
}
```

---

## 📱 UI COMPONENTS

### **Components Created**:
1. `/components/OrderFlow.tsx` - Complete order flow management
   - Timeline visualization
   - Status-based actions
   - PO tracking display
   - SO tracking display
   - Modal forms for each action

2. **Admin Dashboard Integration**:
   - Order list with status filters
   - Quick actions based on status
   - Expandable order details
   - Integrated tracking views

3. **Vendor Dashboard** (Future):
   - PO inbox
   - Accept/dispatch interface
   - Tracking entry

4. **Buyer Dashboard** (Future):
   - Order history
   - SO tracking view
   - Delivery status

---

## ✅ IMPLEMENTATION STATUS

- ✅ Order Flow Component created
- ✅ Two-stage tracking structure defined
- ✅ Admin approve order workflow
- ✅ Forward to vendor with PO creation
- ✅ Receive at warehouse workflow
- ✅ Dispatch to buyer workflow
- ✅ Courier & local delivery options
- ✅ Timeline visualization
- ✅ Status-based action buttons
- ✅ Modal forms for all actions
- ✅ Complete documentation

---

## 🚀 NEXT STEPS

1. Integrate Shiprocket API for automated tracking
2. Create vendor-specific PO acceptance interface
3. Add photo upload for quality inspection
4. Implement SMS/Email notifications
5. Create buyer tracking page
6. Add order analytics dashboard
7. Implement commission auto-calculation on delivery
8. Create printable PO and delivery documents

---

**The new order flow ensures complete transparency, accountability, and tracking throughout the entire supply chain from vendor to buyer!** 🎉
