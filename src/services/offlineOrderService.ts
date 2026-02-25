import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

export interface OfflineOrderItem {
  id: string;
  vendorName: string;
  vendorId?: string;
  productId?: string; // Reference to product catalog
  productDetails: string;
  quantity: number;
  unit?: 'pieces' | 'meters'; // Unit of measurement
  targetPrice?: number;
  offeredPrice?: number;
  // Fabric specifications
  fabricColor?: string;
  quality?: string;
  panna?: string;
  work?: string;
  fusing?: string;
  status: 'pending_vendor' | 'vendor_checked' | 'vendor_confirmed' | 'vendor_unavailable' | 'customer_notified' | 'customer_approved' | 'converted' | 'cancelled';
  timeline?: string;
  vendorNotes?: string;
  customerNotes?: string;
  images?: string[];
  isTashivarItem?: boolean;
}

export interface OfflineOrder {
  id: string;
  customerName: string;
  customerId?: string;
  vendorName?: string; // Optional (Legacy)
  vendorId?: string; // Optional (Legacy)
  productDetails?: string; // Optional (Legacy)
  quantity?: number; // Optional (Legacy)
  targetPrice?: number; // Optional (Legacy)
  status: string; // broadened to support overall status
  timeline?: string; // Optional (Legacy)
  vendorNotes?: string; // Optional (Legacy)
  items?: OfflineOrderItem[]; // New multi-item support
  createdAt: string;
  updatedAt: string;
  convertedOrderId?: string;
  images?: string[];
  referenceImage?: string; // Image of the paper note
  internalNotes?: string;
  isChallan?: boolean; // Challan order flag
  challanNumber?: string; // Challan number
  challanDate?: string; // Challan date
}

// Helper functions for localStorage fallback
function getOfflineOrdersFromStorage(): OfflineOrder[] {
  try {
    const stored = localStorage.getItem('tashivar_offline_orders');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading offline orders from localStorage:', error);
    return [];
  }
}

function saveOfflineOrdersToStorage(orders: OfflineOrder[]): void {
  try {
    localStorage.setItem('tashivar_offline_orders', JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving offline orders to localStorage:', error);
  }
}

// DATA RECOVERY: Check for data under old/alternative keys
async function tryRecoverLostData(): Promise<OfflineOrder[]> {
  const possibleKeys = [
    'offline_requests',  // Old key before rename
    'inquiries',         // Original key name
    'tashivar_offline_requests', // Alternative old key
    'system_offline_orders', // Possible alternative
  ];
  
  console.log('🔍 Attempting data recovery from alternative keys...');
  console.log('🔍 Checking keys:', possibleKeys);
  
  for (const key of possibleKeys) {
    try {
      // Try API
      console.log(`  → Checking API key: ${key}`);
      const response = await fetch(`${API_URL}/kv?key=${key}`, {
        method: 'GET',
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.value && Array.isArray(data.value) && data.value.length > 0) {
          console.log(`✅ FOUND ${data.value.length} orders in API under key: ${key}`);
          console.log(`📋 Sample data:`, data.value[0]);
          return data.value;
        } else {
          console.log(`  ✗ Key "${key}" exists but empty or invalid`);
        }
      } else {
        console.log(`  ✗ Key "${key}" not found in API`);
      }
    } catch (error) {
      console.log(`  ✗ Error checking API key "${key}":`, error);
    }
    
    // Try localStorage with alternative keys
    try {
      console.log(`  → Checking localStorage key: ${key}`);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ FOUND ${parsed.length} orders in localStorage under key: ${key}`);
          console.log(`📋 Sample data:`, parsed[0]);
          return parsed;
        } else {
          console.log(`  ✗ Key "${key}" in localStorage but empty or invalid`);
        }
      } else {
        console.log(`  ✗ Key "${key}" not found in localStorage`);
      }
    } catch (error) {
      console.log(`  ✗ Error checking localStorage key "${key}":`, error);
    }
  }
  
  console.log('❌ No data found in any alternative keys');
  console.log('💡 Available localStorage keys:', Object.keys(localStorage));
  return [];
}

// Get all offline orders
export async function getAllOfflineOrders(): Promise<OfflineOrder[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=offline_orders`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    let orders = data.value || [];
    
    // If no orders found, try to recover from old keys
    if (orders.length === 0) {
      console.log('⚠️ No orders found under current key, attempting recovery...');
      const recoveredOrders = await tryRecoverLostData();
      
      if (recoveredOrders.length > 0) {
        console.log(`🔄 Migrating ${recoveredOrders.length} recovered orders to new key...`);
        // Save recovered data to new key
        await fetch(`${API_URL}/kv`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ key: 'offline_orders', value: recoveredOrders })
        });
        orders = recoveredOrders;
      }
    }
    
    // Also save to localStorage as backup
    saveOfflineOrdersToStorage(orders);
    return orders;
  } catch (error) {
    // Silently use localStorage fallback
    console.log('Using localStorage for offline orders - API unavailable');
    const localOrders = getOfflineOrdersFromStorage();
    
    // If local storage is empty, try recovery
    if (localOrders.length === 0) {
      return await tryRecoverLostData();
    }
    
    return localOrders;
  }
}

// Create new offline order
export async function createOfflineOrder(orderData: Partial<OfflineOrder>): Promise<OfflineOrder> {
  const newOrder: OfflineOrder = {
    id: `REQ-${Date.now()}`,
    customerName: orderData.customerName || 'Unknown Customer',
    customerId: orderData.customerId,
    vendorName: orderData.vendorName || (orderData.items && orderData.items.length > 0 ? 'Multiple Vendors' : 'Unknown Vendor'),
    vendorId: orderData.vendorId,
    productDetails: orderData.productDetails || (orderData.items && orderData.items.length > 0 ? `${orderData.items.length} Items` : ''),
    quantity: orderData.quantity || (orderData.items ? orderData.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 1),
    targetPrice: orderData.targetPrice,
    status: orderData.status || 'pending_vendor',
    timeline: orderData.timeline || '',
    vendorNotes: orderData.vendorNotes || '',
    items: orderData.items || [],
    images: orderData.images || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isChallan: orderData.isChallan || false,
    challanNumber: orderData.challanNumber,
    challanDate: orderData.challanDate
  };
  
  try {
    const orders = await getAllOfflineOrders();
    orders.unshift(newOrder);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'offline_orders', value: orders })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveOfflineOrdersToStorage(orders);
    return newOrder;
  } catch (error) {
    console.error('Error creating offline order via API, using localStorage:', error);
    const orders = getOfflineOrdersFromStorage();
    orders.unshift(newOrder);
    saveOfflineOrdersToStorage(orders);
    return newOrder;
  }
}

// Update offline order
export async function updateOfflineOrder(orderId: string, updates: Partial<OfflineOrder>): Promise<OfflineOrder> {
  try {
    const orders = await getAllOfflineOrders();
    const index = orders.findIndex(o => o.id === orderId);
    
    if (index === -1) {
      throw new Error('Order not found');
    }
    
    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'offline_orders', value: orders })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveOfflineOrdersToStorage(orders);
    return orders[index];
  } catch (error) {
    console.error('Error updating offline order via API, using localStorage:', error);
    const orders = getOfflineOrdersFromStorage();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() };
      saveOfflineOrdersToStorage(orders);
      return orders[index];
    }
    throw error;
  }
}

// Delete offline order
export async function deleteOfflineOrder(orderId: string): Promise<void> {
  try {
    const orders = await getAllOfflineOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'offline_orders', value: filtered })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveOfflineOrdersToStorage(filtered);
  } catch (error) {
    console.error('Error deleting offline order via API, using localStorage:', error);
    const orders = getOfflineOrdersFromStorage();
    const filtered = orders.filter(o => o.id !== orderId);
    saveOfflineOrdersToStorage(filtered);
  }
}