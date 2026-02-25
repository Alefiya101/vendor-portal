import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Award, User, LogOut, Settings, Bell, Home, UserPlus, ChevronDown, Package, ShoppingBag, Calendar, Phone, Mail, MapPin, Star, ArrowUpRight, ExternalLink, Copy } from 'lucide-react';

interface AgentDashboardProps {
  agentType: 'vendor-agent' | 'buyer-agent';
}

export function AgentDashboard({ agentType }: AgentDashboardProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'earnings'>('overview');

  const isVendorAgent = agentType === 'vendor-agent';
  const agentName = isVendorAgent ? "Rajesh Kumar" : "Priya Sharma";
  const agentRole = isVendorAgent ? "Vendor Onboarding Agent" : "Buyer Onboarding Agent";
  const agentId = isVendorAgent ? "VA-2025-001" : "BA-2025-001";
  
  const themeColors = isVendorAgent ? {
    primary: 'teal',
    gradient: 'from-teal-600 to-cyan-600',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-200',
    hover: 'hover:bg-teal-50',
    button: 'bg-teal-600 hover:bg-teal-700'
  } : {
    primary: 'cyan',
    gradient: 'from-cyan-600 to-blue-600',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    hover: 'hover:bg-cyan-50',
    button: 'bg-cyan-600 hover:bg-cyan-700'
  };

  const stats = [
    {
      label: 'Total Earnings',
      value: isVendorAgent ? '₹47,850' : '₹32,450',
      change: '+18.2%',
      icon: DollarSign,
      color: `text-emerald-600`,
      bg: 'bg-emerald-50'
    },
    {
      label: isVendorAgent ? 'Active Vendors' : 'Active Buyers',
      value: isVendorAgent ? '12' : '18',
      change: '+3 this month',
      icon: Users,
      color: `text-${themeColors.primary}-600`,
      bg: themeColors.bg
    },
    {
      label: 'Total Orders',
      value: isVendorAgent ? '156' : '243',
      change: '+45 this month',
      icon: ShoppingBag,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      label: 'Avg. Commission/Order',
      value: isVendorAgent ? '₹307' : '₹134',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  const clients = isVendorAgent ? [
    {
      id: 'V-001',
      name: 'Fashion Creations',
      contact: 'Amit Sharma',
      phone: '+91 98765 43210',
      email: 'amit@fashioncreations.com',
      city: 'Mumbai',
      joinDate: '15 Jan 2025',
      totalOrders: 47,
      totalRevenue: 1240000,
      yourEarnings: 18950,
      status: 'active',
      performance: 95
    },
    {
      id: 'V-002',
      name: 'Silk Heritage',
      contact: 'Deepak Patel',
      phone: '+91 98765 43211',
      email: 'deepak@silkheritage.com',
      city: 'Surat',
      joinDate: '22 Jan 2025',
      totalOrders: 38,
      totalRevenue: 980000,
      yourEarnings: 14500,
      status: 'active',
      performance: 88
    },
    {
      id: 'V-003',
      name: 'Designer Studio',
      contact: 'Kavita Singh',
      phone: '+91 98765 43212',
      email: 'kavita@designerstudio.com',
      city: 'Delhi',
      joinDate: '5 Feb 2025',
      totalOrders: 29,
      totalRevenue: 750000,
      yourEarnings: 8900,
      status: 'active',
      performance: 92
    },
    {
      id: 'V-004',
      name: 'Cotton Crafts',
      contact: 'Rahul Mehta',
      phone: '+91 98765 43213',
      email: 'rahul@cottoncrafts.com',
      city: 'Ahmedabad',
      joinDate: '18 Feb 2025',
      totalOrders: 15,
      totalRevenue: 420000,
      yourEarnings: 5500,
      status: 'active',
      performance: 78
    }
  ] : [
    {
      id: 'B-001',
      name: 'Kumar Fashion Hub',
      contact: 'Suresh Kumar',
      phone: '+91 98765 54321',
      email: 'suresh@kumarfashion.com',
      city: 'Bangalore',
      joinDate: '10 Jan 2025',
      totalOrders: 68,
      totalRevenue: 850000,
      yourEarnings: 9850,
      status: 'active',
      performance: 96
    },
    {
      id: 'B-002',
      name: 'Style Bazaar',
      contact: 'Neha Gupta',
      phone: '+91 98765 54322',
      email: 'neha@stylebazaar.com',
      city: 'Pune',
      joinDate: '15 Jan 2025',
      totalOrders: 54,
      totalRevenue: 680000,
      yourEarnings: 7800,
      status: 'active',
      performance: 91
    },
    {
      id: 'B-003',
      name: 'Metro Mart',
      contact: 'Vikram Shah',
      phone: '+91 98765 54323',
      email: 'vikram@metromart.com',
      city: 'Hyderabad',
      joinDate: '28 Jan 2025',
      totalOrders: 45,
      totalRevenue: 560000,
      yourEarnings: 6200,
      status: 'active',
      performance: 88
    },
    {
      id: 'B-004',
      name: 'Fashion Point',
      contact: 'Anjali Reddy',
      phone: '+91 98765 54324',
      email: 'anjali@fashionpoint.com',
      city: 'Chennai',
      joinDate: '8 Feb 2025',
      totalOrders: 38,
      totalRevenue: 475000,
      yourEarnings: 5350,
      status: 'active',
      performance: 85
    },
    {
      id: 'B-005',
      name: 'Ethnic Wear Shop',
      contact: 'Manoj Iyer',
      phone: '+91 98765 54325',
      email: 'manoj@ethnicwear.com',
      city: 'Coimbatore',
      joinDate: '20 Feb 2025',
      totalOrders: 22,
      totalRevenue: 280000,
      yourEarnings: 3250,
      status: 'active',
      performance: 79
    }
  ];

  const recentEarnings = isVendorAgent ? [
    { date: '24 Dec 2025', client: 'Fashion Creations', orderId: 'ORD-2025-089', orderValue: 64950, commission: 995, rate: '10%' },
    { date: '23 Dec 2025', client: 'Silk Heritage', orderId: 'ORD-2025-087', orderValue: 114975, commission: 998, rate: '10%' },
    { date: '22 Dec 2025', client: 'Designer Studio', orderId: 'ORD-2025-084', orderValue: 26000, commission: 280, rate: '10%' },
    { date: '21 Dec 2025', client: 'Fashion Creations', orderId: 'ORD-2025-082', orderValue: 89500, commission: 895, rate: '10%' },
    { date: '20 Dec 2025', client: 'Cotton Crafts', orderId: 'ORD-2025-079', orderValue: 45800, commission: 458, rate: '10%' },
  ] : [
    { date: '24 Dec 2025', client: 'Kumar Fashion Hub', orderId: 'ORD-2025-090', orderValue: 45000, commission: 225, rate: '5%' },
    { date: '23 Dec 2025', client: 'Style Bazaar', orderId: 'ORD-2025-088', orderValue: 38500, commission: 192, rate: '5%' },
    { date: '22 Dec 2025', client: 'Metro Mart', orderId: 'ORD-2025-085', orderValue: 52000, commission: 260, rate: '5%' },
    { date: '21 Dec 2025', client: 'Fashion Point', orderId: 'ORD-2025-083', orderValue: 29800, commission: 149, rate: '5%' },
    { date: '20 Dec 2025', client: 'Ethnic Wear Shop', orderId: 'ORD-2025-080', orderValue: 18500, commission: 92, rate: '5%' },
  ];

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
                  <UserPlus className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-lg font-semibold text-gray-900">Tashivar</span>
                <span className="text-xs text-gray-500">Agent</span>
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
                  onClick={() => setActiveTab('clients')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'clients'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" strokeWidth={2} />
                  <span>{isVendorAgent ? 'My Vendors' : 'My Buyers'}</span>
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
              <button className={`hidden lg:flex items-center gap-2 px-4 py-2 ${themeColors.button} text-white rounded-lg text-sm font-medium`}>
                <UserPlus className="w-4 h-4" strokeWidth={2} />
                Onboard {isVendorAgent ? 'Vendor' : 'Buyer'}
              </button>

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
                  <span className="hidden sm:block text-sm font-medium text-gray-900">{agentName}</span>
                  <div className={`w-8 h-8 bg-gradient-to-br ${themeColors.gradient} rounded-lg flex items-center justify-center text-white text-sm font-medium`}>
                    {agentName.charAt(0)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{agentName}</p>
                      <p className="text-xs text-gray-500">{agentRole}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{agentId}</p>
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
            Welcome back, {agentName.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-600">Track your {isVendorAgent ? 'vendor' : 'buyer'} onboarding performance and earnings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
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
                  <span className="text-gray-500">vs last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Tabs */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Top Performers */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Performing {isVendorAgent ? 'Vendors' : 'Buyers'}
                </h2>
                <div className="space-y-3">
                  {clients.slice(0, 5).map((client, index) => (
                    <div key={client.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{client.name}</p>
                        <p className="text-xs text-gray-600">{client.contact} • {client.city}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{client.totalOrders} orders</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">₹{(client.totalRevenue / 100000).toFixed(1)}L revenue</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-emerald-600">₹{client.yourEarnings.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Your earnings</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-medium text-gray-700">{client.performance}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              {/* Referral Link */}
              <div className={`bg-gradient-to-br ${themeColors.gradient} rounded-xl p-6 text-white`}>
                <h3 className="text-base font-semibold mb-2">Your Referral Link</h3>
                <p className="text-sm opacity-90 mb-4">Share this link to onboard new {isVendorAgent ? 'vendors' : 'buyers'}</p>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                  <p className="flex-1 text-sm font-mono truncate">tashivar.com/join/{agentId}</p>
                  <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                    <Copy className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* This Month */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">This Month</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">New {isVendorAgent ? 'Vendors' : 'Buyers'}</span>
                      <span className="text-lg font-semibold text-gray-900">{isVendorAgent ? '3' : '4'}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${themeColors.gradient} rounded-full`} style={{ width: '75%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Orders Processed</span>
                      <span className="text-lg font-semibold text-gray-900">{isVendorAgent ? '45' : '58'}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-600 to-purple-600 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Commission Earned</span>
                      <span className="text-lg font-semibold text-emerald-600">₹{isVendorAgent ? '12,450' : '8,920'}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-green-600 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((client) => (
                <div key={client.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">{client.name}</h3>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">Active</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{client.contact}</p>
                      <p className="text-xs text-gray-500">{client.id}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium text-gray-900">{client.performance}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="truncate">{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{client.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined: {client.joinDate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Orders</p>
                      <p className="text-lg font-semibold text-gray-900">{client.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Revenue</p>
                      <p className="text-lg font-semibold text-gray-900">₹{(client.totalRevenue / 100000).toFixed(1)}L</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Your Earnings</p>
                      <p className="text-lg font-semibold text-emerald-600">₹{client.yourEarnings.toLocaleString()}</p>
                    </div>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center justify-center gap-2">
                    View Details
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Commission Earnings</h2>
              <div className="space-y-3">
                {recentEarnings.map((earning, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{earning.orderId}</p>
                        <span className={`px-2 py-0.5 ${themeColors.bg} ${themeColors.text} rounded text-xs font-medium`}>
                          {earning.rate}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{earning.client}</p>
                      <p className="text-xs text-gray-500">{earning.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-0.5">Order: ₹{earning.orderValue.toLocaleString()}</p>
                      <p className="text-lg font-semibold text-emerald-600">₹{earning.commission.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Your commission</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
