import React, { useState } from 'react';
import { Package, Truck, MapPin, Phone, User, Calendar, Check, X, ArrowRight, Building2, Store, ShoppingBag, Clock, CheckCircle, AlertCircle, FileText, Car, Download, Eye, Scissors, Factory } from 'lucide-react';
import { PurchaseOrderTracking } from './PurchaseOrderTracking';
import { VendorDispatchTracking } from './VendorDispatchTracking';
import { ButtonWithLoading } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields } from '../utils/security';
import { toast } from 'sonner';

interface OrderFlowProps {
  order: any;
  onApprove?: (orderId: string) => void;
  onForwardToVendor?: (orderId: string, poDetails: any) => void;
  onReceiveAtWarehouse?: (orderId: string, details: any) => void;
  onDispatchToBuyer?: (orderId: string, details: any) => void;
  userRole: 'admin' | 'vendor' | 'buyer';
}

export function OrderFlow({ order, onApprove, onForwardToVendor, onReceiveAtWarehouse, onDispatchToBuyer, userRole }: OrderFlowProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [forwardForm, setForwardForm] = useState({
    poNumber: '',
    vendorId: order?.vendorId || '',
    expectedDeliveryDate: '',
    deliveryMethod: 'courier',
    courierService: '',
    notes: ''
  });

  const [receiveForm, setReceiveForm] = useState({
    receivedDate: '',
    receivedBy: '',
    condition: 'good',
    notes: ''
  });

  const [dispatchForm, setDispatchForm] = useState({
    deliveryMethod: 'courier',
    courierService: '',
    trackingId: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    estimatedDelivery: '',
    notes: ''
  });

  // Order status configuration with new flow
  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      'pending-approval': { 
        bg: 'bg-amber-50', 
        text: 'text-amber-700', 
        border: 'border-amber-200', 
        label: 'Pending Admin Approval',
        icon: Clock
      },
      'approved': { 
        bg: 'bg-blue-50', 
        text: 'text-blue-700', 
        border: 'border-blue-200', 
        label: 'Approved - Creating PO',
        icon: CheckCircle
      },
      'forwarded-to-vendor': { 
        bg: 'bg-indigo-50', 
        text: 'text-indigo-700', 
        border: 'border-indigo-200', 
        label: 'Sent for Production',
        icon: FileText
      },
      'vendor-processing': { 
        bg: 'bg-purple-50', 
        text: 'text-purple-700', 
        border: 'border-purple-200', 
        label: 'With Stitching Master',
        icon: Package
      },
      'vendor-dispatched': { 
        bg: 'bg-violet-50', 
        text: 'text-violet-700', 
        border: 'border-violet-200', 
        label: 'Dispatched to Hub',
        icon: Truck
      },
      'in-transit-to-warehouse': { 
        bg: 'bg-cyan-50', 
        text: 'text-cyan-700', 
        border: 'border-cyan-200', 
        label: 'In Transit to Hub',
        icon: Truck
      },
      'received-at-warehouse': { 
        bg: 'bg-teal-50', 
        text: 'text-teal-700', 
        border: 'border-teal-200', 
        label: 'Received at Tashivar (QC)',
        icon: Building2
      },
      'dispatched-to-buyer': { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200', 
        label: 'Dispatched to Buyer',
        icon: Truck
      },
      'in-transit-to-buyer': { 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        border: 'border-green-200', 
        label: 'In Transit to Buyer',
        icon: Truck
      },
      'delivered': { 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200', 
        label: 'Delivered',
        icon: CheckCircle
      },
      'cancelled': { 
        bg: 'bg-rose-50', 
        text: 'text-rose-700', 
        border: 'border-rose-200', 
        label: 'Cancelled',
        icon: X
      }
    };
    return configs[status] || configs['pending-approval'];
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  // Timeline steps
  const timelineSteps = [
    { id: 'pending-approval', label: 'Order Placed', completed: true },
    { id: 'approved', label: 'Admin Approved', completed: ['approved', 'forwarded-to-vendor', 'vendor-processing', 'vendor-dispatched', 'in-transit-to-warehouse', 'received-at-warehouse', 'dispatched-to-buyer', 'in-transit-to-buyer', 'delivered'].includes(order.status) },
    { id: 'forwarded-to-vendor', label: 'PO to Vendor', completed: ['forwarded-to-vendor', 'vendor-processing', 'vendor-dispatched', 'in-transit-to-warehouse', 'received-at-warehouse', 'dispatched-to-buyer', 'in-transit-to-buyer', 'delivered'].includes(order.status) },
    { id: 'vendor-dispatched', label: 'Vendor Shipped', completed: ['vendor-dispatched', 'in-transit-to-warehouse', 'received-at-warehouse', 'dispatched-to-buyer', 'in-transit-to-buyer', 'delivered'].includes(order.status) },
    { id: 'received-at-warehouse', label: 'Received', completed: ['received-at-warehouse', 'dispatched-to-buyer', 'in-transit-to-buyer', 'delivered'].includes(order.status) },
    { id: 'dispatched-to-buyer', label: 'Shipped to Buyer', completed: ['dispatched-to-buyer', 'in-transit-to-buyer', 'delivered'].includes(order.status) },
    { id: 'delivered', label: 'Delivered', completed: order.status === 'delivered' }
  ];

  const handleApprove = () => {
    if (onApprove) {
      onApprove(order.id);
    }
    setShowApproveModal(false);
  };

  const handleForwardToVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (onForwardToVendor) {
      onForwardToVendor(order.id, forwardForm);
    }
    setShowForwardModal(false);
  };

  const handleReceiveAtWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (onReceiveAtWarehouse) {
      onReceiveAtWarehouse(order.id, receiveForm);
    }
    setShowReceiveModal(false);
  };

  const handleDispatchToBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (onDispatchToBuyer) {
      onDispatchToBuyer(order.id, dispatchForm);
    }
    setShowDispatchModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className={`${statusConfig.bg} ${statusConfig.border} border-2 rounded-xl p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${statusConfig.bg} border-2 ${statusConfig.border} rounded-xl flex items-center justify-center`}>
              <StatusIcon className={`w-7 h-7 ${statusConfig.text}`} strokeWidth={2} />
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${statusConfig.text}`}>{statusConfig.label}</h3>
              <p className="text-sm text-gray-600 mt-1">Order {order.id}</p>
            </div>
          </div>

          {/* Action Buttons based on status and role */}
          <div className="flex items-center gap-3">
            {userRole === 'admin' && order.status === 'pending-approval' && (
              <button
                onClick={() => setShowApproveModal(true)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" strokeWidth={2} />
                Approve Order
              </button>
            )}

            {userRole === 'admin' && order.status === 'approved' && (
              <button
                onClick={() => setShowForwardModal(true)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
                Forward to Vendor
              </button>
            )}

            {userRole === 'admin' && order.status === 'in-transit-to-warehouse' && (
              <button
                onClick={() => setShowReceiveModal(true)}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" strokeWidth={2} />
                Mark as Received
              </button>
            )}

            {userRole === 'admin' && order.status === 'received-at-warehouse' && (
              <button
                onClick={() => setShowDispatchModal(true)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
              >
                <Truck className="w-4 h-4" strokeWidth={2} />
                Dispatch to Buyer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Production Journey - Visualizing the complex flow */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-8 flex items-center gap-2">
          <Factory className="w-5 h-5 text-indigo-600" />
          Production & Fulfillment Journey
        </h4>
        
        <div className="relative flex items-center justify-between px-4">
          {/* Connector Line */}
          <div className="absolute left-10 right-10 top-5 h-1 bg-gray-100 -z-10">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
              style={{ 
                width: ['pending-approval', 'placed'].includes(order.status) ? '0%' :
                       ['approved'].includes(order.status) ? '25%' :
                       ['forwarded-to-vendor'].includes(order.status) ? '50%' :
                       ['vendor-processing'].includes(order.status) ? '65%' :
                       ['received-at-warehouse'].includes(order.status) ? '85%' :
                       '100%'
              }}
            />
          </div>

          {/* Step 1: Fabric Vendor */}
          <div className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${
              ['approved', 'forwarded-to-vendor', 'vendor-processing', 'received-at-warehouse', 'dispatched-to-buyer', 'delivered'].includes(order.status) 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-gray-200 text-gray-400'
            }`}>
              <Store className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-900">Fabric Vendor</p>
              <p className="text-[10px] text-gray-500">Source</p>
            </div>
          </div>

          {/* Step 2: Tashivar Hub (Inbound) */}
          <div className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${
              ['forwarded-to-vendor', 'vendor-processing', 'received-at-warehouse', 'dispatched-to-buyer', 'delivered'].includes(order.status)
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-gray-200 text-gray-400'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-900">Tashivar</p>
              <p className="text-[10px] text-gray-500">Material Hub</p>
            </div>
          </div>

          {/* Step 3: Stitching Master */}
          <div className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${
              ['vendor-processing', 'received-at-warehouse', 'dispatched-to-buyer', 'delivered'].includes(order.status)
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-gray-200 text-gray-400'
            }`}>
              <Scissors className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-900">Stitching Master</p>
              <p className="text-[10px] text-gray-500">Manufacturing</p>
            </div>
          </div>

          {/* Step 4: Tashivar Hub (Outbound) */}
          <div className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${
              ['received-at-warehouse', 'dispatched-to-buyer', 'delivered'].includes(order.status)
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-gray-200 text-gray-400'
            }`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-900">Tashivar</p>
              <p className="text-[10px] text-gray-500">Quality Check</p>
            </div>
          </div>

          {/* Step 5: Customer */}
          <div className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${
              ['dispatched-to-buyer', 'delivered'].includes(order.status)
                ? 'border-emerald-600 text-emerald-600' 
                : 'border-gray-200 text-gray-400'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-900">Customer</p>
              <p className="text-[10px] text-gray-500">Final Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-900 mb-6">Order Timeline</h4>
        <div className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>
          <div className="space-y-6">
            {timelineSteps.map((step, index) => (
              <div key={step.id} className="relative flex items-start gap-4">
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step.completed 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : 'bg-white border-gray-300'
                }`}>
                  {step.completed ? (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  ) : (
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                  {step.completed && order[`${step.id}Date`] && (
                    <p className="text-xs text-gray-500 mt-0.5">{order[`${step.id}Date`]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Order Tracking (Vendor → Warehouse) */}
      {order.purchaseOrderTracking && (
        <PurchaseOrderTracking order={order} />
      )}

      {/* Vendor Dispatch Tracking (Multi-party) - Show for orders with custom PO or vendor dispatches */}
      {(order.customPO || order.vendorDispatches) && (
        <VendorDispatchTracking 
          order={order}
          onVendorAccept={(orderId) => {
            // Handle vendor accept
            console.log('Vendor accepted:', orderId);
          }}
          onVendorDispatch={(orderId, dispatchData) => {
            // Handle vendor dispatch
            console.log('Vendor dispatched:', orderId, dispatchData);
          }}
          onAdminReceive={(orderId, receiveData) => {
            // Handle admin receive
            console.log('Admin received:', orderId, receiveData);
          }}
          userRole={userRole}
        />
      )}

      {/* Sales Order Tracking (Warehouse → Buyer) */}
      {order.salesOrderTracking && (
        <div className="bg-white border border-emerald-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-emerald-600" strokeWidth={2} />
            </div>
            <h4 className="font-semibold text-gray-900">Sales Order - Warehouse to Buyer</h4>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Buyer</p>
                <p className="text-sm font-medium text-gray-900">{order.buyer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Delivery Address</p>
                <p className="text-sm font-medium text-gray-900">{order.buyerAddress}</p>
              </div>
              {order.salesOrderTracking.deliveryMethod === 'courier' ? (
                <div>
                  <p className="text-xs text-gray-500">Courier Service</p>
                  <p className="text-sm font-medium text-gray-900">{order.salesOrderTracking.courierService}</p>
                  {order.salesOrderTracking.trackingId && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      Tracking: {order.salesOrderTracking.trackingId}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-500">Vehicle Details</p>
                  <p className="text-sm font-medium text-gray-900">{order.salesOrderTracking.vehicleNumber}</p>
                  <p className="text-xs text-gray-600">{order.salesOrderTracking.driverName} • {order.salesOrderTracking.driverPhone}</p>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Dispatch Date</p>
                <p className="text-sm font-medium text-gray-900">{order.salesOrderTracking.dispatchDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expected Delivery</p>
                <p className="text-sm font-medium text-gray-900">{order.salesOrderTracking.expectedDelivery}</p>
              </div>
              {order.salesOrderTracking.deliveredDate && (
                <div>
                  <p className="text-xs text-gray-500">Delivered Date</p>
                  <p className="text-sm font-medium text-emerald-600">{order.salesOrderTracking.deliveredDate}</p>
                </div>
              )}
            </div>
          </div>

          {order.salesOrderTracking.trackingUpdates && order.salesOrderTracking.trackingUpdates.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-900 mb-3">Tracking Updates</p>
              <div className="space-y-3">
                {order.salesOrderTracking.trackingUpdates.map((update: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{update.status}</p>
                      <p className="text-xs text-gray-600">{update.time} • {update.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Buyer Information</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Store className="w-4 h-4 text-gray-400 mt-1" strokeWidth={2} />
              <div>
                <p className="text-sm font-medium text-gray-900">{order.buyer}</p>
                <p className="text-xs text-gray-500">{order.buyerId}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-400 mt-1" strokeWidth={2} />
              <p className="text-sm text-gray-600">{order.buyerPhone}</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-1" strokeWidth={2} />
              <p className="text-sm text-gray-600">{order.buyerAddress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Vendor Information</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Store className="w-4 h-4 text-gray-400 mt-1" strokeWidth={2} />
              <div>
                <p className="text-sm font-medium text-gray-900">{order.vendor}</p>
                <p className="text-xs text-gray-500">{order.vendorId}</p>
              </div>
            </div>
            {order.vendorPhone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-1" strokeWidth={2} />
                <p className="text-sm text-gray-600">{order.vendorPhone}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      
      {/* Approve Order Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Order</h3>
            <p className="text-sm text-gray-600 mb-6">
              Approving this order will create a purchase order to be forwarded to the vendor.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
              >
                Approve Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward to Vendor Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Forward to Vendor - Create Purchase Order</h3>
                <button onClick={() => setShowForwardModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <form onSubmit={handleForwardToVendor} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">PO Number</label>
                <input
                  value={forwardForm.poNumber}
                  onChange={(e) => setForwardForm({...forwardForm, poNumber: e.target.value})}
                  placeholder="PO-2025-001"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Vendor</label>
                <input
                  value={order.vendor}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Expected Delivery to Warehouse</label>
                <input
                  type="date"
                  value={forwardForm.expectedDeliveryDate}
                  onChange={(e) => setForwardForm({...forwardForm, expectedDeliveryDate: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Preferred Delivery Method</label>
                <select
                  value={forwardForm.deliveryMethod}
                  onChange={(e) => setForwardForm({...forwardForm, deliveryMethod: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="courier">Courier Service</option>
                  <option value="transport">Transport/Vehicle</option>
                </select>
              </div>

              {forwardForm.deliveryMethod === 'courier' && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Preferred Courier Service (Optional)</label>
                  <input
                    value={forwardForm.courierService}
                    onChange={(e) => setForwardForm({...forwardForm, courierService: e.target.value})}
                    placeholder="Delhivery, BlueDart, etc."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes for Vendor</label>
                <textarea
                  value={forwardForm.notes}
                  onChange={(e) => setForwardForm({...forwardForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Any special instructions..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForwardModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  Send to Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive at Warehouse Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Mark as Received at Warehouse</h3>
                <button onClick={() => setShowReceiveModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <form onSubmit={handleReceiveAtWarehouse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Received Date</label>
                <input
                  type="date"
                  value={receiveForm.receivedDate}
                  onChange={(e) => setReceiveForm({...receiveForm, receivedDate: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Received By</label>
                <input
                  value={receiveForm.receivedBy}
                  onChange={(e) => setReceiveForm({...receiveForm, receivedBy: e.target.value})}
                  placeholder="Name of person"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Condition</label>
                <select
                  value={receiveForm.condition}
                  onChange={(e) => setReceiveForm({...receiveForm, condition: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="good">Good Condition</option>
                  <option value="damaged">Damaged</option>
                  <option value="partial">Partial Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
                <textarea
                  value={receiveForm.notes}
                  onChange={(e) => setReceiveForm({...receiveForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Any observations..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReceiveModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                >
                  Confirm Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch to Buyer Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Dispatch to Buyer</h3>
                <button onClick={() => setShowDispatchModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <form onSubmit={handleDispatchToBuyer} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Delivery Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDispatchForm({...dispatchForm, deliveryMethod: 'courier'})}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg ${
                      dispatchForm.deliveryMethod === 'courier'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span className="font-medium">Courier Service</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispatchForm({...dispatchForm, deliveryMethod: 'local'})}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg ${
                      dispatchForm.deliveryMethod === 'local'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Car className="w-5 h-5" />
                    <span className="font-medium">Local Delivery</span>
                  </button>
                </div>
              </div>

              {dispatchForm.deliveryMethod === 'courier' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Courier Service</label>
                    <select
                      value={dispatchForm.courierService}
                      onChange={(e) => setDispatchForm({...dispatchForm, courierService: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select courier</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="BlueDart">BlueDart</option>
                      <option value="DTDC">DTDC</option>
                      <option value="Ecom Express">Ecom Express</option>
                      <option value="Shiprocket">Shiprocket</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Tracking ID</label>
                    <input
                      value={dispatchForm.trackingId}
                      onChange={(e) => setDispatchForm({...dispatchForm, trackingId: e.target.value})}
                      placeholder="Enter tracking ID"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Vehicle Number</label>
                      <input
                        value={dispatchForm.vehicleNumber}
                        onChange={(e) => setDispatchForm({...dispatchForm, vehicleNumber: e.target.value})}
                        placeholder="MH02 AB 1234"
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Driver Name</label>
                      <input
                        value={dispatchForm.driverName}
                        onChange={(e) => setDispatchForm({...dispatchForm, driverName: e.target.value})}
                        placeholder="Driver name"
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Driver Phone</label>
                    <input
                      value={dispatchForm.driverPhone}
                      onChange={(e) => setDispatchForm({...dispatchForm, driverPhone: e.target.value})}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Expected Delivery Date</label>
                <input
                  type="date"
                  value={dispatchForm.estimatedDelivery}
                  onChange={(e) => setDispatchForm({...dispatchForm, estimatedDelivery: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Delivery Notes</label>
                <textarea
                  value={dispatchForm.notes}
                  onChange={(e) => setDispatchForm({...dispatchForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Any special delivery instructions..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                >
                  Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}