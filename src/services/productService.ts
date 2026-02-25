import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

export interface Product {
  id: string;
  name: string;
  type: 'readymade' | 'fabric';
  category: string;
  vendor: string;
  vendorId: string;
  images: string[];
  description: string;
  costPrice: number;
  suggestedPrice: number;
  moq: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  quantity?: number;
  totalCost?: number;
  sku?: string;
  barcode?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions for localStorage fallback
function getProductsFromStorage(): Product[] {
  try {
    const stored = localStorage.getItem('tashivar_products');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading products from localStorage:', error);
    return [];
  }
}

function saveProductsToStorage(products: Product[]): void {
  try {
    localStorage.setItem('tashivar_products', JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products to localStorage:', error);
  }
}

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=products`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const products = data.value || [];
    
    // Also save to localStorage as backup
    saveProductsToStorage(products);
    console.log('✅ Products loaded from Supabase API');
    return products;
  } catch (error) {
    // Silently use localStorage fallback - this is expected behavior
    const products = getProductsFromStorage();
    console.log(`ℹ️ Using localStorage for products (${products.length} items) - API unavailable`);
    return products;
  }
}

// Get single product
export async function getProduct(productId: string): Promise<Product | null> {
  try {
    const products = await getAllProducts();
    return products.find(p => p.id === productId) || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Create new product
export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const newProduct: Product = {
    id: productData.id || `TSV-${Date.now()}`,
    name: productData.name!,
    type: productData.type!,
    category: productData.category!,
    vendor: productData.vendor!,
    vendorId: productData.vendorId!,
    images: productData.images || [],
    description: productData.description || '',
    costPrice: productData.costPrice!,
    suggestedPrice: productData.suggestedPrice!,
    moq: productData.moq || 1,
    status: productData.status || 'pending',
    submittedDate: productData.submittedDate || new Date().toISOString().split('T')[0],
    quantity: productData.quantity,
    totalCost: productData.totalCost,
    sku: productData.sku || `SKU-${Date.now()}`,
    barcode: productData.barcode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    const products = await getAllProducts();
    
    // Check for duplicates to prevent multiple submissions
    const existingProduct = products.find(p => p.id === newProduct.id);
    if (existingProduct) {
      console.log('⚠️ Product with this ID already exists, returning existing product');
      return existingProduct;
    }
    
    products.unshift(newProduct);
    console.log(`✅ Creating new product: ${newProduct.id} - ${newProduct.name}`);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'products', value: products })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveProductsToStorage(products);
    return newProduct;
  } catch (error) {
    console.error('Error creating product via API, using localStorage:', error);
    const products = getProductsFromStorage();
    
    // Check for duplicates in localStorage too
    const existingProduct = products.find(p => p.id === newProduct.id);
    if (existingProduct) {
      console.log('⚠️ Product with this ID already exists in localStorage, returning existing product');
      return existingProduct;
    }
    
    products.unshift(newProduct);
    saveProductsToStorage(products);
    return newProduct;
  }
}

// Update product
export async function updateProduct(productId: string, updates: Partial<Product>): Promise<Product> {
  try {
    const products = await getAllProducts();
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) {
      throw new Error('Product not found');
    }
    
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'products', value: products })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveProductsToStorage(products);
    
    // Sync to inventory if quantity changed
    if (updates.quantity !== undefined) {
      syncProductToInventory(products[index]);
    }
    
    return products[index];
  } catch (error) {
    console.error('Error updating product via API, using localStorage:', error);
    const products = getProductsFromStorage();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
      saveProductsToStorage(products);
      
      // Sync to inventory if quantity changed
      if (updates.quantity !== undefined) {
        syncProductToInventory(products[index]);
      }
      
      return products[index];
    }
    throw error;
  }
}

// Delete product
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const products = await getAllProducts();
    const filtered = products.filter(p => p.id !== productId);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'products', value: filtered })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveProductsToStorage(filtered);
    
    // Also delete associated inventory
    deleteInventoryForProduct(productId);
  } catch (error) {
    console.error('Error deleting product via API, using localStorage:', error);
    const products = getProductsFromStorage();
    const filtered = products.filter(p => p.id !== productId);
    saveProductsToStorage(filtered);
    
    // Also delete associated inventory
    deleteInventoryForProduct(productId);
  }
}

// Get products by status
export async function getProductsByStatus(status: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter(p => p.status === status);
}

// Get products by vendor
export async function getProductsByVendor(vendorId: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter(p => p.vendorId === vendorId);
}

// Approve product
export async function approveProduct(productId: string): Promise<Product> {
  return await updateProduct(productId, { status: 'approved' });
}

// Reject product
export async function rejectProduct(productId: string): Promise<Product> {
  return await updateProduct(productId, { status: 'rejected' });
}

// Helper function to sync a single product to inventory
function syncProductToInventory(product: Product): void {
  try {
    const inventory = JSON.parse(localStorage.getItem('tashivar_inventory') || '[]');
    const existingIndex = inventory.findIndex((item: any) => item.productId === product.id);
    
    const inventoryItem = {
      id: existingIndex !== -1 ? inventory[existingIndex].id : `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku || product.barcode || `SKU-${product.id}`,
      category: product.type === 'readymade' ? 'ready-made' : 'fabric',
      description: product.description || '',
      currentStock: product.quantity || 0,
      minStock: existingIndex !== -1 ? inventory[existingIndex].minStock : 10,
      maxStock: existingIndex !== -1 ? inventory[existingIndex].maxStock : 500,
      reorderPoint: existingIndex !== -1 ? inventory[existingIndex].reorderPoint : 20,
      unit: 'pcs',
      costPrice: product.costPrice || 0,
      sellingPrice: product.suggestedPrice || 0,
      vendorId: product.vendorId,
      vendorName: product.vendor,
      location: existingIndex !== -1 ? inventory[existingIndex].location : 'Main Warehouse',
      lastUpdated: product.updatedAt || new Date().toISOString(),
      avgMonthlySales: existingIndex !== -1 ? inventory[existingIndex].avgMonthlySales : 0,
      status: (product.quantity || 0) === 0 ? 'out-of-stock' : 
              (product.quantity || 0) <= 20 ? 'low-stock' : 
              (product.quantity || 0) > 500 ? 'overstocked' : 'in-stock',
      variants: [],
      imageUrl: product.images && product.images[0] ? product.images[0] : undefined
    };
    
    if (existingIndex !== -1) {
      inventory[existingIndex] = inventoryItem;
    } else {
      inventory.push(inventoryItem);
    }
    
    localStorage.setItem('tashivar_inventory', JSON.stringify(inventory));
  } catch (error) {
    console.error('Error syncing product to inventory:', error);
  }
}

// Helper function to delete inventory for a product
function deleteInventoryForProduct(productId: string): void {
  try {
    const inventory = JSON.parse(localStorage.getItem('tashivar_inventory') || '[]');
    const filtered = inventory.filter((item: any) => item.productId !== productId);
    localStorage.setItem('tashivar_inventory', JSON.stringify(filtered));
    console.log(`🗑️ Deleted inventory for product: ${productId}`);
    
    // Also delete all stock transactions for this product
    const transactions = JSON.parse(localStorage.getItem('tashivar_stock_transactions') || '[]');
    const filteredTransactions = transactions.filter((txn: any) => txn.productId !== productId);
    localStorage.setItem('tashivar_stock_transactions', JSON.stringify(filteredTransactions));
    console.log(`🗑️ Deleted stock transactions for product: ${productId}`);
  } catch (error) {
    console.error('Error deleting inventory for product:', error);
  }
}