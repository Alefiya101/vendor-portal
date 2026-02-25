/**
 * Stock Transaction Service
 * Tracks all inventory movements and provides real transaction history
 */

export interface StockTransaction {
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

const STORAGE_KEY = 'tashivar_stock_transactions';

/**
 * Get all stock transactions
 */
export function getAllTransactions(): StockTransaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading stock transactions:', error);
    return [];
  }
}

/**
 * Get transactions for a specific product
 */
export function getTransactionsByProduct(productId: string): StockTransaction[] {
  const allTransactions = getAllTransactions();
  return allTransactions.filter(t => t.productId === productId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get transactions by type
 */
export function getTransactionsByType(type: StockTransaction['transactionType']): StockTransaction[] {
  const allTransactions = getAllTransactions();
  return allTransactions.filter(t => t.transactionType === type)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Get transactions within a date range
 */
export function getTransactionsByDateRange(startDate: Date, endDate: Date): StockTransaction[] {
  const allTransactions = getAllTransactions();
  return allTransactions.filter(t => {
    const txnDate = new Date(t.timestamp);
    return txnDate >= startDate && txnDate <= endDate;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Record a stock transaction
 */
export function recordTransaction(transaction: Omit<StockTransaction, 'id' | 'timestamp'>): StockTransaction {
  const allTransactions = getAllTransactions();
  
  const newTransaction: StockTransaction = {
    ...transaction,
    id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };
  
  allTransactions.unshift(newTransaction);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allTransactions));
    console.log(`✅ Recorded stock transaction: ${newTransaction.transactionType} for ${transaction.productName} (${transaction.quantity} ${transaction.unit})`);
  } catch (error) {
    console.error('Error saving stock transaction:', error);
  }
  
  return newTransaction;
}

/**
 * Record a purchase transaction (when inventory increases from vendor)
 */
export function recordPurchase(
  productId: string,
  productName: string,
  sku: string,
  quantity: number,
  previousStock: number,
  referenceId?: string,
  location: string = 'Main Warehouse',
  performedBy: string = 'System'
): StockTransaction {
  return recordTransaction({
    productId,
    productName,
    sku,
    transactionType: 'purchase',
    quantity,
    previousStock,
    newStock: previousStock + quantity,
    unit: 'pcs',
    referenceId,
    referenceType: 'po',
    location,
    notes: referenceId ? `Purchase from PO ${referenceId}` : 'Stock purchase',
    performedBy
  });
}

/**
 * Record a sale transaction (when inventory decreases from order)
 */
export function recordSale(
  productId: string,
  productName: string,
  sku: string,
  quantity: number,
  previousStock: number,
  orderId?: string,
  location: string = 'Main Warehouse',
  performedBy: string = 'System'
): StockTransaction {
  return recordTransaction({
    productId,
    productName,
    sku,
    transactionType: 'sale',
    quantity,
    previousStock,
    newStock: previousStock - quantity,
    unit: 'pcs',
    referenceId: orderId,
    referenceType: 'order',
    location,
    notes: orderId ? `Sale from Order ${orderId}` : 'Stock sale',
    performedBy
  });
}

/**
 * Record a manual adjustment
 */
export function recordAdjustment(
  productId: string,
  productName: string,
  sku: string,
  quantity: number,
  previousStock: number,
  adjustmentType: 'add' | 'remove',
  reason: string,
  notes?: string,
  location: string = 'Main Warehouse',
  performedBy: string = 'Admin'
): StockTransaction {
  const isIncrease = adjustmentType === 'add';
  
  return recordTransaction({
    productId,
    productName,
    sku,
    transactionType: 'adjustment',
    quantity: Math.abs(quantity),
    previousStock,
    newStock: isIncrease ? previousStock + quantity : previousStock - quantity,
    unit: 'pcs',
    referenceType: 'manual',
    location,
    notes: `${reason}${notes ? ` - ${notes}` : ''}`,
    performedBy
  });
}

/**
 * Record a return transaction
 */
export function recordReturn(
  productId: string,
  productName: string,
  sku: string,
  quantity: number,
  previousStock: number,
  orderId?: string,
  location: string = 'Main Warehouse',
  performedBy: string = 'System'
): StockTransaction {
  return recordTransaction({
    productId,
    productName,
    sku,
    transactionType: 'return',
    quantity,
    previousStock,
    newStock: previousStock + quantity,
    unit: 'pcs',
    referenceId: orderId,
    referenceType: 'order',
    location,
    notes: orderId ? `Return from Order ${orderId}` : 'Stock return',
    performedBy
  });
}

/**
 * Record a damaged/loss transaction
 */
export function recordDamaged(
  productId: string,
  productName: string,
  sku: string,
  quantity: number,
  previousStock: number,
  reason: string,
  location: string = 'Main Warehouse',
  performedBy: string = 'Warehouse Manager'
): StockTransaction {
  return recordTransaction({
    productId,
    productName,
    sku,
    transactionType: 'damaged',
    quantity,
    previousStock,
    newStock: previousStock - quantity,
    unit: 'pcs',
    referenceType: 'manual',
    location,
    notes: reason,
    performedBy
  });
}

/**
 * Record a transfer transaction
 */
export function recordTransfer(
  productId: string,
  productName: string,
  sku: string,
  quantity: number,
  previousStock: number,
  fromLocation: string,
  toLocation: string,
  performedBy: string = 'Warehouse Manager'
): StockTransaction {
  return recordTransaction({
    productId,
    productName,
    sku,
    transactionType: 'transfer',
    quantity,
    previousStock,
    newStock: previousStock, // Stock level doesn't change for transfers (just location)
    unit: 'pcs',
    referenceType: 'transfer',
    location: `${fromLocation} → ${toLocation}`,
    notes: `Transfer from ${fromLocation} to ${toLocation}`,
    performedBy
  });
}

/**
 * Delete transactions for a specific product (when product is deleted)
 */
export function deleteTransactionsForProduct(productId: string): void {
  const allTransactions = getAllTransactions();
  const filtered = allTransactions.filter(t => t.productId !== productId);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log(`🗑️ Deleted all transactions for product: ${productId}`);
  } catch (error) {
    console.error('Error deleting transactions:', error);
  }
}

/**
 * Get stock summary for a product
 */
export function getStockSummary(productId: string): {
  totalPurchases: number;
  totalSales: number;
  totalAdjustments: number;
  totalReturns: number;
  totalDamaged: number;
  netMovement: number;
} {
  const transactions = getTransactionsByProduct(productId);
  
  const summary = {
    totalPurchases: 0,
    totalSales: 0,
    totalAdjustments: 0,
    totalReturns: 0,
    totalDamaged: 0,
    netMovement: 0
  };
  
  transactions.forEach(t => {
    switch (t.transactionType) {
      case 'purchase':
        summary.totalPurchases += t.quantity;
        summary.netMovement += t.quantity;
        break;
      case 'sale':
        summary.totalSales += t.quantity;
        summary.netMovement -= t.quantity;
        break;
      case 'adjustment':
        summary.totalAdjustments += (t.newStock - t.previousStock);
        summary.netMovement += (t.newStock - t.previousStock);
        break;
      case 'return':
        summary.totalReturns += t.quantity;
        summary.netMovement += t.quantity;
        break;
      case 'damaged':
        summary.totalDamaged += t.quantity;
        summary.netMovement -= t.quantity;
        break;
    }
  });
  
  return summary;
}

/**
 * Clear all transactions (use with caution)
 */
export function clearAllTransactions(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    console.log('🗑️ Cleared all stock transactions');
  } catch (error) {
    console.error('Error clearing transactions:', error);
  }
}
