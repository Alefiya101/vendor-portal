import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Calendar, DollarSign, CheckCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react';
import * as productService from '../services/productService';
import { LoadingSpinner, ButtonWithLoading, TableSkeleton } from './LoadingSpinner';
import { toast } from 'sonner@2.0.3';
import { sanitizeString } from '../utils/security';
import { handleApiError } from '../utils/apiClient';

interface PurchaseOrderListProps {
  purchases?: any[];
  onAddPurchase?: () => void;
  onViewPurchase?: (purchase: any) => void;
  onEditPurchase?: (purchase: any) => void;
  onDeletePurchase?: (purchase: any) => void;
  loading?: boolean;
}

export function PurchaseOrderList({ purchases: propPurchases, onAddPurchase, onViewPurchase, onEditPurchase, onDeletePurchase, loading: propLoading }: PurchaseOrderListProps) {
  const [localPurchases, setLocalPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Update local state when props change
  useEffect(() => {
    if (propPurchases) {
      setLocalPurchases(propPurchases);
      setLoading(propLoading || false);
    }
  }, [propPurchases, propLoading]);

  // If no purchases prop is passed, we attempt to load (fallback)
  useEffect(() => {
    if (!propPurchases && loading) {
      loadPurchases();
    }
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await productService.getAllProducts();
      // Filter products that represent a purchase (have cost price and quantity)
      const purchaseList = products.filter(p => p.costPrice && p.quantity).map(p => ({
        id: p.id,
        date: p.createdAt || new Date().toISOString(),
        vendor: p.vendor,
        product: p.name,
        quantity: p.quantity,
        amount: (p.quantity || 0) * (p.costPrice || 0),
        status: p.paymentStatus || 'paid',
        paymentMethod: p.paymentMethod || 'Bank Transfer'
      }));
      // Sort by date desc
      purchaseList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setLocalPurchases(purchaseList);
    } catch (err) {
      console.error('Failed to load purchases:', err);
      const message = handleApiError(err);
      setError(message);
      toast.error(`Failed to load purchases: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (po: any) => {
    if (!confirm(`Are you sure you want to delete purchase order ${po.id}?`)) {
      return;
    }

    try {
      setActionLoading(po.id);
      if (onDeletePurchase) {
        await onDeletePurchase(po);
        toast.success(`Purchase order ${po.id} deleted successfully`);
      }
    } catch (err) {
      const message = handleApiError(err);
      toast.error(`Failed to delete: ${message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (po: any) => {
    if (onEditPurchase) {
      onEditPurchase(po);
    }
  };

  const handleView = (po: any) => {
    if (onViewPurchase) {
      onViewPurchase(po);
    }
  };

  const filteredPurchases = localPurchases.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.vendor && p.vendor.toLowerCase().includes(query)) ||
      (p.product && p.product.toLowerCase().includes(query)) ||
      (p.id && p.id.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search purchase orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
             <Filter className="w-4 h-4" />
             Filter
           </button>
           <button className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100">
             <Download className="w-4 h-4" />
             Export
           </button>
           {onAddPurchase && (
             <button 
               onClick={onAddPurchase}
               className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 ml-2"
             >
               <Plus className="w-4 h-4" />
               Create Purchase Order
             </button>
           )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">PO ID / Date</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr>
                   <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                     <div className="flex justify-center items-center gap-2">
                       <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                       Loading purchase orders...
                     </div>
                   </td>
                 </tr>
              ) : filteredPurchases.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                     No purchase orders found.
                   </td>
                 </tr>
              ) : (
                filteredPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{po.id}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(po.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{po.vendor}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{po.product}</td>
                    <td className="px-4 py-3 text-right font-medium">{po.quantity}</td>
                    <td className="px-4 py-3 text-right font-medium text-indigo-600">
                      ₹{(po.amount || po.totalCost || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (po.status || po.paymentStatus) === 'paid' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {(po.status || po.paymentStatus) === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span className="capitalize">{po.status || po.paymentStatus || 'Pending'}</span>
                      </span>
                      <p className="text-xs text-gray-500 mt-1 pl-1">{po.paymentMethod}</p>
                    </td>
                    <td className="px-4 py-3 flex gap-1 justify-end">
                      <button 
                        onClick={() => handleView(po)}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {onEditPurchase && (
                        <button 
                          onClick={() => handleEdit(po)}
                          className="p-1.5 hover:bg-blue-50 rounded text-blue-600 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onDeletePurchase && (
                        <button 
                          onClick={() => handleDelete(po)}
                          className="p-1.5 hover:bg-rose-50 rounded text-rose-600 hover:text-rose-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}