import React, { useState } from 'react';
import { X, Calendar, DollarSign, Package, User, CreditCard, FileText, Check, Edit2 } from 'lucide-react';

interface PurchaseDetailModalProps {
  purchase: any;
  onClose: () => void;
  onUpdate?: (id: string, updates: any) => Promise<void>;
}

export function PurchaseDetailModal({ purchase, onClose, onUpdate }: PurchaseDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    paymentStatus: purchase?.paymentStatus || 'pending',
    paymentMethod: purchase?.paymentMethod || 'Bank Transfer',
    status: purchase?.status || 'pending'
  });

  if (!purchase) return null;

  const handleSave = async () => {
    if (!onUpdate) return;
    try {
      setLoading(true);
      await onUpdate(purchase.id, editForm);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update purchase:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Purchase Details</h3>
            <p className="text-sm text-gray-500">ID: {purchase.id}</p>
          </div>
          <div className="flex gap-2">
            {onUpdate && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-indigo-600 hover:text-indigo-700 transition-colors"
                title="Edit Status"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Info */}
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
               <Package className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{purchase.product}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <span className="capitalize">{purchase.productType || 'Product'}</span>
                <span>•</span>
                <span>{new Date(purchase.date).toLocaleDateString()}</span>
              </div>
              
              {isEditing ? (
                 <div className="mt-2 space-y-2">
                   <select
                     value={editForm.paymentStatus}
                     onChange={(e) => setEditForm({...editForm, paymentStatus: e.target.value})}
                     className="block w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                   >
                     <option value="paid">Paid</option>
                     <option value="pending">Pending</option>
                     <option value="overdue">Overdue</option>
                   </select>
                 </div>
              ) : (
                <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  (purchase.paymentStatus || purchase.status) === 'paid' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    (purchase.paymentStatus || purchase.status) === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></span>
                  {purchase.paymentStatus || purchase.status || 'Pending'}
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Vendor</p>
              <div className="flex items-center gap-2 font-medium text-gray-900">
                <User className="w-4 h-4 text-indigo-500" />
                {purchase.vendor}
              </div>
            </div>
             <div>
              <p className="text-xs text-gray-500 mb-1">Payment Method</p>
              <div className="flex items-center gap-2 font-medium text-gray-900">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                {isEditing ? (
                  <select
                     value={editForm.paymentMethod}
                     onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
                     className="text-sm border-none bg-transparent p-0 focus:ring-0"
                   >
                     <option value="Bank Transfer">Bank Transfer</option>
                     <option value="UPI">UPI</option>
                     <option value="Cash">Cash</option>
                     <option value="Cheque">Cheque</option>
                   </select>
                ) : (
                  purchase.paymentMethod
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Quantity</p>
              <div className="flex items-center gap-2 font-medium text-gray-900">
                <Package className="w-4 h-4 text-indigo-500" />
                {purchase.quantity} Units
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Amount</p>
              <div className="flex items-center gap-2 font-medium text-gray-900">
                <DollarSign className="w-4 h-4 text-indigo-500" />
                ₹{(purchase.amount || purchase.totalCost || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Additional Info if needed */}
          {(purchase.costPrice) && (
             <div className="text-sm text-gray-600 border-t border-gray-100 pt-4">
               <div className="flex justify-between mb-1">
                 <span>Unit Cost:</span>
                 <span className="font-medium">₹{purchase.costPrice}</span>
               </div>
               <div className="flex justify-between">
                 <span>Subtotal:</span>
                 <span className="font-medium">₹{(purchase.quantity * purchase.costPrice).toLocaleString()}</span>
               </div>
             </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}