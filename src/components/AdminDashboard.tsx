import React, { useState, useEffect } from 'react';
import { Package, Users, DollarSign, TrendingUp, ShoppingBag, AlertCircle, Clock, CheckCircle, XCircle, Search, Bell, Settings, LogOut, ChevronDown, User, Store, Receipt, Percent, Layers, Home, Plus, X, Truck, Phone, MapPin, Calendar, Filter, Eye, Download, Edit, Trash2, Shirt, Package as PackageIcon, Car, Warehouse, QrCode, Shield, Palette, Scissors, ArrowLeft } from 'lucide-react';
import { Card } from './Card';
import { VendorBuyerManagement, FinanceTab } from './AdminFinanceVendorBuyer';
import { AdminProductManagement } from './AdminProductManagement';
import { CommissionManagement } from './CommissionManagement';
import { OrderFlow } from './OrderFlow';
import { OrderListTable } from './OrderListTable';
import { CustomPurchaseOrder } from './CustomPurchaseOrder';
import { VendorDispatchTracking } from './VendorDispatchTracking';
import { InventoryModule } from './InventoryModule';
import { WarehouseModule } from './WarehouseModule';
import { NotificationPanel } from './NotificationPanel';
import { UserManagement } from './UserManagement';
import { PurchaseOrderList } from './PurchaseOrderList';
import { ManufacturingModule } from './ManufacturingModule';
import { ManufacturingOrderManager } from './ManufacturingOrderManager';
import { FinanceTransactionModal } from './FinanceTransactionModal';
import { OfflineOrderManager } from './OfflineOrderManager';
import { ChallanManagement } from './ChallanManagement';
import { QualityColorManagement } from './QualityColorManagement';
import { RevenueChart, OrderStatusChart, CategorySalesChart, TopBuyersChart } from './DashboardCharts';
import { LoadingSpinner, ButtonWithLoading, CardSkeleton, TableSkeleton } from './LoadingSpinner';
import { toast } from 'sonner@2.0.3';
import { apiClient, handleApiError } from '../utils/apiClient';
import { sanitizeString, validateRequiredFields } from '../utils/security';
import * as orderService from '../services/orderService';
import * as vendorService from '../services/vendorService';
import * as buyerService from '../services/buyerService';
import * as financeService from '../services/financeService';
import * as notificationService from '../services/notificationService';
import * as adminAuthService from '../services/adminAuthService';

import { Grid, LayoutGrid } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'orders' | 'commission' | 'products' | 'vendors' | 'inventory' | 'warehouse' | 'users' | 'production'>('overview');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [financeView, setFinanceView] = useState<'overview' | 'ledger' | 'purchases' | 'sales' | 'expenses' | 'reports'>('overview');
  const [orderView, setOrderView] = useState<'sales' | 'purchases'>('sales');
  const [orderSubTab, setOrderSubTab] = useState<'system' | 'offline' | 'manufacturing' | 'challans'>('system');
  const [transactionType, setTransactionType] = useState<'purchase' | 'sell'>('purchase');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [accountingSummary, setAccountingSummary] = useState<any>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dispatchForm, setDispatchForm] = useState({
    orderId: '',
    deliveryMethod: 'local',
    courierService: '',
    trackingId: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    estimatedDelivery: ''
  });

  const userName = adminAuthService.getCurrentUser()?.name || "Admin";

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadOrders(),
      loadDashboardStats(),
      loadPendingProducts(),
      loadNotifications(),
      loadPartners()
    ]);
  };

  const loadPartners = async () => {
    try {
      const [vData, bData] = await Promise.all([
        vendorService.getAllVendors(),
        buyerService.getAllBuyers()
      ]);
      setVendors(vData);
      setBuyers(bData);
    } catch (err) {
      console.error('Failed to load partners:', err);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const fetchedOrders = await orderService.getAllOrders();
      const productService = await import('../services/productService');
      const allProducts = await productService.getAllProducts();
      
      const summary = await financeService.calculateFinanceSummary(fetchedOrders, allProducts);
      const pendingCount = allProducts.filter(p => p.status === 'pending').length;
      
      setAccountingSummary(summary);
      
      setStats([
        { 
          label: 'Total Revenue',
          value: `₹${(summary.totalSales / 100000).toFixed(1)}L`,
          change: summary.totalSales > 0 ? '+18.5%' : '0%',
          icon: TrendingUp,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50'
        },
        { 
          label: 'Active Orders',
          value: fetchedOrders.length.toString(),
          change: `${fetchedOrders.filter(o => ['pending-approval', 'approved', 'forwarded-to-vendor'].includes(o.status)).length} pending dispatch`,
          icon: ShoppingBag,
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        },
        { 
          label: 'Net Profit',
          value: `₹${(summary.netProfit / 100000).toFixed(1)}L`,
          change: summary.netProfit > 0 ? '+22.3%' : '0%',
          icon: DollarSign,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50'
        },
        { 
          label: 'Pending Products',
          value: pendingCount.toString(),
          change: 'awaiting approval',
          icon: AlertCircle,
          color: 'text-orange-600',
          bg: 'bg-orange-50'
        }
      ]);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  };

  const loadPendingProducts = async () => {
    try {
      const productService = await import('../services/productService');
      const products = await productService.getProductsByStatus('pending');
      setPendingProducts(products);
    } catch (err) {
      console.error('Failed to load pending products:', err);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await orderService.getAllOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders. Please try again.');
      setOrders([]); // Clear orders on error instead of using fallback data
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      setActionLoading(orderId);
      const updatedOrder = await orderService.approveOrder(orderId);
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      toast.success(`Order ${orderId} approved successfully!`);
    } catch (err) {
      console.error('Failed to approve order:', err);
      const message = handleApiError(err);
      toast.error(`Failed to approve order: ${message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleForwardToVendor = async (orderId: string, poDetails: any) => {
    try {
      setActionLoading(orderId);
      
      // Sanitize PO details
      const cleanDetails = {
        ...poDetails,
        poNumber: sanitizeString(poDetails.poNumber),
        notes: sanitizeString(poDetails.notes || ''),
        courierService: sanitizeString(poDetails.courierService || '')
      };
      
      const updatedOrder = await orderService.forwardToVendor(orderId, cleanDetails);
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      toast.success(`Order ${orderId} forwarded to vendor successfully!`);
    } catch (err) {
      console.error('Failed to forward to vendor:', err);
      const message = handleApiError(err);
      toast.error(`Failed to forward to vendor: ${message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReceiveAtWarehouse = async (orderId: string, details: any) => {
    try {
      setLoading(true);
      const updatedOrder = await orderService.receiveAtWarehouse(orderId, details);
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
    } catch (err) {
      console.error('Failed to receive at warehouse:', err);
      alert('Failed to mark as received. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchToBuyer = async (orderId: string, details: any) => {
    try {
      setLoading(true);
      const updatedOrder = await orderService.dispatchToBuyer(orderId, details);
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
    } catch (err) {
      console.error('Failed to dispatch to buyer:', err);
      alert('Failed to dispatch to buyer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestOrder = async () => {
    try {
      setLoading(true);
      const testOrder = {
        buyer: 'Kumar Fashion Hub',
        buyerId: 'BUY-001',
        buyerPhone: '+91 98765 43210',
        buyerAddress: '123, Fashion Street, Mumbai, Maharashtra - 400001',
        vendor: 'Fashion Creations',
        vendorId: 'VEN-001',
        vendorPhone: '+91 98765 11111',
        products: [
          {
            id: 'TSV-KRT-001',
            name: 'Premium Cotton Kurta Set',
            type: 'readymade',
            quantity: 50,
            costPrice: 1100,
            sellingPrice: 1299,
            image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=100'
          }
        ],
        subtotal: 64950,
        commission: 9950,
        commissionDistribution: [
          { party: 'Vendor', amount: 6965 },
          { party: 'Stitching Master', amount: 2985 }
        ],
        profit: 9950,
        paymentStatus: 'paid',
        paymentMethod: 'UPI'
      };
      
      const createdOrder = await orderService.createOrder(testOrder);
      setOrders([createdOrder, ...orders]);
      alert('Test order created successfully!');
    } catch (err) {
      console.error('Failed to create test order:', err);
      alert('Failed to create test order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualOrderSubmit = async (data: any) => {
    try {
      setLoading(true);
      const orderData: any = {
        date: data.date,
        buyer: orderView === 'sales' ? data.partyName : 'Tashivar Inventory',
        buyerId: orderView === 'sales' ? data.partyId : 'INV-001',
        buyerPhone: '',
        buyerAddress: '',
        vendor: orderView === 'purchases' ? data.partyName : 'Tashivar Inventory',
        vendorId: orderView === 'purchases' ? data.partyId : 'INV-001',
        products: [{
          id: data.productId,
          name: data.productName,
          type: data.productType,
          quantity: parseInt(data.quantity),
          costPrice: data.costPrice,
          sellingPrice: data.sellingPrice,
          image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'
        }],
        subtotal: parseFloat(data.quantity) * (orderView === 'sales' ? data.sellingPrice : data.costPrice),
        commission: 0,
        commissionDistribution: [],
        profit: orderView === 'sales' ? (parseFloat(data.quantity) * (data.sellingPrice - data.costPrice)) : 0,
        status: orderView === 'sales' ? 'delivered' : 'received-at-warehouse',
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod
      };
      
      await orderService.createOrder(orderData);
      await loadOrders();
      alert('Manual order added successfully');
    } catch (err) {
      console.error('Failed to add manual order:', err);
      alert('Failed to add manual order');
    } finally {
      setLoading(false);
    }
  };

  const currentUser = adminAuthService.getCurrentUser();
  const userPermissions = currentUser?.permissions || [];
  const isSuperAdmin = currentUser?.role === 'superadmin' || currentUser?.role === 'admin';

  const allNavigationItems = [
    { id: 'overview', label: 'Dashboard Quickview', icon: Home, permission: 'any' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, permission: 'orders' },
    { id: 'products', label: 'Products', icon: Layers, permission: 'products' },
    { id: 'quality-colors', label: 'Quality & Colors', icon: Palette, permission: 'products' },
    { id: 'inventory', label: 'Inventory', icon: PackageIcon, permission: 'inventory' },
    { id: 'warehouse', label: 'Warehouse', icon: QrCode, permission: 'warehouse' },
    { id: 'finance', label: 'Billing', icon: Receipt, permission: 'finance' },
    { id: 'commission', label: 'Commission', icon: Percent, permission: 'commission' },
    { id: 'users', label: 'User Management', icon: Shield, permission: 'users' },
    { id: 'vendors', label: 'Vendors', icon: Store, permission: 'vendors' },
    { id: 'customers', label: 'Customers', icon: Users, permission: 'orders' }, // Customers usually go with orders
  ];

  const navigationItems = allNavigationItems.filter(item => {
    if (isSuperAdmin) return true;
    if (item.id === 'overview') return true;
    if (item.id === 'users') return false; // Only superadmin sees user management usually, or explicit permission
    return userPermissions.includes(item.permission);
  });
  
  // Redirect if current tab is not allowed
  useEffect(() => {
    const currentItem = navigationItems.find(i => i.id === activeTab);
    if (!currentItem && activeTab !== 'overview') {
      setActiveTab('overview');
    }
  }, [activeTab, navigationItems]);

  const getOrderStatusConfig = (status: string) => {
    switch (status) {
      case 'pending-approval':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending Approval' };
      case 'approved':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Approved' };
      case 'forwarded-to-vendor':
        return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Sent to Vendor' };
      case 'vendor-processing':
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Vendor Processing' };
      case 'vendor-dispatched':
        return { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', label: 'Vendor Dispatched' };
      case 'in-transit-to-warehouse':
        return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', label: 'In Transit to Warehouse' };
      case 'received-at-warehouse':
        return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: 'At Warehouse' };
      case 'dispatched-to-buyer':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Dispatched to Buyer' };
      case 'in-transit-to-buyer':
        return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'In Transit' };
      case 'delivered':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Delivered' };
      case 'cancelled':
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Cancelled' };
      // Legacy statuses
      case 'placed':
        return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Order Placed' };
      case 'confirmed':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Confirmed' };
      case 'processing':
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', label: 'Processing' };
      case 'dispatched':
        return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Dispatched' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: status };
    }
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with Shiprocket API or save local delivery details
    setShowDispatchModal(false);
    setDispatchForm({
      orderId: '',
      deliveryMethod: 'local',
      courierService: '',
      trackingId: '',
      vehicleNumber: '',
      driverName: '',
      driverPhone: '',
      estimatedDelivery: ''
    });
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      setLoading(true);
      const productService = await import('../services/productService');
      await productService.approveProduct(productId);
      await loadPendingProducts(); // Reload pending products
      await loadDashboardStats(); // Update stats
    } catch (err) {
      console.error('Failed to approve product:', err);
      alert('Failed to approve product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProduct = async (productId: string) => {
    if (confirm('Are you sure you want to reject this product?')) {
      try {
        setLoading(true);
        const productService = await import('../services/productService');
        await productService.rejectProduct(productId);
        await loadPendingProducts();
        await loadDashboardStats(); // Update stats too
      } catch (err) {
        console.error('Failed to reject product:', err);
        alert('Failed to reject product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const loadNotifications = async () => {
    try {
      const count = notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          loadNotifications();
        }}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-40">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Tashivar</span>
              <span className="text-xs text-rose-600 font-medium">Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1 ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Menu at Bottom */}
        <div className="border-t border-gray-200 p-3 space-y-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-indigo-700"
          >
            <LayoutGrid className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-medium">Switch Portal</span>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-rose-600 to-orange-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                A
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
                <button 
                  onClick={() => {
                    setShowSettingsModal(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" strokeWidth={2} />
                  Settings
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button 
                    onClick={onLogout}
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16">
          <div className="h-full px-8 flex items-center justify-between">
            <div>
              {activeTab === 'overview' && (
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Welcome, {userName}!</h1>
                  <p className="text-sm text-gray-600">Manage your B2B marketplace operations</p>
                </div>
              )}
              {activeTab !== 'overview' && (
                <h1 className="text-xl font-semibold text-gray-900 capitalize">
                  {navigationItems.find(item => item.id === activeTab)?.label}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowNotifications(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <Card key={index} className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                            <p className="text-2xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                          </div>
                          <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                            <Icon className="w-6 h-6" strokeWidth={2} />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* KPI Charts Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Analytics</h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Revenue Trends (Last 6 Months)</h3>
                      <RevenueChart />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Order Status Distribution</h3>
                      <OrderStatusChart />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Sales by Category</h3>
                      <CategorySalesChart />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Top 5 Buyers</h3>
                      <TopBuyersChart />
                    </div>
                  </div>
                </div>

                {/* Pending Approvals */}
                {pendingProducts.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Product Approvals</h2>
                    <div className="space-y-3">
                      {pendingProducts.map((product) => (
                        <div key={product.id} className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <ImageWithFallback
                            src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100'} 
                            alt={product.name} 
                            className="w-16 h-16 object-cover rounded-lg" 
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-600">{product.vendor} • Cost: ₹{product.costPrice}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleApproveProduct(product.id)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleRejectProduct(product.id)}
                              className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Orders */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
                  <div className="space-y-3">
                    {orders.slice(0, 4).map((order) => {
                      const statusConfig = getOrderStatusConfig(order.status);
                      return (
                        <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900">{order.id}</p>
                              <span className={`px-2 py-0.5 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} rounded text-xs font-medium`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{order.buyer}</p>
                            <p className="text-xs text-gray-500">{order.products.length} items • ₹{order.subtotal.toLocaleString()}</p>
                          </div>
                          {order.status === 'confirmed' && (
                            <button 
                              onClick={() => {
                                setDispatchForm({...dispatchForm, orderId: order.id});
                                setShowDispatchModal(true);
                              }}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                            >
                              Dispatch
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Financial Summary</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className="text-xl font-semibold text-gray-900">₹{(accountingSummary.totalSales / 100000).toFixed(1)}L</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Commission Paid</p>
                      <p className="text-xl font-semibold text-indigo-600">₹{(accountingSummary.totalCommission / 100000).toFixed(1)}L</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Net Profit</p>
                      <p className="text-xl font-semibold text-emerald-600">₹{(accountingSummary.netProfit / 100000).toFixed(1)}L</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Manage Orders
                    </button>
                    <button 
                      onClick={() => setActiveTab('commission')}
                      className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Set Commission
                    </button>
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                    >
                      Review Products
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab - Complete with dispatch management */}
          {activeTab === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                   <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
                   <div className="flex gap-4 mt-2">
                      <button 
                         className={`pb-1 px-1 text-sm font-medium transition-colors ${orderSubTab === 'system' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                         onClick={() => {
                           setOrderSubTab('system');
                           setSelectedOrder(null);
                         }}
                      >
                         Online Orders
                      </button>
                      <button 
                         className={`pb-1 px-1 text-sm font-medium transition-colors ${orderSubTab === 'offline' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                         onClick={() => setOrderSubTab('offline')}
                      >
                         Offline Orders
                      </button>
                      <button 
                         className={`pb-1 px-1 text-sm font-medium transition-colors ${orderSubTab === 'manufacturing' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-900'}`}
                         onClick={() => setOrderSubTab('manufacturing')}
                      >
                         Manufacturing Orders
                      </button>
                      <button 
                         className={`pb-1 px-1 text-sm font-medium transition-colors ${orderSubTab === 'challans' ? 'border-b-2 border-amber-600 text-amber-600' : 'text-gray-500 hover:text-gray-900'}`}
                         onClick={() => setOrderSubTab('challans')}
                      >
                         Challans
                      </button>
                   </div>
                </div>
              </div>

              {orderSubTab === 'system' ? (
                 orderView === 'sales' && (
                  <>
                    {loading && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-blue-700">Loading orders...</p>
                      </div>
                    )}
      
                    {error && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-amber-700">{error}</p>
                      </div>
                    )}

                    {!loading && !error && (
                      selectedOrder ? (
                        <div>
                          <button 
                            onClick={() => setSelectedOrder(null)} 
                            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" /> Back to Order List
                          </button>
                          
                          {orders.find(o => o.id === selectedOrder) ? (
                            <OrderFlow 
                              order={orders.find(o => o.id === selectedOrder)}
                              onApprove={handleApproveOrder}
                              onForwardToVendor={handleForwardToVendor}
                              onReceiveAtWarehouse={handleReceiveAtWarehouse}
                              onDispatchToBuyer={handleDispatchToBuyer}
                              userRole="admin"
                            />
                          ) : (
                            <div className="text-center py-12">Order not found</div>
                          )}
                        </div>
                      ) : (
                        <OrderListTable 
                          orders={orders} 
                          onSelectOrder={setSelectedOrder} 
                          getStatusConfig={getOrderStatusConfig}
                        />
                      )
                    )}
                  </>
              )
             ) : orderSubTab === 'offline' ? (
                 <OfflineOrderManager onOrderConverted={loadOrders} />
               ) : orderSubTab === 'manufacturing' ? (
                 <ManufacturingModule />
               ) : orderSubTab === 'challans' ? (
                 <ChallanManagement />
               ) : null
             }
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && (
            <FinanceTab 
              financeView={financeView}
              setFinanceView={setFinanceView}
              accountingSummary={accountingSummary}
              onRefreshData={loadAllData}
            />
          )}

          {/* Commission Tab */}
          {activeTab === 'commission' && (
            <CommissionManagement />
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <AdminProductManagement />
          )}

          {/* Quality & Colors Tab */}
          {activeTab === 'quality-colors' && (
            <QualityColorManagement />
          )}

          {/* Vendors Tab */}
          {activeTab === 'vendors' && (
            <VendorBuyerManagement type="vendor" />
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <VendorBuyerManagement type="buyer" />
          )}

          {/* Buyers Tab (Legacy) */}
          {/* Designers Tab */}
          {activeTab === 'designers' && (
            <VendorBuyerManagement type="designer" />
          )}

          {/* Stitching Masters Tab */}
          {activeTab === 'stitching-masters' && (
            <VendorBuyerManagement type="stitching-master" />
          )}

          {/* Agents Tab - showing Vendor Agents by default, maybe add subtabs inside? For now showing Vendor Agents */}
          {activeTab === 'agents' && (
            <div className="space-y-8">
              <VendorBuyerManagement type="vendor-agent" />
              <div className="border-t border-gray-200 my-8"></div>
              <VendorBuyerManagement type="buyer-agent" />
              <div className="border-t border-gray-200 my-8"></div>
              <VendorBuyerManagement type="designer-agent" />
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <InventoryModule />
          )}

          {/* Warehouse Tab */}
          {activeTab === 'warehouse' && (
            <WarehouseModule />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <UserManagement />
          )}
          
          {/* Production/Manufacturing Tab */}
          {activeTab === 'production' && (
            <ManufacturingModule />
          )}
        </div>
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Dispatch Order</h3>
                <button onClick={() => setShowDispatchModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Delivery Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDispatchForm({...dispatchForm, deliveryMethod: 'local'})}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg ${
                      dispatchForm.deliveryMethod === 'local'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Car className="w-5 h-5" />
                    <span className="font-medium">Local Delivery</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispatchForm({...dispatchForm, deliveryMethod: 'shiprocket'})}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg ${
                      dispatchForm.deliveryMethod === 'shiprocket'
                        ? 'border-violet-600 bg-violet-50 text-violet-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                    <span className="font-medium">Shiprocket</span>
                  </button>
                </div>
              </div>

              {dispatchForm.deliveryMethod === 'local' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Vehicle Number</label>
                      <input
                        value={dispatchForm.vehicleNumber}
                        onChange={(e) => setDispatchForm({...dispatchForm, vehicleNumber: e.target.value})}
                        placeholder="MH02 AB 1234"
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Driver Name</label>
                      <input
                        value={dispatchForm.driverName}
                        onChange={(e) => setDispatchForm({...dispatchForm, driverName: e.target.value})}
                        placeholder="Driver name"
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Driver Phone</label>
                    <input
                      value={dispatchForm.driverPhone}
                      onChange={(e) => setDispatchForm({...dispatchForm, driverPhone: e.target.value})}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Courier Service</label>
                    <select
                      value={dispatchForm.courierService}
                      onChange={(e) => setDispatchForm({...dispatchForm, courierService: e.target.value})}
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select courier</option>
                      <option value="Delhivery">Delhivery</option>
                      <option value="BlueDart">BlueDart</option>
                      <option value="DTDC">DTDC</option>
                      <option value="Ecom Express">Ecom Express</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Tracking ID</label>
                    <input
                      value={dispatchForm.trackingId}
                      onChange={(e) => setDispatchForm({...dispatchForm, trackingId: e.target.value})}
                      placeholder="Enter tracking ID"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be auto-generated via Shiprocket API</p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Estimated Delivery</label>
                <input
                  type="date"
                  value={dispatchForm.estimatedDelivery}
                  onChange={(e) => setDispatchForm({...dispatchForm, estimatedDelivery: e.target.value})}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
                >
                  Dispatch Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Platform Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Platform Name</span>
                    <span className="font-medium text-gray-900">Tashivar B2B Portal</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Version</span>
                    <span className="font-medium text-gray-900">1.0.0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Environment</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Production</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Account Settings</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Admin Email</label>
                    <input
                      type="email"
                      defaultValue="admin@tashivar.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue="+91 98765 00000"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Data Management</h4>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      alert('Export feature will be available soon. All data will be exported in JSON format.');
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Export All Data
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    alert('Settings saved successfully!');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Manual Order Modal */}
      <FinanceTransactionModal
        isOpen={showManualOrderModal}
        onClose={() => setShowManualOrderModal(false)}
        type={orderView === 'sales' ? 'sale' : 'purchase'}
        onSubmit={handleManualOrderSubmit}
        vendors={vendors}
        buyers={buyers}
        onRefreshData={loadPartners}
      />
    </div>
  );
}