/**
 * Utility to clean up duplicate entries in products and inventory
 * Removes duplicates based on unique identifiers
 */

interface Product {
  id: string;
  name: string;
  [key: string]: any;
}

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  [key: string]: any;
}

/**
 * Remove duplicate products based on product ID
 * Keeps the most recent entry (first in array)
 */
export function cleanupDuplicateProducts(): { before: number; after: number; removed: number } {
  try {
    const products: Product[] = JSON.parse(localStorage.getItem('tashivar_products') || '[]');
    const beforeCount = products.length;
    
    console.log(`🧹 Cleaning up products. Total entries: ${beforeCount}`);
    
    // Use Map to track unique products by ID
    const uniqueProductsMap = new Map<string, Product>();
    
    products.forEach(product => {
      if (!uniqueProductsMap.has(product.id)) {
        uniqueProductsMap.set(product.id, product);
        console.log(`✅ Keeping product: ${product.id} - ${product.name}`);
      } else {
        console.log(`🗑️ Removing duplicate product: ${product.id} - ${product.name}`);
      }
    });
    
    // Convert Map back to array
    const uniqueProducts = Array.from(uniqueProductsMap.values());
    const afterCount = uniqueProducts.length;
    const removedCount = beforeCount - afterCount;
    
    // Save cleaned data
    localStorage.setItem('tashivar_products', JSON.stringify(uniqueProducts));
    
    console.log(`✅ Products cleanup complete. Before: ${beforeCount}, After: ${afterCount}, Removed: ${removedCount}`);
    
    return { before: beforeCount, after: afterCount, removed: removedCount };
  } catch (error) {
    console.error('❌ Error cleaning up products:', error);
    return { before: 0, after: 0, removed: 0 };
  }
}

/**
 * Remove duplicate inventory items based on product ID
 * Keeps the most recent entry (first in array)
 */
export function cleanupDuplicateInventory(): { before: number; after: number; removed: number } {
  try {
    const inventory: InventoryItem[] = JSON.parse(localStorage.getItem('tashivar_inventory') || '[]');
    const beforeCount = inventory.length;
    
    console.log(`🧹 Cleaning up inventory. Total entries: ${beforeCount}`);
    
    // Use Map to track unique inventory items by productId
    const uniqueInventoryMap = new Map<string, InventoryItem>();
    
    inventory.forEach(item => {
      if (!uniqueInventoryMap.has(item.productId)) {
        uniqueInventoryMap.set(item.productId, item);
        console.log(`✅ Keeping inventory: ${item.id} - ${item.productName} (Product: ${item.productId})`);
      } else {
        console.log(`🗑️ Removing duplicate inventory: ${item.id} - ${item.productName} (Product: ${item.productId})`);
      }
    });
    
    // Convert Map back to array
    const uniqueInventory = Array.from(uniqueInventoryMap.values());
    const afterCount = uniqueInventory.length;
    const removedCount = beforeCount - afterCount;
    
    // Save cleaned data
    localStorage.setItem('tashivar_inventory', JSON.stringify(uniqueInventory));
    
    console.log(`✅ Inventory cleanup complete. Before: ${beforeCount}, After: ${afterCount}, Removed: ${removedCount}`);
    
    return { before: beforeCount, after: afterCount, removed: removedCount };
  } catch (error) {
    console.error('❌ Error cleaning up inventory:', error);
    return { before: 0, after: 0, removed: 0 };
  }
}

/**
 * Clean up all duplicates (products + inventory)
 */
export function cleanupAllDuplicates(): {
  products: { before: number; after: number; removed: number };
  inventory: { before: number; after: number; removed: number };
  totalRemoved: number;
} {
  console.log('🧹🧹🧹 Starting full cleanup of duplicate entries...');
  
  const productsResult = cleanupDuplicateProducts();
  const inventoryResult = cleanupDuplicateInventory();
  const totalRemoved = productsResult.removed + inventoryResult.removed;
  
  console.log(`\n✅ CLEANUP COMPLETE!`);
  console.log(`📦 Products: ${productsResult.removed} duplicates removed`);
  console.log(`📋 Inventory: ${inventoryResult.removed} duplicates removed`);
  console.log(`🎉 Total: ${totalRemoved} duplicate entries removed\n`);
  
  return {
    products: productsResult,
    inventory: inventoryResult,
    totalRemoved
  };
}

/**
 * Sync cleaned data to Supabase backend
 */
export async function syncCleanedDataToSupabase(): Promise<void> {
  try {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'vzukhlwpmttepwbojbos';
    const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6dWtobHdwbXR0ZXB3Ym9qYm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNzI5NzYsImV4cCI6MjA1Mjk0ODk3Nn0.TXhhR2LqBtMEKSyJb0-CfqVMpWLzSCrX-nxFg1bMEek';
    const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;
    
    console.log('☁️ Syncing cleaned data to Supabase...');
    
    // Sync products
    const products = JSON.parse(localStorage.getItem('tashivar_products') || '[]');
    const productsResponse = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ key: 'products', value: products })
    });
    
    if (productsResponse.ok) {
      console.log('✅ Products synced to Supabase');
    } else {
      console.warn('⚠️ Failed to sync products to Supabase');
    }
    
    // Note: Inventory is stored in localStorage only, not in Supabase KV
    console.log('✅ Cleanup sync complete');
  } catch (error) {
    console.error('❌ Error syncing to Supabase:', error);
  }
}
