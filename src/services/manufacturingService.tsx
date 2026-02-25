import { projectId, publicAnonKey } from '../utils/supabase/info';

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
  
  // Cost Breakdown
  processCosts?: {
    id: string;
    processName: string; // e.g. "Stitching", "Embroidery", "Dyeing"
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
}

const STORE_KEY = 'manufacturing_orders';
const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

async function fetchKV(key: string) {
  try {
    const response = await fetch(`${BASE_URL}/kv?key=${key}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch data');
    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('Error fetching from KV:', error);
    return null;
  }
}

async function saveKV(key: string, value: any) {
  try {
    const response = await fetch(`${BASE_URL}/kv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key, value })
    });
    if (!response.ok) throw new Error('Failed to save data');
    return true;
  } catch (error) {
    console.error('Error saving to KV:', error);
    throw error;
  }
}

export const getAllOrders = async (): Promise<ManufacturingOrder[]> => {
  const orders = await fetchKV(STORE_KEY);
  return orders || [];
};

export const createOrder = async (order: Omit<ManufacturingOrder, 'id'>): Promise<ManufacturingOrder> => {
  const orders = await getAllOrders();
  const newOrder: ManufacturingOrder = {
    ...order,
    id: `MFG-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  };
  
  const updatedOrders = [newOrder, ...orders];
  await saveKV(STORE_KEY, updatedOrders);
  return newOrder;
};

export const updateOrder = async (id: string, updates: Partial<ManufacturingOrder>): Promise<ManufacturingOrder> => {
  const orders = await getAllOrders();
  const index = orders.findIndex(o => o.id === id);
  
  if (index === -1) {
    throw new Error('Order not found');
  }
  
  const updatedOrder = { ...orders[index], ...updates };
  orders[index] = updatedOrder;
  
  await saveKV(STORE_KEY, orders);
  return updatedOrder;
};

export const deleteOrder = async (id: string): Promise<void> => {
  const orders = await getAllOrders();
  const filteredOrders = orders.filter(o => o.id !== id);
  await saveKV(STORE_KEY, filteredOrders);
};
