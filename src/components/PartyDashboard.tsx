import React, { useState } from 'react';
import { Package, TrendingUp, DollarSign, ShoppingBag, User, LogOut, Settings, Bell, Home, ChevronDown, Truck, Calendar, Scissors, Palette, Camera, Phone, Mail, MapPin, Star, Check, X, Clock } from 'lucide-react';

interface PartyDashboardProps {
  partyType?: 'designer' | 'stitching-master';
}

export function PartyDashboard({ partyType = 'designer' }: PartyDashboardProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'earnings'>('overview');
  const [orderFilter, setOrderFilter] = useState('all');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const isDesigner = partyType === 'designer';
  const partyName = isDesigner ? "Creative Designs Studio" : "Master Tailors";
  const contactPerson = isDesigner ? "Priya Patel" : "Ramesh Kumar";
  const partyId = isDesigner ? "DES-2025-001" : "STM-2025-001";
  
  const themeColors = isDesigner ? {
    primary: 'pink',
    gradient: 'from-pink-600 to-rose-600',
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    hover: 'hover:bg-pink-50',
    button: 'bg-pink-600 hover:bg-pink-700',
    icon: Palette
  } : {
    primary: 'purple',
    gradient: 'from-purple-600 to-indigo-600',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-50',
    button: 'bg-purple-600 hover:bg-purple-700',
    icon: Scissors
  };

  const Icon = themeColors.icon;

  const stats = [
    {
      label: 'Total Earnings',
      value: isDesigner ? '₹84,250' : '₹56,800',
      change: '+22.4%',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Active Orders',
      value: isDesigner ? '18' : '24',
      change: '+6 new',
      icon: ShoppingBag,
      color: `text-${themeColors.primary}-600`,
      bg: themeColors.bg
    },
    {
      label: 'Completed',
      value: isDesigner ? '142' : '189',
      change: '+28 this month',
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Avg. Commission',
      value: isDesigner ? '₹593' : '₹300',
      change: '+8.5%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  const orders = [
    {
      id: 'ORD-2025-089',
      buyer: 'Kumar Fashion Hub',
      vendor: 'Fashion Creations',
      product: 'Premium Cotton Kurta Set',
      quantity: 50,
      orderValue: 64950,
      commission: isDesigner ? 1299 : 649,
      percentage: isDesigner ? 20 : 10,
      status: 'pending',
      date: '24 Dec 2025',
      daysAgo: '2 hours ago',
      priority: 'high'
    },
    {
      id: 'ORD-2025-087',
      buyer: 'Style Bazaar',
      vendor: 'Fashion Creations',
      product: 'Royal Silk Sherwani',
      quantity: 25,
      orderValue: 114975,
      commission: isDesigner ? 2875 : 1150,
      percentage: isDesigner ? 25 : 10,
      status: 'confirmed',
      date: '23 Dec 2025',
      daysAgo: 'Yesterday',
      priority: 'high'
    },
    {
      id: 'ORD-2025-084',
      buyer: 'Metro Mart',
      vendor: 'Silk Heritage',
      product: 'Designer Lehenga Choli',
      quantity: 15,
      orderValue: 89250,
      commission: isDesigner ? 2231 : 893,
      percentage: isDesigner ? 25 : 10,
      status: 'in-progress',
      date: '22 Dec 2025',
      daysAgo: '2 days ago',
      priority: 'medium'
    },
    {
      id: 'ORD-2025-082',
      buyer: 'Fashion Point',
      vendor: 'Designer Studio',
      product: 'Embroidered Saree Collection',
      quantity: 30,
      orderValue: 135000,
      commission: isDesigner ? 4050 : 1350,
      percentage: isDesigner ? 30 : 10,
      status: 'in-progress',
      date: '21 Dec 2025',
      daysAgo: '3 days ago',
      priority: 'high'
    },
    {
      id: 'ORD-2025-079',
      buyer: 'Ethnic Wear Shop',
      vendor: 'Cotton Crafts',
      product: 'Party Wear Anarkali',
      quantity: 40,
      orderValue: 78000,
      commission: isDesigner ? 1560 : 780,
      percentage: isDesigner ? 20 : 10,
      status: 'dispatched',
      date: '20 Dec 2025',
      daysAgo: '4 days ago',
      priority: 'medium'
    },
    {
      id: 'ORD-2025-075',
      buyer: 'Kumar Fashion Hub',
      vendor: 'Fashion Creations',
      product: 'Bridal Palazzo Set',
      quantity: 20,
      orderValue: 98000,
      commission: isDesigner ? 2450 : 980,
      percentage: isDesigner ? 25 : 10,
      status: 'dispatched',
      date: '19 Dec 2025',
      daysAgo: '5 days ago',
      priority: 'low'
    },
    {
      id: 'ORD-2025-072',
      buyer: 'Style Bazaar',
      vendor: 'Silk Heritage',
      product: 'Indo-Western Fusion Wear',
      quantity: 35,
      orderValue: 87500,
      commission: isDesigner ? 1750 : 875,
      percentage: isDesigner ? 20 : 10,
      status: 'completed',
      date: '18 Dec 2025',
      daysAgo: '6 days ago',
      priority: 'low'
    },
    {
      id: 'ORD-2025-068',
      buyer: 'Metro Mart',
      vendor: 'Designer Studio',
      product: 'Traditional Silk Dhoti Kurta',
      quantity: 45,
      orderValue: 112500,
      commission: isDesigner ? 2813 : 1125,
      percentage: isDesigner ? 25 : 10,
      status: 'completed',
      date: '17 Dec 2025',
      daysAgo: '1 week ago',
      priority: 'low'
    },
    {
      id: 'ORD-2025-065',
      buyer: 'Fashion Point',
      vendor: 'Cotton Crafts',
      product: 'Designer Kurti with Palazzo',
      quantity: 60,
      orderValue: 72000,
      commission: isDesigner ? 1440 : 720,
      percentage: isDesigner ? 20 : 10,
      status: 'completed',
      date: '16 Dec 2025',
      daysAgo: '1 week ago',
      priority: 'low'
    },
    {
      id: 'ORD-2025-061',
      buyer: 'Ethnic Wear Shop',
      vendor: 'Fashion Creations',
      product: 'Festive Bandhani Collection',
      quantity: 25,
      orderValue: 56250,
      commission: isDesigner ? 1688 : 563,
      percentage: isDesigner ? 30 : 10,
      status: 'completed',
      date: '15 Dec 2025',
      daysAgo: '1 week ago',
      priority: 'low'
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Pending', icon: Clock };
      case 'confirmed':
        return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed', icon: Check };
      case 'in-progress':
        return { bg: 'bg-violet-50', text: 'text-violet-700', label: 'In Progress', icon: Package };
      case 'dispatched':
        return { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Dispatched', icon: Truck };
      case 'completed':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Completed', icon: Check };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', label: 'Unknown', icon: Clock };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-700';
      case 'medium': return 'bg-amber-100 text-amber-700';
      case 'low': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(o => o.status === orderFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${themeColors.gradient} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-lg font-semibold text-gray-900">Tashivar</span>
                <span className="text-xs text-gray-500">{isDesigner ? 'Designer' : 'Stitching Master'}</span>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-4 h-4" strokeWidth={2} />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" strokeWidth={2} />
                  <span>My Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('earnings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'earnings'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4" strokeWidth={2} />
                  <span>Earnings</span>
                </button>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" strokeWidth={2} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative ml-2">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-gray-100 rounded-lg"
                >
                  <span className="hidden sm:block text-sm font-medium text-gray-900">{contactPerson}</span>
                  <div className={`w-8 h-8 bg-gradient-to-br ${themeColors.gradient} rounded-lg flex items-center justify-center text-white text-sm font-medium`}>
                    {contactPerson.charAt(0)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{contactPerson}</p>
                      <p className="text-xs text-gray-500">{partyName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{partyId}</p>
                    </div>
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <User className="w-4 h-4" strokeWidth={2} />
                      Profile
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <Settings className="w-4 h-4" strokeWidth={2} />
                      Settings
                    </button>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button className="w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                        <LogOut className="w-4 h-4" strokeWidth={2} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Welcome back, {contactPerson.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-600">Track your assigned {isDesigner ? 'design' : 'stitching'} work and earnings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <StatIcon className={`w-5 h-5 ${stat.color}`} strokeWidth={2} />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                  <span className="text-emerald-600 font-medium">{stat.change}</span>
                  <span className="text-gray-500">vs last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Assigned Orders</h2>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">{order.id}</p>
                            <span className={`px-2 py-0.5 ${statusConfig.bg} ${statusConfig.text} rounded text-xs font-medium flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConfig.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(order.priority)}`}>
                              {order.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{order.product}</p>
                          <p className="text-xs text-gray-500">{order.buyer} • {order.quantity} pcs</p>
                          <p className="text-xs text-gray-400 mt-1">{order.daysAgo}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-emerald-600">₹{order.commission.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{order.percentage}% commission</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="space-y-6">
              <div className={`bg-gradient-to-br ${themeColors.gradient} rounded-xl p-6 text-white`}>
                <h3 className="text-base font-semibold mb-2">Your Performance</h3>
                <p className="text-sm opacity-90 mb-4">Keep up the excellent work!</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span>Quality Rating</span>
                      <span className="font-semibold">4.9/5.0</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '98%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span>On-Time Delivery</span>
                      <span className="font-semibold">96%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '96%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span>Client Satisfaction</span>
                      <span className="font-semibold">98%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: '98%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">This Month</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Orders</span>
                    <span className="text-lg font-semibold text-gray-900">{isDesigner ? '18' : '24'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-lg font-semibold text-emerald-600">{isDesigner ? '28' : '35'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="text-lg font-semibold text-violet-600">{isDesigner ? '12' : '16'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Total Earned</span>
                    <span className="text-xl font-semibold text-emerald-600">₹{isDesigner ? '22,450' : '15,800'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex gap-2 mb-6">
              {['all', 'pending', 'confirmed', 'in-progress', 'dispatched', 'completed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    orderFilter === filter
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter === 'in-progress' ? 'In Progress' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold text-gray-900">{order.id}</h3>
                          <span className={`px-2.5 py-1 ${statusConfig.bg} ${statusConfig.text} rounded-lg text-xs font-medium flex items-center gap-1.5`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getPriorityColor(order.priority)}`}>
                            Priority: {order.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{order.buyer}</p>
                        <p className="text-sm text-gray-900 font-medium mb-3">{order.product}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-medium text-gray-900">{order.quantity} pieces</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Order Value</p>
                            <p className="font-medium text-gray-900">₹{order.orderValue.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Your Commission</p>
                            <p className="font-medium text-emerald-600">₹{order.commission.toLocaleString()} ({order.percentage}%)</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Order Date</p>
                            <p className="font-medium text-gray-900">{order.date}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-emerald-600">₹{order.commission.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Your earnings</p>
                      </div>
                    </div>
                    
                    {(order.status === 'confirmed' || order.status === 'in-progress') && (
                      <div className="pt-4 border-t border-gray-200">
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDispatchModal(true);
                          }}
                          className={`w-full px-4 py-2 ${themeColors.button} text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2`}
                        >
                          <Truck className="w-4 h-4" strokeWidth={2} />
                          Add Dispatch Details
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Commission Earnings History</h2>
              <div className="space-y-3">
                {orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">{order.id}</p>
                          <span className={`px-2 py-0.5 ${statusConfig.bg} ${statusConfig.text} rounded text-xs font-medium`}>
                            {statusConfig.label}
                          </span>
                          <span className={`px-2 py-0.5 ${themeColors.bg} ${themeColors.text} rounded text-xs font-medium`}>
                            {order.percentage}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{order.product}</p>
                        <p className="text-xs text-gray-500">{order.buyer} • {order.quantity} pcs • {order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-0.5">Order: ₹{order.orderValue.toLocaleString()}</p>
                        <p className="text-lg font-semibold text-emerald-600">₹{order.commission.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Your commission</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Submit Work Completion</h3>
              <p className="text-sm text-gray-600 mt-1">Order: {selectedOrder.id}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Completion Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Upload Work Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">Photos of completed work</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Add any notes about the work..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert(`Work completion submitted for ${selectedOrder.id}!`);
                    setShowDispatchModal(false);
                  }}
                  className={`flex-1 px-4 py-2 ${themeColors.button} text-white rounded-lg font-medium`}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
