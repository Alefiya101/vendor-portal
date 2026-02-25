import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Mail, Building, Users } from 'lucide-react';
import * as vendorService from '../services/vendorService';
import * as buyerService from '../services/buyerService';
import * as adminAuthService from '../services/adminAuthService';
import { toast } from 'sonner@2.0.3';
import { SearchableDropdown } from './SearchableDropdown';

interface AddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'vendor' | 'buyer';
  onSuccess: () => void;
}

export function AddPartyModal({ isOpen, onClose, type, onSuccess }: AddPartyModalProps) {
  const [loading, setLoading] = useState(false);
  const isSubmitting = React.useRef(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gst: '',
    agentId: '', // Agent for vendors
    agentName: '',
    agentPhone: ''
  });

  useEffect(() => {
    if (isOpen && type === 'vendor') {
      // Load agents when modal opens for vendors - fetch from Supabase
      console.log('🔄 AddPartyModal opened for vendor - loading agents...');
      
      const loadAgents = async () => {
        try {
          const allAgents = await adminAuthService.getAllAgents();
          console.log('🔍 Agents loaded:', allAgents.length, 'agents found:', allAgents);
          setAgents(allAgents);
        } catch (error) {
          console.error('❌ Error loading agents:', error);
          setAgents([]);
        }
      };
      
      loadAgents();
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isSubmitting.current || loading) return;
    
    try {
      isSubmitting.current = true;
      setLoading(true);
      
      const partyData: any = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        gst: formData.gst
      };

      // Add agent info for vendors
      if (type === 'vendor' && formData.agentId) {
        partyData.agentId = formData.agentId;
        partyData.agentName = formData.agentName;
      }

      if (type === 'vendor') {
        await vendorService.createVendor(partyData);
        toast.success('Vendor added successfully');
      } else {
        await buyerService.createBuyer(partyData);
        toast.success('Customer added successfully');
      }
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to add party:', err);
      toast.error(`Failed to add ${type}`);
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Add New {type === 'vendor' ? 'Vendor' : 'Customer'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={type === 'vendor' ? "Vendor Name" : "Customer Name"}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                placeholder="Full address..."
              />
            </div>
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST / Tax ID</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.gst}
                onChange={e => setFormData({...formData, gst: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Agent Dropdown - Only for Vendors */}
          {type === 'vendor' && (
            <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-100">
              <label className="block text-sm font-medium text-cyan-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assign Agent (Optional)
              </label>
              {agents.length === 0 ? (
                <div className="text-sm text-cyan-700 p-2 bg-cyan-100 rounded border border-cyan-200">
                  ℹ️ No agents available. Create agents in User Management first.
                </div>
              ) : (
                <>
                  <SearchableDropdown
                    options={agents.map(agent => ({ 
                      id: agent.id, 
                      label: agent.name, 
                      subLabel: agent.phone || 'No phone' 
                    }))}
                    value={formData.agentId}
                    onChange={(value) => {
                      const selectedAgent = agents.find(a => a.id === value);
                      console.log('🎯 Agent selected:', selectedAgent);
                      setFormData({
                        ...formData, 
                        agentId: value,
                        agentName: selectedAgent?.name || '',
                        agentPhone: selectedAgent?.phone || ''
                      });
                    }}
                    placeholder="Select agent (optional)"
                    className="w-full"
                  />
                  <p className="text-xs text-cyan-700 mt-1">💼 Link this vendor to an agent for commission tracking ({agents.length} agents available)</p>
                </>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : `Add ${type === 'vendor' ? 'Vendor' : 'Customer'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}