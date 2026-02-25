import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Filter, Download, Plus, AlertCircle } from 'lucide-react';
import * as inventoryService from '../services/inventoryService';
import { LoadingSpinner, ButtonWithLoading, TableSkeleton, CardSkeleton } from './LoadingSpinner';
import { sanitizeString } from '../utils/security';
import { handleApiError } from '../utils/apiClient';
import { toast } from 'sonner@2.0.3';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: 'ready-made' | 'fabric';
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  vendorId?: string;
  vendorName?: string;
  location: string;
  lastUpdated: string;
  avgMonthlySales: number;
  reorderPoint: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
}

interface StockSummary {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockedItems: number;
}

interface InventoryDashboardProps {
  onAddInventory: () => void;
  onEditInventory: (item: InventoryItem) => void;
  onViewHistory: (productId: string) => void;
}

export function InventoryDashboard({ onAddInventory, onEditInventory, onViewHistory }: InventoryDashboardProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<StockSummary>({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    overstockedItems: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [inventory, searchTerm, statusFilter, categoryFilter]);

  const loadInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Sync inventory from products first
      await inventoryService.syncInventoryFromProducts();
      
      // Load from database
      const data = inventoryService.getAllInventory();
      setInventory(data);
      calculateSummary(data);
    } catch (err) {
      console.error('Error loading inventory:', err);
      const message = handleApiError(err);
      setError(message);
      toast.error(`Failed to load inventory: ${message}`);
      setInventory([]);
      calculateSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: InventoryItem[]) => {
    const summary: StockSummary = {
      totalProducts: data.length,
      totalValue: data.reduce((sum, item) => sum + item.currentStock, 0),
      lowStockItems: data.filter(item => item.status === 'low-stock').length,
      outOfStockItems: data.filter(item => item.status === 'out-of-stock').length,
      overstockedItems: data.filter(item => item.status === 'overstocked').length
    };
    setSummary(summary);
  };

  const filterInventory = () => {
    let filtered = [...inventory];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredInventory(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800 border-green-300';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'out-of-stock': return 'bg-red-100 text-red-800 border-red-300';
      case 'overstocked': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const exportInventory = () => {
    const csv = [
      ['SKU', 'Product Name', 'Category', 'Current Stock', 'Unit', 'Status', 'Location', 'Vendor'].join(','),
      ...filteredInventory.map(item =>
        [item.sku, item.productName, item.category, item.currentStock, item.unit, item.status, item.location, item.vendorName || 'N/A'].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
          <TableSkeleton rows={8} columns={7} />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl border border-gray-200 max-w-md">
          <AlertCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Inventory</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => loadInventory()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Track and manage your product inventory across all warehouses</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalProducts}</p>
            <p className="text-sm text-gray-600">Total Products</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.totalValue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Units</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{summary.lowStockItems}</p>
            <p className="text-sm text-gray-600">Low Stock Items</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{summary.outOfStockItems}</p>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{summary.overstockedItems}</p>
            <p className="text-sm text-gray-600">Overstocked</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="overstocked">Overstocked</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="ready-made">Ready Made</option>
                <option value="fabric">Fabric</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportInventory}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={onAddInventory}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Inventory
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">SKU</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Current Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Min/Max</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Vendor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{item.sku}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-sm text-gray-500">{item.productId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.currentStock} {item.unit}</div>
                      <div className="text-xs text-gray-500">Avg: {item.avgMonthlySales}/mo</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.minStock} / {item.maxStock}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)} capitalize`}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.vendorName || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditInventory(item)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onViewHistory(item.productId)}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">No inventory items found</p>
              <p className="text-sm text-gray-500">Add products in Product Management to see them here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}