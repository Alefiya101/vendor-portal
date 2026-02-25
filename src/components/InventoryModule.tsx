import React, { useState } from 'react';
import { InventoryDashboard } from './InventoryDashboard';
import { InventoryManagement } from './InventoryManagement';
import { StockHistory, StockAdjustmentForm } from './StockHistory';

interface InventoryItem {
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

interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  transactionType: 'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer' | 'damaged';
  quantity: number;
  previousStock: number;
  newStock: number;
  unit: string;
  referenceId?: string;
  referenceType?: 'order' | 'po' | 'manual' | 'transfer';
  location: string;
  notes?: string;
  performedBy: string;
  timestamp: string;
}

export function InventoryModule() {
  const [view, setView] = useState<'dashboard' | 'add' | 'edit' | 'history' | 'adjust'>('dashboard');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddInventory = () => {
    setSelectedItem(null);
    setView('add');
  };

  const handleEditInventory = (item: InventoryItem) => {
    setSelectedItem(item);
    setView('edit');
  };

  const handleViewHistory = (productId: string) => {
    const inventory = JSON.parse(localStorage.getItem('tashivar_inventory') || '[]');
    const item = inventory.find((i: InventoryItem) => i.productId === productId);
    setSelectedItem(item || null);
    setSelectedProductId(productId);
    setView('history');
  };

  const handleSaveInventory = (item: InventoryItem) => {
    // Prevent duplicate saves
    if (isSaving) {
      console.log('⚠️ Already saving inventory, ignoring duplicate save');
      return;
    }
    
    setIsSaving(true);
    
    // Load existing inventory
    const inventory = JSON.parse(localStorage.getItem('tashivar_inventory') || '[]');
    
    // Check if this is an update or new item
    const existingIndex = inventory.findIndex((i: InventoryItem) => i.id === item.id);
    
    let previousStock = 0;
    if (existingIndex !== -1) {
      previousStock = inventory[existingIndex].currentStock;
      inventory[existingIndex] = item;
    } else {
      inventory.push(item);
    }
    
    // Save to localStorage
    localStorage.setItem('tashivar_inventory', JSON.stringify(inventory));
    
    // If stock changed, record transaction
    if (existingIndex !== -1 && previousStock !== item.currentStock) {
      recordStockTransaction({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        transactionType: 'adjustment',
        quantity: Math.abs(item.currentStock - previousStock),
        previousStock,
        newStock: item.currentStock,
        unit: item.unit,
        location: item.location,
        notes: 'Manual stock update',
        performedBy: 'Admin User'
      });
    }
    
    setView('dashboard');
    setSelectedItem(null);
    setIsSaving(false);
  };

  const handleStockAdjustment = (adjustment: any) => {
    // Load inventory
    const inventory = JSON.parse(localStorage.getItem('tashivar_inventory') || '[]');
    const itemIndex = inventory.findIndex((i: InventoryItem) => i.productId === adjustment.productId);
    
    if (itemIndex !== -1) {
      const item = inventory[itemIndex];
      const previousStock = item.currentStock;
      const quantityChange = adjustment.adjustmentType === 'add' ? adjustment.quantity : -adjustment.quantity;
      const newStock = previousStock + quantityChange;
      
      // Update stock
      item.currentStock = newStock;
      item.lastUpdated = new Date().toISOString();
      
      // Update status
      if (newStock === 0) item.status = 'out-of-stock';
      else if (newStock <= item.reorderPoint) item.status = 'low-stock';
      else if (newStock > item.maxStock) item.status = 'overstocked';
      else item.status = 'in-stock';
      
      inventory[itemIndex] = item;
      localStorage.setItem('tashivar_inventory', JSON.stringify(inventory));
      
      // Record transaction
      const transactionType = adjustment.adjustmentType === 'add' ? 'adjustment' : 
                             adjustment.reason === 'damaged' ? 'damaged' : 'adjustment';
      
      recordStockTransaction({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        transactionType,
        quantity: adjustment.quantity,
        previousStock,
        newStock,
        unit: item.unit,
        location: item.location,
        notes: `${adjustment.reason}: ${adjustment.notes || ''}`.trim(),
        performedBy: 'Admin User'
      });
    }
    
    setView('dashboard');
    setSelectedItem(null);
  };

  const recordStockTransaction = (transaction: Partial<StockTransaction>) => {
    const transactions = JSON.parse(localStorage.getItem('tashivar_stock_transactions') || '[]');
    
    const newTransaction: StockTransaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId: transaction.productId!,
      productName: transaction.productName!,
      sku: transaction.sku!,
      transactionType: transaction.transactionType!,
      quantity: transaction.quantity!,
      previousStock: transaction.previousStock!,
      newStock: transaction.newStock!,
      unit: transaction.unit!,
      referenceId: transaction.referenceId,
      referenceType: transaction.referenceType || 'manual',
      location: transaction.location!,
      notes: transaction.notes,
      performedBy: transaction.performedBy || 'System',
      timestamp: new Date().toISOString()
    };
    
    transactions.unshift(newTransaction);
    localStorage.setItem('tashivar_stock_transactions', JSON.stringify(transactions));
  };

  // Function to update stock when orders are placed
  // This can be called from order management
  const updateStockFromOrder = (orderId: string, items: Array<{ productId: string; quantity: number }>) => {
    const inventory = JSON.parse(localStorage.getItem('tashivar_inventory') || '[]');
    
    items.forEach(orderItem => {
      const itemIndex = inventory.findIndex((i: InventoryItem) => i.productId === orderItem.productId);
      
      if (itemIndex !== -1) {
        const item = inventory[itemIndex];
        const previousStock = item.currentStock;
        const newStock = previousStock - orderItem.quantity;
        
        // Update stock
        item.currentStock = Math.max(0, newStock);
        item.lastUpdated = new Date().toISOString();
        
        // Update status
        if (item.currentStock === 0) item.status = 'out-of-stock';
        else if (item.currentStock <= item.reorderPoint) item.status = 'low-stock';
        else item.status = 'in-stock';
        
        inventory[itemIndex] = item;
        
        // Record transaction
        recordStockTransaction({
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          transactionType: 'sale',
          quantity: orderItem.quantity,
          previousStock,
          newStock: item.currentStock,
          unit: item.unit,
          referenceId: orderId,
          referenceType: 'order',
          location: item.location,
          notes: `Order ${orderId}`,
          performedBy: 'System'
        });
      }
    });
    
    localStorage.setItem('tashivar_inventory', JSON.stringify(inventory));
  };

  // Expose this function globally so order management can call it
  if (typeof window !== 'undefined') {
    (window as any).updateInventoryFromOrder = updateStockFromOrder;
  }

  return (
    <div>
      {view === 'dashboard' && (
        <InventoryDashboard
          onAddInventory={handleAddInventory}
          onEditInventory={handleEditInventory}
          onViewHistory={handleViewHistory}
        />
      )}
      
      {(view === 'add' || view === 'edit') && (
        <InventoryManagement
          item={selectedItem}
          onClose={() => {
            setView('dashboard');
            setSelectedItem(null);
          }}
          onSave={handleSaveInventory}
        />
      )}
      
      {view === 'history' && (
        <StockHistory
          productId={selectedProductId || undefined}
          productName={selectedItem?.productName}
          onClose={() => {
            setView('dashboard');
            setSelectedProductId(null);
            setSelectedItem(null);
          }}
        />
      )}
      
      {view === 'adjust' && selectedItem && (
        <StockAdjustmentForm
          productId={selectedItem.productId}
          productName={selectedItem.productName}
          currentStock={selectedItem.currentStock}
          unit={selectedItem.unit}
          onClose={() => {
            setView('dashboard');
            setSelectedItem(null);
          }}
          onSave={handleStockAdjustment}
        />
      )}
    </div>
  );
}

// Utility function to check stock availability
export function checkStockAvailability(productId: string, requestedQuantity: number): {
  available: boolean;
  currentStock: number;
  message: string;
} {
  const inventory = JSON.parse(localStorage.getItem('tashivar_inventory') || '[]');
  const item = inventory.find((i: InventoryItem) => i.productId === productId);
  
  if (!item) {
    return {
      available: false,
      currentStock: 0,
      message: 'Product not found in inventory'
    };
  }
  
  if (item.currentStock < requestedQuantity) {
    return {
      available: false,
      currentStock: item.currentStock,
      message: `Insufficient stock. Available: ${item.currentStock} ${item.unit}`
    };
  }
  
  if (item.currentStock - requestedQuantity <= item.reorderPoint) {
    return {
      available: true,
      currentStock: item.currentStock,
      message: `Warning: Stock will be low after this order (${item.currentStock - requestedQuantity} ${item.unit} remaining)`
    };
  }
  
  return {
    available: true,
    currentStock: item.currentStock,
    message: 'Stock available'
  };
}

// Utility function to get low stock alerts
export function getLowStockAlerts(): InventoryItem[] {
  const inventory = JSON.parse(localStorage.getItem('tashivar_inventory') || '[]');
  return inventory.filter((item: InventoryItem) => 
    item.status === 'low-stock' || item.status === 'out-of-stock'
  );
}
