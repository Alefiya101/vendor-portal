import { projectId, publicAnonKey } from '../utils/supabase/info';
import * as vendorService from './vendorService';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3/orders`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

// Check if we should use API or localStorage
const USE_API = true; // ENABLED - Use Supabase KV store for data persistence
const STORAGE_KEY = 'tashivar_orders';

export interface Order {
  id: string;
  date: string;
  buyer: string;
  buyerId: string;
  buyerPhone: string;
  buyerAddress: string; // Used as Billing Address
  shippingAddress?: string; // New field
  vendor: string;
  vendorId: string;
  vendorPhone?: string;
  products: Array<{
    id: string;
    name: string;
    type: 'readymade' | 'fabric';
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    image: string;
    hsn?: string;
    gstRate?: number; // GST rate percentage (5, 12, 18, 28, etc.)
  }>;
  subtotal: number;
  commission: number;
  commissionDistribution: Array<{
    party: string;
    amount: number;
  }>;
  profit: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  taxRate?: number;
  discountRate?: number;
  placeOfSupply?: string;
  purchaseOrderTracking?: any;
  salesOrderTracking?: any;
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions for localStorage
function getOrdersFromStorage(): Order[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

function saveOrdersToStorage(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

function findOrderInStorage(orderId: string): Order | null {
  const orders = getOrdersFromStorage();
  return orders.find(o => o.id === orderId) || null;
}

function updateOrderInStorage(orderId: string, updates: Partial<Order>): Order {
  const orders = getOrdersFromStorage();
  const index = orders.findIndex(o => o.id === orderId);
  
  if (index === -1) {
    throw new Error('Order not found');
  }
  
  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  saveOrdersToStorage(orders);
  return orders[index];
}

// Helper to calculate agent commission
async function calculateVendorAgentCommission(vendorId: string, amount: number, currentDistribution: any[] = []): Promise<any> {
  if (!vendorId || vendorId === 'internal') return null;
  
  try {
    const vendor = await vendorService.getVendor(vendorId);
    if (!vendor || !vendor.agentId || !vendor.agentCommission) return null;
    
    const commissionAmount = Math.round(amount * (vendor.agentCommission / 100));
    
    // Check if agent is already in distribution to avoid duplicates
    const agentLabel = `${vendor.agentName || 'Agent'} (Vendor Agent)`;
    if (currentDistribution.some(d => d.party === agentLabel)) return null;
    
    return {
      distribution: [
        ...currentDistribution,
        {
          party: agentLabel,
          amount: commissionAmount
        }
      ]
    };
  } catch (err) {
    console.error('Error calculating vendor agent commission:', err);
    return null;
  }
}

// Get all orders
export async function getAllOrders(): Promise<Order[]> {
  if (!USE_API) {
    // Use localStorage
    return getOrdersFromStorage();
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('Error fetching orders from API, falling back to localStorage:', error);
    return getOrdersFromStorage();
  }
}

// Get single order
export async function getOrder(orderId: string): Promise<Order | null> {
  if (!USE_API) {
    return findOrderInStorage(orderId);
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error fetching order from API, falling back to localStorage:', error);
    return findOrderInStorage(orderId);
  }
}

// Create new order
export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  // Calculate agent commission if vendor is involved
  if (orderData.vendorId && orderData.subtotal) {
    const commissionData = await calculateVendorAgentCommission(
      orderData.vendorId, 
      orderData.subtotal, 
      orderData.commissionDistribution || []
    );
    
    if (commissionData) {
      orderData.commissionDistribution = commissionData.distribution;
    }
  }

  const newOrder: Order = {
    id: orderData.id || `ORD-${Date.now()}`,
    date: orderData.date || new Date().toISOString().split('T')[0],
    buyer: orderData.buyer!,
    buyerId: orderData.buyerId!,
    buyerPhone: orderData.buyerPhone!,
    buyerAddress: orderData.buyerAddress!,
    shippingAddress: orderData.shippingAddress,
    vendor: orderData.vendor!,
    vendorId: orderData.vendorId!,
    vendorPhone: orderData.vendorPhone,
    products: orderData.products!,
    subtotal: orderData.subtotal!,
    commission: orderData.commission!,
    commissionDistribution: orderData.commissionDistribution!,
    profit: orderData.profit!,
    status: orderData.status || 'pending-approval',
    paymentStatus: orderData.paymentStatus!,
    paymentMethod: orderData.paymentMethod!,
    purchaseOrderTracking: orderData.purchaseOrderTracking,
    salesOrderTracking: orderData.salesOrderTracking,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  if (!USE_API) {
    const orders = getOrdersFromStorage();
    orders.unshift(newOrder);
    saveOrdersToStorage(orders);
    return newOrder;
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error creating order via API, using localStorage:', error);
    const orders = getOrdersFromStorage();
    orders.unshift(newOrder);
    saveOrdersToStorage(orders);
    return newOrder;
  }
}

// Update order (Generic)
export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
  if (!USE_API) {
    return updateOrderInStorage(orderId, updates);
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error updating order via API, using localStorage:', error);
    return updateOrderInStorage(orderId, updates);
  }
}

// Approve order
export async function approveOrder(orderId: string): Promise<Order> {
  if (!USE_API) {
    return updateOrderInStorage(orderId, { status: 'approved' });
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}/approve`, {
      method: 'POST',
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error approving order via API, using localStorage:', error);
    return updateOrderInStorage(orderId, { status: 'approved' });
  }
}

// Forward to vendor
export async function forwardToVendor(orderId: string, poDetails: {
  poNumber: string;
  expectedDeliveryDate: string;
  deliveryMethod: string;
  courierService?: string;
  notes?: string;
}): Promise<Order> {
  
  // Fetch current order to check vendor and calculate commission
  let additionalUpdates: any = {};
  try {
    const order = await getOrder(orderId);
    if (order && order.vendorId && order.subtotal) {
       const commissionData = await calculateVendorAgentCommission(
         order.vendorId, 
         order.subtotal, 
         order.commissionDistribution || []
       );
       
       if (commissionData) {
         additionalUpdates.commissionDistribution = commissionData.distribution;
       }
    }
  } catch (e) {
    console.error('Error calculating commission during forward:', e);
  }

  const updates = {
    status: 'forwarded-to-vendor',
    purchaseOrderTracking: {
      poNumber: poDetails.poNumber,
      expectedDeliveryDate: poDetails.expectedDeliveryDate,
      deliveryMethod: poDetails.deliveryMethod,
      courierService: poDetails.courierService,
      notes: poDetails.notes,
      createdAt: new Date().toISOString(),
      updates: []
    },
    ...additionalUpdates
  };
  
  if (!USE_API) {
    return updateOrderInStorage(orderId, updates);
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}/forward-to-vendor`, {
      method: 'POST',
      headers,
      body: JSON.stringify(poDetails)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error forwarding to vendor via API, using localStorage:', error);
    return updateOrderInStorage(orderId, updates);
  }
}

// Vendor accepts PO
export async function vendorAcceptPO(orderId: string): Promise<Order> {
  if (!USE_API) {
    return updateOrderInStorage(orderId, { status: 'vendor-processing' });
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}/vendor-accept`, {
      method: 'POST',
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error accepting PO via API, using localStorage:', error);
    return updateOrderInStorage(orderId, { status: 'vendor-processing' });
  }
}

// Vendor dispatches to warehouse
export async function vendorDispatch(orderId: string, dispatchDetails: {
  deliveryMethod: string;
  courierService?: string;
  trackingId?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedDelivery?: string;
}): Promise<Order> {
  const order = findOrderInStorage(orderId);
  const updates = {
    status: 'vendor-dispatched',
    purchaseOrderTracking: {
      ...order?.purchaseOrderTracking,
      trackingId: dispatchDetails.trackingId,
      courierService: dispatchDetails.courierService,
      vehicleNumber: dispatchDetails.vehicleNumber,
      driverName: dispatchDetails.driverName,
      driverPhone: dispatchDetails.driverPhone,
      estimatedDelivery: dispatchDetails.estimatedDelivery,
      dispatchedAt: new Date().toISOString()
    }
  };
  
  if (!USE_API) {
    return updateOrderInStorage(orderId, updates);
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}/vendor-dispatch`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dispatchDetails)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error dispatching from vendor via API, using localStorage:', error);
    return updateOrderInStorage(orderId, updates);
  }
}

// Add PO tracking update
export async function addPOTrackingUpdate(orderId: string, update: {
  status: string;
  location: string;
}): Promise<Order> {
  const order = findOrderInStorage(orderId);
  const updates = {
    purchaseOrderTracking: {
      ...order?.purchaseOrderTracking,
      updates: [
        ...(order?.purchaseOrderTracking?.updates || []),
        {
          ...update,
          timestamp: new Date().toISOString()
        }
      ]
    }
  };
  
  if (!USE_API) {
    return updateOrderInStorage(orderId, updates);
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}/po-tracking-update`, {
      method: 'POST',
      headers,
      body: JSON.stringify(update)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error adding PO tracking update via API, using localStorage:', error);
    return updateOrderInStorage(orderId, updates);
  }
}

// Receive at warehouse
export async function receiveAtWarehouse(orderId: string, receiveDetails: {
  receivedDate: string;
  receivedBy: string;
  condition: string;
  notes?: string;
}): Promise<Order> {
  const order = findOrderInStorage(orderId);
  const updates = {
    status: 'received-at-warehouse',
    purchaseOrderTracking: {
      ...order?.purchaseOrderTracking,
      receivedAt: receiveDetails.receivedDate,
      receivedBy: receiveDetails.receivedBy,
      condition: receiveDetails.condition,
      receivedNotes: receiveDetails.notes
    }
  };
  
  if (!USE_API) {
    return updateOrderInStorage(orderId, updates);
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}/receive-at-warehouse`, {
      method: 'POST',
      headers,
      body: JSON.stringify(receiveDetails)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error receiving at warehouse via API, using localStorage:', error);
    return updateOrderInStorage(orderId, updates);
  }
}

// Dispatch to buyer
export async function dispatchToBuyer(orderId: string, dispatchDetails: {
  deliveryMethod: string;
  courierService?: string;
  trackingId?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  estimatedDelivery: string;
  notes?: string;
}): Promise<Order> {
  const updates = {
    status: 'dispatched-to-buyer',
    salesOrderTracking: {
      deliveryMethod: dispatchDetails.deliveryMethod,
      courierService: dispatchDetails.courierService,
      trackingId: dispatchDetails.trackingId,
      vehicleNumber: dispatchDetails.vehicleNumber,
      driverName: dispatchDetails.driverName,
      driverPhone: dispatchDetails.driverPhone,
      estimatedDelivery: dispatchDetails.estimatedDelivery,
      notes: dispatchDetails.notes,
      dispatchedAt: new Date().toISOString(),
      updates: []
    }
  };
  
  if (!USE_API) {
    return updateOrderInStorage(orderId, updates);
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}/dispatch-to-buyer`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dispatchDetails)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error dispatching to buyer via API, using localStorage:', error);
    return updateOrderInStorage(orderId, updates);
  }
}

// Add SO tracking update
export async function addSOTrackingUpdate(orderId: string, update: {
  status: string;
  location: string;
}): Promise<Order> {
  const order = findOrderInStorage(orderId);
  const updates = {
    salesOrderTracking: {
      ...order?.salesOrderTracking,
      updates: [
        ...(order?.salesOrderTracking?.updates || []),
        {
          ...update,
          timestamp: new Date().toISOString()
        }
      ]
    }
  };
  
  if (!USE_API) {
    return updateOrderInStorage(orderId, updates);
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}/so-tracking-update`, {
      method: 'POST',
      headers,
      body: JSON.stringify(update)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error adding SO tracking update via API, using localStorage:', error);
    return updateOrderInStorage(orderId, updates);
  }
}

// Mark as delivered
export async function markAsDelivered(orderId: string, deliveryDetails: {
  deliveredDate?: string;
  deliveredTo?: string;
  deliveryNotes?: string;
}): Promise<Order> {
  const order = findOrderInStorage(orderId);
  const updates = {
    status: 'delivered',
    salesOrderTracking: {
      ...order?.salesOrderTracking,
      deliveredAt: deliveryDetails.deliveredDate || new Date().toISOString(),
      deliveredTo: deliveryDetails.deliveredTo,
      deliveryNotes: deliveryDetails.deliveryNotes
    }
  };
  
  if (!USE_API) {
    return updateOrderInStorage(orderId, updates);
  }
  
  try {
    const response = await fetch(`${API_URL}/${orderId}/mark-delivered`, {
      method: 'POST',
      headers,
      body: JSON.stringify(deliveryDetails)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error marking as delivered via API, using localStorage:', error);
    return updateOrderInStorage(orderId, updates);
  }
}

// Get orders by status
export async function getOrdersByStatus(status: string): Promise<Order[]> {
  if (!USE_API) {
    const orders = getOrdersFromStorage();
    return orders.filter(o => o.status === status);
  }
  
  try {
    const response = await fetch(`${API_URL}/status/${status}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('Error fetching orders by status from API, falling back to localStorage:', error);
    const orders = getOrdersFromStorage();
    return orders.filter(o => o.status === status);
  }
}

// Get orders by buyer
export async function getOrdersByBuyer(buyerId: string): Promise<Order[]> {
  if (!USE_API) {
    const orders = getOrdersFromStorage();
    return orders.filter(o => o.buyerId === buyerId);
  }
  
  try {
    const response = await fetch(`${API_URL}/buyer/${buyerId}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('Error fetching buyer orders from API, falling back to localStorage:', error);
    const orders = getOrdersFromStorage();
    return orders.filter(o => o.buyerId === buyerId);
  }
}

// Get orders by vendor
export async function getOrdersByVendor(vendorId: string): Promise<Order[]> {
  if (!USE_API) {
    const orders = getOrdersFromStorage();
    return orders.filter(o => o.vendorId === vendorId);
  }
  
  try {
    const response = await fetch(`${API_URL}/vendor/${vendorId}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('Error fetching vendor orders from API, falling back to localStorage:', error);
    const orders = getOrdersFromStorage();
    return orders.filter(o => o.vendorId === vendorId);
  }
}

// Delete order (Soft Delete)
export async function deleteOrder(orderId: string): Promise<void> {
  // Soft delete implementation - update status to 'deleted'
  const updates = { status: 'deleted' };
  
  if (!USE_API) {
    return updateOrderInStorage(orderId, updates);
  }
  
  try {
    // Determine if we should use DELETE method (hard) or PATCH (soft)
    // Based on user request "no hard delete", we'll implement soft delete logic here.
    // However, the backend might expect DELETE for actual removal.
    // If we want soft delete, we should update the status.
    
    // Check if we can just update status
    const response = await fetch(`${API_URL}/${orderId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      // If patch fails, maybe try the delete endpoint if the intention was hard delete?
      // But user specifically asked for NO HARD DELETE.
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error soft deleting order via API, using localStorage:', error);
    return updateOrderInStorage(orderId, updates);
  }
}

// Restore order (optional, for undoing delete)
export async function restoreOrder(orderId: string): Promise<void> {
    const updates = { status: 'pending-approval' }; // Or previous status? hard to know.
    if (!USE_API) {
        return updateOrderInStorage(orderId, updates);
    }
    // ... API implementation
}