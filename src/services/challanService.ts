import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3/challans`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

export interface Challan {
  id: string;
  challanNumber: string;
  challanDate: string;
  customerName: string;
  customerId: string;
  customerPhone?: string;
  customerAddress?: string;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    rate: number;
    amount: number;
    hsn?: string;
    gstRate?: number;
  }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'converted' | 'cancelled';
  sourceType: 'order' | 'offline_request';
  sourceId: string;
  paymentHistory: Array<{
    date: string;
    amount: number;
    method: string;
    notes?: string;
    recordedAt: string;
  }>;
  notes?: string;
  invoiceId?: string; // Set when converted to invoice
  createdAt: string;
  updatedAt: string;
}

// Get all challans
export async function getAllChallans(): Promise<Challan[]> {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.challans || [];
  } catch (error) {
    console.error('Error fetching challans:', error);
    return [];
  }
}

// Get single challan
export async function getChallan(challanId: string): Promise<Challan | null> {
  try {
    const response = await fetch(`${API_URL}/${challanId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.challan;
  } catch (error) {
    console.error('Error fetching challan:', error);
    return null;
  }
}

// Create challan from order
export async function createChallanFromOrder(order: any): Promise<Challan> {
  try {
    const response = await fetch(`${API_URL}/from-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId: order.id })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.challan;
  } catch (error) {
    console.error('Error creating challan from order:', error);
    throw error;
  }
}

// Create challan from offline order
export async function createChallanFromOfflineRequest(request: any): Promise<Challan> {
  try {
    const response = await fetch(`${API_URL}/from-offline-request`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ requestId: request.id })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.challan;
  } catch (error) {
    console.error('Error creating challan from offline order:', error);
    throw error;
  }
}

// Create challan from manufacturing order
export async function createChallanFromManufacturingOrder(order: any): Promise<Challan> {
  try {
    const response = await fetch(`${API_URL}/from-manufacturing-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId: order.id })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.challan;
  } catch (error) {
    console.error('Error creating challan from manufacturing order:', error);
    throw error;
  }
}

// Record payment against challan
export async function recordPayment(challanId: string, paymentData: {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  paymentNotes?: string;
}): Promise<Challan> {
  try {
    const response = await fetch(`${API_URL}/${challanId}/payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.challan;
  } catch (error) {
    console.error('Error recording payment:', error);
    throw error;
  }
}

// Convert challan to invoice (creates order)
export async function convertChallanToInvoice(challanId: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/${challanId}/convert-to-invoice`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error converting challan to invoice:', error);
    throw error;
  }
}

// Update challan
export async function updateChallan(challanId: string, updates: Partial<Challan>): Promise<Challan> {
  try {
    const response = await fetch(`${API_URL}/${challanId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.challan;
  } catch (error) {
    console.error('Error updating challan:', error);
    throw error;
  }
}

// Cancel challan
export async function cancelChallan(challanId: string): Promise<Challan> {
  try {
    const response = await fetch(`${API_URL}/${challanId}/cancel`, {
      method: 'POST',
      headers
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.challan;
  } catch (error) {
    console.error('Error cancelling challan:', error);
    throw error;
  }
}

// Get challans by customer
export async function getChallansByCustomer(customerId: string): Promise<Challan[]> {
  try {
    const response = await fetch(`${API_URL}/customer/${customerId}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.challans || [];
  } catch (error) {
    console.error('Error fetching customer challans:', error);
    return [];
  }
}

// Get challans by status
export async function getChallansByStatus(status: string): Promise<Challan[]> {
  try {
    const response = await fetch(`${API_URL}/status/${status}`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.challans || [];
  } catch (error) {
    console.error('Error fetching challans by status:', error);
    return [];
  }
}
