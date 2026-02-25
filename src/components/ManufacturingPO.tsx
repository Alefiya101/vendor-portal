import React, { useState } from 'react';
import { X, Plus, Trash2, Users, DollarSign, Package, Calendar, CheckCircle, AlertCircle, Percent } from 'lucide-react';

interface ManufacturingPOProps {
  customOrder?: any;
  onSubmit: (poData: any) => void;
  onCancel: () => void;
}

export function ManufacturingPO({ customOrder, onSubmit, onCancel }: ManufacturingPOProps) {
  const [poData, setPoData] = useState({
    productName: customOrder?.productName || '',
    quantity: customOrder?.quantity || '',
    targetDeliveryDate: '',
    basePrice: '',
    totalAmount: '',
    notes: ''
  });

  const [vendors, setVendors] = useState<any[]>([
    {
      id: 1,
      type: 'fabric-vendor',
      name: '',
      contactPerson: '',
      phone: '',
      commissionType: 'fixed',
      commissionValue: '',
      commissionAmount: 0,
      status: 'assigned',
      workDescription: ''
    }
  ]);

  const vendorTypes = [
    { value: 'fabric-vendor', label: 'Fabric Vendor', icon: '🧵' },
    { value: 'designer', label: 'Designer', icon: '🎨' },
    { value: 'stitching-master', label: 'Stitching Master', icon: '✂️' },
    { value: 'embroidery-vendor', label: 'Embroidery Vendor', icon: '🪡' },
    { value: 'printing-vendor', label: 'Printing Vendor', icon: '🖨️' },
    { value: 'finishing-vendor', label: 'Finishing Vendor', icon: '✨' },
    { value: 'packaging-vendor', label: 'Packaging Vendor', icon: '📦' }
  ];

  const addVendor = () => {
    setVendors([...vendors, {
      id: vendors.length + 1,
      type: '',
      name: '',
      contactPerson: '',
      phone: '',
      commissionType: 'fixed',
      commissionValue: '',
      commissionAmount: 0,
      status: 'assigned',
      workDescription: ''
    }]);
  };

  const removeVendor = (id: number) => {
    setVendors(vendors.filter(v => v.id !== id));
  };

  const updateVendor = (id: number, field: string, value: any) => {
    setVendors(vendors.map(v => {
      if (v.id === id) {
        const updated = { ...v, [field]: value };
        
        // Calculate commission amount
        if (field === 'commissionValue' || field === 'commissionType') {
          const basePrice = parseFloat(poData.basePrice) || 0;
          const quantity = parseFloat(poData.quantity) || 0;
          const total = basePrice * quantity;
          
          if (updated.commissionType === 'percentage') {
            updated.commissionAmount = (total * parseFloat(updated.commissionValue || 0)) / 100;
          } else {
            updated.commissionAmount = parseFloat(updated.commissionValue || 0) * quantity;
          }
        }
        
        return updated;
      }
      return v;
    }));
  };

  const calculateTotalCommission = () => {
    return vendors.reduce((sum, v) => sum + (v.commissionAmount || 0), 0);
  };

  const calculateTotalAmount = () => {
    const basePrice = parseFloat(poData.basePrice) || 0;
    const quantity = parseFloat(poData.quantity) || 0;
    const baseTotal = basePrice * quantity;
    const totalCommission = calculateTotalCommission();
    return baseTotal + totalCommission;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const manufacturingPO = {
      id: `MPO-${Date.now()}`,
      customOrderId: customOrder?.id || null,
      ...poData,
      vendors: vendors,
      totalCommission: calculateTotalCommission(),
      totalAmount: calculateTotalAmount(),
      status: 'active',
      createdDate: new Date().toISOString(),
      createdBy: 'Admin'
    };

    onSubmit(manufacturingPO);
  };

  // Recalculate when base price or quantity changes
  React.useEffect(() => {
    if (poData.basePrice && poData.quantity) {
      const updatedVendors = vendors.map(v => {
        const basePrice = parseFloat(poData.basePrice) || 0;
        const quantity = parseFloat(poData.quantity) || 0;
        const total = basePrice * quantity;
        
        if (v.commissionType === 'percentage') {
          v.commissionAmount = (total * parseFloat(v.commissionValue || 0)) / 100;
        } else {
          v.commissionAmount = parseFloat(v.commissionValue || 0) * quantity;
        }
        
        return v;
      });
      setVendors(updatedVendors);
    }
  }, [poData.basePrice, poData.quantity]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-6xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Create Manufacturing Purchase Order</h2>
              <p className="text-sm text-gray-600 mt-1">
                {customOrder ? `For Custom Order: ${customOrder.id}` : 'New Manufacturing PO'}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" strokeWidth={2} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Custom Order Reference */}
          {customOrder && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Custom Order Details</h4>
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Order ID</p>
                  <p className="font-medium text-gray-900">{customOrder.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Buyer</p>
                  <p className="font-medium text-gray-900">{customOrder.buyerName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Product</p>
                  <p className="font-medium text-gray-900">{customOrder.productName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Quantity</p>
                  <p className="font-medium text-gray-900">{customOrder.quantity} pcs</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Product Name *</label>
              <input
                type="text"
                value={poData.productName}
                onChange={(e) => setPoData({...poData, productName: e.target.value})}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Total Quantity *</label>
              <input
                type="number"
                value={poData.quantity}
                onChange={(e) => setPoData({...poData, quantity: e.target.value})}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Base Price per Piece *</label>
              <input
                type="number"
                value={poData.basePrice}
                onChange={(e) => setPoData({...poData, basePrice: e.target.value})}
                placeholder="₹"
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Target Delivery Date *</label>
              <input
                type="date"
                value={poData.targetDeliveryDate}
                onChange={(e) => setPoData({...poData, targetDeliveryDate: e.target.value})}
                required
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Vendors Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manufacturing Parties</h3>
                <p className="text-sm text-gray-600">Add all vendors involved in manufacturing</p>
              </div>
              <button
                type="button"
                onClick={addVendor}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Vendor
              </button>
            </div>

            <div className="space-y-4">
              {vendors.map((vendor, index) => (
                <div key={vendor.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-base font-medium text-gray-900">Vendor #{index + 1}</h4>
                    {vendors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVendor(vendor.id)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Vendor Type *</label>
                      <select
                        value={vendor.type}
                        onChange={(e) => updateVendor(vendor.id, 'type', e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select type</option>
                        {vendorTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Vendor/Company Name *</label>
                      <input
                        type="text"
                        value={vendor.name}
                        onChange={(e) => updateVendor(vendor.id, 'name', e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Contact Person</label>
                      <input
                        type="text"
                        value={vendor.contactPerson}
                        onChange={(e) => updateVendor(vendor.id, 'contactPerson', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={vendor.phone}
                        onChange={(e) => updateVendor(vendor.id, 'phone', e.target.value)}
                        placeholder="+91"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Commission Type *</label>
                      <select
                        value={vendor.commissionType}
                        onChange={(e) => updateVendor(vendor.id, 'commissionType', e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed per Piece</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {vendor.commissionType === 'percentage' ? 'Percentage (%)' : 'Amount per Piece'} *
                      </label>
                      <input
                        type="number"
                        value={vendor.commissionValue}
                        onChange={(e) => updateVendor(vendor.id, 'commissionValue', e.target.value)}
                        placeholder={vendor.commissionType === 'percentage' ? '%' : '₹'}
                        step="0.01"
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Total Commission</label>
                      <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-semibold text-emerald-700">
                        ₹{vendor.commissionAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Work Description</label>
                    <textarea
                      value={vendor.workDescription}
                      onChange={(e) => updateVendor(vendor.id, 'workDescription', e.target.value)}
                      placeholder="Describe the specific work this vendor will do"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Base Price ({poData.quantity || 0} pcs × ₹{poData.basePrice || 0})</span>
                <span className="text-base font-semibold text-gray-900">
                  ₹{((parseFloat(poData.basePrice) || 0) * (parseFloat(poData.quantity) || 0)).toLocaleString('en-IN')}
                </span>
              </div>
              
              {vendors.map((vendor, index) => (
                vendor.commissionAmount > 0 && (
                  <div key={vendor.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {vendorTypes.find(t => t.value === vendor.type)?.label || 'Vendor'} Commission
                      {vendor.commissionType === 'percentage' 
                        ? ` (${vendor.commissionValue}%)` 
                        : ` (₹${vendor.commissionValue}/pc)`}
                    </span>
                    <span className="font-medium text-gray-700">
                      ₹{vendor.commissionAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )
              ))}

              <div className="border-t border-blue-200 pt-3 flex items-center justify-between">
                <span className="text-base font-medium text-gray-900">Total Commission</span>
                <span className="text-lg font-semibold text-blue-600">
                  ₹{calculateTotalCommission().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="border-t-2 border-blue-300 pt-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total PO Amount</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ₹{calculateTotalAmount().toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Additional Notes</label>
            <textarea
              value={poData.notes}
              onChange={(e) => setPoData({...poData, notes: e.target.value})}
              placeholder="Any special instructions or notes for this manufacturing order"
              rows={3}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" strokeWidth={2} />
              Create Manufacturing PO
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
