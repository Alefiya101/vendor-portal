import React, { useState } from 'react';
import { FileText, Layers, Shirt, Users, Truck, Package, CheckCircle, Clock, MapPin, Phone, User, Calendar, Eye } from 'lucide-react';
import { PurchaseBillModal } from './PurchaseBillModal';

interface PurchaseOrderTrackingProps {
  order: any;
}

export function PurchaseOrderTracking({ order }: PurchaseOrderTrackingProps) {
  const [showBill, setShowBill] = useState(false);
  const [selectedBillType, setSelectedBillType] = useState<'fabric' | 'manufacturing'>('fabric');

  const hasFabricItems = order.products?.some((p: any) => p.type === 'fabric');
  const hasReadymadeItems = order.products?.some((p: any) => p.type === 'readymade');

  const fabricItems = order.products?.filter((p: any) => p.type === 'fabric') || [];
  const readymadeItems = order.products?.filter((p: any) => p.type === 'readymade') || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={2} />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" strokeWidth={2} />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" strokeWidth={2} />;
    }
  };

  const renderFabricPO = () => {
    if (!hasFabricItems) return null;

    const fabricPO = order.purchaseOrderTracking?.fabricPO || {};

    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Fabric Purchase Order</h4>
              <p className="text-sm text-gray-600">Single-party vendor order</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedBillType('fabric');
              setShowBill(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <FileText className="w-4 h-4" strokeWidth={2} />
            View Bill
          </button>
        </div>

        {/* PO Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-600 mb-1">PO Number</p>
            <p className="font-medium text-gray-900">{fabricPO.poNumber || 'Not assigned'}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-600 mb-1">Fabric Vendor</p>
            <p className="font-medium text-gray-900">{order.vendor}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-600 mb-1">Total Fabric Value</p>
            <p className="font-medium text-blue-600">
              ₹{fabricItems.reduce((sum: number, item: any) => sum + (item.costPrice * item.quantity), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-600 mb-1">Expected Delivery</p>
            <p className="font-medium text-gray-900">{fabricPO.expectedDelivery || 'TBD'}</p>
          </div>
        </div>

        {/* Fabric Items */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Fabric Items</h5>
          <div className="space-y-2">
            {fabricItems.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-blue-600" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.quantity} meters • ₹{item.costPrice}/mtr</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">₹{(item.costPrice * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-lg p-4">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Fabric PO Timeline</h5>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {getStatusIcon(fabricPO.status === 'created' || fabricPO.status ? 'completed' : 'pending')}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">PO Created & Sent to Vendor</p>
                <p className="text-xs text-gray-600">{fabricPO.createdAt || 'Pending'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {getStatusIcon(fabricPO.acceptedAt ? 'completed' : 'pending')}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Vendor Accepted PO</p>
                <p className="text-xs text-gray-600">{fabricPO.acceptedAt || 'Waiting for vendor'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {getStatusIcon(fabricPO.dispatchedAt ? 'completed' : 'pending')}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Fabric Dispatched</p>
                <p className="text-xs text-gray-600">{fabricPO.dispatchedAt || 'Not dispatched'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {getStatusIcon(fabricPO.receivedAt ? 'completed' : 'pending')}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Received at Warehouse</p>
                <p className="text-xs text-gray-600">{fabricPO.receivedAt || 'Not received'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Commission */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mt-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Vendor Commission:</span> ₹
            {(order.commissionDistribution?.find((d: any) => d.party === 'Vendor')?.amount || 0).toLocaleString()}
            {' '}(100% to fabric vendor)
          </p>
        </div>
      </div>
    );
  };

  const renderManufacturingOrder = () => {
    if (!hasReadymadeItems) return null;

    const manufacturingPO = order.purchaseOrderTracking?.manufacturingPO || {};

    return (
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shirt className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Manufacturing Order</h4>
              <p className="text-sm text-gray-600">Multi-party production order</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedBillType('manufacturing');
              setShowBill(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            <FileText className="w-4 h-4" strokeWidth={2} />
            View Bill
          </button>
        </div>

        {/* PO Details */}
        <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-600 mb-1">MO Number</p>
            <p className="font-medium text-gray-900">{manufacturingPO.moNumber || 'Not assigned'}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-600 mb-1">Lead Vendor</p>
            <p className="font-medium text-gray-900">{order.vendor}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-600 mb-1">Total Manufacturing Value</p>
            <p className="font-medium text-purple-600">
              ₹{readymadeItems.reduce((sum: number, item: any) => sum + (item.costPrice * item.quantity), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-gray-600 mb-1">Expected Completion</p>
            <p className="font-medium text-gray-900">{manufacturingPO.expectedCompletion || 'TBD'}</p>
          </div>
        </div>

        {/* Parties Involved */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" strokeWidth={2} />
            Parties Involved in Manufacturing
          </h5>
          <div className="space-y-2">
            {order.commissionDistribution?.map((party: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{party.party}</p>
                    <p className="text-xs text-gray-600">
                      {party.contactPerson || 'Contact TBD'} {party.phone ? `• ${party.phone}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{party.amount?.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">{((party.amount / order.commission) * 100).toFixed(0)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manufacturing Items */}
        <div className="bg-white rounded-lg p-4 mb-4">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Manufacturing Items</h5>
          <div className="space-y-2">
            {readymadeItems.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-3">
                  <Shirt className="w-4 h-4 text-purple-600" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.quantity} pieces • ₹{item.costPrice}/pc</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">₹{(item.costPrice * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Manufacturing Tracking Timeline */}
        <div className="bg-white rounded-lg p-4">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Manufacturing Timeline</h5>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {getStatusIcon(manufacturingPO.status === 'created' || manufacturingPO.status ? 'completed' : 'pending')}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">MO Created & Sent to Vendor</p>
                <p className="text-xs text-gray-600">{manufacturingPO.createdAt || 'Pending'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {getStatusIcon(manufacturingPO.acceptedAt ? 'completed' : 'pending')}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Vendor Accepted MO</p>
                <p className="text-xs text-gray-600">{manufacturingPO.acceptedAt || 'Waiting for vendor'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {getStatusIcon(manufacturingPO.productionStarted ? 'completed' : 'pending')}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Production Started</p>
                <p className="text-xs text-gray-600">{manufacturingPO.productionStarted || 'Not started'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {getStatusIcon(manufacturingPO.qualityCheckAt ? 'completed' : 'pending')}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Quality Check</p>
                <p className="text-xs text-gray-600">{manufacturingPO.qualityCheckAt || 'Pending'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {getStatusIcon(manufacturingPO.dispatchedAt ? 'completed' : 'pending')}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Dispatched to Warehouse</p>
                <p className="text-xs text-gray-600">{manufacturingPO.dispatchedAt || 'Not dispatched'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              {getStatusIcon(manufacturingPO.receivedAt ? 'completed' : 'pending')}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Received at Warehouse</p>
                <p className="text-xs text-gray-600">{manufacturingPO.receivedAt || 'Not received'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total Commission */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">Total Manufacturing Commission:</p>
            <p className="text-sm font-bold text-indigo-600">₹{order.commission?.toLocaleString()}</p>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Distributed among {order.commissionDistribution?.length || 0} parties
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-indigo-600" strokeWidth={2} />
          <h3 className="text-base font-semibold text-gray-900">Purchase Order Tracking</h3>
        </div>

        {renderFabricPO()}
        {renderManufacturingOrder()}

        {!hasFabricItems && !hasReadymadeItems && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" strokeWidth={2} />
            <p className="text-sm text-gray-600">No purchase orders created yet</p>
          </div>
        )}
      </div>

      {/* Bill Modal */}
      {showBill && (
        <PurchaseBillModal
          order={order}
          billType={selectedBillType}
          onClose={() => setShowBill(false)}
        />
      )}
    </>
  );
}
