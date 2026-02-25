import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, BarChart3, Settings, LogOut, 
  Plus, Search, Bell, ChevronDown, User, Filter, TrendingUp, DollarSign, 
  Truck, Check, X, Shirt, Trash2, Camera, Loader2, ScrollText as Fabric 
} from 'lucide-react';
import * as vendorService from '../services/vendorService';
import * as productService from '../services/productService';
import * as orderService from '../services/orderService';
import { VendorDispatchModal } from './VendorDispatchModal';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface DashboardProduct {
  id: string;
  name: string;
  productType: 'readymade' | 'fabric';
  stock: number;
  costPrice: number;
  sellingPrice: number;
  moq: number;
  sold: number;
  commission: number;
  commissionType: 'single' | 'split';
  commissionParties: { name: string; percentage: number; amount: number }[];
  image: string;
  status: 'active' | 'pending' | 'out-of-stock';
}

interface DashboardOrder {
  id: string;
  shopName: string;
  product: string;
  productType: 'readymade' | 'fabric';
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  amount: number;
  commission: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'vendor-dispatched';
  date: string;
}

export function VendorDashboard({ onLogout }: { onLogout?: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'analytics'>('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [productFilter, setProductFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic Data State
  const [vendor, setVendor] = useState<vendorService.Vendor | null>(null);
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [stats, setStats] = useState([
    { label: 'Revenue', value: '₹0', change: '+0%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Orders', value: '0', change: '+0 new', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Products', value: '0', change: '+0', icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Commission', value: '₹0', change: '+0%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' }
  ]);
  
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    productType: 'readymade',
    price: '',
    moq: '',
    fabric: '',
    colors: '',
    description: '',
    image: '',
    stock: '',
    expectedPrice: '',
    work: '',
    panna: '',
    commissionType: 'single',
    baseCommission: ''
  });

  const [analyticsData, setAnalyticsData] = useState({
    revenue: {
      current: 0,
      previous: 0,
      growth: 0,
      chartData: [] as { month: string; amount: number }[]
    },
    productPerformance: {
      readymade: { orders: 0, revenue: 0, commission: 0 },
      fabric: { orders: 0, revenue: 0, commission: 0 }
    },
    topProducts: [] as { name: string; sales: number; revenue: number }[]
  });

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Get Vendor (Simulating logged in vendor by taking the first one)
        const allVendors = await vendorService.getAllVendors();
        const currentVendor = allVendors[0]; // For demo, use the first vendor
        
        if (currentVendor) {
          setVendor(currentVendor);
          
          // 2. Get Products for this vendor
          const vendorProducts = await productService.getProductsByVendor(currentVendor.id);
          
          // Map to DashboardProduct format
          const mappedProducts: DashboardProduct[] = vendorProducts.map(p => {
            const commission = p.suggestedPrice - p.costPrice;
            
            return {
              id: p.id,
              name: p.name,
              productType: p.type,
              stock: p.quantity || 0,
              costPrice: p.costPrice,
              sellingPrice: p.suggestedPrice,
              moq: p.moq,
              sold: p.status === 'pending' ? 0 : Math.floor(Math.random() * 50), // Mock sold count only for active items
              commission: commission,
              commissionType: 'single', // Default
              commissionParties: [{ name: 'Vendor', percentage: 100, amount: commission }],
              image: p.images?.[0] || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200',
              status: (p.status === 'approved' ? 'active' : p.status) as any
            };
          });
          setProducts(mappedProducts);

          // 3. Get Orders for this vendor
          const vendorOrders = await orderService.getOrdersByVendor(currentVendor.id);
          
          // Map to DashboardOrder format
          const mappedOrders: DashboardOrder[] = vendorOrders.map(o => {
            const mainProduct = o.products?.[0];
            return {
              id: o.id,
              shopName: o.buyer, // Assuming buyer name is shop name
              product: mainProduct?.name || 'Multiple Items',
              productType: mainProduct?.type || 'readymade',
              quantity: mainProduct?.quantity || 0,
              costPrice: mainProduct?.costPrice || 0,
              sellingPrice: mainProduct?.sellingPrice || 0,
              amount: o.totalAmount,
              commission: o.totalAmount * 0.1, // Mock commission
              status: o.status as any,
              date: new Date(o.createdAt).toLocaleDateString()
            };
          });
          setOrders(mappedOrders);

          // 4. Calculate Stats
          const totalRevenue = mappedOrders.reduce((acc, o) => acc + o.amount, 0);
          const totalCommission = mappedOrders.reduce((acc, o) => acc + o.commission, 0);
          
          setStats([
            { label: 'Revenue', value: `₹${(totalRevenue/1000).toFixed(1)}k`, change: '+12%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Orders', value: mappedOrders.length.toString(), change: `+${mappedOrders.filter(o => o.status === 'pending').length} new`, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Products', value: mappedProducts.length.toString(), change: '+2', icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Commission', value: `₹${(totalCommission/1000).toFixed(1)}k`, change: '+8%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' }
          ]);

          // 5. Mock Analytics Data
          setAnalyticsData({
            revenue: {
              current: totalRevenue,
              previous: totalRevenue * 0.8,
              growth: 20,
              chartData: [
                { month: 'Jan', amount: totalRevenue * 0.6 },
                { month: 'Feb', amount: totalRevenue * 0.7 },
                { month: 'Mar', amount: totalRevenue * 0.9 },
                { month: 'Apr', amount: totalRevenue }
              ]
            },
            productPerformance: {
              readymade: {
                orders: mappedOrders.filter(o => o.productType === 'readymade').length,
                revenue: mappedOrders.filter(o => o.productType === 'readymade').reduce((acc, o) => acc + o.amount, 0),
                commission: 0
              },
              fabric: {
                orders: mappedOrders.filter(o => o.productType === 'fabric').length,
                revenue: mappedOrders.filter(o => o.productType === 'fabric').reduce((acc, o) => acc + o.amount, 0),
                commission: 0
              }
            },
            topProducts: [
              { name: 'Embroidered Kurta', sales: 120, revenue: 150000 },
              { name: 'Cotton Fabric', sales: 85, revenue: 45000 },
              { name: 'Silk Saree', sales: 45, revenue: 220000 }
            ]
          });
        }
      } catch (error) {
        console.error("Error fetching vendor dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    try {
      const newProductData: Partial<productService.Product> = {
        name: productForm.name,
        type: productForm.productType as any,
        category: 'Ethnic Wear', // Default
        vendor: vendor.name,
        vendorId: vendor.id,
        description: `${productForm.description}\n\nDetails:\nFabric: ${productForm.fabric || 'N/A'}\nWork: ${productForm.work || 'N/A'}\nPanna: ${productForm.panna || 'N/A'}\nColors: ${productForm.colors || 'N/A'}`,
        costPrice: Number(productForm.price),
        suggestedPrice: productForm.expectedPrice ? Number(productForm.expectedPrice) : Number(productForm.price) * 1.2,
        moq: Number(productForm.moq),
        quantity: 0, // Default stock as per user request
        sku: productForm.sku,
        status: 'pending',
        images: productForm.image ? [productForm.image] : undefined
      };

      await productService.createProduct(newProductData);
      
      // Refresh products (simple reload for now or append to state)
      // For simplicity in this demo, we'll append to local state
      const newDashboardProduct: DashboardProduct = {
        id: `TEMP-${Date.now()}`,
        name: productForm.name,
        productType: productForm.productType as any,
        stock: 0,
        costPrice: Number(productForm.price),
        sellingPrice: productForm.expectedPrice ? Number(productForm.expectedPrice) : Number(productForm.price) * 1.2,
        moq: Number(productForm.moq),
        sold: 0,
        commission: productForm.expectedPrice ? Number(productForm.expectedPrice) - Number(productForm.price) : 0,
        commissionType: 'single',
        commissionParties: [],
        image: productForm.image || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200',
        status: 'pending'
      };
      
      setProducts([newDashboardProduct, ...products]);
      setShowProductForm(false);
      setProductForm({ 
        name: '', 
        sku: '', 
        productType: 'readymade',
        price: '', 
        moq: '', 
        fabric: '', 
        colors: '', 
        description: '',
        image: '',
        stock: '',
        expectedPrice: '',
        work: '',
        panna: '',
        commissionType: 'single',
        baseCommission: ''
      });
      alert('Product submitted successfully!');
    } catch (error) {
      console.error("Error creating product:", error);
      alert('Failed to create product');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending-approval':
        return { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Pending' };
      case 'confirmed':
      case 'approved':
        return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed' };
      case 'shipped':
      case 'dispatched-to-buyer':
      case 'vendor-dispatched':
        return { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Shipped' };
      case 'delivered':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Delivered' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', label: status };
    }
  };

  const filteredProducts = productFilter === 'all' 
    ? products 
    : products.filter(p => p.productType === productFilter);

  const filteredOrders = orderFilter === 'all'
    ? orders
    : orders.filter(o => o.status === orderFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <span className="text-xs text-gray-500">Vendor</span>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
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

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowProductForm(true)}
                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Product
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
                  <span className="hidden sm:block text-sm font-medium text-gray-900">{vendor?.name || 'Vendor'}</span>
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                    {vendor?.name?.charAt(0) || 'V'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1 animate-slideUp">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{vendor?.name}</p>
                      <p className="text-xs text-gray-500">{vendor?.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" strokeWidth={2} />
                      Profile
                    </button>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowSettingsModal(true);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" strokeWidth={2} />
                      Settings
                    </button>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button 
                        onClick={() => {
                          if (onLogout) {
                            onLogout();
                          } else {
                            localStorage.removeItem('currentUserRole');
                            window.location.reload();
                          }
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
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
            Welcome back, {vendor?.owner.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-600">Here's what's happening with your store today</p>
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

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No orders found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      return (
                        <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">{order.id}</p>
                              <span className={`px-2 py-0.5 ${statusConfig.bg} ${statusConfig.text} rounded text-xs font-medium`}>
                                {statusConfig.label}
                              </span>
                              {order.productType === 'fabric' ? (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">Fabric</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-xs font-medium">Ready Made</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{order.shopName}</p>
                            <p className="text-sm text-gray-500">{order.product} • {order.quantity} pcs</p>
                            <p className="text-xs text-gray-400 mt-1">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">₹{order.amount.toLocaleString()}</p>
                            <p className="text-xs text-emerald-600 font-medium">Commission: ₹{order.commission.toLocaleString()}</p>
                            {order.status === 'pending' && (
                              <div className="flex gap-2 mt-2">
                                <button className="p-1.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200">
                                  <Check className="w-4 h-4" strokeWidth={2} />
                                </button>
                                <button className="p-1.5 bg-rose-100 text-rose-700 rounded hover:bg-rose-200">
                                  <X className="w-4 h-4" strokeWidth={2} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Product Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-violet-50 rounded-lg flex items-center justify-center">
                      <Shirt className="w-6 h-6 text-violet-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Ready Made</p>
                      <p className="text-xs text-gray-500">{analyticsData.productPerformance.readymade.orders} orders • ₹{(analyticsData.productPerformance.readymade.revenue / 1000).toFixed(1)}k</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Fabric className="w-6 h-6 text-blue-600" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Fabric</p>
                      <p className="text-xs text-gray-500">{analyticsData.productPerformance.fabric.orders} orders • ₹{(analyticsData.productPerformance.fabric.revenue / 1000).toFixed(1)}k</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Performance</h3>
                <p className="text-sm text-gray-600 mb-4">Your store is doing great!</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-700">Fulfillment</span>
                      <span className="font-medium text-gray-900">92%</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-700">Quality</span>
                      <span className="font-medium text-gray-900">95%</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    orderFilter === filter
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
                No orders found matching this filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-semibold text-gray-900">{order.id}</h3>
                            <span className={`px-2.5 py-1 ${statusConfig.bg} ${statusConfig.text} rounded-lg text-xs font-medium`}>
                              {statusConfig.label}
                            </span>
                            {order.productType === 'fabric' ? (
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1">
                                <Fabric className="w-3 h-3" />
                                Fabric
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded-lg text-xs font-medium flex items-center gap-1">
                                <Shirt className="w-3 h-3" />
                                Ready Made
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{order.shopName}</p>
                          <p className="text-sm text-gray-900 font-medium mb-3">{order.product}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Quantity</p>
                              <p className="font-medium text-gray-900">{order.quantity} pieces</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Cost Price</p>
                              <p className="font-medium text-gray-900">₹{order.costPrice.toLocaleString()}/pc</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Selling Price</p>
                              <p className="font-medium text-gray-900">₹{order.sellingPrice.toLocaleString()}/pc</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Your Commission</p>
                              <p className="font-medium text-emerald-600">₹{order.commission.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold text-gray-900">₹{order.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Total amount</p>
                        </div>
                      </div>
                      
                      {order.status === 'pending' && (
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button 
                            onClick={async () => {
                              try {
                                if (confirm(`Accept order ${order.id}?`)) {
                                  // Call API to approve
                                  await orderService.approveOrder(order.id);
                                  // Update local state
                                  setOrders(orders.map(o => o.id === order.id ? {...o, status: 'confirmed'} : o));
                                  alert(`Order ${order.id} accepted successfully!`);
                                }
                              } catch (e) {
                                console.error(e);
                                alert('Failed to update order');
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100"
                          >
                            Accept Order
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Are you sure you want to reject order ${order.id}?`)) {
                                console.log('Rejecting order:', order.id);
                                alert(`Order ${order.id} rejected. Admin will be notified.`);
                              }
                            }}
                            className="flex-1 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-medium hover:bg-rose-100"
                          >
                            Reject Order
                          </button>
                        </div>
                      )}

                      {order.status === 'confirmed' && (
                        <div className="pt-4 border-t border-gray-200">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDispatchModal(true);
                            }}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
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
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                {['all', 'readymade', 'fabric'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setProductFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      productFilter === filter
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {filter === 'readymade' ? 'Ready Made' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowProductForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.status === 'active' 
                          ? 'bg-emerald-500 text-white' 
                          : product.status === 'pending'
                            ? 'bg-orange-500 text-white'
                            : 'bg-rose-500 text-white'
                      }`}>
                        {product.status === 'active' ? 'Active' : product.status === 'pending' ? 'Pending' : 'Out of Stock'}
                      </span>
                      {product.productType === 'fabric' ? (
                        <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium">Fabric</span>
                      ) : (
                        <span className="px-2 py-1 bg-violet-500 text-white rounded text-xs font-medium">Ready Made</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{product.id}</p>
                    <h3 className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">{product.name}</h3>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-medium text-gray-900">₹{product.costPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selling:</span>
                        <span className="font-medium text-gray-900">₹{product.sellingPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission:</span>
                        <span className="font-medium text-emerald-600">₹{product.commission}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sold:</span>
                        <span className="font-medium text-indigo-600">{product.sold} pcs</span>
                      </div>
                    </div>

                    {product.commissionType === 'split' && (
                      <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">Commission Split:</p>
                        {product.commissionParties.map((party, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-gray-600">
                            <span>{party.name} ({party.percentage}%)</span>
                            <span className="font-medium">₹{party.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                        Edit
                      </button>
                      <button className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100">
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Revenue Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h2>
              <div className="mb-6">
                <p className="text-3xl font-semibold text-gray-900">₹{(analyticsData.revenue.current / 100000).toFixed(1)}L</p>
                <p className="text-sm text-emerald-600 font-medium">+{analyticsData.revenue.growth}% from last period</p>
              </div>
              <div className="flex items-end justify-between gap-2 h-64">
                {analyticsData.revenue.chartData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg relative group">
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-600 to-violet-600 rounded-t-lg transition-all hover:from-indigo-500 hover:to-violet-500 cursor-pointer"
                        style={{ height: `${(data.amount / Math.max(...analyticsData.revenue.chartData.map(d => d.amount), 1)) * 220}px` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{(data.amount / 100000).toFixed(1)}L
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{data.month}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Performance */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Product Type Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shirt className="w-4 h-4 text-violet-600" />
                        <span className="text-sm font-medium text-gray-900">Ready Made</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                         {analyticsData.productPerformance.readymade.orders + analyticsData.productPerformance.fabric.orders > 0 
                          ? Math.round((analyticsData.productPerformance.readymade.orders / (analyticsData.productPerformance.readymade.orders + analyticsData.productPerformance.fabric.orders)) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-600 rounded-full" style={{ width: `${analyticsData.productPerformance.readymade.orders + analyticsData.productPerformance.fabric.orders > 0 ? (analyticsData.productPerformance.readymade.orders / (analyticsData.productPerformance.readymade.orders + analyticsData.productPerformance.fabric.orders)) * 100 : 0}%` }} />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-600">
                      <span>{analyticsData.productPerformance.readymade.orders} orders</span>
                      <span>₹{(analyticsData.productPerformance.readymade.revenue / 100000).toFixed(1)}L revenue</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Fabric className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Fabric</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {analyticsData.productPerformance.readymade.orders + analyticsData.productPerformance.fabric.orders > 0 
                          ? Math.round((analyticsData.productPerformance.fabric.orders / (analyticsData.productPerformance.readymade.orders + analyticsData.productPerformance.fabric.orders)) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${analyticsData.productPerformance.readymade.orders + analyticsData.productPerformance.fabric.orders > 0 ? (analyticsData.productPerformance.fabric.orders / (analyticsData.productPerformance.readymade.orders + analyticsData.productPerformance.fabric.orders)) * 100 : 0}%` }} />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-600">
                      <span>{analyticsData.productPerformance.fabric.orders} orders</span>
                      <span>₹{(analyticsData.productPerformance.fabric.revenue / 100000).toFixed(1)}L revenue</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Top Products</h3>
                {analyticsData.topProducts.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No sales data yet</div>
                ) : (
                  <div className="space-y-3">
                    {analyticsData.topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.sales} sales</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">₹{(product.revenue / 1000).toFixed(0)}k</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Product Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProductForm({...productForm, productType: 'readymade'})}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg ${
                      productForm.productType === 'readymade'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Shirt className="w-5 h-5" />
                    <span className="font-medium">Ready Made</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductForm({...productForm, productType: 'fabric'})}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg ${
                      productForm.productType === 'fabric'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Fabric className="w-5 h-5" />
                    <span className="font-medium">Fabric</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Product Name</label>
                <input
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="Premium Cotton Kurta Set"
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">SKU</label>
                  <input
                    value={productForm.sku}
                    onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                    placeholder="TSV-KRT-XXX"
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Cost Price (₹)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    placeholder="1100"
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Fabric</label>
                  <input
                    value={productForm.fabric}
                    onChange={(e) => setProductForm({...productForm, fabric: e.target.value})}
                    placeholder="e.g. Cotton, Silk"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Work</label>
                  <input
                    value={productForm.work}
                    onChange={(e) => setProductForm({...productForm, work: e.target.value})}
                    placeholder="e.g. Embroidery, Zari"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Panna (Width)</label>
                  <input
                    value={productForm.panna}
                    onChange={(e) => setProductForm({...productForm, panna: e.target.value})}
                    placeholder="e.g. 44 inches"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Colors</label>
                  <input
                    value={productForm.colors}
                    onChange={(e) => setProductForm({...productForm, colors: e.target.value})}
                    placeholder="e.g. Red, Blue, Green"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Expected Sell Price (₹)</label>
                <input
                  type="number"
                  value={productForm.expectedPrice}
                  onChange={(e) => setProductForm({...productForm, expectedPrice: e.target.value})}
                  placeholder="1500"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {productForm.price && productForm.expectedPrice && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Expected Commission: ₹{Number(productForm.expectedPrice) - Number(productForm.price)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {productForm.image ? (
                      <ImageWithFallback src={productForm.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const url = URL.createObjectURL(e.target.files[0]);
                          setProductForm({...productForm, image: url});
                        }
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-indigo-50 file:text-indigo-700
                        hover:file:bg-indigo-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  placeholder="Product description..."
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && selectedOrder && (
        <VendorDispatchModal
          order={selectedOrder}
          onClose={() => {
            setShowDispatchModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={async (data) => {
            console.log('Dispatch data:', data);
            try {
              // Map dispatch data to orderService format
              await orderService.vendorDispatch(selectedOrder.id, {
                deliveryMethod: data.deliveryMethod,
                courierService: data.courierService,
                trackingId: data.trackingId,
                vehicleNumber: data.vehicleNumber,
                driverName: data.driverName,
                driverPhone: data.driverPhone,
                estimatedDelivery: data.estimatedDelivery
              });
              
              // Update local state
              setOrders(orders.map(o => o.id === selectedOrder.id ? {...o, status: 'vendor-dispatched'} : o));
              
              alert(`Dispatch details submitted successfully for ${selectedOrder.id}!`);
              setShowDispatchModal(false);
              setSelectedOrder(null);
            } catch (e) {
              console.error(e);
              alert('Failed to submit dispatch details');
            }
          }}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Vendor Profile</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {vendor?.name?.charAt(0) || 'V'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{vendor?.name}</h4>
                  <p className="text-sm text-gray-500">{vendor?.owner}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="text-sm font-medium text-gray-900">{vendor?.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                  <p className="text-sm font-medium text-gray-900">{vendor?.phone}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Business Address</p>
                  <p className="text-sm font-medium text-gray-900">{vendor?.address}, {vendor?.city}, {vendor?.state} - {vendor?.pincode}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">GST Number</p>
                    <p className="text-sm font-medium text-gray-900">{vendor?.gst || 'Not Available'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">PAN Number</p>
                    <p className="text-sm font-medium text-gray-900">{vendor?.pancard || 'Not Available'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-gray-200">
                    <Bell className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-500">Receive order alerts</p>
                  </div>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400"/>
                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
