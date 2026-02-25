import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Calendar, User, Store, Package, DollarSign, CheckCircle, XCircle, AlertCircle, Eye, Printer, RefreshCw, ArrowRight, Trash2 } from 'lucide-react';
import * as challanService from '../services/challanService';
import * as orderService from '../services/orderService';
import * as offlineOrderService from '../services/offlineOrderService';
import * as buyerService from '../services/buyerService';
import * as manufacturingService from '../services/manufacturingService';
import { toast } from 'sonner@2.0.3';
import { printChallan } from './ChallanGenerator';
import { ChallanPrintModal } from './ChallanPrintModal';
import { LoadingSpinner, ButtonWithLoading, TableSkeleton, CardSkeleton } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields } from '../utils/security';
import { handleApiError } from '../utils/apiClient';

interface ChallanManagementProps {
  source?: 'admin' | 'shop';
}

export function ChallanManagement({ source = 'admin' }: ChallanManagementProps) {
  const [challans, setChallans] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [offlineRequests, setOfflineRequests] = useState<any[]>([]);
  const [manufacturingOrders, setManufacturingOrders] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedChallan, setSelectedChallan] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading challan data...');
      
      const [challanData, orderData, offlineData, buyerData, manufacturingData] = await Promise.all([
        challanService.getAllChallans(),
        orderService.getAllOrders(),
        offlineOrderService.getAllOfflineOrders(),
        buyerService.getAllBuyers(),
        manufacturingService.getAllOrders()
      ]);
      
      console.log('✅ Data loaded:', {
        challans: challanData.length,
        orders: orderData.length,
        offlineRequests: offlineData.length,
        buyers: buyerData.length,
        manufacturingOrders: manufacturingData.length
      });
      
      console.log('📋 Challans:', challanData);
      
      setChallans(challanData);
      setOrders(orderData);
      setOfflineRequests(offlineData);
      setBuyers(buyerData);
      setManufacturingOrders(manufacturingData);
    } catch (err) {
      console.error('❌ Failed to load data:', err);
      toast.error('Failed to load challans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        toast.error('Order not found');
        return;
      }

      const challan = await challanService.createChallanFromOrder(order);
      toast.success('Challan created successfully!');
      loadData();
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create challan');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromOfflineRequest = async (requestId: string) => {
    try {
      setLoading(true);
      console.log(`🔄 Creating challan from request: ${requestId}`);
      
      const request = offlineRequests.find(r => r.id === requestId);
      if (!request) {
        console.error(`❌ Request not found: ${requestId}`);
        toast.error('Request not found');
        return;
      }

      console.log('📋 Request data:', request);
      console.log('🔍 Approved items:', request.items?.filter((i: any) => i.status === 'customer_approved'));
      
      const challan = await challanService.createChallanFromOfflineRequest(request);
      
      console.log('✅ Challan created:', challan);
      
      toast.success(`Challan ${challan.challanNumber} created successfully!`);
      
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      console.error('❌ Failed to create challan:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create challan');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFromManufacturingOrder = async (orderId: string) => {
    try {
      setLoading(true);
      console.log(`🔄 Creating challan from manufacturing order: ${orderId}`);
      
      const order = manufacturingOrders.find(o => o.id === orderId);
      if (!order) {
        console.error(`❌ Manufacturing order not found: ${orderId}`);
        toast.error('Manufacturing order not found');
        return;
      }

      console.log('📋 Manufacturing order data:', order);
      
      const challan = await challanService.createChallanFromManufacturingOrder(order);
      console.log('✅ Challan created:', challan);
      
      toast.success(`Challan ${challan.challanNumber} created successfully!`);
      
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      console.error('❌ Failed to create challan:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create challan');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (challanId: string, paymentData: any) => {
    try {
      setActionLoading('recordPayment');
      const updatedChallan = await challanService.recordPayment(challanId, paymentData);
      
      console.log('✅ Payment recorded successfully:', updatedChallan);
      
      toast.success(`Payment of ₹${paymentData.amount.toLocaleString()} recorded successfully!`);
      
      // Update the local state immediately with the updated challan
      setChallans(prevChallans => 
        prevChallans.map(c => c.id === challanId ? updatedChallan : c)
      );
      
      setShowPaymentModal(false);
      setSelectedChallan(null);
      
      // Reload data to ensure sync
      await loadData();
    } catch (err) {
      console.error('❌ Failed to record payment:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConvertToInvoice = async (challanId: string) => {
    if (!confirm('Convert this challan to an invoice? This will create a sales order.')) return;

    try {
      setActionLoading('convertToInvoice');
      const invoice = await challanService.convertChallanToInvoice(challanId);
      toast.success('Challan converted to invoice successfully!');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to convert challan');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrint = (challan: any) => {
    printChallan(challan);
  };

  const handleDelete = async (challanId: string) => {
    if (!confirm('Are you sure you want to delete this challan? This action cannot be undone.')) return;

    try {
      setActionLoading('delete');
      await challanService.cancelChallan(challanId);
      toast.success('Challan deleted successfully!');
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete challan');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'partial': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'converted': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Payment';
      case 'partial': return 'Partially Paid';
      case 'paid': return 'Fully Paid';
      case 'converted': return 'Converted to Invoice';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredChallans = challans.filter(challan => {
    const matchesSearch = 
      challan.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challan.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || challan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Challan Management</h2>
          <p className="text-sm text-gray-600">Manage delivery challans and track payments</p>
        </div>
        <div className="flex gap-4 flex-1 w-full md:w-auto md:flex-initial">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search challans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Payment</option>
            <option value="partial">Partially Paid</option>
            <option value="paid">Fully Paid</option>
            <option value="converted">Converted</option>
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Challan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Challans</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{challans.length}</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending Payment</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">
                {challans.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Paid Challans</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                {challans.filter(c => c.status === 'paid').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹{challans.reduce((sum, c) => sum + (c.totalAmount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Challans Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Challan #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Paid</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredChallans.map((challan) => (
                <tr key={challan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-gray-900">{challan.challanNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(challan.challanDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{challan.customerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {challan.items?.length || 0} items
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ₹{(challan.totalAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-emerald-600">
                    ₹{(challan.paidAmount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(challan.status)}`}>
                      {getStatusLabel(challan.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrint(challan)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Print Challan"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {challan.status !== 'paid' && challan.status !== 'converted' && (
                        <button
                          onClick={() => {
                            setSelectedChallan(challan);
                            setShowPaymentModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="Record Payment"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      {challan.status === 'paid' && (
                        <button
                          onClick={() => handleConvertToInvoice(challan.id)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Convert to Invoice"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(challan.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete Challan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredChallans.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No challans found</h3>
            <p className="text-gray-500 mt-2">Create a new challan to get started.</p>
          </div>
        )}
      </div>

      {/* Create Challan Modal */}
      {showCreateModal && (
        <CreateChallanModal
          orders={orders}
          offlineRequests={offlineRequests}
          manufacturingOrders={manufacturingOrders}
          onCreateFromOrder={handleCreateFromOrder}
          onCreateFromOfflineRequest={handleCreateFromOfflineRequest}
          onCreateFromManufacturingOrder={handleCreateFromManufacturingOrder}
          onClose={() => setShowCreateModal(false)}
          loading={loading}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedChallan && (
        <PaymentModal
          challan={selectedChallan}
          onRecordPayment={(data) => handleRecordPayment(selectedChallan.id, data)}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedChallan(null);
          }}
          loading={actionLoading === 'recordPayment'}
        />
      )}
    </div>
  );
}

// Create Challan Modal Component
function CreateChallanModal({ orders, offlineRequests, manufacturingOrders, onCreateFromOrder, onCreateFromOfflineRequest, onCreateFromManufacturingOrder, onClose, loading }: any) {
  const [sourceType, setSourceType] = useState<'order' | 'offline' | 'manufacturing'>('order');
  const [selectedId, setSelectedId] = useState('');

  const availableOrders = orders.filter((o: any) => 
    !o.challanId && o.status !== 'cancelled'
  );

  // Filter offline orders that have at least one customer_approved item
  const availableRequests = offlineRequests.filter((r: any) => {
    if (r.challanId) return false;
    const hasApprovedItems = r.items?.some((item: any) => item.status === 'customer_approved');
    return hasApprovedItems;
  });

  // Filter manufacturing orders that are completed
  const availableManufacturingOrders = manufacturingOrders.filter((m: any) => 
    m.status === 'completed' && !m.challanId
  );

  const handleCreate = () => {
    if (!selectedId) {
      toast.error('Please select an order or request');
      return;
    }

    if (sourceType === 'order') {
      onCreateFromOrder(selectedId);
    } else if (sourceType === 'offline') {
      onCreateFromOfflineRequest(selectedId);
    } else {
      onCreateFromManufacturingOrder(selectedId);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Create New Challan
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="order"
                  checked={sourceType === 'order'}
                  onChange={(e) => {
                    setSourceType('order');
                    setSelectedId('');
                  }}
                  className="w-4 h-4 text-amber-600"
                />
                <span className="text-sm text-gray-700">From Online Order</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="offline"
                  checked={sourceType === 'offline'}
                  onChange={(e) => {
                    setSourceType('offline');
                    setSelectedId('');
                  }}
                  className="w-4 h-4 text-amber-600"
                />
                <span className="text-sm text-gray-700">From Offline Order</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="manufacturing"
                  checked={sourceType === 'manufacturing'}
                  onChange={(e) => {
                    setSourceType('manufacturing');
                    setSelectedId('');
                  }}
                  className="w-4 h-4 text-purple-600"
                />
                <span className="text-sm text-gray-700">From Manufacturing Order</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {sourceType === 'order' ? 'Order' : sourceType === 'offline' ? 'Offline Order' : 'Manufacturing Order'}
              {sourceType === 'offline' && (
                <span className="text-xs text-gray-500 ml-2">
                  ({availableRequests.length} available with approved items)
                </span>
              )}
              {sourceType === 'manufacturing' && (
                <span className="text-xs text-gray-500 ml-2">
                  ({availableManufacturingOrders.length} completed orders)
                </span>
              )}
            </label>
            {sourceType === 'order' ? (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Select Order --</option>
                {availableOrders.map((order: any) => (
                  <option key={order.id} value={order.id}>
                    {order.id} - {order.buyer} - ₹{order.subtotal?.toLocaleString()}
                  </option>
                ))}
              </select>
            ) : sourceType === 'offline' ? (
              <>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Select Request --</option>
                  {availableRequests.map((request: any) => {
                    const approvedCount = request.items?.filter((i: any) => i.status === 'customer_approved').length || 0;
                    return (
                      <option key={request.id} value={request.id}>
                        {request.id} - {request.customerName} - {approvedCount} approved items
                      </option>
                    );
                  })}
                </select>
                {availableRequests.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ No offline orders with "Customer Approved" items found. 
                    Please approve items in the Offline Order Manager first.
                  </p>
                )}
              </>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Select Manufacturing Order --</option>
                {availableManufacturingOrders.map((order: any) => (
                  <option key={order.id} value={order.id}>
                    {order.id} - {order.customerName} - ₹{order.totalAmount?.toLocaleString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="text-sm font-semibold text-amber-900 mb-2">What is a Challan?</h4>
            <p className="text-xs text-amber-800">
              A challan is a delivery document sent with goods for approval or on consignment. 
              The customer can review the products and decide whether to purchase. Payment is 
              recorded when the customer confirms and pays for the items.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !selectedId}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Create Challan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment Modal Component
function PaymentModal({ challan, onRecordPayment, onClose, loading }: any) {
  const [paymentData, setPaymentData] = useState({
    amount: challan.totalAmount - (challan.paidAmount || 0),
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    paymentNotes: ''
  });

  const remainingAmount = challan.totalAmount - (challan.paidAmount || 0);

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Record Payment
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Challan: <span className="font-medium text-gray-900">{challan.challanNumber}</span></p>
            <p className="text-sm text-gray-600">Customer: <span className="font-medium text-gray-900">{challan.customerName}</span></p>
            <p className="text-sm text-gray-600">Total Amount: <span className="font-medium text-gray-900">₹{challan.totalAmount.toLocaleString()}</span></p>
            <p className="text-sm text-gray-600">Already Paid: <span className="font-medium text-emerald-600">₹{(challan.paidAmount || 0).toLocaleString()}</span></p>
            <p className="text-sm text-gray-600">Remaining: <span className="font-medium text-amber-600">₹{remainingAmount.toLocaleString()}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
            <input
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
              max={remainingAmount}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
            <input
              type="date"
              value={paymentData.paymentDate}
              onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Notes (Optional)</label>
            <textarea
              value={paymentData.paymentNotes}
              onChange={(e) => setPaymentData({ ...paymentData, paymentNotes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none"
              placeholder="Transaction ID, cheque number, etc."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onRecordPayment(paymentData)}
            disabled={loading || paymentData.amount <= 0}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Record Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}