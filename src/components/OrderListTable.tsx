import React from 'react';
import { Eye, ChevronRight } from 'lucide-react';
import { TableSkeleton } from './LoadingSpinner';

interface OrderListTableProps {
  orders: any[];
  onSelectOrder: (orderId: string) => void;
  getStatusConfig: (status: string) => any;
  loading?: boolean;
  error?: string | null;
}

export function OrderListTable({ orders, onSelectOrder, getStatusConfig, loading = false, error = null }: OrderListTableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-6">
        <TableSkeleton rows={5} columns={7} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm p-12 text-center">
        <p className="text-red-600 mb-2">{error}</p>
        <p className="text-gray-500 text-sm">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Buyer</th>
              <th className="px-6 py-4">Vendor</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onSelectOrder(order.id)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.buyer}</div>
                      <div className="text-xs text-gray-500">{order.buyerId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.vendor}</div>
                      <div className="text-xs text-gray-500">{order.vendorId}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{order.subtotal?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectOrder(order.id);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}