export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: 'ready-made' | 'fabric';
  description: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  vendorId?: string;
  vendorName?: string;
  location: string;
  lastUpdated: string;
  avgMonthlySales: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  variants?: any[];
  imageUrl?: string;
}

/**
 * Get all inventory items
 */
export function getAllInventory(): InventoryItem[] {
  try {
    const stored = localStorage.getItem('tashivar_inventory');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading inventory from localStorage:', error);
    return [];
  }
}

/**
 * Sync inventory from products (create inventory items for approved products)
 */
export async function syncInventoryFromProducts(): Promise<void> {
  try {
    // Import productService dynamically to avoid circular dependencies
    const productService = await import('./productService');
    const products = await productService.getAllProducts();
    const approvedProducts = products.filter(p => p.status === 'approved');
    
    const currentInventory = getAllInventory();
    
    // Create inventory items for products that don't have inventory entries
    const newInventoryItems: InventoryItem[] = [];
    
    for (const product of approvedProducts) {
      const existingItem = currentInventory.find(item => item.productId === product.id);
      
      if (!existingItem) {
        // Create new inventory item
        const newItem: InventoryItem = {
          id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId: product.id,
          productName: product.name,
          sku: product.sku || `SKU-${product.id}`,
          category: product.type === 'fabric' ? 'fabric' : 'ready-made',
          description: product.description || '',
          currentStock: product.quantity || 0,
          minStock: 10,
          maxStock: 1000,
          reorderPoint: 20,
          unit: product.type === 'fabric' ? 'meters' : 'pieces',
          costPrice: product.costPrice || 0,
          sellingPrice: product.suggestedPrice || 0,
          vendorId: product.vendorId,
          vendorName: product.vendor,
          location: 'Main Warehouse',
          lastUpdated: new Date().toISOString(),
          avgMonthlySales: 0,
          status: (product.quantity || 0) === 0 ? 'out-of-stock' : 
                  (product.quantity || 0) < 10 ? 'low-stock' : 'in-stock',
          imageUrl: product.images?.[0] || undefined
        };
        newInventoryItems.push(newItem);
      }
    }
    
    if (newInventoryItems.length > 0) {
      const updatedInventory = [...currentInventory, ...newInventoryItems];
      localStorage.setItem('tashivar_inventory', JSON.stringify(updatedInventory));
      console.log(`✅ Synced ${newInventoryItems.length} new inventory items from products`);
    }
  } catch (error) {
    console.error('Error syncing inventory from products:', error);
  }
}

/**
 * Add or update inventory item
 */
export function saveInventoryItem(item: InventoryItem): void {
  const inventory = getAllInventory();
  const existingIndex = inventory.findIndex(i => i.id === item.id);
  
  if (existingIndex !== -1) {
    inventory[existingIndex] = item;
  } else {
    inventory.push(item);
  }
  
  localStorage.setItem('tashivar_inventory', JSON.stringify(inventory));
  console.log(`💾 Saved inventory item: ${item.productName}`);
}

/**
 * Delete inventory item
 */
export function deleteInventoryItem(itemId: string): void {
  const inventory = getAllInventory();
  const filtered = inventory.filter(item => item.id !== itemId);
  localStorage.setItem('tashivar_inventory', JSON.stringify(filtered));
  console.log(`🗑️ Deleted inventory item: ${itemId}`);
}

/**
 * Delete inventory item by product ID
 */
export function deleteInventoryByProductId(productId: string): void {
  const inventory = getAllInventory();
  const filtered = inventory.filter(item => item.productId !== productId);
  localStorage.setItem('tashivar_inventory', JSON.stringify(filtered));
  console.log(`🗑️ Deleted inventory for product: ${productId}`);
}

/**
 * Update stock level
 */
export function updateStock(productId: string, newStock: number): void {
  const inventory = getAllInventory();
  const item = inventory.find(i => i.productId === productId);
  
  if (item) {
    item.currentStock = newStock;
    item.lastUpdated = new Date().toISOString();
    
    // Update status based on stock levels
    if (newStock === 0) {
      item.status = 'out-of-stock';
    } else if (newStock < item.minStock) {
      item.status = 'low-stock';
    } else if (newStock > item.maxStock) {
      item.status = 'overstocked';
    } else {
      item.status = 'in-stock';
    }
    
    localStorage.setItem('tashivar_inventory', JSON.stringify(inventory));
    console.log(`📦 Updated stock for ${item.productName}: ${newStock} ${item.unit}`);
  }
}

/**
 * Get inventory item by product ID
 */
export function getInventoryByProductId(productId: string): InventoryItem | undefined {
  const inventory = getAllInventory();
  return inventory.find(item => item.productId === productId);
}

/**
 * Get low stock items
 */
export function getLowStockItems(): InventoryItem[] {
  const inventory = getAllInventory();
  return inventory.filter(item => item.currentStock < item.reorderPoint);
}

/**
 * Get out of stock items
 */
export function getOutOfStockItems(): InventoryItem[] {
  const inventory = getAllInventory();
  return inventory.filter(item => item.currentStock === 0);
}
