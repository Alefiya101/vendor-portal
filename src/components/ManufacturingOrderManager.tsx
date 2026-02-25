import React, { useState, useEffect } from 'react';
import { 
  Scissors, Plus, Search, Filter, Calendar, FileText, 
  Clock, CheckCircle, AlertCircle, Package, User, 
  Truck, Eye, Download, Printer, ChevronRight, X, Edit, Trash2, DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as manufacturingService from '../services/manufacturingService';
import * as vendorService from '../services/vendorService';
import * as productService from '../services/productService';
import { printChallan } from './ChallanGenerator';
import { ChallanPrintModal } from './ChallanPrintModal';
import { LoadingSpinner, ButtonWithLoading, TableSkeleton, CardSkeleton } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields } from '../utils/security';
import { apiClient, handleApiError } from '../utils/apiClient';

interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  orderDate: string;
  
  // Source Material
  sourceFabricId?: string;
  sourceFabricName: string;
  sourceFabricQuantity: number;
  sourceFabricUnit: 'pieces' | 'meters';
  sourceFabricImage?: string;
  
  // Output Product
  outputProductName: string;
  outputQuantity: number;
  outputUnit: 'pieces' | 'meters';
  
  // Parties
  stitchingMasterId?: string;
  stitchingMasterName: string;
  designerId?: string;
  designerName?: string;
  
  // Costs
  fabricCost: number;
  stitchingCost: number;
  designCost: number;
  additionalCosts: Array<{
    id: string;
    description: string;
    amount: number;
  }>;
  totalCost: number;
  
  // Dates
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  
  // Status
  status: 'pending' | 'in-production' | 'completed' | 'cancelled';
  
  // Challan Info
  challanGenerated: boolean;
  challanNumber?: string;
  challanDate?: string;
  
  // Additional Fields
  notes?: string;
  internalReference?: string;
}

interface Challan {
  id: string;
  challanNumber: string;
  challanDate: string;
  manufacturingOrderId: string;
  
  // Issuer Details (Your Company)
  issuerName: string;
  issuerAddress: string;
  issuerGSTIN?: string;
  issuerPhone?: string;
  
  // Receiver Details (Stitching Master/Designer)
  receiverName: string;
  receiverAddress: string;
  receiverGSTIN?: string;
  receiverPhone?: string;
  
  // Material Details
  materials: Array<{
    name: string;
    quantity: number;
    unit: 'pieces' | 'meters';
    description?: string;
  }>;
  
  // Service Costs (Fabric, Fusing, Stitching, Stone, Handwork, etc.)
  serviceCosts?: Array<{
    id: string;
    serviceName: string;
    costPerUnit: number;
    totalUnits?: number;
    totalCost?: number;
  }>;
  
  // Extra Fields
  purposeOfDispatch: string; // e.g., "Manufacturing", "Processing", "Job Work"
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  expectedReturnDate?: string;
  transportMode?: 'own_vehicle' | 'courier' | 'pickup' | 'other';
  transportDetails?: string;
  
  // Terms
  terms?: string;
  specialInstructions?: string;
  
  status: 'issued' | 'in-transit' | 'received' | 'returned' | 'cancelled';
}

export function ManufacturingOrderManager() {
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'challans'>('orders');
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showCreateChallanModal, setShowCreateChallanModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form states
  const [orderForm, setOrderForm] = useState<Partial<ManufacturingOrder>>({
    orderDate: new Date().toISOString().split('T')[0],
    sourceFabricUnit: 'pieces',
    outputUnit: 'pieces',
    status: 'pending',
    challanGenerated: false,
    additionalCosts: []
  });
  
  // Default company details for issuer
  const DEFAULT_COMPANY_DETAILS = {
    issuerName: 'Tashivar Fashion Pvt Ltd',
    issuerAddress: 'Plot No. 123, Fashion District, Surat, Gujarat - 395001, India',
    issuerGSTIN: '24XXXXX1234X1Z5',
    issuerPhone: '+91 98765 43210'
  };
  
  const [challanForm, setChallanForm] = useState<Partial<Challan>>({
    challanDate: new Date().toISOString().split('T')[0],
    purposeOfDispatch: 'Manufacturing',
    transportMode: 'own_vehicle',
    status: 'issued',
    materials: [],
    serviceCosts: [],
    ...DEFAULT_COMPANY_DETAILS
  });
  
  const [vendors, setVendors] = useState<any[]>([]);
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [newServiceCost, setNewServiceCost] = useState({ serviceName: '', costPerUnit: '', totalUnits: '' });
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersData, challansData, vendorsData, productsData] = await Promise.all([
        manufacturingService.getAllOrders(),
        manufacturingService.getAllChallans(),
        vendorService.getAllVendors(),
        productService.getAllProducts()
      ]);
      
      // @ts-ignore
      setOrders(ordersData || []);
      // @ts-ignore
      setChallans(challansData || []);
      setVendors(vendorsData || []);
      setFabrics(productsData.filter((p: any) => p.type === 'fabric') || []);
    } catch (err) {
      console.error('Failed to load manufacturing data:', err);
      const message = handleApiError(err);
      setError(message);
      toast.error(`Failed to load data: ${message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateOrder = async () => {
    try {
      // Validation with proper error messages
      const validation = validateRequiredFields(orderForm, [
        'sourceFabricName',
        'outputProductName',
        'stitchingMasterName',
        'sourceFabricQuantity',
        'outputQuantity',
        'expectedCompletionDate'
      ]);
      
      if (!validation.valid) {
        toast.error(`Missing required fields: ${validation.missing.join(', ')}`);
        return;
      }
      
      setActionLoading('create-order');
      
      const totalCost = (orderForm.fabricCost || 0) + 
                       (orderForm.stitchingCost || 0) + 
                       (orderForm.designCost || 0) + 
                       (orderForm.additionalCosts?.reduce((sum, cost) => sum + cost.amount, 0) || 0);
      
      // Sanitize inputs
      const newOrder: ManufacturingOrder = {
        id: `MFG-${Date.now()}`,
        orderNumber: `MFG-${Date.now().toString().slice(-6)}`,
        ...orderForm as ManufacturingOrder,
        sourceFabricName: sanitizeString(orderForm.sourceFabricName || ''),
        outputProductName: sanitizeString(orderForm.outputProductName || ''),
        stitchingMasterName: sanitizeString(orderForm.stitchingMasterName || ''),
        designerName: orderForm.designerName ? sanitizeString(orderForm.designerName) : undefined,
        notes: orderForm.notes ? sanitizeString(orderForm.notes) : undefined,
        totalCost,
        challanGenerated: false
      };
      
      await manufacturingService.createOrder(newOrder);
      toast.success(`Manufacturing order ${newOrder.orderNumber} created successfully!`);
      setShowCreateOrderModal(false);
      setOrderForm({
        orderDate: new Date().toISOString().split('T')[0],
        sourceFabricUnit: 'pieces',
        outputUnit: 'pieces',
        status: 'pending',
        challanGenerated: false,
        additionalCosts: []
      });
      loadData();
    } catch (err) {
      console.error('Failed to create manufacturing order:', err);
      toast.error(`Failed to create order: ${handleApiError(err)}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleCreateChallan = async () => {
    try {
      if (!selectedOrder) {
        toast.error('Please select a manufacturing order');
        return;
      }
      
      // Validation
      const validation = validateRequiredFields(challanForm, [
        'issuerName',
        'receiverName',
        'challanDate',
        'purposeOfDispatch'
      ]);
      
      if (!validation.valid) {
        toast.error(`Missing required fields: ${validation.missing.join(', ')}`);
        return;
      }
      
      if (!challanForm.materials || challanForm.materials.length === 0) {
        toast.error('Please add at least one material item');
        return;
      }
      
      setActionLoading('create-challan');
      
      // Sanitize inputs
      const newChallan: Challan = {
        id: `CHN-${Date.now()}`,
        challanNumber: `CHN-${Date.now().toString().slice(-6)}`,
        manufacturingOrderId: selectedOrder.id,
        ...challanForm as Challan,
        issuerName: sanitizeString(challanForm.issuerName || ''),
        issuerAddress: sanitizeString(challanForm.issuerAddress || ''),
        receiverName: sanitizeString(challanForm.receiverName || ''),
        receiverAddress: sanitizeString(challanForm.receiverAddress || ''),
        purposeOfDispatch: sanitizeString(challanForm.purposeOfDispatch || ''),
        vehicleNumber: challanForm.vehicleNumber ? sanitizeString(challanForm.vehicleNumber) : undefined,
        driverName: challanForm.driverName ? sanitizeString(challanForm.driverName) : undefined,
        terms: challanForm.terms ? sanitizeString(challanForm.terms) : undefined,
        specialInstructions: challanForm.specialInstructions ? sanitizeString(challanForm.specialInstructions) : undefined
      };
      
      await manufacturingService.createChallan(newChallan);
      
      // Update order to mark challan as generated
      await manufacturingService.updateOrder(selectedOrder.id, {
        challanGenerated: true,
        challanNumber: newChallan.challanNumber,
        challanDate: newChallan.challanDate
      });
      
      toast.success(`Challan ${newChallan.challanNumber} created successfully!`);
      setShowCreateChallanModal(false);
      setChallanForm({
        challanDate: new Date().toISOString().split('T')[0],
        purposeOfDispatch: 'Manufacturing',
        transportMode: 'own_vehicle',
        status: 'issued',
        materials: [],
        serviceCosts: [],
        ...DEFAULT_COMPANY_DETAILS
      });
      setNewServiceCost({ serviceName: '', costPerUnit: '', totalUnits: '' });
      setSelectedOrder(null);
      loadData();
    } catch (err) {
      console.error('Failed to create challan:', err);
      toast.error(`Failed to create challan: ${handleApiError(err)}`);
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleAddServiceCost = () => {
    if (!newServiceCost.serviceName || !newServiceCost.costPerUnit) {
      toast.error('Please fill service name and cost per unit');
      return;
    }

    const costPerUnit = parseFloat(newServiceCost.costPerUnit);
    const totalUnits = newServiceCost.totalUnits ? parseFloat(newServiceCost.totalUnits) : 1;
    
    if (isNaN(costPerUnit) || costPerUnit <= 0) {
      toast.error('Cost per unit must be a positive number');
      return;
    }
    
    if (isNaN(totalUnits) || totalUnits <= 0) {
      toast.error('Total units must be a positive number');
      return;
    }
    
    const totalCost = costPerUnit * totalUnits;

    const serviceItem = {
      id: `SVC-${Date.now()}`,
      serviceName: sanitizeString(newServiceCost.serviceName),
      costPerUnit,
      totalUnits,
      totalCost
    };

    setChallanForm({
      ...challanForm,
      serviceCosts: [...(challanForm.serviceCosts || []), serviceItem]
    });

    setNewServiceCost({ serviceName: '', costPerUnit: '', totalUnits: '' });
    toast.success(`${serviceItem.serviceName} added: ₹${totalCost.toLocaleString()}`);
  };

  const removeServiceCost = (id: string) => {
    setChallanForm({
      ...challanForm,
      serviceCosts: (challanForm.serviceCosts || []).filter(s => s.id !== id)
    });
    toast.success('Service cost removed');
  };
  
  const handlePrintChallan = (challan: Challan) => {
    setSelectedChallan(challan);
    setShowPrintModal(true);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'in-production':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'issued':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'in-transit':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'received':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'returned':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.outputProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.stitchingMasterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const filteredChallans = challans.filter(challan => {
    const matchesSearch = challan.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challan.receiverName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || challan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manufacturing Orders</h2>
          <p className="text-sm text-gray-600">Manage internal production and job work</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'orders' && (
            <button
              onClick={() => setShowCreateOrderModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              <Plus className="w-5 h-5" />
              New Order
            </button>
          )}
          {activeTab === 'challans' && (
            <button
              onClick={() => {
                if (orders.length === 0) {
                  toast.error('Create a manufacturing order first');
                  return;
                }
                setShowCreateChallanModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
            >
              <FileText className="w-5 h-5" />
              New Challan
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-2 text-sm font-medium transition-colors ${
            activeTab === 'orders'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4" />
            Manufacturing Orders ({orders.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('challans')}
          className={`pb-3 px-2 text-sm font-medium transition-colors ${
            activeTab === 'challans'
              ? 'border-b-2 border-amber-600 text-amber-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Challans ({challans.length})
          </div>
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'orders' ? 'Search orders...' : 'Search challans...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          {activeTab === 'orders' ? (
            <>
              <option value="pending">Pending</option>
              <option value="in-production">In Production</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </>
          ) : (
            <>
              <option value="issued">Issued</option>
              <option value="in-transit">In Transit</option>
              <option value="received">Received</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
            </>
          )}
        </select>
      </div>
      
      {/* Content */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} columns={7} />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
              <p className="text-rose-600 font-medium mb-2">Failed to load manufacturing orders</p>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => loadData()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No manufacturing orders found</p>
              <button
                onClick={() => setShowCreateOrderModal(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create First Order
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Output Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stitching Master</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{order.outputProductName}</p>
                        <p className="text-xs text-gray-500">From: {order.sourceFabricName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{order.stitchingMasterName}</p>
                      {order.designerName && (
                        <p className="text-xs text-gray-500">Designer: {order.designerName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{order.outputQuantity} {order.outputUnit}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusColor(order.status)}`}>
                        {order.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {order.challanGenerated ? (
                        <div>
                          <p className="text-xs text-emerald-600 font-medium">✓ Generated</p>
                          <p className="text-xs text-gray-500">{order.challanNumber}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setChallanForm({
                              ...challanForm,
                              manufacturingOrderId: order.id,
                              receiverName: order.stitchingMasterName,
                              materials: [{
                                name: order.sourceFabricName,
                                quantity: order.sourceFabricQuantity,
                                unit: order.sourceFabricUnit
                              }]
                            });
                            setShowCreateChallanModal(true);
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Generate Challan
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {/* View details */}}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => {/* Edit */}}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {activeTab === 'challans' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
              <p className="text-rose-600 font-medium mb-2">Failed to load challans</p>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => loadData()}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Retry
              </button>
            </div>
          ) : filteredChallans.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No challans found</p>
              <button
                onClick={() => {
                  if (orders.length === 0) {
                    toast.error('Create a manufacturing order first');
                    return;
                  }
                  setShowCreateChallanModal(true);
                }}
                className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Create First Challan
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Challan #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receiver</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Materials</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredChallans.map((challan) => (
                  <tr key={challan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{challan.challanNumber}</p>
                        <p className="text-xs text-gray-500">{new Date(challan.challanDate).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{challan.receiverName}</p>
                        {challan.receiverPhone && (
                          <p className="text-xs text-gray-500">{challan.receiverPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{challan.materials.length} item(s)</p>
                      <p className="text-xs text-gray-500">
                        {challan.materials.map(m => `${m.quantity} ${m.unit}`).join(', ')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{challan.purposeOfDispatch}</p>
                      {challan.transportMode && (
                        <p className="text-xs text-gray-500">{challan.transportMode.replace('_', ' ')}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusColor(challan.status)}`}>
                        {challan.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintChallan(challan)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Printer className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => {/* View details */}}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* Create Order Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Manufacturing Order</h3>
              <button onClick={() => setShowCreateOrderModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Order Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Order Date *</label>
                <input
                  type="date"
                  value={orderForm.orderDate}
                  onChange={(e) => setOrderForm({...orderForm, orderDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              {/* Source Fabric */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Source Fabric Name *</label>
                  <input
                    type="text"
                    value={orderForm.sourceFabricName || ''}
                    onChange={(e) => setOrderForm({...orderForm, sourceFabricName: e.target.value})}
                    placeholder="e.g., Cotton Fabric"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Quantity *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={orderForm.sourceFabricQuantity || ''}
                      onChange={(e) => setOrderForm({...orderForm, sourceFabricQuantity: parseFloat(e.target.value)})}
                      placeholder="100"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <select
                      value={orderForm.sourceFabricUnit}
                      onChange={(e) => setOrderForm({...orderForm, sourceFabricUnit: e.target.value as 'pieces' | 'meters'})}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pieces">Pieces</option>
                      <option value="meters">Meters</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Output Product */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Output Product Name *</label>
                  <input
                    type="text"
                    value={orderForm.outputProductName || ''}
                    onChange={(e) => setOrderForm({...orderForm, outputProductName: e.target.value})}
                    placeholder="e.g., Kurta Set"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Output Quantity *</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={orderForm.outputQuantity || ''}
                      onChange={(e) => setOrderForm({...orderForm, outputQuantity: parseFloat(e.target.value)})}
                      placeholder="50"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    <select
                      value={orderForm.outputUnit}
                      onChange={(e) => setOrderForm({...orderForm, outputUnit: e.target.value as 'pieces' | 'meters'})}
                      className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pieces">Pieces</option>
                      <option value="meters">Meters</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Stitching Master *</label>
                  <select
                    value={orderForm.stitchingMasterName || ''}
                    onChange={(e) => {
                      const vendor = vendors.find(v => v.name === e.target.value);
                      setOrderForm({
                        ...orderForm,
                        stitchingMasterName: e.target.value,
                        stitchingMasterId: vendor?.id
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select stitching master</option>
                    {vendors.filter(v => v.type === 'stitching-master').map(v => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Designer (Optional)</label>
                  <select
                    value={orderForm.designerName || ''}
                    onChange={(e) => {
                      const vendor = vendors.find(v => v.name === e.target.value);
                      setOrderForm({
                        ...orderForm,
                        designerName: e.target.value,
                        designerId: vendor?.id
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select designer</option>
                    {vendors.filter(v => v.type === 'designer').map(v => (
                      <option key={v.id} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Costs */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Fabric Cost (₹)</label>
                    <input
                      type="number"
                      value={orderForm.fabricCost || ''}
                      onChange={(e) => setOrderForm({...orderForm, fabricCost: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Stitching Cost (₹)</label>
                    <input
                      type="number"
                      value={orderForm.stitchingCost || ''}
                      onChange={(e) => setOrderForm({...orderForm, stitchingCost: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Design Cost (₹)</label>
                    <input
                      type="number"
                      value={orderForm.designCost || ''}
                      onChange={(e) => setOrderForm({...orderForm, designCost: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                {/* Additional Costs Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-900">Additional Costs</label>
                    <button
                      type="button"
                      onClick={() => {
                        const additionalCosts = orderForm.additionalCosts || [];
                        setOrderForm({
                          ...orderForm,
                          additionalCosts: [
                            ...additionalCosts,
                            {
                              id: `AC-${Date.now()}`,
                              description: '',
                              amount: 0
                            }
                          ]
                        });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Cost
                    </button>
                  </div>
                  
                  {orderForm.additionalCosts && orderForm.additionalCosts.length > 0 && (
                    <div className="space-y-2">
                      {orderForm.additionalCosts.map((cost, index) => (
                        <div key={cost.id} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg">
                          <input
                            type="text"
                            value={cost.description}
                            onChange={(e) => {
                              const newCosts = [...(orderForm.additionalCosts || [])];
                              newCosts[index].description = e.target.value;
                              setOrderForm({...orderForm, additionalCosts: newCosts});
                            }}
                            placeholder="e.g., Thread, Buttons, Transport"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                          <input
                            type="number"
                            value={cost.amount || ''}
                            onChange={(e) => {
                              const newCosts = [...(orderForm.additionalCosts || [])];
                              newCosts[index].amount = parseFloat(e.target.value) || 0;
                              setOrderForm({...orderForm, additionalCosts: newCosts});
                            }}
                            placeholder="Amount"
                            className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newCosts = orderForm.additionalCosts?.filter((_, i) => i !== index);
                              setOrderForm({...orderForm, additionalCosts: newCosts});
                            }}
                            className="p-2 hover:bg-rose-100 rounded text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-end pt-2 border-t border-gray-200">
                        <div className="text-sm">
                          <span className="text-gray-600">Additional Costs Total: </span>
                          <span className="font-semibold text-gray-900">
                            ₹{orderForm.additionalCosts.reduce((sum, cost) => sum + (cost.amount || 0), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(!orderForm.additionalCosts || orderForm.additionalCosts.length === 0) && (
                    <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg">
                      No additional costs added. Click "Add Cost" to add items like thread, buttons, transport, etc.
                    </div>
                  )}
                </div>
                
                {/* Total Cost Display */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Manufacturing Cost:</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ₹{(
                        (orderForm.fabricCost || 0) +
                        (orderForm.stitchingCost || 0) +
                        (orderForm.designCost || 0) +
                        (orderForm.additionalCosts?.reduce((sum, cost) => sum + (cost.amount || 0), 0) || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Expected Completion Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Expected Completion Date *</label>
                <input
                  type="date"
                  value={orderForm.expectedCompletionDate || ''}
                  onChange={(e) => setOrderForm({...orderForm, expectedCompletionDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
                <textarea
                  value={orderForm.notes || ''}
                  onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  placeholder="Any special instructions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCreateOrderModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <ButtonWithLoading
                onClick={handleCreateOrder}
                loading={actionLoading === 'create-order'}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
              >
                Create Order
              </ButtonWithLoading>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Challan Modal */}
      {showCreateChallanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Manufacturing Challan</h3>
              <button onClick={() => setShowCreateChallanModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Select Manufacturing Order */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Manufacturing Order *</label>
                <select
                  value={selectedOrder?.id || ''}
                  onChange={(e) => {
                    const order = orders.find(o => o.id === e.target.value);
                    setSelectedOrder(order || null);
                    if (order) {
                      setChallanForm({
                        ...challanForm,
                        receiverName: order.stitchingMasterName,
                        materials: [{
                          name: order.sourceFabricName,
                          quantity: order.sourceFabricQuantity,
                          unit: order.sourceFabricUnit
                        }]
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">Select manufacturing order</option>
                  {orders.filter(o => !o.challanGenerated).map(o => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} - {o.outputProductName} ({o.stitchingMasterName})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Challan Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Challan Date *</label>
                <input
                  type="date"
                  value={challanForm.challanDate}
                  onChange={(e) => setChallanForm({...challanForm, challanDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              {/* Issuer Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-4">Issuer Details (Your Company)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={challanForm.issuerName || ''}
                      onChange={(e) => setChallanForm({...challanForm, issuerName: e.target.value})}
                      placeholder="Tashivar Fashion Pvt Ltd"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={challanForm.issuerGSTIN || ''}
                      onChange={(e) => setChallanForm({...challanForm, issuerGSTIN: e.target.value})}
                      placeholder="27XXXXX1234X1ZX"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Address *</label>
                    <textarea
                      value={challanForm.issuerAddress || ''}
                      onChange={(e) => setChallanForm({...challanForm, issuerAddress: e.target.value})}
                      placeholder="Complete address with city, state, pincode"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={challanForm.issuerPhone || ''}
                      onChange={(e) => setChallanForm({...challanForm, issuerPhone: e.target.value})}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Receiver Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-4">Receiver Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Name *</label>
                    <input
                      type="text"
                      value={challanForm.receiverName || ''}
                      onChange={(e) => setChallanForm({...challanForm, receiverName: e.target.value})}
                      placeholder="Stitching master or designer name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={challanForm.receiverGSTIN || ''}
                      onChange={(e) => setChallanForm({...challanForm, receiverGSTIN: e.target.value})}
                      placeholder="27XXXXX1234X1ZX"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Address *</label>
                    <textarea
                      value={challanForm.receiverAddress || ''}
                      onChange={(e) => setChallanForm({...challanForm, receiverAddress: e.target.value})}
                      placeholder="Complete address with city, state, pincode"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={challanForm.receiverPhone || ''}
                      onChange={(e) => setChallanForm({...challanForm, receiverPhone: e.target.value})}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Transport & Extra Fields */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-4">Transport & Additional Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Purpose of Dispatch *</label>
                    <input
                      type="text"
                      value={challanForm.purposeOfDispatch}
                      onChange={(e) => setChallanForm({...challanForm, purposeOfDispatch: e.target.value})}
                      placeholder="Manufacturing / Job Work / Processing"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Transport Mode</label>
                    <select
                      value={challanForm.transportMode}
                      onChange={(e) => setChallanForm({...challanForm, transportMode: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="own_vehicle">Own Vehicle</option>
                      <option value="courier">Courier</option>
                      <option value="pickup">Self Pickup</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {challanForm.transportMode === 'own_vehicle' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Vehicle Number</label>
                        <input
                          type="text"
                          value={challanForm.vehicleNumber || ''}
                          onChange={(e) => setChallanForm({...challanForm, vehicleNumber: e.target.value})}
                          placeholder="MH02 AB 1234"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Driver Name</label>
                        <input
                          type="text"
                          value={challanForm.driverName || ''}
                          onChange={(e) => setChallanForm({...challanForm, driverName: e.target.value})}
                          placeholder="Driver name"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Driver Phone</label>
                        <input
                          type="tel"
                          value={challanForm.driverPhone || ''}
                          onChange={(e) => setChallanForm({...challanForm, driverPhone: e.target.value})}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Expected Return Date</label>
                    <input
                      type="date"
                      value={challanForm.expectedReturnDate || ''}
                      onChange={(e) => setChallanForm({...challanForm, expectedReturnDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Service Costs Section */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                  Service Costs (Fabric, Fusing, Stitching, Stone, Handwork, etc.)
                </h4>
                
                {/* Add Service Cost Form */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Service Name *</label>
                      <input
                        type="text"
                        value={newServiceCost.serviceName}
                        onChange={(e) => setNewServiceCost({...newServiceCost, serviceName: e.target.value})}
                        placeholder="e.g., Fabric, Stitching, Stone"
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cost Per Unit *</label>
                      <input
                        type="number"
                        value={newServiceCost.costPerUnit}
                        onChange={(e) => setNewServiceCost({...newServiceCost, costPerUnit: e.target.value})}
                        placeholder="100"
                        step="0.01"
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Total Units (Optional)</label>
                      <input
                        type="number"
                        value={newServiceCost.totalUnits}
                        onChange={(e) => setNewServiceCost({...newServiceCost, totalUnits: e.target.value})}
                        placeholder="1"
                        step="0.01"
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddServiceCost}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Service Cost
                  </button>
                </div>

                {/* Service Costs List */}
                {challanForm.serviceCosts && challanForm.serviceCosts.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Added Service Costs:</p>
                    {challanForm.serviceCosts.map((service) => (
                      <div key={service.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{service.serviceName}</p>
                          <p className="text-xs text-gray-600">
                            ₹{service.costPerUnit.toFixed(2)} × {service.totalUnits || 1} units = ₹{service.totalCost?.toFixed(2) || service.costPerUnit.toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeServiceCost(service.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                      <p className="text-sm font-semibold text-gray-900">
                        Total Service Costs: ₹{challanForm.serviceCosts.reduce((sum, s) => sum + (s.totalCost || s.costPerUnit), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Terms & Instructions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Terms & Conditions</label>
                  <textarea
                    value={challanForm.terms || ''}
                    onChange={(e) => setChallanForm({...challanForm, terms: e.target.value})}
                    placeholder="Material to be returned after processing..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Special Instructions</label>
                  <textarea
                    value={challanForm.specialInstructions || ''}
                    onChange={(e) => setChallanForm({...challanForm, specialInstructions: e.target.value})}
                    placeholder="Handle with care, quality check required..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCreateChallanModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium"
              >
                Cancel
              </button>
              <ButtonWithLoading
                onClick={handleCreateChallan}
                loading={actionLoading === 'create-challan'}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50"
              >
                Create Challan
              </ButtonWithLoading>
            </div>
          </div>
        </div>
      )}
      
      {/* Print Challan Modal */}
      {showPrintModal && selectedChallan && (
        <ChallanPrintModal
          challan={{
            challanNumber: selectedChallan.challanNumber,
            challanDate: selectedChallan.challanDate,
            customerName: selectedChallan.receiverName,
            customerAddress: selectedChallan.receiverAddress,
            customerPhone: selectedChallan.receiverPhone,
            customerGSTIN: selectedChallan.receiverGSTIN,
            items: [
              ...selectedChallan.materials.map((m, i) => ({
                srNo: i + 1,
                name: m.name,
                quantity: m.quantity,
                unit: m.unit,
                description: m.description,
                rate: 0,
                amount: 0
              })),
              ...(selectedChallan.serviceCosts || []).map((s, i) => ({
                srNo: selectedChallan.materials.length + i + 1,
                name: `Service: ${s.serviceName}`,
                quantity: s.totalUnits || 1,
                unit: 'units',
                rate: s.costPerUnit,
                amount: s.totalCost || s.costPerUnit
              }))
            ],
            subtotal: (selectedChallan.serviceCosts || []).reduce((sum, s) => sum + (s.totalCost || s.costPerUnit), 0),
            totalAmount: (selectedChallan.serviceCosts || []).reduce((sum, s) => sum + (s.totalCost || s.costPerUnit), 0),
            notes: `Purpose: ${selectedChallan.purposeOfDispatch}\n${selectedChallan.specialInstructions || ''}`
          }}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedChallan(null);
          }}
        />
      )}
    </div>
  );
}