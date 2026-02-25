import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

export interface Buyer {
  id: string;
  name: string;
  businessName: string;
  owner: string;
  type?: 'retailer' | 'direct';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst: string;
  pancard: string;
  status: 'active' | 'inactive' | 'pending';
  joiningDate: string;
  totalOrders: number;
  totalBusiness: number;
  outstandingPayments: number;
  creditLimit: number;
  rating: number;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions for localStorage fallback
function getBuyersFromStorage(): Buyer[] {
  try {
    const stored = localStorage.getItem('tashivar_buyers');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading buyers from localStorage:', error);
    return [];
  }
}

function saveBuyersToStorage(buyers: Buyer[]): void {
  try {
    localStorage.setItem('tashivar_buyers', JSON.stringify(buyers));
  } catch (error) {
    console.error('Error saving buyers to localStorage:', error);
  }
}

// Get all buyers
export async function getAllBuyers(): Promise<Buyer[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=buyers`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const buyers = data.value || [];
    
    saveBuyersToStorage(buyers);
    console.log('✅ Buyers loaded from Supabase API');
    return buyers;
  } catch (error) {
    // Silently use localStorage fallback - this is expected behavior
    const buyers = getBuyersFromStorage();
    console.log(`ℹ️ Using localStorage for buyers (${buyers.length} items) - API unavailable`);
    return buyers;
  }
}

// Get single buyer
export async function getBuyer(buyerId: string): Promise<Buyer | null> {
  try {
    const buyers = await getAllBuyers();
    return buyers.find(b => b.id === buyerId) || null;
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return null;
  }
}

// Create new buyer
export async function createBuyer(buyerData: Partial<Buyer>): Promise<Buyer> {
  const newBuyer: Buyer = {
    id: buyerData.id || `BUY-${Date.now()}`,
    name: buyerData.name!,
    businessName: buyerData.businessName!,
    owner: buyerData.owner!,
    type: buyerData.type || 'direct',
    email: buyerData.email!,
    phone: buyerData.phone!,
    address: buyerData.address!,
    city: buyerData.city!,
    state: buyerData.state!,
    pincode: buyerData.pincode!,
    gst: buyerData.gst || '',
    pancard: buyerData.pancard || '',
    status: buyerData.status || 'active',
    joiningDate: buyerData.joiningDate || new Date().toISOString().split('T')[0],
    totalOrders: buyerData.totalOrders || 0,
    totalBusiness: buyerData.totalBusiness || 0,
    outstandingPayments: buyerData.outstandingPayments || 0,
    creditLimit: buyerData.creditLimit || 0,
    rating: buyerData.rating || 0,
    barcode: buyerData.barcode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    const buyers = await getAllBuyers();
    buyers.unshift(newBuyer);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'buyers', value: buyers })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveBuyersToStorage(buyers);
    return newBuyer;
  } catch (error) {
    console.error('Error creating buyer via API, using localStorage:', error);
    const buyers = getBuyersFromStorage();
    buyers.unshift(newBuyer);
    saveBuyersToStorage(buyers);
    return newBuyer;
  }
}

// Update buyer
export async function updateBuyer(buyerId: string, updates: Partial<Buyer>): Promise<Buyer> {
  try {
    const buyers = await getAllBuyers();
    const index = buyers.findIndex(b => b.id === buyerId);
    
    if (index === -1) {
      throw new Error('Buyer not found');
    }
    
    buyers[index] = {
      ...buyers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'buyers', value: buyers })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveBuyersToStorage(buyers);
    return buyers[index];
  } catch (error) {
    console.error('Error updating buyer via API, using localStorage:', error);
    const buyers = getBuyersFromStorage();
    const index = buyers.findIndex(b => b.id === buyerId);
    if (index !== -1) {
      buyers[index] = { ...buyers[index], ...updates, updatedAt: new Date().toISOString() };
      saveBuyersToStorage(buyers);
      return buyers[index];
    }
    throw error;
  }
}

// Delete buyer
export async function deleteBuyer(buyerId: string): Promise<void> {
  try {
    const buyers = await getAllBuyers();
    const filtered = buyers.filter(b => b.id !== buyerId);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'buyers', value: filtered })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveBuyersToStorage(filtered);
  } catch (error) {
    console.error('Error deleting buyer via API, using localStorage:', error);
    const buyers = getBuyersFromStorage();
    const filtered = buyers.filter(b => b.id !== buyerId);
    saveBuyersToStorage(filtered);
  }
}

// Get buyers by status
export async function getBuyersByStatus(status: string): Promise<Buyer[]> {
  const buyers = await getAllBuyers();
  return buyers.filter(b => b.status === status);
}