import React, { useState } from 'react';
import { X, Plus, Trash2, Users, Package, DollarSign, Percent, Phone, Mail, User, Shirt, Scissors, Palette, Building2 } from 'lucide-react';
import { ButtonWithLoading } from './LoadingSpinner';
import { sanitizeString, validateEmail, validatePhone, validateRequiredFields } from '../utils/security';
import { toast } from 'sonner';

interface Party {
  id: string;
  type: 'vendor' | 'stitching-master' | 'designer';
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  commissionPercentage: number;
  commissionAmount: number;
  items: any[];
  notes: string;
}

interface CustomPurchaseOrderProps {
  order: any;
  onClose: () => void;
  onCreate: (poData: any) => void;
}

export function CustomPurchaseOrder({ order, onClose, onCreate }: CustomPurchaseOrderProps) {
  const [parties, setParties] = useState<Party[]>([]);
  const [showAddParty, setShowAddParty] = useState(false);
  const [totalCommission, setTotalCommission] = useState(0);
  const [loading, setLoading] = useState(false);

  const [newParty, setNewParty] = useState<Party>({
    id: '',
    type: 'vendor',
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    commissionPercentage: 0,
    commissionAmount: 0,
    items: [],
    notes: ''
  });

  const calculateCommissionAmount = (percentage: number) => {
    return (order.subtotal * percentage) / 100;
  };

  const handleAddParty = () => {
    // Validate required fields
    const validation = validateRequiredFields(newParty, ['name', 'contactPerson', 'phone']);
    if (!validation.valid) {
      toast.error(`Missing required fields: ${validation.missing.join(', ')}`);
      return;
    }

    // Validate phone
    if (!validatePhone(newParty.phone)) {
      toast.error('Invalid phone number format. Use: +91 XXXXX XXXXX');
      return;
    }

    // Validate email if provided
    if (newParty.email && !validateEmail(newParty.email)) {
      toast.error('Invalid email address');
      return;
    }

    // Validate commission percentage
    if (newParty.commissionPercentage < 0 || newParty.commissionPercentage > 100) {
      toast.error('Commission percentage must be between 0 and 100');
      return;
    }

    const partyId = `PARTY-${Date.now()}`;
    const commissionAmount = calculateCommissionAmount(newParty.commissionPercentage);
    
    const party: Party = {
      ...newParty,
      id: partyId,
      name: sanitizeString(newParty.name),
      contactPerson: sanitizeString(newParty.contactPerson),
      phone: sanitizeString(newParty.phone),
      email: sanitizeString(newParty.email),
      notes: sanitizeString(newParty.notes),
      commissionAmount
    };

    setParties([...parties, party]);
    setTotalCommission(totalCommission + commissionAmount);
    toast.success(`${party.type} added successfully!`);
    
    // Reset form
    setNewParty({
      id: '',
      type: 'vendor',
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      commissionPercentage: 0,
      commissionAmount: 0,
      items: [],
      notes: ''
    });
    setShowAddParty(false);
  };

  const handleRemoveParty = (partyId: string) => {
    const party = parties.find(p => p.id === partyId);
    if (party) {
      setTotalCommission(totalCommission - party.commissionAmount);
      toast.success(`${party.type} removed`);
    }
    setParties(parties.filter(p => p.id !== partyId));
  };

  const handleCreatePO = () => {
    if (parties.length === 0) {
      alert('Please add at least one party');
      return;
    }

    const totalPercentage = parties.reduce((sum, p) => sum + p.commissionPercentage, 0);
    if (totalPercentage > 100) {
      alert('Total commission percentage cannot exceed 100%');
      return;
    }

    const poData = {
      orderId: order.id,
      parties,
      totalCommission,
      createdAt: new Date().toISOString(),
      status: 'created'
    };

    onCreate(poData);
    onClose();
  };

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
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'stitching-master':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'designer':
        return 'bg-pink-50 border-pink-200 text-pink-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Purchase Order</h3>
              <p className="text-sm text-gray-600 mt-1">Assign multiple parties with commission distribution</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Order ID</p>
                <p className="font-medium text-gray-900">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Buyer</p>
                <p className="font-medium text-gray-900">{order.buyer}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Value</p>
                <p className="font-medium text-emerald-600">₹{order.subtotal?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Parties List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Assigned Parties ({parties.length})</h4>
              <button
                onClick={() => setShowAddParty(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Party
              </button>
            </div>

            {parties.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" strokeWidth={2} />
                <p className="text-gray-600">No parties assigned yet</p>
                <p className="text-sm text-gray-500 mt-1">Click "Add Party" to assign vendors, stitching masters, or designers</p>
              </div>
            ) : (
              <div className="space-y-4">
                {parties.map((party) => (
                  <div key={party.id} className={`border-2 rounded-lg p-5 ${getPartyColor(party.type)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${party.type === 'vendor' ? 'bg-blue-600' : party.type === 'stitching-master' ? 'bg-purple-600' : 'bg-pink-600'} rounded-lg flex items-center justify-center text-white`}>
                          {getPartyIcon(party.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-gray-900">{party.name}</h5>
                            <span className="px-2 py-0.5 bg-white/80 rounded text-xs font-medium">
                              {party.type === 'vendor' ? 'Vendor' : party.type === 'stitching-master' ? 'Stitching Master' : 'Designer'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{party.contactPerson}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveParty(party.id)}
                        className="p-2 bg-white/50 hover:bg-rose-100 text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{party.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">{party.email}</span>
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-lg p-3 border border-white/80">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Commission</p>
                          <p className="font-semibold text-gray-900">{party.commissionPercentage}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 mb-1">Amount</p>
                          <p className="font-bold text-lg text-emerald-600">₹{party.commissionAmount.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {party.notes && (
                      <div className="mt-3 text-sm text-gray-700 bg-white/60 rounded p-2">
                        <p className="font-medium mb-1">Notes:</p>
                        <p>{party.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Commission Summary */}
          {parties.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-5">
              <h4 className="font-semibold text-gray-900 mb-4">Commission Summary</h4>
              <div className="space-y-3">
                {parties.map((party) => (
                  <div key={party.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{party.name} ({party.commissionPercentage}%)</span>
                    <span className="font-medium text-gray-900">₹{party.commissionAmount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="pt-3 border-t-2 border-indigo-300 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total Commission</span>
                  <span className="font-bold text-xl text-indigo-600">₹{totalCommission.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-600 bg-white/60 rounded p-2">
                  Total: {parties.reduce((sum, p) => sum + p.commissionPercentage, 0)}% of order value
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <ButtonWithLoading
            onClick={handleCreatePO}
            disabled={parties.length === 0}
            loading={loading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Purchase Order
          </ButtonWithLoading>
        </div>
      </div>

      {/* Add Party Modal */}
      {showAddParty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Party to Purchase Order</h3>
                <button onClick={() => setShowAddParty(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Party Type *</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewParty({...newParty, type: 'vendor'})}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg ${
                      newParty.type === 'vendor' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Building2 className={`w-6 h-6 ${newParty.type === 'vendor' ? 'text-blue-600' : 'text-gray-400'}`} strokeWidth={2} />
                    <span className={`text-sm font-medium ${newParty.type === 'vendor' ? 'text-blue-900' : 'text-gray-700'}`}>Vendor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewParty({...newParty, type: 'stitching-master'})}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg ${
                      newParty.type === 'stitching-master' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Scissors className={`w-6 h-6 ${newParty.type === 'stitching-master' ? 'text-purple-600' : 'text-gray-400'}`} strokeWidth={2} />
                    <span className={`text-sm font-medium ${newParty.type === 'stitching-master' ? 'text-purple-900' : 'text-gray-700'}`}>Stitching Master</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewParty({...newParty, type: 'designer'})}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg ${
                      newParty.type === 'designer' ? 'border-pink-600 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Palette className={`w-6 h-6 ${newParty.type === 'designer' ? 'text-pink-600' : 'text-gray-400'}`} strokeWidth={2} />
                    <span className={`text-sm font-medium ${newParty.type === 'designer' ? 'text-pink-900' : 'text-gray-700'}`}>Designer</span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Business Name *</label>
                  <input
                    value={newParty.name}
                    onChange={(e) => setNewParty({...newParty, name: e.target.value})}
                    placeholder="Enter business name"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Contact Person *</label>
                  <input
                    value={newParty.contactPerson}
                    onChange={(e) => setNewParty({...newParty, contactPerson: e.target.value})}
                    placeholder="Enter contact person"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number *</label>
                  <input
                    value={newParty.phone}
                    onChange={(e) => setNewParty({...newParty, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newParty.email}
                    onChange={(e) => setNewParty({...newParty, email: e.target.value})}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Commission Percentage *</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={newParty.commissionPercentage}
                    onChange={(e) => setNewParty({...newParty, commissionPercentage: parseFloat(e.target.value) || 0})}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-gray-600">%</span>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 min-w-[150px]">
                    <p className="text-xs text-emerald-700">Commission Amount</p>
                    <p className="font-semibold text-emerald-900">₹{calculateCommissionAmount(newParty.commissionPercentage).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on order value of ₹{order.subtotal?.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes (Optional)</label>
                <textarea
                  value={newParty.notes}
                  onChange={(e) => setNewParty({...newParty, notes: e.target.value})}
                  rows={3}
                  placeholder="Any special instructions or notes..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowAddParty(false)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddParty}
                disabled={!newParty.name || !newParty.contactPerson || !newParty.phone || !newParty.email || newParty.commissionPercentage <= 0}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Party
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}