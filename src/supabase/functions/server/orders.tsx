import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const orders = new Hono();

// Get all orders
orders.get("/", async (c) => {
  try {
    const allOrders = await kv.getByPrefix("order:");
    return c.json({ 
      success: true, 
      orders: allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return c.json({ success: false, error: "Failed to fetch orders" }, 500);
  }
});

// Get single order by ID
orders.get("/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return c.json({ success: false, error: "Failed to fetch order" }, 500);
  }
});

// Create new order (from buyer)
orders.post("/", async (c) => {
  try {
    const orderData = await c.req.json();
    
    // Generate order ID if not provided
    const orderId = orderData.id || `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create order with all fields from request, with defaults where needed
    const newOrder = {
      ...orderData,
      id: orderId,
      date: orderData.date || new Date().toISOString().split('T')[0],
      status: orderData.status || 'placed',
      createdAt: orderData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`order:${orderId}`, newOrder);
    
    return c.json({ success: true, order: newOrder }, 201);
  } catch (error) {
    console.error("Error creating order:", error);
    return c.json({ success: false, error: "Failed to create order" }, 500);
  }
});

// Approve order (Admin)
orders.post("/:orderId/approve", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    if (order.status !== 'pending-approval') {
      return c.json({ success: false, error: "Order cannot be approved in current status" }, 400);
    }
    
    order.status = 'approved';
    order.approvedDate = new Date().toISOString().split('T')[0];
    order.approvedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error approving order:", error);
    return c.json({ success: false, error: "Failed to approve order" }, 500);
  }
});

// Forward to Vendor - Create Purchase Order (Admin)
orders.post("/:orderId/forward-to-vendor", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { poNumber, expectedDeliveryDate, deliveryMethod, courierService, notes } = body;
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    if (order.status !== 'approved') {
      return c.json({ success: false, error: "Order must be approved before forwarding to vendor" }, 400);
    }
    
    order.status = 'forwarded-to-vendor';
    order.forwardedToVendorDate = new Date().toISOString().split('T')[0];
    order.purchaseOrderTracking = {
      poNumber,
      vendorId: order.vendorId,
      vendorName: order.vendor,
      deliveryMethod,
      courierService: deliveryMethod === 'courier' ? courierService : null,
      expectedDelivery: expectedDeliveryDate,
      notes,
      createdAt: new Date().toISOString(),
      trackingUpdates: [
        {
          status: 'PO Created and Sent to Vendor',
          time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          location: 'Admin Office'
        }
      ]
    };
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error forwarding order to vendor:", error);
    return c.json({ success: false, error: "Failed to forward order to vendor" }, 500);
  }
});

// Vendor accepts PO
orders.post("/:orderId/vendor-accept", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    if (order.status !== 'forwarded-to-vendor') {
      return c.json({ success: false, error: "Order is not in correct status for vendor acceptance" }, 400);
    }
    
    order.status = 'vendor-processing';
    order.vendorAcceptedDate = new Date().toISOString().split('T')[0];
    order.purchaseOrderTracking.trackingUpdates.push({
      status: 'PO Accepted by Vendor',
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      location: 'Vendor Facility'
    });
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error accepting PO:", error);
    return c.json({ success: false, error: "Failed to accept PO" }, 500);
  }
});

// Vendor dispatches to warehouse
orders.post("/:orderId/vendor-dispatch", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { deliveryMethod, courierService, trackingId, vehicleNumber, driverName, driverPhone, estimatedDelivery } = body;
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    if (order.status !== 'vendor-processing') {
      return c.json({ success: false, error: "Order is not ready for dispatch" }, 400);
    }
    
    order.status = 'vendor-dispatched';
    order.vendorDispatchedDate = new Date().toISOString().split('T')[0];
    
    // Update purchase order tracking with dispatch details
    order.purchaseOrderTracking.deliveryMethod = deliveryMethod;
    order.purchaseOrderTracking.dispatchDate = new Date().toISOString().split('T')[0];
    
    if (deliveryMethod === 'courier') {
      order.purchaseOrderTracking.courierService = courierService;
      order.purchaseOrderTracking.trackingId = trackingId;
    } else {
      order.purchaseOrderTracking.vehicleNumber = vehicleNumber;
      order.purchaseOrderTracking.driverName = driverName;
      order.purchaseOrderTracking.driverPhone = driverPhone;
    }
    
    if (estimatedDelivery) {
      order.purchaseOrderTracking.expectedDelivery = estimatedDelivery;
    }
    
    order.purchaseOrderTracking.trackingUpdates.push({
      status: 'Dispatched from Vendor',
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      location: 'Vendor Facility'
    });
    
    // Automatically update to in-transit
    order.status = 'in-transit-to-warehouse';
    order.purchaseOrderTracking.trackingUpdates.push({
      status: 'In Transit to Warehouse',
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      location: 'En route'
    });
    
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error dispatching from vendor:", error);
    return c.json({ success: false, error: "Failed to dispatch from vendor" }, 500);
  }
});

// Add PO tracking update
orders.post("/:orderId/po-tracking-update", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { status, location } = body;
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    if (!order.purchaseOrderTracking) {
      return c.json({ success: false, error: "No purchase order tracking exists" }, 400);
    }
    
    order.purchaseOrderTracking.trackingUpdates.push({
      status,
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      location
    });
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error adding PO tracking update:", error);
    return c.json({ success: false, error: "Failed to add tracking update" }, 500);
  }
});

// Mark as received at warehouse (Admin)
orders.post("/:orderId/receive-at-warehouse", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { receivedDate, receivedBy, condition, notes } = body;
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    if (order.status !== 'in-transit-to-warehouse') {
      return c.json({ success: false, error: "Order is not in transit to warehouse" }, 400);
    }
    
    order.status = 'received-at-warehouse';
    order.receivedAtWarehouseDate = receivedDate;
    order.purchaseOrderTracking.receivedDate = receivedDate;
    order.purchaseOrderTracking.receivedBy = receivedBy;
    order.purchaseOrderTracking.condition = condition;
    order.purchaseOrderTracking.receivedNotes = notes;
    order.purchaseOrderTracking.trackingUpdates.push({
      status: 'Received at Warehouse',
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      location: 'Tashivar Warehouse'
    });
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error receiving at warehouse:", error);
    return c.json({ success: false, error: "Failed to mark as received" }, 500);
  }
});

// Dispatch to buyer from warehouse (Admin)
orders.post("/:orderId/dispatch-to-buyer", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { deliveryMethod, courierService, trackingId, vehicleNumber, driverName, driverPhone, estimatedDelivery, notes } = body;
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    if (order.status !== 'received-at-warehouse') {
      return c.json({ success: false, error: "Order has not been received at warehouse yet" }, 400);
    }
    
    order.status = 'dispatched-to-buyer';
    order.dispatchedToBuyerDate = new Date().toISOString().split('T')[0];
    
    // Create sales order tracking
    order.salesOrderTracking = {
      orderId: order.id,
      buyerId: order.buyerId,
      buyerName: order.buyer,
      deliveryAddress: order.buyerAddress,
      buyerPhone: order.buyerPhone,
      deliveryMethod,
      dispatchDate: new Date().toISOString().split('T')[0],
      expectedDelivery: estimatedDelivery,
      notes,
      trackingUpdates: [
        {
          status: 'Dispatched from Warehouse',
          time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          location: 'Tashivar Warehouse'
        }
      ]
    };
    
    if (deliveryMethod === 'courier') {
      order.salesOrderTracking.courierService = courierService;
      order.salesOrderTracking.trackingId = trackingId || `TRK-${Date.now()}`;
    } else {
      order.salesOrderTracking.vehicleNumber = vehicleNumber;
      order.salesOrderTracking.driverName = driverName;
      order.salesOrderTracking.driverPhone = driverPhone;
    }
    
    // Automatically update to in-transit
    order.status = 'in-transit-to-buyer';
    order.salesOrderTracking.trackingUpdates.push({
      status: 'In Transit to Buyer',
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      location: 'En route'
    });
    
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error dispatching to buyer:", error);
    return c.json({ success: false, error: "Failed to dispatch to buyer" }, 500);
  }
});

// Add SO tracking update
orders.post("/:orderId/so-tracking-update", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { status, location } = body;
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    if (!order.salesOrderTracking) {
      return c.json({ success: false, error: "No sales order tracking exists" }, 400);
    }
    
    order.salesOrderTracking.trackingUpdates.push({
      status,
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      location
    });
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error adding SO tracking update:", error);
    return c.json({ success: false, error: "Failed to add tracking update" }, 500);
  }
});

// Mark as delivered (Admin or auto from tracking)
orders.post("/:orderId/mark-delivered", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { deliveredDate, deliveredTo, deliveryNotes } = body;
    
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    if (order.status !== 'in-transit-to-buyer') {
      return c.json({ success: false, error: "Order is not in transit to buyer" }, 400);
    }
    
    order.status = 'delivered';
    order.deliveredDate = deliveredDate || new Date().toISOString().split('T')[0];
    order.salesOrderTracking.deliveredDate = deliveredDate || new Date().toISOString().split('T')[0];
    order.salesOrderTracking.deliveredTo = deliveredTo;
    order.salesOrderTracking.deliveryNotes = deliveryNotes;
    order.salesOrderTracking.trackingUpdates.push({
      status: 'Delivered Successfully',
      time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      location: order.buyerAddress
    });
    order.updatedAt = new Date().toISOString();
    
    await kv.set(`order:${orderId}`, order);
    
    return c.json({ success: true, order });
  } catch (error) {
    console.error("Error marking as delivered:", error);
    return c.json({ success: false, error: "Failed to mark as delivered" }, 500);
  }
});

// Get orders by status
orders.get("/status/:status", async (c) => {
  try {
    const status = c.req.param("status");
    const allOrders = await kv.getByPrefix("order:");
    const filteredOrders = allOrders.filter(order => order.status === status);
    
    return c.json({ 
      success: true, 
      orders: filteredOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    return c.json({ success: false, error: "Failed to fetch orders" }, 500);
  }
});

// Get orders by buyer
orders.get("/buyer/:buyerId", async (c) => {
  try {
    const buyerId = c.req.param("buyerId");
    const allOrders = await kv.getByPrefix("order:");
    const buyerOrders = allOrders.filter(order => order.buyerId === buyerId);
    
    return c.json({ 
      success: true, 
      orders: buyerOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
  } catch (error) {
    console.error("Error fetching buyer orders:", error);
    return c.json({ success: false, error: "Failed to fetch buyer orders" }, 500);
  }
});

// Get orders by vendor
orders.get("/vendor/:vendorId", async (c) => {
  try {
    const vendorId = c.req.param("vendorId");
    const allOrders = await kv.getByPrefix("order:");
    const vendorOrders = allOrders.filter(order => order.vendorId === vendorId);
    
    return c.json({ 
      success: true, 
      orders: vendorOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    return c.json({ success: false, error: "Failed to fetch vendor orders" }, 500);
  }
});

// Delete order (Admin only - for testing/cancellation)
orders.delete("/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    await kv.del(`order:${orderId}`);
    
    return c.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return c.json({ success: false, error: "Failed to delete order" }, 500);
  }
});

// Update order (Generic update endpoint)
orders.put("/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const updates = await c.req.json();
    
    const existingOrder = await kv.get(`order:${orderId}`);
    
    if (!existingOrder) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }
    
    const updatedOrder = {
      ...existingOrder,
      ...updates,
      id: orderId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`order:${orderId}`, updatedOrder);
    
    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return c.json({ success: false, error: "Failed to update order" }, 500);
  }
});

export default orders;