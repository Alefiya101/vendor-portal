import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check, Plus, User, Phone, Mail, MapPin, Building, X } from 'lucide-react';
import * as buyerService from '../services/buyerService';
import { toast } from 'sonner@2.0.3';

interface CustomerOption {
  id: string;
  label: string;
  subLabel?: string;
}

interface CustomerSearchDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onCustomerCreated?: () => void;
  placeholder?: string;
  label?: string;
  className?: string;
  customers: any[];
}

export function CustomerSearchDropdown({
  value,
  onChange,
  onCustomerCreated,
  placeholder = 'Select or create customer...',
  label,
  className = '',
  customers
}: CustomerSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<CustomerOption[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  // New customer form data
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    businessName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst: ''
  });

  const options: CustomerOption[] = customers.map(c => ({
    id: c.id,
    label: c.name,
    subLabel: c.phone || c.businessName || c.email
  }));

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const filtered = options.filter(opt =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOptions(filtered);
  }, [searchTerm, customers]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setCoords({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width
          });
        }
      };
      
      updatePosition();
      
      const handleScroll = () => setIsOpen(false);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownEl = document.getElementById('customer-dropdown-portal');
      if (dropdownEl && dropdownEl.contains(event.target as Node)) {
        return;
      }
      
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
      setShowCreateForm(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Name and phone are required');
      return;
    }

    try {
      setIsCreating(true);
      const created = await buyerService.createBuyer({
        name: newCustomer.name,
        businessName: newCustomer.businessName || newCustomer.name,
        owner: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        address: newCustomer.address,
        city: newCustomer.city,
        state: newCustomer.state,
        pincode: newCustomer.pincode,
        gst: newCustomer.gst,
        pancard: '',
        status: 'active'
      });

      toast.success('Customer created successfully');
      onChange(created.id);
      setIsOpen(false);
      setShowCreateForm(false);
      setNewCustomer({
        name: '',
        businessName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gst: ''
      });
      
      if (onCustomerCreated) onCustomerCreated();
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    } finally {
      setIsCreating(false);
    }
  };

  const dropdownMenu = isOpen ? (
    <div 
      id="customer-dropdown-portal"
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden"
      style={{ 
        top: coords.top, 
        left: coords.left, 
        width: Math.max(coords.width, 400),
        maxHeight: '500px'
      }}
    >
      {!showCreateForm ? (
        <>
          <div className="p-2 border-b border-gray-100 bg-white">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 12px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #c1c1c1;
              border-radius: 6px;
              border: 3px solid #f1f1f1;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background-color: #a8a8a8;
            }
          `}</style>
          
          <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-500 text-center">
                No customers found
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  className={`px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between group ${
                    value === opt.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className={`font-medium truncate ${value === opt.id ? 'text-indigo-700' : 'group-hover:text-gray-900'}`}>
                      {opt.label}
                    </span>
                    {opt.subLabel && <span className="text-xs text-gray-500 truncate">{opt.subLabel}</span>}
                  </div>
                  {value === opt.id && <Check className="w-3 h-3 flex-shrink-0" />}
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 p-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Customer
            </button>
          </div>
        </>
      ) : (
        <div className="p-4 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Create New Customer</h3>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateCustomer} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Customer Name *
              </label>
              <div className="relative">
                <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter customer name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <div className="relative">
                <Building className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  value={newCustomer.businessName}
                  onChange={e => setNewCustomer({...newCustomer, businessName: e.target.value})}
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2 w-3 h-3 text-gray-400" />
                <textarea
                  value={newCustomer.address}
                  onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={2}
                  placeholder="Street address"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={newCustomer.city}
                  onChange={e => setNewCustomer({...newCustomer, city: e.target.value})}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={newCustomer.state}
                  onChange={e => setNewCustomer({...newCustomer, state: e.target.value})}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">PIN</label>
                <input
                  type="text"
                  value={newCustomer.pincode}
                  onChange={e => setNewCustomer({...newCustomer, pincode: e.target.value})}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="PIN"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                GST Number
              </label>
              <input
                type="text"
                value={newCustomer.gst}
                onChange={e => setNewCustomer({...newCustomer, gst: e.target.value.toUpperCase()})}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>}
      
      <div
        ref={buttonRef}
        className={`w-full px-3 py-2 bg-white border rounded-lg text-sm flex items-center justify-between cursor-pointer transition-shadow ${
          isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setSearchTerm('');
            setShowCreateForm(false);
          }
        }}
      >
        <div className="flex-1 truncate mr-2">
          {selectedOption ? (
            <div className="flex flex-col md:flex-row md:items-center gap-1 truncate">
              <span className="text-gray-900 font-medium truncate">{selectedOption.label}</span>
              {selectedOption.subLabel && (
                <span className="text-gray-400 text-xs hidden md:inline truncate">
                  ({selectedOption.subLabel})
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {typeof document !== 'undefined' && createPortal(dropdownMenu, document.body)}
    </div>
  );
}
