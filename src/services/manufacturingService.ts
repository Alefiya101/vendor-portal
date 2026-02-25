import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

export interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  sourceFabricId: string;
  sourceFabricName: string;
  sourceFabricImage: string;
  quantity: number;
  status: 'planned' | 'in-production' | 'quality-check' | 'completed' | 'cancelled';
  
  // Parties involved
  stitchingMasterId: string;
  stitchingMasterName: string;
  designerId?: string;
  designerName?: string;
  
  processCosts?: {
    id: string;
    processName: string;
    vendorId?: string;
    vendorName?: string;
    costPerUnit: number;
    notes?: string;
  }[];
  
  // Dates
  issuedDate: string;
  expectedDate: string;
  completedDate?: string;
  
  // Financials
  fabricCostPerUnit: number;
  manufacturingCostPerUnit: number;
  totalManufacturingCost: number;
  expectedSellingPrice: number;
  
  notes?: string;
  createdProductId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions for localStorage fallback
function getOrdersFromStorage(): ManufacturingOrder[] {
  try {
    const stored = localStorage.getItem('tashivar_manufacturing_orders');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading manufacturing orders from localStorage:', error);
    return [];
  }
}

function saveOrdersToStorage(orders: ManufacturingOrder[]): void {
  try {
    localStorage.setItem('tashivar_manufacturing_orders', JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving manufacturing orders to localStorage:', error);
  }
}

// Get all orders
export async function getAllOrders(): Promise<ManufacturingOrder[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=manufacturing_orders`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const orders = data.value || [];
    
    saveOrdersToStorage(orders);
    console.log('✅ Manufacturing orders loaded from Supabase API');
    return orders;
  } catch (error) {
    // Silently use localStorage fallback - this is expected behavior
    const orders = getOrdersFromStorage();
    console.log(`ℹ️ Using localStorage for manufacturing orders (${orders.length} items) - API unavailable`);
    return orders;
  }
}

// Get single order
export async function getOrder(orderId: string): Promise<ManufacturingOrder | null> {
  try {
    const orders = await getAllOrders();
    return orders.find(o => o.id === orderId) || null;
  } catch (error) {
    console.error('Error fetching manufacturing order:', error);
    return null;
  }
}

// Create new order
export async function createOrder(orderData: Partial<ManufacturingOrder>): Promise<ManufacturingOrder> {
  const newOrder: ManufacturingOrder = {
    id: orderData.id || `MFG-${Date.now()}`,
    orderNumber: orderData.orderNumber || `MO-${Math.floor(Math.random() * 10000)}`,
    sourceFabricId: orderData.sourceFabricId!,
    sourceFabricName: orderData.sourceFabricName!,
    sourceFabricImage: orderData.sourceFabricImage!,
    quantity: orderData.quantity!,
    status: orderData.status || 'planned',
    stitchingMasterId: orderData.stitchingMasterId!,
    stitchingMasterName: orderData.stitchingMasterName!,
    designerId: orderData.designerId,
    designerName: orderData.designerName,
    processCosts: orderData.processCosts || [],
    issuedDate: orderData.issuedDate!,
    expectedDate: orderData.expectedDate!,
    completedDate: orderData.completedDate,
    fabricCostPerUnit: orderData.fabricCostPerUnit!,
    manufacturingCostPerUnit: orderData.manufacturingCostPerUnit!,
    totalManufacturingCost: orderData.totalManufacturingCost!,
    expectedSellingPrice: orderData.expectedSellingPrice!,
    notes: orderData.notes,
    createdProductId: orderData.createdProductId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    const orders = await getAllOrders();
    orders.unshift(newOrder);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'manufacturing_orders', value: orders })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveOrdersToStorage(orders);
    return newOrder;
  } catch (error) {
    console.error('Error creating manufacturing order via API, using localStorage:', error);
    const orders = getOrdersFromStorage();
    orders.unshift(newOrder);
    saveOrdersToStorage(orders);
    return newOrder;
  }
}

// Update order
export async function updateOrder(orderId: string, updates: Partial<ManufacturingOrder>): Promise<ManufacturingOrder> {
  try {
    const orders = await getAllOrders();
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index === -1) {
      throw new Error('Manufacturing order not found');
    }
    
    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'manufacturing_orders', value: orders })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveOrdersToStorage(orders);
    return orders[index];
  } catch (error) {
    console.error('Error updating manufacturing order via API, using localStorage:', error);
    const orders = getOrdersFromStorage();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
      saveOrdersToStorage(orders);
      return orders[index];
    }
    throw error;
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: ManufacturingOrder['status'], notes?: string): Promise<ManufacturingOrder> {
  const updates: Partial<ManufacturingOrder> = {
    status,
    notes: notes || undefined
  };
  
  // If status is completed, set completedDate
  if (status === 'completed') {
    updates.completedDate = new Date().toISOString();
  }
  
  return updateOrder(orderId, updates);
}

// Delete order
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const orders = await getAllOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'manufacturing_orders', value: filtered })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveOrdersToStorage(filtered);
  } catch (error) {
    console.error('Error deleting manufacturing order via API, using localStorage:', error);
    const orders = getOrdersFromStorage();
    const filtered = orders.filter(o => o.id !== orderId);
    saveOrdersToStorage(filtered);
  }
}

// Get orders by status
export async function getOrdersByStatus(status: string): Promise<ManufacturingOrder[]> {
  const orders = await getAllOrders();
  return orders.filter(o => o.status === status);
}

// ============= CHALLAN MANAGEMENT =============

export interface ManufacturingChallan {
  id: string;
  challanNumber: string;
  challanDate: string;
  manufacturingOrderId: string;
  
  // Issuer Details (Your Company)
  issuerName: string;
  issuerAddress: string;
  issuerGSTIN?: string;
  issuerPhone?: string;
  
  // Receiver Details (Stitching Master/Designer)
  receiverName: string;
  receiverAddress: string;
  receiverGSTIN?: string;
  receiverPhone?: string;
  
  // Material Details
  materials: Array<{
    name: string;
    quantity: number;
    unit: 'pieces' | 'meters';
    description?: string;
  }>;
  
  // Extra Fields
  purposeOfDispatch: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  expectedReturnDate?: string;
  transportMode?: 'own_vehicle' | 'courier' | 'pickup' | 'other';
  transportDetails?: string;
  
  // Terms
  terms?: string;
  specialInstructions?: string;
  
  status: 'issued' | 'in-transit' | 'received' | 'returned' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions for challan localStorage
function getChallansFromStorage(): ManufacturingChallan[] {
  try {
    const stored = localStorage.getItem('tashivar_manufacturing_challans');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading manufacturing challans from localStorage:', error);
    return [];
  }
}

function saveChallansToStorage(challans: ManufacturingChallan[]): void {
  try {
    localStorage.setItem('tashivar_manufacturing_challans', JSON.stringify(challans));
  } catch (error) {
    console.error('Error saving manufacturing challans to localStorage:', error);
  }
}

// Get all challans
export async function getAllChallans(): Promise<ManufacturingChallan[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=manufacturing_challans`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const challans = data.value || [];
    
    saveChallansToStorage(challans);
    console.log('✅ Manufacturing challans loaded from Supabase API');
    return challans;
  } catch (error) {
    const challans = getChallansFromStorage();
    console.log(`ℹ️ Using localStorage for manufacturing challans (${challans.length} items) - API unavailable`);
    return challans;
  }
}

// Get single challan
export async function getChallan(challanId: string): Promise<ManufacturingChallan | null> {
  try {
    const challans = await getAllChallans();
    return challans.find(c => c.id === challanId) || null;
  } catch (error) {
    console.error('Error fetching manufacturing challan:', error);
    return null;
  }
}

// Create new challan
export async function createChallan(challanData: Partial<ManufacturingChallan>): Promise<ManufacturingChallan> {
  const newChallan: ManufacturingChallan = {
    id: challanData.id || `CHN-${Date.now()}`,
    challanNumber: challanData.challanNumber || `CHN-${Math.floor(Math.random() * 100000)}`,
    challanDate: challanData.challanDate || new Date().toISOString().split('T')[0],
    manufacturingOrderId: challanData.manufacturingOrderId!,
    issuerName: challanData.issuerName!,
    issuerAddress: challanData.issuerAddress!,
    issuerGSTIN: challanData.issuerGSTIN,
    issuerPhone: challanData.issuerPhone,
    receiverName: challanData.receiverName!,
    receiverAddress: challanData.receiverAddress!,
    receiverGSTIN: challanData.receiverGSTIN,
    receiverPhone: challanData.receiverPhone,
    materials: challanData.materials || [],
    purposeOfDispatch: challanData.purposeOfDispatch || 'Manufacturing',
    vehicleNumber: challanData.vehicleNumber,
    driverName: challanData.driverName,
    driverPhone: challanData.driverPhone,
    expectedReturnDate: challanData.expectedReturnDate,
    transportMode: challanData.transportMode || 'own_vehicle',
    transportDetails: challanData.transportDetails,
    terms: challanData.terms,
    specialInstructions: challanData.specialInstructions,
    status: challanData.status || 'issued',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    const challans = await getAllChallans();
    challans.unshift(newChallan);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'manufacturing_challans', value: challans })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveChallansToStorage(challans);
    return newChallan;
  } catch (error) {
    console.error('Error creating manufacturing challan via API, using localStorage:', error);
    const challans = getChallansFromStorage();
    challans.unshift(newChallan);
    saveChallansToStorage(challans);
    return newChallan;
  }
}

// Update challan
export async function updateChallan(challanId: string, updates: Partial<ManufacturingChallan>): Promise<ManufacturingChallan> {
  try {
    const challans = await getAllChallans();
    const index = challans.findIndex(c => c.id === challanId);
    
    if (index === -1) {
      throw new Error('Manufacturing challan not found');
    }
    
    challans[index] = {
      ...challans[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'manufacturing_challans', value: challans })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveChallansToStorage(challans);
    return challans[index];
  } catch (error) {
    console.error('Error updating manufacturing challan via API, using localStorage:', error);
    const challans = getChallansFromStorage();
    const index = challans.findIndex(c => c.id === challanId);
    if (index !== -1) {
      challans[index] = { ...challans[index], ...updates, updatedAt: new Date().toISOString() };
      saveChallansToStorage(challans);
      return challans[index];
    }
    throw error;
  }
}

// Delete challan
export async function deleteChallan(challanId: string): Promise<void> {
  try {
    const challans = await getAllChallans();
    const filtered = challans.filter(c => c.id !== challanId);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'manufacturing_challans', value: filtered })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveChallansToStorage(filtered);
  } catch (error) {
    console.error('Error deleting manufacturing challan via API, using localStorage:', error);
    const challans = getChallansFromStorage();
    const filtered = challans.filter(c => c.id !== challanId);
    saveChallansToStorage(filtered);
  }
}

// Get challans by manufacturing order ID
export async function getChallansByOrderId(orderId: string): Promise<ManufacturingChallan[]> {
  const challans = await getAllChallans();
  return challans.filter(c => c.manufacturingOrderId === orderId);
}

// Update challan status
export async function updateChallanStatus(challanId: string, status: ManufacturingChallan['status']): Promise<ManufacturingChallan> {
  return updateChallan(challanId, { status });
}