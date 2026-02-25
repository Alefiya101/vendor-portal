import React, { useState } from 'react';
import { Package, Clock, CheckCircle, Truck, Users, DollarSign, Search, Filter, Eye, Plus, Calendar, AlertCircle, TrendingUp, X } from 'lucide-react';

interface ManufacturingDashboardProps {
  onCreatePO: (customOrder?: any) => void;
  manufacturingOrders?: any[];
}

export function ManufacturingDashboard({ onCreatePO, manufacturingOrders = [] }: ManufacturingDashboardProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const sampleOrders = [
    {
      id: 'MPO-2025-001',
      customOrderId: 'CO-1735296000000',
      productName: 'Premium Silk Sherwani',
      quantity: 50,
      buyer: 'Kumar Fashion Hub',
      status: 'in-production',
      basePrice: 4000,
      totalCommission: 12500,
      totalAmount: 212500,
      targetDate: '2025-01-15',
      createdDate: '2024-12-20',
      vendors: [
        { type: 'fabric-vendor', name: 'Silk Heritage', commission: 5000, status: 'completed', progress: 100 },
        { type: 'designer', name: 'Creative Designs Studio', commission: 4500, status: 'in-progress', progress: 75 },
        { type: 'stitching-master', name: 'Master Tailors', commission: 3000, status: 'pending', progress: 0 }
      ],
      overallProgress: 58
    },
    {
      id: 'MPO-2025-002',
      customOrderId: 'CO-1735296100000',
      productName: 'Designer Lehenga Choli',
      quantity: 25,
      buyer: 'Style Bazaar',
      status: 'dispatched',
      basePrice: 5500,
      totalCommission: 17500,
      totalAmount: 155000,
      targetDate: '2025-01-10',
      createdDate: '2024-12-18',
      vendors: [
        { type: 'fabric-vendor', name: 'Cotton Crafts', commission: 6000, status: 'completed', progress: 100 },
        { type: 'designer', name: 'Fashion Creations', commission: 7000, status: 'completed', progress: 100 },
        { type: 'embroidery-vendor', name: 'Zari Works', commission: 4500, status: 'completed', progress: 100 }
      ],
      overallProgress: 100
    },
    {
      id: 'MPO-2025-003',
      customOrderId: null,
      productName: 'Indo-Western Fusion Collection',
      quantity: 100,
      buyer: 'Metro Mart',
      status: 'pending-approval',
      basePrice: 2200,
      totalCommission: 28000,
      totalAmount: 248000,
      targetDate: '2025-01-25',
      createdDate: '2024-12-23',
      vendors: [
        { type: 'fabric-vendor', name: 'Fabric World', commission: 10000, status: 'assigned', progress: 0 },
        { type: 'designer', name: 'Designer Studio', commission: 12000, status: 'assigned', progress: 0 },
        { type: 'stitching-master', name: 'Perfect Stitching', commission: 6000, status: 'assigned', progress: 0 }
      ],
      overallProgress: 0
    },
    {
      id: 'MPO-2025-004',
      customOrderId: 'CO-1735296200000',
      productName: 'Traditional Saree Collection',
      quantity: 75,
      buyer: 'Fashion Point',
      status: 'quality-check',
      basePrice: 3800,
      totalCommission: 21375,
      totalAmount: 306375,
      targetDate: '2025-01-12',
      createdDate: '2024-12-19',
      vendors: [
        { type: 'fabric-vendor', name: 'Silk Heritage', commission: 9000, status: 'completed', progress: 100 },
        { type: 'designer', name: 'Creative Designs Studio', commission: 9375, status: 'completed', progress: 100 },
        { type: 'printing-vendor', name: 'Digital Prints', commission: 3000, status: 'completed', progress: 100 }
      ],
      overallProgress: 95
    }
  ];

  const allOrders = [...sampleOrders, ...manufacturingOrders];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending-approval':
        return { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Pending Approval', icon: Clock };
      case 'in-production':
        return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'In Production', icon: Package };
      case 'quality-check':
        return { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Quality Check', icon: AlertCircle };
      case 'dispatched':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Dispatched', icon: Truck };
      case 'completed':
        return { bg: 'bg-green-50', text: 'text-green-700', label: 'Completed', icon: CheckCircle };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Unknown', icon: Clock };
    }
  };

  const getVendorStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'assigned': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOrders = allOrders.filter(order => {
    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = [
    {
      label: 'Total Manufacturing Orders',
      value: allOrders.length.toString(),
      change: '+4 this month',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'In Production',
      value: allOrders.filter(o => o.status === 'in-production').length.toString(),
      change: 'Active now',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      label: 'Total Value',
      value: `₹${(allOrders.reduce((sum, o) => sum + o.totalAmount, 0) / 100000).toFixed(1)}L`,
      change: '+18.5%',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Active Vendors',
      value: '15',
      change: '3 new',
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2} />
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                <span className="text-emerald-600 font-medium">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Manufacturing Purchase Orders</h2>
          <p className="text-sm text-gray-600 mt-1">Track all custom manufacturing orders with multi-vendor management</p>
        </div>
        <button
          onClick={() => onCreatePO()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Create Manufacturing PO
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by PO ID, product, or buyer..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending-approval', 'in-production', 'quality-check', 'dispatched', 'completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter === 'all' ? 'All' :
               filter === 'pending-approval' ? 'Pending Approval' :
               filter === 'in-production' ? 'In Production' :
               filter === 'quality-check' ? 'Quality Check' :
               filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          const StatusIcon = statusConfig.icon;
          const daysLeft = Math.ceil((new Date(order.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                    <span className={`px-3 py-1 ${statusConfig.bg} ${statusConfig.text} rounded-lg text-xs font-medium flex items-center gap-1.5`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig.label}
                    </span>
                    {order.customOrderId && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                        Custom: {order.customOrderId}
                      </span>
                    )}
                  </div>
                  <p className="text-base font-medium text-gray-900 mb-1">{order.productName}</p>
                  <p className="text-sm text-gray-600">Buyer: {order.buyer} • {order.quantity} pieces</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="text-2xl font-semibold text-blue-600">₹{order.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Commission: ₹{order.totalCommission.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-medium text-gray-900">{order.overallProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      order.overallProgress === 100 ? 'bg-emerald-600' :
                      order.overallProgress >= 50 ? 'bg-blue-600' : 'bg-orange-600'
                    }`}
                    style={{ width: `${order.overallProgress}%` }}
                  />
                </div>
              </div>

              {/* Vendors */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Manufacturing Parties ({order.vendors.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {order.vendors.map((vendor, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getVendorStatusColor(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{vendor.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Commission</span>
                        <span className="font-medium text-gray-900">₹{vendor.commission.toLocaleString()}</span>
                      </div>
                      <div className="mt-2">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              vendor.progress === 100 ? 'bg-emerald-600' :
                              vendor.progress > 0 ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                            style={{ width: `${vendor.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                    <span>Target: {new Date(order.targetDate).toLocaleDateString()}</span>
                  </div>
                  {daysLeft > 0 && (
                    <div className={`flex items-center gap-1.5 ${daysLeft <= 3 ? 'text-rose-600' : daysLeft <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
                      <Clock className="w-4 h-4" strokeWidth={2} />
                      <span>{daysLeft} days left</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPO(order)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  <Eye className="w-4 h-4" strokeWidth={2} />
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No manufacturing orders found</h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Create your first manufacturing PO to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => onCreatePO()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Create Manufacturing PO
            </button>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{selectedPO.id}</h3>
                <button
                  onClick={() => setSelectedPO(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Product Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Product</p>
                      <p className="font-medium text-gray-900">{selectedPO.productName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Quantity</p>
                      <p className="font-medium text-gray-900">{selectedPO.quantity} pieces</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Buyer</p>
                      <p className="font-medium text-gray-900">{selectedPO.buyer}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Target Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedPO.targetDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Cost Breakdown</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Amount</span>
                      <span className="font-medium">₹{(selectedPO.basePrice * selectedPO.quantity).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Commission (All Vendors)</span>
                      <span className="font-medium">₹{selectedPO.totalCommission.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                      <span className="font-medium text-gray-900">Total PO Amount</span>
                      <span className="text-lg font-semibold text-blue-600">₹{selectedPO.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Vendor Details</h4>
                  <div className="space-y-3">
                    {selectedPO.vendors.map((vendor: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{vendor.name}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getVendorStatusColor(vendor.status)}`}>
                            {vendor.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {vendor.type.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Commission</span>
                          <span className="font-semibold text-emerald-600">₹{vendor.commission.toLocaleString()}</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{vendor.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                vendor.progress === 100 ? 'bg-emerald-600' :
                                vendor.progress > 0 ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                              style={{ width: `${vendor.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}