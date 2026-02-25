import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scissors, Search, Filter, Plus, Clock, CheckCircle, 
  AlertCircle, ChevronRight, Package, User, Truck, 
  Calendar, FileText, Download, Eye, MoreVertical, X, Upload, Trash2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import * as vendorService from '../services/vendorService';
import * as productService from '../services/productService';
import * as commissionService from '../services/commissionService';

import * as manufacturingService from '../services/manufacturingService';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Default fabric placeholder image
const DEFAULT_FABRIC_IMAGE = 'https://images.unsplash.com/photo-1519699047748-40ba52c79303?w=300';

interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  sourceFabricId: string;
  sourceFabricName: string;
  sourceFabricImage: string;
  quantity: number;
  status: 'planned' | 'in-production' | 'quality-check' | 'completed' | 'cancelled';
  
  // Parties involved
  stitchingMasterId: string;
  stitchingMasterName: string;
  designerId?: string;
  designerName?: string;
  
  processCosts?: {
    id: string;
    processName: string;
    vendorId?: string;
    vendorName?: string;
    costPerUnit: number;
    notes?: string;
  }[];
  
  // Dates
  issuedDate: string;
  expectedDate: string;
  completedDate?: string;
  
  // Financials
  fabricCostPerUnit: number;
  manufacturingCostPerUnit: number;
  totalManufacturingCost: number;
  expectedSellingPrice: number;
  
  notes?: string;
}

export function ManufacturingModule() {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const data = await manufacturingService.getAllOrders();
    // @ts-ignore
    setOrders(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'in-production': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'quality-check': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const handleCreateOrder = async (newOrder: ManufacturingOrder) => {
    try {
      await manufacturingService.createOrder(newOrder);
      await loadOrders();
      setShowCreateModal(false);
      toast.success('Manufacturing order created successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create manufacturing order');
    }
  };

  // Calculate stats dynamically
  const completedThisMonth = orders.filter(o => {
    if (o.status !== 'completed' || !o.completedDate) return false;
    const completedDate = new Date(o.completedDate);
    const now = new Date();
    return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
  }).length;

  const avgTurnaround = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === 'completed' && o.completedDate && o.issuedDate);
    if (completedOrders.length === 0) return 0;
    
    const totalDays = completedOrders.reduce((sum, order) => {
      const start = new Date(order.issuedDate).getTime();
      const end = new Date(order.completedDate!).getTime();
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return Math.round(totalDays / completedOrders.length);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Manufacturing Orders</h2>
          <p className="text-sm text-gray-600 mt-1">Track internal production from fabric to ready-made</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Production Order
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active Orders</p>
            <Scissors className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {orders.filter(o => ['planned', 'in-production', 'quality-check'].includes(o.status)).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">In Production</p>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {orders.filter(o => o.status === 'in-production').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completed (This Month)</p>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{completedThisMonth}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg. Turnaround</p>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{avgTurnaround} Days</p>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'active' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Active Orders
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All History
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search order no, fabric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <ImageWithFallback
                  src={order.sourceFabricImage || DEFAULT_FABRIC_IMAGE} 
                  alt="Fabric" 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)} capitalize`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{order.sourceFabricName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Quantity: {order.quantity} pcs</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Due: {new Date(order.expectedDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Issued: {new Date(order.issuedDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Stitching Master</p>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-indigo-600" />
                      <span className="text-sm font-medium text-gray-900">{order.stitchingMasterName}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Designer</p>
                    <span className="text-sm text-gray-900">
                      {order.designerName ? (
                        <span className="flex items-center gap-2">
                          <User className="w-3 h-3 text-pink-600" />
                          {order.designerName}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not Assigned</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-end items-center gap-2">
                    <button 
                      className="px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailsModal(true);
                      }}
                    >
                      View Details
                    </button>
                    <button 
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowStatusModal(true);
                      }}
                    >
                      Update Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <Scissors className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No Orders Found</h3>
            <p className="text-sm text-gray-500 mt-1">Start a new manufacturing order to track production</p>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <CreateManufacturingOrderModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateOrder}
        />
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedOrder && (
        <UpdateStatusModal 
          order={selectedOrder}
          onClose={() => setShowStatusModal(false)}
        />
      )}
    </div>
  );
}

function CreateManufacturingOrderModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (order: ManufacturingOrder) => void }) {
  const [formData, setFormData] = useState<Partial<ManufacturingOrder>>({
    status: 'planned',
    issuedDate: new Date().toISOString().split('T')[0],
    quantity: 1,
    processCosts: []
  });
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [masters, setMasters] = useState<any[]>([]);
  const [designers, setDesigners] = useState<any[]>([]);
  const [allVendors, setAllVendors] = useState<any[]>([]);
  const [showAddFabric, setShowAddFabric] = useState(false);
  
  // New process state
  const [newProcess, setNewProcess] = useState({
    processName: '',
    vendorId: '',
    costPerUnit: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allProducts = await productService.getAllProducts();
    const allPartners = await vendorService.getAllVendors();
    
    // Sort fabrics so newest are first
    const fabricList = allProducts
      .filter(p => p.type === 'fabric' && p.status === 'approved')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
    setFabrics(fabricList);
    setAllVendors(allPartners);
    setMasters(allPartners.filter(p => p.type === 'stitching-master'));
    setDesigners(allPartners.filter(p => p.type === 'designer'));
  };

  const handleNewFabricAdded = async (newFabric: any) => {
    await loadData(); // Reload list to get new fabric
    
    // Auto-select the new fabric
    setFormData({
      ...formData,
      sourceFabricId: newFabric.id,
      sourceFabricName: newFabric.name,
      sourceFabricImage: newFabric.images[0],
      fabricCostPerUnit: parseFloat(newFabric.suggestedPrice)
    });
    
    setShowAddFabric(false);
  };

  const handleAddProcess = () => {
    if (!newProcess.processName || !newProcess.costPerUnit) {
      toast.error('Please fill process name and cost');
      return;
    }

    const vendor = allVendors.find(v => v.id === newProcess.vendorId);
    
    const costItem = {
      id: `PROC-${Date.now()}`,
      processName: newProcess.processName,
      vendorId: newProcess.vendorId,
      vendorName: vendor ? vendor.name : 'In-House/Other',
      costPerUnit: parseFloat(newProcess.costPerUnit)
    };

    const updatedCosts = [...(formData.processCosts || []), costItem];
    const totalMfgCost = updatedCosts.reduce((sum, item) => sum + item.costPerUnit, 0);

    setFormData({
      ...formData,
      processCosts: updatedCosts,
      manufacturingCostPerUnit: totalMfgCost
    });

    setNewProcess({
      processName: '',
      vendorId: '',
      costPerUnit: ''
    });
  };

  const removeProcess = (id: string) => {
    const updatedCosts = (formData.processCosts || []).filter(p => p.id !== id);
    const totalMfgCost = updatedCosts.reduce((sum, item) => sum + item.costPerUnit, 0);
    
    setFormData({
      ...formData,
      processCosts: updatedCosts,
      manufacturingCostPerUnit: totalMfgCost
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order: ManufacturingOrder = {
      ...formData as ManufacturingOrder,
      id: `MFG-${Date.now()}`,
      orderNumber: `MO-${Math.floor(Math.random() * 10000)}`,
      totalManufacturingCost: (formData.quantity || 0) * (formData.manufacturingCostPerUnit || 0)
    };
    onSubmit(order);
  };

  if (showAddFabric) {
    return (
      <AddFabricModal 
        onClose={() => setShowAddFabric(false)} 
        onSuccess={handleNewFabricAdded} 
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">New Manufacturing Order</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Fabric Selection */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-900">Select Source Fabric *</label>
                <button 
                  type="button" 
                  onClick={() => setShowAddFabric(true)}
                  className="text-xs text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  New Fabric / PO
                </button>
              </div>
              <select 
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                value={formData.sourceFabricId || ''}
                onChange={(e) => {
                  const fabric = fabrics.find(f => f.id === e.target.value);
                  if (fabric) {
                    setFormData({
                      ...formData,
                      sourceFabricId: fabric.id,
                      sourceFabricName: fabric.name,
                      sourceFabricImage: fabric.images[0],
                      fabricCostPerUnit: parseFloat(fabric.suggestedPrice)
                    });
                  }
                }}
              >
                <option value="">Choose a fabric...</option>
                {fabrics.map(f => (
                  <option key={f.id} value={f.id}>{f.name} (Qty: {f.quantity})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Quantity (pcs) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Expected Completion *</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Party Selection (Primary) */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900">Primary Responsibilities</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Stitching Master *</label>
                <select 
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  onChange={(e) => {
                    const master = masters.find(m => m.id === e.target.value);
                    if (master) {
                      setFormData({
                        ...formData,
                        stitchingMasterId: master.id,
                        stitchingMasterName: master.owner || master.name
                      });
                    }
                  }}
                >
                  <option value="">Select Master...</option>
                  {masters.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.owner})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Designer</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  onChange={(e) => {
                    const designer = designers.find(d => d.id === e.target.value);
                    if (designer) {
                      setFormData({
                        ...formData,
                        designerId: designer.id,
                        designerName: designer.owner || designer.name
                      });
                    }
                  }}
                >
                  <option value="">Select Designer...</option>
                  {designers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Detailed Cost Breakdown */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900">Process Cost Breakdown</h4>
            
            {/* Added Processes List */}
            {formData.processCosts && formData.processCosts.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.processCosts.map((proc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{proc.processName}</p>
                      <p className="text-xs text-gray-500">{proc.vendorName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">₹{proc.costPerUnit}</span>
                      <button 
                        type="button" 
                        onClick={() => removeProcess(proc.id)}
                        className="text-gray-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Process Form */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-3">Add Process Cost</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input 
                  type="text"
                  placeholder="Process (e.g. Embroidery)"
                  className="px-3 py-2 border border-indigo-200 rounded-lg text-sm"
                  value={newProcess.processName}
                  onChange={(e) => setNewProcess({...newProcess, processName: e.target.value})}
                  list="process-suggestions"
                />
                <datalist id="process-suggestions">
                  <option value="Stitching" />
                  <option value="Embroidery" />
                  <option value="Dyeing" />
                  <option value="Printing" />
                  <option value="Finishing" />
                  <option value="Design Fee" />
                </datalist>

                <select 
                  className="px-3 py-2 border border-indigo-200 rounded-lg text-sm"
                  value={newProcess.vendorId}
                  onChange={(e) => setNewProcess({...newProcess, vendorId: e.target.value})}
                >
                  <option value="">Select Vendor (Optional)</option>
                  {allVendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <input 
                    type="number"
                    placeholder="Cost"
                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm"
                    value={newProcess.costPerUnit}
                    onChange={(e) => setNewProcess({...newProcess, costPerUnit: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={handleAddProcess}
                    className="px-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Financials Summary */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <h4 className="font-semibold text-gray-900">Total Financials</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Cost (per unit)</label>
                <input
                  type="number"
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500"
                  value={formData.fabricCostPerUnit || 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Total Mfg Cost (per unit)</label>
                <input
                  type="number"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg font-medium text-gray-900"
                  value={formData.manufacturingCostPerUnit || 0}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">Final Selling Price (Ready Made) *</label>
                <input
                  type="number"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Enter expected selling price"
                  onChange={(e) => setFormData({...formData, expectedSellingPrice: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="pt-2 flex justify-between items-center text-sm border-t border-gray-200 mt-2">
              <span className="text-gray-600">Total Estimated Cost (Qty: {formData.quantity}):</span>
              <span className="font-bold text-2xl text-indigo-600">
                ₹{((formData.quantity || 0) * ((formData.fabricCostPerUnit || 0) + (formData.manufacturingCostPerUnit || 0))).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddFabricModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (fabric: any) => void }) {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    vendorId: '',
    costPrice: '',
    suggestedPrice: '',
    moq: '1',
    quantity: '',
    purchaseCommission: '10'
  });
  
  // Use a default fabric image
  const defaultImage = "https://images.unsplash.com/photo-1519699047748-40ba52c79303?w=300";

  useEffect(() => {
    vendorService.getAllVendors().then(allVendors => {
      setVendors(allVendors.filter(v => !v.type || v.type === 'vendor'));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const selectedVendor = vendors.find(v => v.id === formData.vendorId);
      
      // 1. Create Product (acts as PO too)
      const newProduct = await productService.createProduct({
        name: formData.name,
        type: 'fabric',
        category: 'Fabric',
        vendor: selectedVendor?.name || 'Unknown',
        vendorId: formData.vendorId,
        images: [defaultImage],
        description: `Fabric Purchase from ${selectedVendor?.name}`,
        costPrice: parseFloat(formData.costPrice),
        suggestedPrice: parseFloat(formData.suggestedPrice),
        moq: parseInt(formData.moq),
        quantity: parseInt(formData.quantity),
        status: 'approved',
        totalCost: parseFloat(formData.quantity) * parseFloat(formData.costPrice),
        stitchingCost: 0
      });

      // 2. Create Commission Rule
      await commissionService.createCommissionRule({
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'single', // Use simple model for quick add
        saleCommissionRate: 20, // Default sale commission
        saleDistribution: [{ role: 'Platform', name: 'Tashivar', phone: '', percentage: 100 }],
        purchaseCommissionRate: parseFloat(formData.purchaseCommission),
        purchaseDistribution: [{ role: 'Vendor', name: selectedVendor?.name || '', phone: selectedVendor?.phone || '', percentage: 100 }]
      });

      toast.success('Fabric Product & Purchase Order created');
      onSuccess(newProduct);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create fabric purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Add New Fabric (Purchase Order)</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Fabric Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Premium Silk Roll"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Vendor *</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              value={formData.vendorId}
              onChange={e => setFormData({...formData, vendorId: e.target.value})}
            >
              <option value="">Select Vendor...</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Purchase Cost (per unit) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  required
                  className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg"
                  value={formData.costPrice}
                  onChange={e => setFormData({...formData, costPrice: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Selling Price (for Ready Made) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  required
                  className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg"
                  value={formData.suggestedPrice}
                  onChange={e => setFormData({...formData, suggestedPrice: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Quantity (Meters/Units) *</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Purchase Commission (%)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                value={formData.purchaseCommission}
                onChange={e => setFormData({...formData, purchaseCommission: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailsModal({ order, onClose }: { order: ManufacturingOrder, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-900">Source Fabric</label>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <ImageWithFallback
                    src={order.sourceFabricImage} 
                    alt="Fabric" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.sourceFabricName}</h3>
                  <p className="text-sm text-gray-600 font-medium">Quantity: {order.quantity} pcs</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Expected Completion</label>
                <p className="text-sm text-gray-600 font-medium">{new Date(order.expectedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Issued Date</label>
                <p className="text-sm text-gray-600 font-medium">{new Date(order.issuedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Party Selection (Primary) */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900">Primary Responsibilities</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Stitching Master</label>
                <p className="text-sm text-gray-600 font-medium">{order.stitchingMasterName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Designer</label>
                <p className="text-sm text-gray-600 font-medium">{order.designerName || 'Not Assigned'}</p>
              </div>
            </div>
          </div>

          {/* Detailed Cost Breakdown */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900">Process Cost Breakdown</h4>
            
            {/* Added Processes List */}
            {order.processCosts && order.processCosts.length > 0 && (
              <div className="space-y-2 mb-4">
                {order.processCosts.map((proc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{proc.processName}</p>
                      <p className="text-xs text-gray-500">{proc.vendorName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">₹{proc.costPerUnit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financials Summary */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <h4 className="font-semibold text-gray-900">Total Financials</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Cost (per unit)</label>
                <input
                  type="number"
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500"
                  value={order.fabricCostPerUnit || 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Total Mfg Cost (per unit)</label>
                <input
                  type="number"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg font-medium text-gray-900"
                  value={order.manufacturingCostPerUnit || 0}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">Final Selling Price (Ready Made)</label>
                <input
                  type="number"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg font-medium text-gray-900"
                  value={order.expectedSellingPrice || 0}
                />
              </div>
            </div>
            
            <div className="pt-2 flex justify-between items-center text-sm border-t border-gray-200 mt-2">
              <span className="text-gray-600">Total Estimated Cost (Qty: {order.quantity}):</span>
              <span className="font-bold text-2xl text-indigo-600">
                ₹{((order.quantity || 0) * ((order.fabricCostPerUnit || 0) + (order.manufacturingCostPerUnit || 0))).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UpdateStatusModal({ order, onClose }: { order: ManufacturingOrder, onClose: () => void }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      await manufacturingService.updateOrderStatus(order.id, newStatus, notes);
      toast.success('Order status updated successfully');
      onClose();
      // Trigger page refresh to reload orders
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Update Order Status</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-900">Source Fabric</label>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <ImageWithFallback
                    src={order.sourceFabricImage} 
                    alt="Fabric" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.sourceFabricName}</h3>
                  <p className="text-sm text-gray-600 font-medium">Quantity: {order.quantity} pcs</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Expected Completion</label>
                <p className="text-sm text-gray-600 font-medium">{new Date(order.expectedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Issued Date</label>
                <p className="text-sm text-gray-600 font-medium">{new Date(order.issuedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Party Selection (Primary) */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900">Primary Responsibilities</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Stitching Master</label>
                <p className="text-sm text-gray-600 font-medium">{order.stitchingMasterName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Designer</label>
                <p className="text-sm text-gray-600 font-medium">{order.designerName || 'Not Assigned'}</p>
              </div>
            </div>
          </div>

          {/* Detailed Cost Breakdown */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900">Process Cost Breakdown</h4>
            
            {/* Added Processes List */}
            {order.processCosts && order.processCosts.length > 0 && (
              <div className="space-y-2 mb-4">
                {order.processCosts.map((proc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{proc.processName}</p>
                      <p className="text-xs text-gray-500">{proc.vendorName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">₹{proc.costPerUnit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financials Summary */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
            <h4 className="font-semibold text-gray-900">Total Financials</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fabric Cost (per unit)</label>
                <input
                  type="number"
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500"
                  value={order.fabricCostPerUnit || 0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Total Mfg Cost (per unit)</label>
                <input
                  type="number"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg font-medium text-gray-900"
                  value={order.manufacturingCostPerUnit || 0}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">Final Selling Price (Ready Made)</label>
                <input
                  type="number"
                  readOnly
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg font-medium text-gray-900"
                  value={order.expectedSellingPrice || 0}
                />
              </div>
            </div>
            
            <div className="pt-2 flex justify-between items-center text-sm border-t border-gray-200 mt-2">
              <span className="text-gray-600">Total Estimated Cost (Qty: {order.quantity}):</span>
              <span className="font-bold text-2xl text-indigo-600">
                ₹{((order.quantity || 0) * ((order.fabricCostPerUnit || 0) + (order.manufacturingCostPerUnit || 0))).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-900">Update Status</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">New Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as ManufacturingOrder['status'])}
                >
                  <option value="planned">Planned</option>
                  <option value="in-production">In Production</option>
                  <option value="quality-check">Quality Check</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdateStatus}
              className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}