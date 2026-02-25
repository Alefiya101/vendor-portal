import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Package, ShoppingCart, Truck, RefreshCw, FileText, Download } from 'lucide-react';
import * as stockTransactionService from '../services/stockTransactionService';

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

interface StockAdjustment {
  productId: string;
  adjustmentType: 'add' | 'remove';
  quantity: number;
  reason: string;
  notes?: string;
}

interface StockHistoryProps {
  productId?: string;
  productName?: string;
  onClose: () => void;
}

export function StockHistory({ productId, productName, onClose }: StockHistoryProps) {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [productId]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, filterType, dateRange]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const storedTransactions = localStorage.getItem('tashivar_stock_transactions');
      let allTransactions: StockTransaction[] = [];

      if (storedTransactions) {
        allTransactions = JSON.parse(storedTransactions);
      } else {
        allTransactions = generateSampleTransactions();
        localStorage.setItem('tashivar_stock_transactions', JSON.stringify(allTransactions));
      }

      // Filter by product if specified
      if (productId) {
        allTransactions = allTransactions.filter(t => t.productId === productId);
      }

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    setLoading(false);
  };

  const generateSampleTransactions = (): StockTransaction[] => {
    const types: StockTransaction['transactionType'][] = ['purchase', 'sale', 'adjustment', 'return', 'transfer', 'damaged'];
    const locations = ['Mumbai Warehouse', 'Delhi Warehouse', 'Bangalore Warehouse'];
    const users = ['Admin User', 'Warehouse Manager', 'System'];

    return Array.from({ length: 50 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const isIncrease = type === 'purchase' || type === 'return';
      const quantity = Math.floor(Math.random() * 50) + 1;
      const previousStock = Math.floor(Math.random() * 200) + 50;
      const newStock = isIncrease ? previousStock + quantity : previousStock - quantity;

      return {
        id: `TXN-${String(i + 1).padStart(6, '0')}`,
        productId: productId || `PROD-000${(i % 5) + 1}`,
        productName: productName || `Product ${(i % 5) + 1}`,
        sku: `SKU-00000${(i % 5) + 1}`,
        transactionType: type,
        quantity,
        previousStock,
        newStock,
        unit: 'pieces',
        referenceId: type === 'sale' ? `ORD-${String(i + 1).padStart(6, '0')}` : undefined,
        referenceType: type === 'sale' ? 'order' : type === 'purchase' ? 'po' : 'manual',
        location: locations[i % 3],
        notes: type === 'adjustment' ? 'Stock correction after physical count' : undefined,
        performedBy: users[i % 3],
        timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
      };
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.transactionType === filterType);
    }

    // Filter by date range
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    filtered = filtered.filter(t => new Date(t.timestamp) >= cutoffDate);

    setFilteredTransactions(filtered);
  };

  const getTransactionIcon = (type: StockTransaction['transactionType']) => {
    switch (type) {
      case 'purchase': return <Package className="w-5 h-5 text-green-600" />;
      case 'sale': return <ShoppingCart className="w-5 h-5 text-blue-600" />;
      case 'adjustment': return <RefreshCw className="w-5 h-5 text-yellow-600" />;
      case 'return': return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'transfer': return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'damaged': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: StockTransaction['transactionType']) => {
    switch (type) {
      case 'purchase': return 'bg-green-100 text-green-800 border-green-300';
      case 'sale': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'adjustment': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'return': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'transfer': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'damaged': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const exportTransactions = () => {
    const csv = [
      ['Transaction ID', 'Date', 'Type', 'Product', 'SKU', 'Quantity', 'Previous Stock', 'New Stock', 'Location', 'Performed By'].join(','),
      ...filteredTransactions.map(t =>
        [
          t.id,
          new Date(t.timestamp).toLocaleString(),
          t.transactionType,
          t.productName,
          t.sku,
          t.quantity,
          t.previousStock,
          t.newStock,
          t.location,
          t.performedBy
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const calculateStockSummary = () => {
    const summary = {
      totalIn: 0,
      totalOut: 0,
      netChange: 0
    };

    filteredTransactions.forEach(t => {
      const change = t.newStock - t.previousStock;
      if (change > 0) {
        summary.totalIn += change;
      } else {
        summary.totalOut += Math.abs(change);
      }
    });

    summary.netChange = summary.totalIn - summary.totalOut;
    return summary;
  };

  const summary = calculateStockSummary();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Stock Transaction History</h2>
            {productName && <p className="text-sm text-gray-600 mt-1">{productName}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span className="text-sm text-gray-600">Stock In</span>
            </div>
            <p className="text-2xl font-bold text-green-600">+{summary.totalIn}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-6 h-6 text-red-600" />
              <span className="text-sm text-gray-600">Stock Out</span>
            </div>
            <p className="text-2xl font-bold text-red-600">-{summary.totalOut}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="w-6 h-6 text-indigo-600" />
              <span className="text-sm text-gray-600">Net Change</span>
            </div>
            <p className={`text-2xl font-bold ${summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.netChange >= 0 ? '+' : ''}{summary.netChange}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
                <option value="adjustment">Adjustment</option>
                <option value="return">Return</option>
                <option value="transfer">Transfer</option>
                <option value="damaged">Damaged</option>
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

            <button
              onClick={exportTransactions}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getTransactionIcon(transaction.transactionType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTransactionColor(transaction.transactionType)} capitalize`}>
                            {transaction.transactionType}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(transaction.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        {!productId && (
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {transaction.productName} <span className="text-gray-500 font-mono">({transaction.sku})</span>
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                          <div>
                            <span className="text-gray-600">Quantity:</span>
                            <span className={`ml-2 font-medium ${transaction.newStock > transaction.previousStock ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.newStock > transaction.previousStock ? '+' : '-'}{transaction.quantity} {transaction.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Previous:</span>
                            <span className="ml-2 font-medium text-gray-900">{transaction.previousStock}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">New:</span>
                            <span className="ml-2 font-medium text-gray-900">{transaction.newStock}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <span className="ml-2 font-medium text-gray-900">{transaction.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>By: {transaction.performedBy}</span>
                          {transaction.referenceId && (
                            <span>Ref: {transaction.referenceId}</span>
                          )}
                        </div>

                        {transaction.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">Note: {transaction.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-gray-500 font-mono">{transaction.id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stock Adjustment Component
interface StockAdjustmentFormProps {
  productId: string;
  productName: string;
  currentStock: number;
  unit: string;
  onClose: () => void;
  onSave: (adjustment: StockAdjustment) => void;
}

export function StockAdjustmentForm({ productId, productName, currentStock, unit, onClose, onSave }: StockAdjustmentFormProps) {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (adjustmentType === 'remove' && quantity > currentStock) {
      setError('Cannot remove more than current stock');
      return;
    }

    if (!reason) {
      setError('Please select a reason');
      return;
    }

    onSave({
      productId,
      adjustmentType,
      quantity,
      reason,
      notes: notes || undefined
    });
  };

  const newStock = adjustmentType === 'add' ? currentStock + quantity : currentStock - quantity;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Adjust Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Product</p>
            <p className="text-gray-900">{productName}</p>
            <p className="text-sm text-gray-500">Current Stock: {currentStock} {unit}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  adjustmentType === 'add'
                    ? 'bg-green-50 border-green-500 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('remove')}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  adjustmentType === 'remove'
                    ? 'bg-red-50 border-red-500 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Remove Stock
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              min="0"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select reason</option>
              <option value="physical-count">Physical Count Adjustment</option>
              <option value="damaged">Damaged Goods</option>
              <option value="expired">Expired Items</option>
              <option value="found">Stock Found</option>
              <option value="returned">Customer Return</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Additional notes..."
            />
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>New Stock Level:</strong> {newStock} {unit}
              <span className={`ml-2 ${adjustmentType === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                ({adjustmentType === 'add' ? '+' : '-'}{quantity})
              </span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Confirm Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}