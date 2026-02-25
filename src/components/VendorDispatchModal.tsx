import React, { useState } from 'react';
import { X, Truck, Package, Camera, Phone, MapPin } from 'lucide-react';

interface VendorDispatchModalProps {
  order: any;
  onClose: () => void;
  onSubmit: (dispatchData: any) => void;
}

export function VendorDispatchModal({ order, onClose, onSubmit }: VendorDispatchModalProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(dispatchForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add Dispatch Details</h3>
              <p className="text-sm text-gray-600 mt-1">Order: {order.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Product</p>
                <p className="font-medium text-gray-900">{order.product}</p>
              </div>
              <div>
                <p className="text-gray-600">Quantity</p>
                <p className="font-medium text-gray-900">{order.quantity} pieces</p>
              </div>
              <div>
                <p className="text-gray-600">Shop</p>
                <p className="font-medium text-gray-900">{order.shopName}</p>
              </div>
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-medium text-gray-900">₹{order.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Dispatch Date */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Dispatch Date *
            </label>
            <input
              type="date"
              value={dispatchForm.dispatchDate}
              onChange={(e) => setDispatchForm({...dispatchForm, dispatchDate: e.target.value})}
              required
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Quantity Dispatched *
            </label>
            <input
              type="number"
              value={dispatchForm.quantity}
              onChange={(e) => setDispatchForm({...dispatchForm, quantity: e.target.value})}
              placeholder={`Max: ${order.quantity} pieces`}
              required
              max={order.quantity}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Delivery Method */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Delivery Method *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDispatchForm({...dispatchForm, deliveryMethod: 'courier'})}
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg ${
                  dispatchForm.deliveryMethod === 'courier'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="font-medium">Courier Service</span>
              </button>
              <button
                type="button"
                onClick={() => setDispatchForm({...dispatchForm, deliveryMethod: 'local'})}
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg ${
                  dispatchForm.deliveryMethod === 'local'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Truck className="w-5 h-5" />
                <span className="font-medium">Local Delivery</span>
              </button>
            </div>
          </div>

          {/* Courier Service Details */}
          {dispatchForm.deliveryMethod === 'courier' && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Courier Service Name *
                </label>
                <input
                  value={dispatchForm.courierService}
                  onChange={(e) => setDispatchForm({...dispatchForm, courierService: e.target.value})}
                  placeholder="e.g., Delhivery, Blue Dart, DTDC"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tracking ID / AWB Number *
                </label>
                <input
                  value={dispatchForm.trackingId}
                  onChange={(e) => setDispatchForm({...dispatchForm, trackingId: e.target.value})}
                  placeholder="e.g., DELH123456789"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Local Delivery Details */}
          {dispatchForm.deliveryMethod === 'local' && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Vehicle Number *
                </label>
                <input
                  value={dispatchForm.vehicleNumber}
                  onChange={(e) => setDispatchForm({...dispatchForm, vehicleNumber: e.target.value})}
                  placeholder="e.g., MH 12 AB 1234"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Driver Name *
                  </label>
                  <input
                    value={dispatchForm.driverName}
                    onChange={(e) => setDispatchForm({...dispatchForm, driverName: e.target.value})}
                    placeholder="Driver name"
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Driver Phone *
                  </label>
                  <input
                    value={dispatchForm.driverPhone}
                    onChange={(e) => setDispatchForm({...dispatchForm, driverPhone: e.target.value})}
                    placeholder="10-digit mobile"
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Estimated Delivery */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Estimated Delivery Date
            </label>
            <input
              type="date"
              value={dispatchForm.estimatedDelivery}
              onChange={(e) => setDispatchForm({...dispatchForm, estimatedDelivery: e.target.value})}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Additional Notes
            </label>
            <textarea
              value={dispatchForm.notes}
              onChange={(e) => setDispatchForm({...dispatchForm, notes: e.target.value})}
              placeholder="Any special instructions or notes about this dispatch..."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload Images (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload dispatch images</p>
              <p className="text-xs text-gray-500 mt-1">Packing photos, product images, etc.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" strokeWidth={2} />
              Submit Dispatch Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
