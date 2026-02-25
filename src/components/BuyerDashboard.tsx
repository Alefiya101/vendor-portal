import React, { useState } from 'react';
import { Search, ShoppingCart, User, Bell, Settings, LogOut, Package, TrendingUp, Clock, Star, Heart, Filter, Grid, List, ShoppingBag, Sparkles, Eye, Home, Layers, Bookmark, History, MapPin, CreditCard, ChevronDown, ArrowRight, Truck, CheckCircle, XCircle, Calendar, Download, MoreVertical, FileText, MessageSquare, Plus } from 'lucide-react';
import { Card } from './Card';
import { CustomOrderForm } from './CustomOrderForm';

interface BuyerDashboardProps {
  onViewProduct: (productId: string) => void;
  onViewCart: () => void;
}

export function BuyerDashboard({ onViewProduct, onViewCart }: BuyerDashboardProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeNav, setActiveNav] = useState('home');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showCustomOrderForm, setShowCustomOrderForm] = useState(false);
  const [customOrders, setCustomOrders] = useState<any[]>([]);

  const userName = "Rajesh Kumar";
  const businessName = "Kumar Fashion Hub";

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Bookmark },
  ];

  const handleCustomOrderSubmit = (orderData: any) => {
    setCustomOrders([...customOrders, orderData]);
    setShowCustomOrderForm(false);
    alert(`Custom order ${orderData.id} submitted successfully! Admin will review and create manufacturing PO.`);
  };

  const stats = [
    { 
      label: 'Total Orders',
      value: '156',
      change: '+12.5%',
      icon: ShoppingBag,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    { 
      label: 'Pending',
      value: '8',
      change: '3 today',
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    { 
      label: 'This Month',
      value: '₹2.8L',
      change: '+28%',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    { 
      label: 'Saved',
      value: '24',
      change: '6 in stock',
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-50'
    },
  ];

  const orderFilters = [
    { id: 'all', label: 'All Orders', count: 156 },
    { id: 'pending', label: 'Pending', count: 8 },
    { id: 'confirmed', label: 'Confirmed', count: 12 },
    { id: 'shipped', label: 'Shipped', count: 23 },
    { id: 'delivered', label: 'Delivered', count: 108 },
    { id: 'cancelled', label: 'Cancelled', count: 5 }
  ];

  const orders = [
    {
      id: 'ORD-2025-156',
      date: '2025-01-15',
      status: 'delivered',
      items: 3,
      quantity: 85,
      total: 112450,
      expectedDelivery: '2025-01-18',
      actualDelivery: '2025-01-17',
      products: [
        {
          name: 'Premium Cotton Kurta Set',
          code: 'TSV-KRT-001',
          quantity: 50,
          price: 1299,
          image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=100'
        },
        {
          name: 'Designer Nehru Jacket',
          code: 'TSV-NHR-089',
          quantity: 25,
          price: 2199,
          image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100'
        },
        {
          name: 'Printed Kurta Pyjama',
          code: 'TSV-KRT-156',
          quantity: 10,
          price: 899,
          image: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=100'
        }
      ],
      tracking: {
        courier: 'Delhivery',
        trackingId: 'DELH785623419',
        timeline: [
          { status: 'Order Placed', date: '2025-01-15 10:30 AM', completed: true },
          { status: 'Order Confirmed', date: '2025-01-15 11:45 AM', completed: true },
          { status: 'Packed & Ready', date: '2025-01-15 04:20 PM', completed: true },
          { status: 'Shipped', date: '2025-01-16 09:15 AM', completed: true },
          { status: 'Out for Delivery', date: '2025-01-17 07:00 AM', completed: true },
          { status: 'Delivered', date: '2025-01-17 02:30 PM', completed: true }
        ]
      },
      payment: {
        method: 'UPI',
        transactionId: 'TXN20250115001',
        status: 'paid'
      }
    },
    {
      id: 'ORD-2025-155',
      date: '2025-01-14',
      status: 'shipped',
      items: 2,
      quantity: 45,
      total: 89955,
      expectedDelivery: '2025-01-17',
      products: [
        {
          name: 'Royal Silk Sherwani',
          code: 'TSV-SHW-045',
          quantity: 15,
          price: 4599,
          image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=100'
        },
        {
          name: 'Bandhgala Suit Set',
          code: 'TSV-IWS-078',
          quantity: 30,
          price: 3299,
          image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=100'
        }
      ],
      tracking: {
        courier: 'BlueDart',
        trackingId: 'BLUE456789123',
        timeline: [
          { status: 'Order Placed', date: '2025-01-14 02:15 PM', completed: true },
          { status: 'Order Confirmed', date: '2025-01-14 03:30 PM', completed: true },
          { status: 'Packed & Ready', date: '2025-01-15 11:00 AM', completed: true },
          { status: 'Shipped', date: '2025-01-15 06:45 PM', completed: true },
          { status: 'Out for Delivery', date: 'Expected: 2025-01-17', completed: false },
          { status: 'Delivered', date: 'Pending', completed: false }
        ]
      },
      payment: {
        method: 'Credit Card',
        transactionId: 'TXN20250114002',
        status: 'paid'
      }
    },
    {
      id: 'ORD-2025-154',
      date: '2025-01-13',
      status: 'confirmed',
      items: 1,
      quantity: 60,
      total: 53940,
      expectedDelivery: '2025-01-16',
      products: [
        {
          name: 'Printed Kurta Pyjama',
          code: 'TSV-KRT-156',
          quantity: 60,
          price: 899,
          image: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=100'
        }
      ],
      tracking: {
        courier: 'DTDC',
        trackingId: 'DTDC987654321',
        timeline: [
          { status: 'Order Placed', date: '2025-01-13 09:20 AM', completed: true },
          { status: 'Order Confirmed', date: '2025-01-13 10:45 AM', completed: true },
          { status: 'Packed & Ready', date: 'Processing', completed: false },
          { status: 'Shipped', date: 'Pending', completed: false },
          { status: 'Out for Delivery', date: 'Pending', completed: false },
          { status: 'Delivered', date: 'Pending', completed: false }
        ]
      },
      payment: {
        method: 'Net Banking',
        transactionId: 'TXN20250113003',
        status: 'paid'
      }
    },
    {
      id: 'ORD-2025-153',
      date: '2025-01-12',
      status: 'pending',
      items: 2,
      quantity: 35,
      total: 71465,
      expectedDelivery: '2025-01-16',
      products: [
        {
          name: 'Designer Nehru Jacket',
          code: 'TSV-NHR-089',
          quantity: 20,
          price: 2199,
          image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100'
        },
        {
          name: 'Pathani Kurta Set',
          code: 'TSV-KRT-203',
          quantity: 15,
          price: 1599,
          image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=100'
        }
      ],
      tracking: {
        courier: 'Not Assigned',
        trackingId: 'Pending',
        timeline: [
          { status: 'Order Placed', date: '2025-01-12 03:45 PM', completed: true },
          { status: 'Order Confirmed', date: 'Awaiting confirmation', completed: false },
          { status: 'Packed & Ready', date: 'Pending', completed: false },
          { status: 'Shipped', date: 'Pending', completed: false },
          { status: 'Out for Delivery', date: 'Pending', completed: false },
          { status: 'Delivered', date: 'Pending', completed: false }
        ]
      },
      payment: {
        method: 'COD',
        transactionId: 'N/A',
        status: 'pending'
      }
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          bg: 'bg-orange-50', 
          text: 'text-orange-700', 
          border: 'border-orange-200',
          icon: Clock,
          label: 'Pending Confirmation' 
        };
      case 'confirmed':
        return { 
          bg: 'bg-blue-50', 
          text: 'text-blue-700', 
          border: 'border-blue-200',
          icon: CheckCircle,
          label: 'Confirmed' 
        };
      case 'shipped':
        return { 
          bg: 'bg-violet-50', 
          text: 'text-violet-700', 
          border: 'border-violet-200',
          icon: Truck,
          label: 'Shipped' 
        };
      case 'delivered':
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-700', 
          border: 'border-emerald-200',
          icon: CheckCircle,
          label: 'Delivered' 
        };
      case 'cancelled':
        return { 
          bg: 'bg-rose-50', 
          text: 'text-rose-700', 
          border: 'border-rose-200',
          icon: XCircle,
          label: 'Cancelled' 
        };
      default:
        return { 
          bg: 'bg-gray-50', 
          text: 'text-gray-700', 
          border: 'border-gray-200',
          icon: Package,
          label: 'Unknown' 
        };
    }
  };

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === orderFilter);

  const categories = [
    { id: 'all', name: 'All Products', count: 1247 },
    { id: 'kurta', name: 'Kurta Sets', count: 456 },
    { id: 'sherwani', name: 'Sherwani', count: 234 },
    { id: 'indo', name: 'Indo-Western', count: 189 },
    { id: 'fabrics', name: 'Fabrics', count: 368 }
  ];

  const products = [
    {
      id: '1',
      name: 'Premium Cotton Kurta Set',
      code: 'TSV-KRT-001',
      price: 1299,
      originalPrice: 1799,
      moq: 10,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=600&fit=crop',
      rating: 4.8,
      reviews: 124,
      colors: 5,
      sold: 234,
      badge: 'Best Seller',
      discount: 28,
      status: 'approved' // ✅ Only approved products visible to buyers
    },
    {
      id: '2',
      name: 'Royal Silk Sherwani',
      code: 'TSV-SHW-045',
      price: 4599,
      originalPrice: 5999,
      moq: 5,
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=500&h=600&fit=crop',
      rating: 4.9,
      reviews: 89,
      colors: 4,
      sold: 156,
      badge: 'Premium',
      discount: 23,
      status: 'approved' // ✅ Only approved products visible to buyers
    },
    {
      id: '3',
      name: 'Designer Nehru Jacket',
      code: 'TSV-NHR-089',
      price: 2199,
      originalPrice: 2899,
      moq: 8,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=600&fit=crop',
      rating: 4.7,
      reviews: 67,
      colors: 6,
      sold: 178,
      badge: 'New',
      discount: 24,
      status: 'approved' // ✅ Only approved products visible to buyers
    },
    {
      id: '4',
      name: 'Printed Kurta Pyjama',
      code: 'TSV-KRT-156',
      price: 899,
      originalPrice: 1299,
      moq: 15,
      image: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=500&h=600&fit=crop',
      rating: 4.6,
      reviews: 203,
      colors: 8,
      sold: 456,
      discount: 31,
      status: 'approved' // ✅ Only approved products visible to buyers
    },
    {
      id: '5',
      name: 'Bandhgala Suit Set',
      code: 'TSV-IWS-078',
      price: 3299,
      originalPrice: 4199,
      moq: 6,
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&h=600&fit=crop',
      rating: 4.8,
      reviews: 92,
      colors: 3,
      sold: 134,
      badge: 'Trending',
      discount: 21,
      status: 'approved' // ✅ Only approved products visible to buyers
    },
    {
      id: '6',
      name: 'Pathani Kurta Set',
      code: 'TSV-KRT-203',
      price: 1599,
      originalPrice: 2199,
      moq: 12,
      image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=500&h=600&fit=crop',
      rating: 4.7,
      reviews: 156,
      colors: 5,
      sold: 289,
      discount: 27,
      status: 'approved' // ✅ Only approved products visible to buyers
    }
  ];

  // ✅ In production, this would filter products from API: products.filter(p => p.status === 'approved')
  const approvedProducts = products; // All products here are already approved

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-lg font-semibold text-gray-900">Tashivar</span>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeNav === item.id
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={2} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" strokeWidth={2} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
              
              <button 
                onClick={onViewCart}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" strokeWidth={2} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="relative ml-2">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="hidden sm:block text-sm font-medium text-gray-900">{userName}</span>
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                    {userName.charAt(0)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 animate-slideUp">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500">{businessName}</p>
                    </div>
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <User className="w-4 h-4" strokeWidth={2} />
                      Profile
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" strokeWidth={2} />
                      Orders
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <MapPin className="w-4 h-4" strokeWidth={2} />
                      Addresses
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
            Welcome back, {userName.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your business today</p>
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

        {/* Custom Order CTA */}
        <div className="mb-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Need Custom Manufacturing?</h3>
              <p className="text-blue-100 text-sm">Upload your design or choose from pre-approved products for custom manufacturing</p>
            </div>
            <button
              onClick={() => setShowCustomOrderForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
              Place Custom Order
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" strokeWidth={2} />
                Filter
              </button>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                <button className="p-1.5 bg-gray-100 text-gray-900 rounded">
                  <Grid className="w-4 h-4" strokeWidth={2} />
                </button>
                <button className="p-1.5 text-gray-600 hover:bg-gray-50 rounded">
                  <List className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-xs ${selectedCategory === cat.id ? 'text-gray-400' : 'text-gray-500'}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active nav */}
        {activeNav === 'home' && (
          <>
            {/* Products */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Trending Products</h2>
                <p className="text-sm text-gray-600">{approvedProducts.length} products</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {approvedProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => onViewProduct(product.id)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {product.badge && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md text-xs font-medium text-gray-900">
                          {product.badge}
                        </div>
                      )}
                      
                      {product.discount && (
                        <div className="absolute top-3 right-3 px-2 py-1 bg-rose-500 rounded-md text-xs font-medium text-white">
                          -{product.discount}%
                        </div>
                      )}

                      <button className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110">
                        <Heart className="w-4 h-4 text-gray-700" strokeWidth={2} />
                      </button>
                    </div>
                    
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">{product.code}</p>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" strokeWidth={2} />
                          <span className="font-medium text-gray-900">{product.rating}</span>
                          <span className="text-gray-500">({product.reviews})</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600">{product.sold} sold</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                        <span>{product.colors} colors</span>
                        <span className="text-gray-300">•</span>
                        <span>MOQ: {product.moq}</span>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-semibold text-gray-900">₹{product.price.toLocaleString()}</span>
                            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-gray-500">per piece</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewCart();
                          }}
                          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                        >
                          <ShoppingCart className="w-4 h-4" strokeWidth={2} />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Products Tab */}
        {activeNav === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">All Products</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" strokeWidth={2} />
                  Filter
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {approvedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => onViewProduct(product.id)}
                >
                  <div className="relative overflow-hidden rounded-t-xl aspect-[3/4]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-sm ${
                          product.badge === 'Best Seller' ? 'bg-violet-500/90 text-white' :
                          product.badge === 'Premium' ? 'bg-amber-500/90 text-white' :
                          product.badge === 'New' ? 'bg-emerald-500/90 text-white' :
                          'bg-blue-500/90 text-white'
                        }`}>
                          {product.badge}
                        </span>
                      </div>
                    )}
                    {product.discount && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-rose-500/90 text-white rounded-lg text-xs font-medium backdrop-blur-sm">
                          {product.discount}% OFF
                        </span>
                      </div>
                    )}
                    <button className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
                      <Heart className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.code}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={2} />
                        <span className="text-sm font-medium text-gray-900">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                      {product.colors && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">{product.colors} colors</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-semibold text-gray-900">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">MOQ: {product.moq} pcs</span>
                      {product.sold && (
                        <span className="text-emerald-600 font-medium">{product.sold} sold</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeNav === 'wishlist' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">My Wishlist</h2>
              <p className="text-sm text-gray-600">{approvedProducts.slice(0, 4).length} items saved</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {approvedProducts.slice(0, 4).map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative overflow-hidden rounded-t-xl aspect-[3/4]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => onViewProduct(product.id)}
                    />
                    {product.badge && (
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-sm ${
                          product.badge === 'Best Seller' ? 'bg-violet-500/90 text-white' :
                          product.badge === 'Premium' ? 'bg-amber-500/90 text-white' :
                          product.badge === 'New' ? 'bg-emerald-500/90 text-white' :
                          'bg-blue-500/90 text-white'
                        }`}>
                          {product.badge}
                        </span>
                      </div>
                    )}
                    {product.discount && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-rose-500/90 text-white rounded-lg text-xs font-medium backdrop-blur-sm">
                          {product.discount}% OFF
                        </span>
                      </div>
                    )}
                    <button className="absolute bottom-3 right-3 w-9 h-9 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center hover:bg-rose-100 transition-colors">
                      <Heart className="w-4 h-4 fill-rose-600" strokeWidth={2} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.code}</p>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={2} />
                        <span className="text-sm font-medium text-gray-900">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                      {product.colors && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-600">{product.colors} colors</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-xl font-semibold text-gray-900">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-600">MOQ: {product.moq} pcs</span>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">In Stock</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onViewProduct(product.id)}
                        className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                      >
                        View Details
                      </button>
                      <button className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">
                        <Heart className="w-4 h-4 fill-rose-600" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {approvedProducts.slice(0, 4).length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-400" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No items in wishlist</h3>
                <p className="text-gray-600 mb-6">Start adding products you love to your wishlist</p>
                <button 
                  onClick={() => setActiveNav('products')}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeNav === 'orders' && (
          <div>
            {/* Order Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {orderFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setOrderFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    orderFilter === filter.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className={`text-xs ${orderFilter === filter.id ? 'text-gray-400' : 'text-gray-500'}`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                const isExpanded = selectedOrder === order.id;

                return (
                  <div 
                    key={order.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Order Header */}
                    <div 
                      className="p-5 cursor-pointer"
                      onClick={() => setSelectedOrder(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-semibold text-gray-900">{order.id}</h3>
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} rounded-lg text-xs font-medium`}>
                              <StatusIcon className="w-3.5 h-3.5" strokeWidth={2} />
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" strokeWidth={2} />
                              <span>Ordered: {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <span>{order.items} items ({order.quantity} pieces)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Total amount</p>
                        </div>
                      </div>

                      {/* Product Preview */}
                      <div className="flex items-center gap-3">
                        {order.products.slice(0, 3).map((product, idx) => (
                          <img
                            key={idx}
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                        {order.products.length > 3 && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                            +{order.products.length - 3}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        <div className="p-5 space-y-6">
                          {/* Order Items */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                            <div className="space-y-3">
                              {order.products.map((product, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.code}</p>
                                    <p className="text-xs text-gray-600 mt-1">Quantity: {product.quantity} pcs</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">₹{product.price.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">per piece</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tracking Timeline */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Tracking</h4>
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <div>
                                  <p className="font-medium text-gray-900">Courier: {order.tracking.courier}</p>
                                  <p className="text-xs text-gray-600">Tracking ID: {order.tracking.trackingId}</p>
                                </div>
                                {order.status === 'shipped' || order.status === 'delivered' ? (
                                  <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50">
                                    <Truck className="w-3.5 h-3.5" strokeWidth={2} />
                                    Track Package
                                  </button>
                                ) : null}
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {order.tracking.timeline.map((step, idx) => (
                                <div key={idx} className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                      step.completed ? 'bg-emerald-100' : 'bg-gray-100'
                                    }`}>
                                      {step.completed ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                                      ) : (
                                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                      )}
                                    </div>
                                    {idx < order.tracking.timeline.length - 1 && (
                                      <div className={`w-0.5 h-8 ${step.completed ? 'bg-emerald-200' : 'bg-gray-200'}`} />
                                    )}
                                  </div>
                                  <div className="flex-1 pb-4">
                                    <p className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                                      {step.status}
                                    </p>
                                    <p className="text-xs text-gray-500">{step.date}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment Information</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium text-gray-900">{order.payment.method}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Transaction ID:</span>
                                <span className="font-medium text-gray-900">{order.payment.transactionId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium ${order.payment.status === 'paid' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                  {order.payment.status === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                              <FileText className="w-4 h-4" strokeWidth={2} />
                              Download Invoice
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                              <MessageSquare className="w-4 h-4" strokeWidth={2} />
                              Contact Support
                            </button>
                            {order.status === 'pending' && (
                              <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-100 ml-auto">
                                <XCircle className="w-4 h-4" strokeWidth={2} />
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Custom Order Form Modal */}
      {showCustomOrderForm && (
        <CustomOrderForm
          onSubmit={handleCustomOrderSubmit}
          onCancel={() => setShowCustomOrderForm(false)}
        />
      )}
    </div>
  );
}