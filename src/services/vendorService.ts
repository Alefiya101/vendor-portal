import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

export interface Vendor {
  id: string;
  type: 'vendor' | 'designer' | 'stitching-master' | 'vendor-agent' | 'buyer-agent' | 'designer-agent' | 'admin' | 'shop-owner';
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gst: string;
  pancard: string;
  bankAccount: string;
  ifscCode: string;
  status: 'active' | 'inactive' | 'pending';
  joiningDate: string;
  productsSupplied: number;
  totalBusiness: number;
  totalCommission: number;
  outstandingPayments: number;
  rating: number;
  commissionRate?: number;
  barcode?: string;
  agentId?: string;
  agentName?: string;
  agentCommission?: number;
  designerAgentId?: string;
  designerAgentName?: string;
  designerAgentCommission?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions for localStorage fallback
function getVendorsFromStorage(): Vendor[] {
  try {
    const stored = localStorage.getItem('tashivar_vendors');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading vendors from localStorage:', error);
    return [];
  }
}

function saveVendorsToStorage(vendors: Vendor[]): void {
  try {
    localStorage.setItem('tashivar_vendors', JSON.stringify(vendors));
  } catch (error) {
    console.error('Error saving vendors to localStorage:', error);
  }
}

// Get all vendors
export async function getAllVendors(): Promise<Vendor[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=vendors`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const vendors = data.value || [];
    
    saveVendorsToStorage(vendors);
    console.log('✅ Vendors loaded from Supabase API');
    return vendors;
  } catch (error) {
    // Silently use localStorage fallback - this is expected behavior
    const vendors = getVendorsFromStorage();
    console.log(`ℹ️ Using localStorage for vendors (${vendors.length} items) - API unavailable`);
    return vendors;
  }
}

// Get single vendor
export async function getVendor(vendorId: string): Promise<Vendor | null> {
  try {
    const vendors = await getAllVendors();
    return vendors.find(v => v.id === vendorId) || null;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return null;
  }
}

// Create new vendor
export async function createVendor(vendorData: Partial<Vendor>): Promise<Vendor> {
  const newVendor: Vendor = {
    id: vendorData.id || `VEN-${Date.now()}`,
    type: vendorData.type || 'vendor',
    name: vendorData.name!,
    owner: vendorData.owner!,
    email: vendorData.email!,
    phone: vendorData.phone!,
    address: vendorData.address!,
    city: vendorData.city!,
    state: vendorData.state!,
    pincode: vendorData.pincode!,
    gst: vendorData.gst || '',
    pancard: vendorData.pancard || '',
    bankAccount: vendorData.bankAccount || '',
    ifscCode: vendorData.ifscCode || '',
    status: vendorData.status || 'active',
    joiningDate: vendorData.joiningDate || new Date().toISOString().split('T')[0],
    productsSupplied: vendorData.productsSupplied || 0,
    totalBusiness: vendorData.totalBusiness || 0,
    totalCommission: vendorData.totalCommission || 0,
    outstandingPayments: vendorData.outstandingPayments || 0,
    rating: vendorData.rating || 0,
    commissionRate: vendorData.commissionRate || 0,
    barcode: vendorData.barcode,
    agentId: vendorData.agentId,
    agentName: vendorData.agentName,
    agentCommission: vendorData.agentCommission || 0,
    designerAgentId: vendorData.designerAgentId,
    designerAgentName: vendorData.designerAgentName,
    designerAgentCommission: vendorData.designerAgentCommission || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    const vendors = await getAllVendors();
    vendors.unshift(newVendor);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'vendors', value: vendors })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveVendorsToStorage(vendors);
    return newVendor;
  } catch (error) {
    console.error('Error creating vendor via API, using localStorage:', error);
    const vendors = getVendorsFromStorage();
    vendors.unshift(newVendor);
    saveVendorsToStorage(vendors);
    return newVendor;
  }
}

// Update vendor
export async function updateVendor(vendorId: string, updates: Partial<Vendor>): Promise<Vendor> {
  try {
    const vendors = await getAllVendors();
    const index = vendors.findIndex(v => v.id === vendorId);
    
    if (index === -1) {
      throw new Error('Vendor not found');
    }
    
    vendors[index] = {
      ...vendors[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'vendors', value: vendors })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveVendorsToStorage(vendors);
    return vendors[index];
  } catch (error) {
    console.error('Error updating vendor via API, using localStorage:', error);
    const vendors = getVendorsFromStorage();
    const index = vendors.findIndex(v => v.id === vendorId);
    if (index !== -1) {
      vendors[index] = { ...vendors[index], ...updates, updatedAt: new Date().toISOString() };
      saveVendorsToStorage(vendors);
      return vendors[index];
    }
    throw error;
  }
}

// Delete vendor
export async function deleteVendor(vendorId: string): Promise<void> {
  try {
    const vendors = await getAllVendors();
    const filtered = vendors.filter(v => v.id !== vendorId);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'vendors', value: filtered })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveVendorsToStorage(filtered);
  } catch (error) {
    console.error('Error deleting vendor via API, using localStorage:', error);
    const vendors = getVendorsFromStorage();
    const filtered = vendors.filter(v => v.id !== vendorId);
    saveVendorsToStorage(filtered);
  }
}

// Get vendors by type
export async function getVendorsByType(type: string): Promise<Vendor[]> {
  const vendors = await getAllVendors();
  return vendors.filter(v => v.type === type);
}

// Get vendors by status
export async function getVendorsByStatus(status: string): Promise<Vendor[]> {
  const vendors = await getAllVendors();
  return vendors.filter(v => v.status === status);
}