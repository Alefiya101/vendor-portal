/**
 * Warehouse Service
 * 
 * Manages warehouse operations including receiving, dispatching,
 * and tracking inventory movements.
 */

import * as inventoryService from './inventoryService';
import * as orderService from './orderService';

interface WarehouseTransaction {
  id: string;
  type: 'receiving' | 'dispatching';
  orderId?: string;
  poId?: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  unit: string;
  location: string;
  binLocation?: string;
  scannedBy: string;
  verifiedBy?: string;
  qualityStatus?: 'pending' | 'passed' | 'failed';
  qualityNotes?: string;
  source?: string; // For receiving: vendor name
  destination?: string; // For dispatching: buyer name
  trackingNumber?: string;
  courierService?: string;
  timestamp: string;
}

interface WarehouseStats {
  totalItems: number;
  receivedToday: number;
  dispatchedToday: number;
  pendingReceiving: number;
  pendingDispatching: number;
  totalValueInWarehouse: number;
}

const STORAGE_KEY = 'tashivar_warehouse_transactions';

/**
 * Get all warehouse transactions
 */
export function getAllTransactions(): WarehouseTransaction[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get warehouse statistics
 */
export function getWarehouseStats(): WarehouseStats {
  const transactions = getAllTransactions();
  const inventory = inventoryService.getAllInventory();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTransactions = transactions.filter(t => {
    const txDate = new Date(t.timestamp);
    txDate.setHours(0, 0, 0, 0);
    return txDate.getTime() === today.getTime();
  });
  
  const receivedToday = todayTransactions
    .filter(t => t.type === 'receiving')
    .reduce((sum, t) => sum + t.quantity, 0);
    
  const dispatchedToday = todayTransactions
    .filter(t => t.type === 'dispatching')
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const totalItems = inventory.reduce((sum: number, item: any) => sum + item.currentStock, 0);
  
  // Get orders to count pending operations
  let orders: any[] = [];
  try {
    const ordersResult = orderService.getAllOrders();
    orders = Array.isArray(ordersResult) ? ordersResult : [];
  } catch (error) {
    console.error('Error loading orders for warehouse stats:', error);
    orders = [];
  }
  
  const pendingReceiving = orders.filter((o: any) => 
    ['vendor-dispatched', 'in-transit-to-warehouse'].includes(o.status)
  ).length;
  
  const pendingDispatching = orders.filter((o: any) => 
    o.status === 'received-at-warehouse'
  ).length;
  
  const totalValueInWarehouse = inventory.reduce(
    (sum: number, item: any) => sum + (item.currentStock * item.costPrice), 
    0
  );
  
  return {
    totalItems: Math.floor(totalItems),
    receivedToday: Math.floor(receivedToday),
    dispatchedToday: Math.floor(dispatchedToday),
    pendingReceiving,
    pendingDispatching,
    totalValueInWarehouse
  };
}

/**
 * Record receiving transaction
 */
export function recordReceiving(transaction: Omit<WarehouseTransaction, 'id' | 'timestamp' | 'type'>): WarehouseTransaction {
  const transactions = getAllTransactions();
  
  const newTransaction: WarehouseTransaction = {
    ...transaction,
    id: `WH-RCV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'receiving',
    timestamp: new Date().toISOString()
  };
  
  transactions.unshift(newTransaction);
  
  // Keep last 5000 transactions
  if (transactions.length > 5000) {
    transactions.splice(5000);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  
  console.log('📦 Warehouse receiving recorded:', newTransaction.id);
  
  return newTransaction;
}

/**
 * Record dispatching transaction
 */
export function recordDispatching(transaction: Omit<WarehouseTransaction, 'id' | 'timestamp' | 'type'>): WarehouseTransaction {
  const transactions = getAllTransactions();
  
  const newTransaction: WarehouseTransaction = {
    ...transaction,
    id: `WH-DSP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'dispatching',
    timestamp: new Date().toISOString()
  };
  
  transactions.unshift(newTransaction);
  
  // Keep last 5000 transactions
  if (transactions.length > 5000) {
    transactions.splice(5000);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  
  console.log('📤 Warehouse dispatching recorded:', newTransaction.id);
  
  return newTransaction;
}

/**
 * Get transactions by type
 */
export function getTransactionsByType(type: 'receiving' | 'dispatching', limit: number = 100): WarehouseTransaction[] {
  const transactions = getAllTransactions();
  return transactions
    .filter(t => t.type === type)
    .slice(0, limit);
}

/**
 * Get transactions for an order
 */
export function getOrderTransactions(orderId: string): WarehouseTransaction[] {
  const transactions = getAllTransactions();
  return transactions.filter(t => t.orderId === orderId);
}

/**
 * Get transactions for a product
 */
export function getProductTransactions(productId: string, limit: number = 50): WarehouseTransaction[] {
  const transactions = getAllTransactions();
  return transactions
    .filter(t => t.productId === productId)
    .slice(0, limit);
}

/**
 * Get today's transactions
 */
export function getTodayTransactions(): WarehouseTransaction[] {
  const transactions = getAllTransactions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return transactions.filter(t => {
    const txDate = new Date(t.timestamp);
    txDate.setHours(0, 0, 0, 0);
    return txDate.getTime() === today.getTime();
  });
}

/**
 * Verify quality check
 */
export function updateQualityCheck(transactionId: string, status: 'passed' | 'failed', notes?: string, verifiedBy?: string): void {
  const transactions = getAllTransactions();
  const transaction = transactions.find(t => t.id === transactionId);
  
  if (transaction) {
    transaction.qualityStatus = status;
    transaction.qualityNotes = notes;
    transaction.verifiedBy = verifiedBy;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    console.log('✅ Quality check updated:', transactionId, status);
  }
}

/**
 * Clear all warehouse transactions
 */
export function clearAllTransactions(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  console.log('🗑️ All warehouse transactions cleared');
}