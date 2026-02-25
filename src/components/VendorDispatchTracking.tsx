import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, AlertCircle, XCircle, Eye, MapPin, Calendar, User, Phone, FileText, Building2, Scissors, Palette, Download } from 'lucide-react';
import { ButtonWithLoading } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields, validatePhone } from '../utils/security';
import { toast } from 'sonner@2.0.3';
import { handleApiError } from '../utils/apiClient';

interface VendorDispatchTrackingProps {
  order: any;
  onVendorAccept?: (orderId: string) => void;
  onVendorDispatch?: (orderId: string, dispatchData: any) => void;
  onAdminReceive?: (orderId: string, receiveData: any) => void;
  userRole: 'admin' | 'vendor' | 'party';
  partyId?: string;
}

export function VendorDispatchTracking({ order, onVendorAccept, onVendorDispatch, onAdminReceive, userRole, partyId }: VendorDispatchTrackingProps) {
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [dispatchForm, setDispatchForm] = useState({
    dispatchDate: '',
    deliveryMethod: 'courier',
    courierService: '',
    trackingId: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    estimatedDelivery: '',
    quantity: '',
    notes: ''
  });

  const [receiveForm, setReceiveForm] = useState({
    receivedDate: '',
    receivedBy: '',
    condition: 'good',
    quantityReceived: '',
    notes: ''
  });

  // Get all parties involved in this order
  const parties = order.customPO?.parties || [];
  const fabricItems = order.products?.filter((p: any) => p.type === 'fabric') || [];
  const readymadeItems = order.products?.filter((p: any) => p.type === 'readymade') || [];

  const getPartyIcon = (type: string) => {
    switch (type) {
      case 'vendor':
        return <Building2 className="w-5 h-5" strokeWidth={2} />;
      case 'stitching-master':
        return <Scissors className="w-5 h-5" strokeWidth={2} />;
      case 'designer':
        return <Palette className="w-5 h-5" strokeWidth={2} />;
      default:
        return <User className="w-5 h-5" strokeWidth={2} />;
    }
  };

  const getPartyColor = (type: string) => {
    switch (type) {
      case 'vendor':
        return { bg: 'bg-blue-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
      case 'stitching-master':
        return { bg: 'bg-purple-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' };
      case 'designer':
        return { bg: 'bg-pink-600', light: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' };
      default:
        return { bg: 'bg-gray-600', light: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
    }
  };

  const getPartyStatusIcon = (party: any) => {
    const dispatch = order.vendorDispatches?.[party.id];
    if (!dispatch) return <Clock className="w-4 h-4 text-amber-600" strokeWidth={2} />;
    if (dispatch.receivedAt) return <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={2} />;
    if (dispatch.dispatchedAt) return <Truck className="w-4 h-4 text-blue-600" strokeWidth={2} />;
    return <Clock className="w-4 h-4 text-amber-600" strokeWidth={2} />;
  };

  const getPartyStatus = (party: any) => {
    const dispatch = order.vendorDispatches?.[party.id];
    if (!dispatch || !dispatch.accepted) return 'Pending Acceptance';
    if (dispatch.receivedAt) return 'Received at Warehouse';
    if (dispatch.dispatchedAt) return 'In Transit';
    if (dispatch.accepted) return 'Accepted - Ready to Dispatch';
    return 'Pending';
  };

  const handleAcceptOrder = (party: any) => {
    if (onVendorAccept) {
      onVendorAccept(order.id);
    }
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onVendorDispatch && selectedParty) {
      const errors = validateRequiredFields(dispatchForm, ['dispatchDate', 'quantity', 'estimatedDelivery']);
      if (errors.length > 0) {
        toast.error(`Please fill in the following fields: ${errors.join(', ')}`);
        return;
      }
      if (dispatchForm.deliveryMethod === 'local') {
        const phoneErrors = validatePhone(dispatchForm.driverPhone);
        if (phoneErrors.length > 0) {
          toast.error(`Invalid phone number: ${phoneErrors.join(', ')}`);
          return;
        }
      }
      setLoading(true);
      onVendorDispatch(order.id, {
        ...dispatchForm,
        partyId: selectedParty.id,
        partyType: selectedParty.type,
        partyName: selectedParty.name
      }).then(() => {
        setLoading(false);
        setShowDispatchModal(false);
        setSelectedParty(null);
      }).catch((error) => {
        setLoading(false);
        handleApiError(error);
      });
    }
  };

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdminReceive && selectedParty) {
      const errors = validateRequiredFields(receiveForm, ['receivedDate', 'receivedBy', 'quantityReceived']);
      if (errors.length > 0) {
        toast.error(`Please fill in the following fields: ${errors.join(', ')}`);
        return;
      }
      setLoading(true);
      onAdminReceive(order.id, {
        ...receiveForm,
        partyId: selectedParty.id,
        partyType: selectedParty.type,
        partyName: selectedParty.name
      }).then(() => {
        setLoading(false);
        setShowReceiveModal(false);
        setSelectedParty(null);
      }).catch((error) => {
        setLoading(false);
        handleApiError(error);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Vendor Dispatch Tracking</h3>
            <p className="text-sm text-gray-600">Multi-party order fulfillment</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600">Total Parties</p>
            <p className="text-lg font-semibold text-gray-900">{parties.length}</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600">Dispatched</p>
            <p className="text-lg font-semibold text-blue-600">
              {parties.filter((p: any) => order.vendorDispatches?.[p.id]?.dispatchedAt).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600">Received</p>
            <p className="text-lg font-semibold text-emerald-600">
              {parties.filter((p: any) => order.vendorDispatches?.[p.id]?.receivedAt).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-xs text-gray-600">Pending</p>
            <p className="text-lg font-semibold text-amber-600">
              {parties.filter((p: any) => !order.vendorDispatches?.[p.id]?.dispatchedAt).length}
            </p>
          </div>
        </div>
      </div>

      {/* Fabric Purchase Order (if applicable) */}
      {fabricItems.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-600" strokeWidth={2} />
            <h4 className="font-semibold text-gray-900">Fabric Purchase Order</h4>
            <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-medium">
              Simple PO
            </span>
          </div>

          <div className="space-y-3">
            {fabricItems.map((item: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} meters • ₹{item.costPrice}/mtr
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{(item.quantity * item.costPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Fabric vendor tracking */}
          {order.purchaseOrderTracking?.fabricPO && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-sm font-medium text-gray-900 mb-3">Fabric Vendor: {order.vendor}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {order.purchaseOrderTracking.fabricPO.acceptedAt ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600" strokeWidth={2} />
                  )}
                  <span className="text-gray-700">
                    {order.purchaseOrderTracking.fabricPO.acceptedAt 
                      ? `Accepted on ${order.purchaseOrderTracking.fabricPO.acceptedAt}`
                      : 'Awaiting vendor acceptance'}
                  </span>
                </div>
                {order.purchaseOrderTracking.fabricPO.dispatchedAt && (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" strokeWidth={2} />
                    <span className="text-gray-700">
                      Dispatched on {order.purchaseOrderTracking.fabricPO.dispatchedAt}
                    </span>
                  </div>
                )}
                {order.purchaseOrderTracking.fabricPO.receivedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                    <span className="text-gray-700">
                      Received on {order.purchaseOrderTracking.fabricPO.receivedAt}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manufacturing Order Parties */}
      {readymadeItems.length > 0 && parties.length > 0 && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-purple-600" strokeWidth={2} />
            <h4 className="font-semibold text-gray-900">Manufacturing Order - Multi-Party</h4>
            <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-xs font-medium">
              Complex PO
            </span>
          </div>

          {/* Items */}
          <div className="mb-4 space-y-2">
            {readymadeItems.map((item: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} pieces • ₹{item.costPrice}/pc
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{(item.quantity * item.costPrice).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Parties Tracking */}
          <div className="space-y-4">
            <h5 className="font-semibold text-gray-900">Party-wise Dispatch Tracking</h5>
            
            {parties.map((party: any) => {
              const colors = getPartyColor(party.type);
              const dispatch = order.vendorDispatches?.[party.id] || {};
              const canDispatch = userRole === 'vendor' && partyId === party.id && dispatch.accepted && !dispatch.dispatchedAt;
              const canReceive = userRole === 'admin' && dispatch.dispatchedAt && !dispatch.receivedAt;
              const canAccept = userRole === 'vendor' && partyId === party.id && !dispatch.accepted;

              return (
                <div key={party.id} className={`border-2 ${colors.border} ${colors.light} rounded-lg p-4`}>
                  {/* Party Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center text-white`}>
                        {getPartyIcon(party.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h6 className="font-semibold text-gray-900">{party.name}</h6>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors.light} ${colors.text}`}>
                            {party.type === 'vendor' ? 'Vendor' : party.type === 'stitching-master' ? 'Stitching Master' : 'Designer'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{party.contactPerson} • {party.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Commission</p>
                      <p className="text-lg font-bold text-emerald-600">₹{party.commissionAmount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{party.commissionPercentage}%</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      {getPartyStatusIcon(party)}
                      <span className="font-medium text-gray-900">{getPartyStatus(party)}</span>
                    </div>
                  </div>

                  {/* Dispatch Details */}
                  {dispatch.dispatchedAt && (
                    <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                      <h6 className="text-sm font-semibold text-gray-900 mb-3">Dispatch Information</h6>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Dispatch Date</p>
                          <p className="font-medium text-gray-900">{dispatch.dispatchDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Estimated Delivery</p>
                          <p className="font-medium text-gray-900">{dispatch.estimatedDelivery}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Quantity</p>
                          <p className="font-medium text-gray-900">{dispatch.quantity} units</p>
                        </div>
                        {dispatch.deliveryMethod === 'courier' ? (
                          <>
                            <div>
                              <p className="text-gray-600">Courier</p>
                              <p className="font-medium text-gray-900">{dispatch.courierService}</p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-gray-600">Tracking ID</p>
                              <p className="font-medium text-blue-600">{dispatch.trackingId}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="text-gray-600">Vehicle</p>
                              <p className="font-medium text-gray-900">{dispatch.vehicleNumber}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Driver</p>
                              <p className="font-medium text-gray-900">{dispatch.driverName} • {dispatch.driverPhone}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Received Details */}
                  {dispatch.receivedAt && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-3">
                      <h6 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" strokeWidth={2} />
                        Received at Warehouse
                      </h6>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-emerald-700">Received Date</p>
                          <p className="font-medium text-gray-900">{dispatch.receivedDate}</p>
                        </div>
                        <div>
                          <p className="text-emerald-700">Received By</p>
                          <p className="font-medium text-gray-900">{dispatch.receivedBy}</p>
                        </div>
                        <div>
                          <p className="text-emerald-700">Quantity Received</p>
                          <p className="font-medium text-gray-900">{dispatch.quantityReceived} units</p>
                        </div>
                        <div>
                          <p className="text-emerald-700">Condition</p>
                          <p className="font-medium text-gray-900 capitalize">{dispatch.condition}</p>
                        </div>
                        {dispatch.receiveNotes && (
                          <div className="md:col-span-2">
                            <p className="text-emerald-700">Notes</p>
                            <p className="font-medium text-gray-900">{dispatch.receiveNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {canAccept && (
                      <button
                        onClick={() => handleAcceptOrder(party)}
                        className={`flex-1 px-4 py-2 ${colors.bg} text-white rounded-lg font-medium hover:opacity-90 flex items-center justify-center gap-2`}
                      >
                        <CheckCircle className="w-4 h-4" strokeWidth={2} />
                        Accept Order
                      </button>
                    )}
                    
                    {canDispatch && (
                      <button
                        onClick={() => {
                          setSelectedParty(party);
                          setShowDispatchModal(true);
                        }}
                        className={`flex-1 px-4 py-2 ${colors.bg} text-white rounded-lg font-medium hover:opacity-90 flex items-center justify-center gap-2`}
                      >
                        <Truck className="w-4 h-4" strokeWidth={2} />
                        Add Dispatch Details
                      </button>
                    )}
                    
                    {canReceive && (
                      <button
                        onClick={() => {
                          setSelectedParty(party);
                          setShowReceiveModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" strokeWidth={2} />
                        Mark as Received
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && selectedParty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <h3 className="text-lg font-semibold text-gray-900">Add Dispatch Details</h3>
              <p className="text-sm text-gray-600 mt-1">Party: {selectedParty.name}</p>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Dispatch Date *</label>
                <input
                  type="date"
                  value={dispatchForm.dispatchDate}
                  onChange={(e) => setDispatchForm({...dispatchForm, dispatchDate: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Quantity Dispatched *</label>
                <input
                  type="number"
                  value={dispatchForm.quantity}
                  onChange={(e) => setDispatchForm({...dispatchForm, quantity: e.target.value})}
                  placeholder="Enter quantity"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Delivery Method *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDispatchForm({...dispatchForm, deliveryMethod: 'courier'})}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg ${
                      dispatchForm.deliveryMethod === 'courier'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span className="font-medium">Courier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispatchForm({...dispatchForm, deliveryMethod: 'local'})}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg ${
                      dispatchForm.deliveryMethod === 'local'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Local/Vehicle</span>
                  </button>
                </div>
              </div>

              {dispatchForm.deliveryMethod === 'courier' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Courier Service *</label>
                    <select
                      value={dispatchForm.courierService}
                      onChange={(e) => setDispatchForm({...dispatchForm, courierService: e.target.value})}
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select courier</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="BlueDart">BlueDart</option>
                      <option value="DTDC">DTDC</option>
                      <option value="Ecom Express">Ecom Express</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Tracking ID *</label>
                    <input
                      value={dispatchForm.trackingId}
                      onChange={(e) => setDispatchForm({...dispatchForm, trackingId: e.target.value})}
                      placeholder="Enter tracking number"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Vehicle Number *</label>
                    <input
                      value={dispatchForm.vehicleNumber}
                      onChange={(e) => setDispatchForm({...dispatchForm, vehicleNumber: e.target.value})}
                      placeholder="MH02 AB 1234"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Driver Name *</label>
                      <input
                        value={dispatchForm.driverName}
                        onChange={(e) => setDispatchForm({...dispatchForm, driverName: e.target.value})}
                        placeholder="Driver name"
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Driver Phone *</label>
                      <input
                        value={dispatchForm.driverPhone}
                        onChange={(e) => setDispatchForm({...dispatchForm, driverPhone: e.target.value})}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Estimated Delivery *</label>
                <input
                  type="date"
                  value={dispatchForm.estimatedDelivery}
                  onChange={(e) => setDispatchForm({...dispatchForm, estimatedDelivery: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
                <textarea
                  value={dispatchForm.notes}
                  onChange={(e) => setDispatchForm({...dispatchForm, notes: e.target.value})}
                  rows={3}
                  placeholder="Any special notes..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDispatchModal(false);
                    setSelectedParty(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <ButtonWithLoading
                  type="submit"
                  loading={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  Submit Dispatch
                </ButtonWithLoading>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && selectedParty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Mark as Received</h3>
              <p className="text-sm text-gray-600 mt-1">Party: {selectedParty.name}</p>
            </div>

            <form onSubmit={handleReceiveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Received Date *</label>
                <input
                  type="date"
                  value={receiveForm.receivedDate}
                  onChange={(e) => setReceiveForm({...receiveForm, receivedDate: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Received By *</label>
                <input
                  value={receiveForm.receivedBy}
                  onChange={(e) => setReceiveForm({...receiveForm, receivedBy: e.target.value})}
                  placeholder="Name of person"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Quantity Received *</label>
                <input
                  type="number"
                  value={receiveForm.quantityReceived}
                  onChange={(e) => setReceiveForm({...receiveForm, quantityReceived: e.target.value})}
                  placeholder="Enter quantity"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Condition *</label>
                <select
                  value={receiveForm.condition}
                  onChange={(e) => setReceiveForm({...receiveForm, condition: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  placeholder="Any observations..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowReceiveModal(false);
                    setSelectedParty(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <ButtonWithLoading
                  type="submit"
                  loading={loading}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                >
                  Confirm Receipt
                </ButtonWithLoading>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}