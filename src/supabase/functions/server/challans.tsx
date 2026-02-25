import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const challans = new Hono();

// Helper function to generate challan number
function generateChallanNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CH-${year}${month}-${random}`;
}

// Get all challans
challans.get("/", async (c) => {
  try {
    const allChallans = await kv.getByPrefix("challan:");
    return c.json({ 
      success: true, 
      challans: allChallans.sort((a, b) => new Date(b.challanDate).getTime() - new Date(a.challanDate).getTime())
    });
  } catch (error) {
    console.error("Error fetching challans:", error);
    return c.json({ success: false, error: "Failed to fetch challans" }, 500);
  }
});

// Get single challan
challans.get("/:challanId", async (c) => {
  try {
    const challanId = c.req.param("challanId");
    const challan = await kv.get(`challan:${challanId}`);
    
    if (!challan) {
      return c.json({ success: false, error: "Challan not found" }, 404);
    }
    
    return c.json({ success: true, challan });
  } catch (error) {
    console.error("Error fetching challan:", error);
    return c.json({ success: false, error: "Failed to fetch challan" }, 500);
  }
});

// Create challan from order
challans.post("/from-order", async (c) => {
  try {
    const body = await c.req.json();
    const { orderId } = body;
    
    // Get the order
    const order = await kv.get(`order:${orderId}`);
    if (!order) {
      return c.json({ success: false, error: "Order not found" }, 404);
    }

    // Generate challan
    const challanId = `CHL-${Date.now()}`;
    const challanNumber = generateChallanNumber();
    
    const newChallan = {
      id: challanId,
      challanNumber,
      challanDate: new Date().toISOString().split('T')[0],
      customerName: order.buyer,
      customerId: order.buyerId,
      customerPhone: order.buyerPhone,
      customerAddress: order.buyerAddress,
      items: order.products.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.type === 'custom' ? 'Custom Item' : '',
        quantity: product.quantity,
        rate: product.sellingPrice || product.price || 0,
        amount: (product.sellingPrice || product.price || 0) * product.quantity,
        hsn: product.hsn || '5407',
        gstRate: product.gstRate || 5
      })),
      subtotal: order.subtotal || 0,
      taxAmount: order.subtotal ? (order.subtotal * 0.05) : 0, // Default 5% GST
      totalAmount: order.subtotal ? (order.subtotal * 1.05) : 0,
      paidAmount: 0,
      status: 'pending',
      sourceType: 'order',
      sourceId: orderId,
      paymentHistory: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`challan:${challanId}`, newChallan);
    
    // Update order to mark it has a challan
    await kv.set(`order:${orderId}`, {
      ...order,
      challanId,
      challanNumber,
      updatedAt: new Date().toISOString()
    });
    
    return c.json({ success: true, challan: newChallan }, 201);
  } catch (error) {
    console.error("Error creating challan from order:", error);
    return c.json({ success: false, error: "Failed to create challan" }, 500);
  }
});

// Create challan from offline order
challans.post("/from-offline-request", async (c) => {
  try {
    const body = await c.req.json();
    const { requestId } = body;
    
    console.log(`📝 Creating challan from offline order: ${requestId}`);
    
    // Get all offline orders (they're stored as an array)
    const allOfflineOrders = await kv.get(`offline_orders`) || [];
    const request = allOfflineOrders.find((r: any) => r.id === requestId);
    
    if (!request) {
      console.error(`❌ Offline order not found: ${requestId}`);
      return c.json({ success: false, error: "Offline order not found" }, 404);
    }

    // Generate challan
    const challanId = `CHL-${Date.now()}`;
    const challanNumber = generateChallanNumber();
    
    // Get approved items
    const approvedItems = request.items?.filter((item: any) => item.status === 'customer_approved') || [];
    
    if (approvedItems.length === 0) {
      console.error(`❌ No approved items found in request ${requestId}`);
      return c.json({ success: false, error: "No approved items found" }, 400);
    }
    
    console.log(`✅ Found ${approvedItems.length} approved items`);
    
    const subtotal = approvedItems.reduce((sum: number, item: any) => {
      return sum + ((item.offeredPrice || item.targetPrice || 0) * item.quantity);
    }, 0);
    
    console.log(`💰 Challan subtotal: ₹${subtotal}`);
    
    const newChallan = {
      id: challanId,
      challanNumber,
      challanDate: new Date().toISOString().split('T')[0],
      customerName: request.customerName,
      customerId: request.customerId || 'offline-customer',
      customerPhone: '',
      customerAddress: '',
      items: approvedItems.map((item: any) => ({
        id: item.id,
        name: item.productDetails,
        description: item.customerNotes || '',
        quantity: item.quantity,
        unit: item.unit || 'pieces',
        rate: item.offeredPrice || item.targetPrice || 0,
        amount: (item.offeredPrice || item.targetPrice || 0) * item.quantity,
        hsn: '5407',
        gstRate: 5
      })),
      subtotal,
      taxAmount: subtotal * 0.05, // Default 5% GST
      totalAmount: subtotal * 1.05,
      paidAmount: 0,
      status: 'pending',
      sourceType: 'offline_request',
      sourceId: requestId,
      paymentHistory: [],
      notes: request.internalNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`challan:${challanId}`, newChallan);
    console.log(`✅ Challan created: ${challanNumber}`);
    
    // Update the offline order in the array to mark it has a challan
    const updatedOfflineOrders = allOfflineOrders.map((r: any) => 
      r.id === requestId 
        ? { 
            ...r, 
            challanId, 
            challanNumber,
            updatedAt: new Date().toISOString() 
          }
        : r
    );
    
    await kv.set(`offline_orders`, updatedOfflineOrders);
    console.log(`✅ Offline order updated with challan reference`);
    
    return c.json({ success: true, challan: newChallan }, 201);
  } catch (error) {
    console.error("❌ Error creating challan from offline order:", error);
    return c.json({ success: false, error: "Failed to create challan" }, 500);
  }
});

// Record payment against challan
challans.post("/:challanId/payment", async (c) => {
  try {
    const challanId = c.req.param("challanId");
    const body = await c.req.json();
    const { amount, paymentDate, paymentMethod, paymentNotes } = body;
    
    console.log(`📝 Recording payment for challan ${challanId}:`, { amount, paymentDate, paymentMethod });
    
    const challan = await kv.get(`challan:${challanId}`);
    
    if (!challan) {
      console.error(`❌ Challan not found: ${challanId}`);
      return c.json({ success: false, error: "Challan not found" }, 404);
    }
    
    if (challan.status === 'cancelled' || challan.status === 'converted') {
      console.error(`❌ Cannot record payment - challan status: ${challan.status}`);
      return c.json({ success: false, error: "Cannot record payment for this challan" }, 400);
    }
    
    const paymentAmount = parseFloat(amount);
    const currentPaidAmount = challan.paidAmount || 0;
    const newPaidAmount = currentPaidAmount + paymentAmount;
    
    console.log(`💰 Payment calculation:`, {
      totalAmount: challan.totalAmount,
      currentPaidAmount,
      paymentAmount,
      newPaidAmount
    });
    
    // Validate payment amount
    if (newPaidAmount > challan.totalAmount) {
      console.error(`❌ Payment exceeds total amount: ${newPaidAmount} > ${challan.totalAmount}`);
      return c.json({ success: false, error: "Payment amount exceeds total amount" }, 400);
    }
    
    // Add payment to history
    const paymentRecord = {
      date: paymentDate,
      amount: paymentAmount,
      method: paymentMethod,
      notes: paymentNotes || '',
      recordedAt: new Date().toISOString()
    };
    
    // Update status
    let newStatus = 'pending';
    if (newPaidAmount >= challan.totalAmount) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }
    
    console.log(`🔄 Status change: ${challan.status} → ${newStatus}`);
    
    const updatedChallan = {
      ...challan,
      paidAmount: newPaidAmount,
      status: newStatus,
      paymentHistory: [...(challan.paymentHistory || []), paymentRecord],
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`challan:${challanId}`, updatedChallan);
    
    console.log(`✅ Payment recorded successfully for ${challanId}`);
    
    return c.json({ success: true, challan: updatedChallan });
  } catch (error) {
    console.error("❌ Error recording payment:", error);
    return c.json({ success: false, error: "Failed to record payment" }, 500);
  }
});

// Convert challan to invoice (creates sales order)
challans.post("/:challanId/convert-to-invoice", async (c) => {
  try {
    const challanId = c.req.param("challanId");
    const challan = await kv.get(`challan:${challanId}`);
    
    if (!challan) {
      return c.json({ success: false, error: "Challan not found" }, 404);
    }
    
    if (challan.status !== 'paid') {
      return c.json({ success: false, error: "Challan must be fully paid before conversion" }, 400);
    }
    
    if (challan.status === 'converted') {
      return c.json({ success: false, error: "Challan already converted" }, 400);
    }
    
    // Create a sales order from challan
    const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    const newOrder = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      buyer: challan.customerName,
      buyerId: challan.customerId,
      buyerPhone: challan.customerPhone || '',
      buyerAddress: challan.customerAddress || '',
      vendor: 'By Tashivar',
      vendorId: 'internal',
      products: challan.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: 'readymade',
        quantity: item.quantity,
        costPrice: item.rate,
        sellingPrice: item.rate,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=100',
        hsn: item.hsn || '5407',
        gstRate: item.gstRate || 5
      })),
      subtotal: challan.subtotal,
      commission: 0,
      commissionDistribution: [],
      profit: 0,
      status: 'placed',
      paymentStatus: 'paid',
      paymentMethod: 'As per Challan',
      taxRate: 5,
      challanId: challanId,
      challanNumber: challan.challanNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`order:${orderId}`, newOrder);
    
    // Update challan status
    const updatedChallan = {
      ...challan,
      status: 'converted',
      invoiceId: orderId,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`challan:${challanId}`, updatedChallan);
    
    return c.json({ 
      success: true, 
      challan: updatedChallan,
      order: newOrder,
      message: "Challan converted to invoice successfully"
    });
  } catch (error) {
    console.error("Error converting challan:", error);
    return c.json({ success: false, error: "Failed to convert challan" }, 500);
  }
});

// Update challan
challans.put("/:challanId", async (c) => {
  try {
    const challanId = c.req.param("challanId");
    const updates = await c.req.json();
    
    const existingChallan = await kv.get(`challan:${challanId}`);
    
    if (!existingChallan) {
      return c.json({ success: false, error: "Challan not found" }, 404);
    }
    
    const updatedChallan = {
      ...existingChallan,
      ...updates,
      id: challanId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`challan:${challanId}`, updatedChallan);
    
    return c.json({ success: true, challan: updatedChallan });
  } catch (error) {
    console.error("Error updating challan:", error);
    return c.json({ success: false, error: "Failed to update challan" }, 500);
  }
});

// Cancel challan
challans.post("/:challanId/cancel", async (c) => {
  try {
    const challanId = c.req.param("challanId");
    const challan = await kv.get(`challan:${challanId}`);
    
    if (!challan) {
      return c.json({ success: false, error: "Challan not found" }, 404);
    }
    
    if (challan.status === 'converted') {
      return c.json({ success: false, error: "Cannot cancel converted challan" }, 400);
    }
    
    const updatedChallan = {
      ...challan,
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`challan:${challanId}`, updatedChallan);
    
    return c.json({ success: true, challan: updatedChallan });
  } catch (error) {
    console.error("Error cancelling challan:", error);
    return c.json({ success: false, error: "Failed to cancel challan" }, 500);
  }
});

// Get challans by customer
challans.get("/customer/:customerId", async (c) => {
  try {
    const customerId = c.req.param("customerId");
    const allChallans = await kv.getByPrefix("challan:");
    const customerChallans = allChallans.filter(challan => challan.customerId === customerId);
    
    return c.json({ 
      success: true, 
      challans: customerChallans.sort((a, b) => new Date(b.challanDate).getTime() - new Date(a.challanDate).getTime())
    });
  } catch (error) {
    console.error("Error fetching customer challans:", error);
    return c.json({ success: false, error: "Failed to fetch customer challans" }, 500);
  }
});

// Get challans by status
challans.get("/status/:status", async (c) => {
  try {
    const status = c.req.param("status");
    const allChallans = await kv.getByPrefix("challan:");
    const filteredChallans = allChallans.filter(challan => challan.status === status);
    
    return c.json({ 
      success: true, 
      challans: filteredChallans.sort((a, b) => new Date(b.challanDate).getTime() - new Date(a.challanDate).getTime())
    });
  } catch (error) {
    console.error("Error fetching challans by status:", error);
    return c.json({ success: false, error: "Failed to fetch challans" }, 500);
  }
});

export default challans;