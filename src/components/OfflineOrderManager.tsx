import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, Calendar, User, Store, Package, ArrowRight, DollarSign, MessageSquare, Trash2, Edit, ChevronDown, ChevronUp, Image as ImageIcon, ExternalLink, RefreshCw, Star, Printer } from 'lucide-react';
import * as offlineOrderService from '../services/offlineOrderService';
import * as orderService from '../services/orderService';
import * as vendorService from '../services/vendorService';
import * as buyerService from '../services/buyerService';
import * as productService from '../services/productService';
import * as workTypesService from '../services/workTypesService';
import * as qualityColorService from '../services/qualityColorService';
import { toast } from 'sonner@2.0.3';
import { ImageUpload, MultiImageUpload } from './ImageUpload';
import { initializeBucket } from '../services/imageUploadService';
import { CustomerSearchDropdown } from './CustomerSearchDropdown';
import { VendorSearchDropdown } from './VendorSearchDropdown';
import { TashivarInvoice } from './TashivarInvoice';
import { LoadingSpinner, ButtonWithLoading, TableSkeleton } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields, validateEmail, validatePhone } from '../utils/security';
import { apiClient, handleApiError } from '../utils/apiClient';

interface OfflineOrderManagerProps {
  onOrderConverted?: () => void;
}

export function OfflineOrderManager({ onOrderConverted }: OfflineOrderManagerProps) {
  const [requests, setRequests] = useState<offlineOrderService.OfflineOrder[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [newWorkType, setNewWorkType] = useState('');
  const [qualities, setQualities] = useState<any[]>([]);
  const [availableColors, setAvailableColors] = useState<any[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceRequest, setInvoiceRequest] = useState<offlineOrderService.OfflineOrder | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<offlineOrderService.OfflineOrder>>(({
    customerName: '',
    customerId: '',
    status: 'pending_vendor',
    items: [],
    referenceImage: '',
    internalNotes: '',
    isChallan: false,
    challanNumber: '',
    challanDate: ''
  }) as any);

  // Temporary item state for the "Add Item" form inside the modal
  const [newItem, setNewItem] = useState<Partial<offlineOrderService.OfflineOrderItem>>((({
    productDetails: '',
    quantity: 1,
    unit: 'pieces',
    targetPrice: 0,
    offeredPrice: 0,
    vendorId: '',
    vendorName: '',
    productId: '',
    fabricColor: '',
    colorNumber: '',
    quality: '',
    qualityId: '',
    panna: '',
    work: '',
    fusing: '',
    status: 'pending_vendor',
    images: [],
    customerNotes: '',
    isTashivarItem: false,
    processCosts: {}
  }) as any));

  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [vendorProducts, setVendorProducts] = useState<any[]>([]);

  // Conversion modal state
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [requestToConvert, setRequestToConvert] = useState<offlineOrderService.OfflineOrder | null>(null);
  const [conversionData, setConversionData] = useState({
    isChallan: false,
    challanNumber: '',
    challanDate: ''
  });

  useEffect(() => {
    loadData();
    // Initialize Supabase Storage bucket
    initializeBucket();
    // Initialize work types
    initializeWorkTypes();
  }, []);

  const initializeWorkTypes = async () => {
    try {
      await workTypesService.initializeDefaultWorkTypes();
      const types = await workTypesService.getAllWorkTypes();
      setWorkTypes(types);
    } catch (err) {
      console.error('Failed to load work types:', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqs, vData, bData] = await Promise.all([
        offlineOrderService.getAllOfflineOrders(),
        vendorService.getAllVendors(),
        buyerService.getAllBuyers()
      ]);
      console.log('📦 Loaded offline orders:', reqs);
      console.log('📦 Number of orders:', reqs.length);
      setRequests(reqs);
      setVendors(vData);
      setBuyers(bData);
      
      // Load qualities
      const qData = await qualityColorService.getAllQualities();
      setQualities(qData);
    } catch (err) {
      console.error('Failed to load data:', err);
      toast.error('Failed to load offline orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      customerName: '',
      customerId: '',
      status: 'pending_vendor',
      items: [],
      referenceImage: '',
      internalNotes: '',
      isChallan: false,
      challanNumber: '',
      challanDate: ''
    });
    setNewItem({
      productDetails: '',
      quantity: 1,
      unit: 'pieces',
      targetPrice: 0,
      offeredPrice: 0,
      vendorId: '',
      vendorName: '',
      status: 'pending_vendor',
      images: [],
      customerNotes: '',
      isTashivarItem: false
    });
    setNewItemImageUrl('');
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (req: offlineOrderService.OfflineOrder) => {
    // If legacy request (no items), convert to item format for editing
    let items = req.items || [];
    if (items.length === 0 && req.productDetails) {
      items = [{
        id: `ITEM-${Date.now()}`,
        productDetails: req.productDetails || '',
        quantity: req.quantity || 1,
        targetPrice: req.targetPrice || 0,
        offeredPrice: 0,
        vendorId: req.vendorId,
        vendorName: req.vendorName || 'Unknown',
        status: (req.status as any) || 'pending_vendor',
        timeline: req.timeline,
        vendorNotes: req.vendorNotes,
        customerNotes: '',
        images: req.images || []
      }];
    }

    setFormData({
      ...req,
      items
    });
    setNewItem({
      productDetails: '',
      quantity: 1,
      unit: 'pieces',
      targetPrice: 0,
      offeredPrice: 0,
      vendorId: '',
      vendorName: '',
      status: 'pending_vendor',
      images: [],
      customerNotes: '',
      isTashivarItem: false
    });
    setNewItemImageUrl('');
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      await offlineOrderService.deleteOfflineOrder(id);
      toast.success('Request deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete request');
    }
  };

  // Handle vendor selection and load products
  const handleVendorSelect = async (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    setNewItem({
      ...newItem, 
      vendorId,
      vendorName: vendor?.name || '',
      productId: '',
      productDetails: ''
    });

    if (vendorId && !newItem.isTashivarItem) {
      try {
        const products = await productService.getProductsByVendor(vendorId);
        const approvedProducts = products.filter(p => p.status === 'approved');
        setVendorProducts(approvedProducts);
        console.log(`📦 Loaded ${products.length} total products for vendor ${vendorId}`);
        console.log(`✅ ${approvedProducts.length} approved products:`, approvedProducts);
        console.log(`📋 Product details:`, approvedProducts.map(p => ({ id: p.id, name: p.name, status: p.status, type: p.type, category: p.category })));
      } catch (error) {
        console.error('Failed to load vendor products:', error);
        setVendorProducts([]);
      }
    } else {
      setVendorProducts([]);
    }
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    if (productId === 'CUSTOM') {
      // Custom product - enable manual entry
      setNewItem({
        ...newItem,
        productId: 'CUSTOM',
        productDetails: '',
        targetPrice: 0,
        offeredPrice: 0,
        images: []
      });
      console.log('✅ Custom product mode enabled');
    } else {
      // Catalog product - auto-populate
      const product = vendorProducts.find(p => p.id === productId);
      if (product) {
        setNewItem({
          ...newItem,
          productId,
          productDetails: product.name,
          targetPrice: product.costPrice || 0,
          offeredPrice: product.costPrice || 0,
          images: product.images || []
        });
        console.log('✅ Product selected:', product.name);
      }
    }
  };

  const handleAddItemToForm = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    // Validation based on item type
    if (newItem.isTashivarItem) {
      // Tashivar items: only need product details
      if (!newItem.productDetails) {
        toast.error('Please enter product details for Tashivar item');
        return;
      }
    } else {
      // Regular items: need vendor AND product selection
      if (!newItem.vendorId) {
        toast.error('Please select a vendor first');
        return;
      }
      if (!newItem.productId) {
        toast.error('Please select a product from the vendor or choose "Add Custom Product"');
        return;
      }
      if (newItem.productId === 'CUSTOM' && !newItem.productDetails) {
        toast.error('Please enter custom product details');
        return;
      }
      if (newItem.productId !== 'CUSTOM' && !newItem.productDetails) {
        toast.error('Product details are missing');
        return;
      }
    }

    // Loose comparison for vendor ID to handle string/number mismatch
    const vendor = newItem.vendorId ? vendors.find(v => String(v.id) === String(newItem.vendorId)) : null;
    
    const itemToAdd: offlineOrderService.OfflineOrderItem = {
      id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productDetails: newItem.productDetails,
      productId: newItem.productId || undefined,
      quantity: Number(newItem.quantity) || 1,
      unit: newItem.unit || 'pieces',
      targetPrice: Number(newItem.targetPrice) || 0,
      offeredPrice: Number(newItem.offeredPrice) || 0,
      fabricColor: newItem.fabricColor || undefined,
      quality: newItem.quality || undefined,
      panna: newItem.panna || undefined,
      work: newItem.work || undefined,
      fusing: newItem.fusing || undefined,
      vendorId: newItem.isTashivarItem ? 'TASHIVAR' : (newItem.vendorId || ''),
      vendorName: newItem.isTashivarItem ? 'By Tashivar' : (vendor ? vendor.name : newItem.vendorName || 'Unknown Vendor'),
      status: 'pending_vendor',
      timeline: '',
      vendorNotes: '',
      customerNotes: newItem.customerNotes || '',
      images: newItem.images || [],
      isTashivarItem: newItem.isTashivarItem || false
    };

    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), itemToAdd]
    }));

    // Reset new item form
    setNewItem({
      productDetails: '',
      quantity: 1,
      unit: 'pieces',
      targetPrice: 0,
      offeredPrice: 0,
      vendorId: newItem.isTashivarItem ? '' : newItem.vendorId, // Keep the same vendor selected for convenience (unless Tashivar)
      vendorName: '',
      productId: '',
      fabricColor: '',
      quality: '',
      panna: '',
      work: '',
      fusing: '',
      status: 'pending_vendor',
      images: [],
      customerNotes: '',
      isTashivarItem: false
    });
    setNewItemImageUrl('');
    
    // If keeping same vendor, reload products
    if (!newItem.isTashivarItem && newItem.vendorId) {
      handleVendorSelect(newItem.vendorId);
    } else {
      setVendorProducts([]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateItemStatus = (index: number, updates: Partial<offlineOrderService.OfflineOrderItem>) => {
    setFormData(prev => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], ...updates };
      return { ...prev, items: newItems };
    });
  };

  const handleAddImageToNewItem = () => {
    if (newItemImageUrl) {
      setNewItem(prev => ({
        ...prev,
        images: [...(prev.images || []), newItemImageUrl]
      }));
      setNewItemImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      let finalData = { ...formData };
      
      // Enrich customer name
      if (finalData.customerId) {
        const b = buyers.find(buy => buy.id === finalData.customerId);
        if (b) finalData.customerName = b.name;
      }

      // Ensure at least one item or legacy data
      if ((!finalData.items || finalData.items.length === 0) && !finalData.productDetails) {
        toast.error('Please add at least one product item');
        setLoading(false);
        return;
      }

      if (isEditing && formData.id) {
        await offlineOrderService.updateOfflineOrder(formData.id, finalData);
        toast.success('Request updated');
      } else {
        await offlineOrderService.createOfflineOrder(finalData);
        toast.success('Request created');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToOrder = async (req: offlineOrderService.OfflineOrder) => {
    // Logic: Create orders for items that are 'customer_approved' (or convert all if forced)
    // Group by vendor
    const itemsToConvert = req.items?.filter(i => i.status === 'customer_approved') || [];
    
    if (itemsToConvert.length === 0) {
       toast.error('No \"Customer Approved\" items to convert. Update item status first.');
       return;
    }

    // Open conversion modal
    setRequestToConvert(req);
    setConversionData({
      isChallan: req.isChallan || false,
      challanNumber: req.challanNumber || '',
      challanDate: req.challanDate || new Date().toISOString().split('T')[0]
    });
    setShowConversionModal(true);
  };

  const handleConfirmConversion = async () => {
    if (!requestToConvert) return;

    const itemsToConvert = requestToConvert.items?.filter(i => i.status === 'customer_approved') || [];
    
    try {
      setLoading(true);

      // Group by Vendor
      const vendorGroups: Record<string, typeof itemsToConvert> = {};
      itemsToConvert.forEach(item => {
        const vId = item.vendorId || 'unknown';
        if (!vendorGroups[vId]) vendorGroups[vId] = [];
        vendorGroups[vId].push(item);
      });

      // Create One Order Per Vendor
      for (const vId of Object.keys(vendorGroups)) {
        const vendorItems = vendorGroups[vId];
        const vendorName = vendorItems[0].vendorName; // Assume consistent

        const orderData: any = {
          date: new Date().toISOString().split('T')[0],
          buyer: requestToConvert.customerName,
          buyerId: requestToConvert.customerId || 'offline-cust',
          buyerPhone: '', 
          buyerAddress: '',
          vendor: vendorName,
          vendorId: vId,
          products: vendorItems.map(item => ({
            id: `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: item.productDetails,
            type: 'custom',
            quantity: item.quantity,
            costPrice: item.offeredPrice || item.targetPrice || 0, // Use confirmed vendor price
            sellingPrice: item.targetPrice || 0, // This should ideally be a 'quotedPrice' but falling back to target
            image: item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=100'
          })),
          subtotal: vendorItems.reduce((sum, i) => sum + ((i.targetPrice || 0) * i.quantity), 0),
          commission: 0,
          commissionDistribution: [],
          profit: 0,
          status: 'placed',
          paymentStatus: 'pending',
          paymentMethod: 'Bank Transfer'
        };

        await orderService.createOrder(orderData);
      }

      // Update items status to converted
      const updatedItems = requestToConvert.items?.map(item => {
        if (item.status === 'customer_approved') {
          return { ...item, status: 'converted' as const };
        }
        return item;
      });

      // Check if all converted
      const allConverted = updatedItems?.every(i => i.status === 'converted' || i.status === 'cancelled');
      
      await offlineOrderService.updateOfflineOrder(requestToConvert.id, { 
        items: updatedItems,
        status: allConverted ? 'converted' : 'partially_converted' as any
      });
      
      toast.success('Orders created successfully!');
      loadData();
      if (onOrderConverted) onOrderConverted();
    } catch (err) {
      console.error(err);
      toast.error('Failed to convert to order');
    } finally {
      setLoading(false);
      setShowConversionModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_vendor': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'vendor_checked': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'vendor_confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'vendor_unavailable': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'customer_notified': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'customer_approved': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'converted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'partially_converted': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_vendor': return 'To Check';
      case 'vendor_checked': return 'Vendor Contacted';
      case 'vendor_confirmed': return 'Vendor Confirmed';
      case 'vendor_unavailable': return 'Unavailable';
      case 'customer_notified': return 'Customer Notified';
      case 'customer_approved': return 'Customer Approved';
      case 'converted': return 'Converted to Order';
      case 'partially_converted': return 'Partially Converted';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.items && req.items.some(i => i.productDetails.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (!req.items && req.productDetails?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1 w-full md:w-auto">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending_vendor">To Check</option>
            <option value="vendor_confirmed">Vendor Confirmed</option>
            <option value="customer_notified">Customer Notified</option>
            <option value="customer_approved">Customer Approved</option>
            <option value="converted">Converted</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            New Offline Order
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offline orders...</p>
        </div>
      )}

      {/* Requests Grid */}
      {!loading && (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
          const isExpanded = expandedRequestId === req.id;
          const items = req.items || (req.productDetails ? [{
            id: 'legacy',
            productDetails: req.productDetails,
            quantity: req.quantity,
            vendorName: req.vendorName,
            status: req.status
          }] : []);

          return (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all shadow-sm">
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                      {getStatusLabel(req.status)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                       <Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {req.customerName}
                    <span className="text-sm font-normal text-gray-500">
                      • {items.length} Item{items.length !== 1 ? 's' : ''}
                    </span>
                    {req.isChallan && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                        <DollarSign className="w-3 h-3" /> CHALLAN
                      </span>
                    )}
                  </h3>
                  {req.internalNotes && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">Note: {req.internalNotes}</p>
                  )}
                  {req.isChallan && req.challanNumber && (
                      <p className="text-xs text-amber-700 mt-1 font-medium">Challan #: {req.challanNumber} {req.challanDate && `• ${new Date(req.challanDate).toLocaleDateString()}`}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(req); }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Request"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(req.id); }}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                   <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: General Info & Reference */}
                        <div className="w-full md:w-1/4 space-y-4">
                            {req.referenceImage && (
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">Reference Image</p>
                                    <img src={req.referenceImage} alt="Reference" className="w-full h-auto rounded object-cover max-h-48" />
                                    <a href={req.referenceImage} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-2 flex items-center gap-1">
                                        <ExternalLink className="w-3 h-3" /> View Original
                                    </a>
                                </div>
                            )}
                            <div className="bg-white p-3 rounded-lg border border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 mb-1">Internal Notes</p>
                                <p className="text-sm text-gray-800">{req.internalNotes || 'No notes.'}</p>
                            </div>
                        </div>

                        {/* Right: Items List */}
                        <div className="flex-1">
                              <div className="mb-4 flex justify-between items-center">
                                <h4 className="text-sm font-semibold text-gray-900">Request Items</h4>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setInvoiceRequest(req); setShowInvoiceModal(true); }}
                                    className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 shadow-sm"
                                  >
                                    <Printer className="w-3 h-3" /> Print Invoice
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleConvertToOrder(req); }}
                                    className="text-xs font-medium bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm"
                                  >
                                    <RefreshCw className="w-3 h-3" /> Convert Approved to Orders
                                  </button>
                                </div>
                            </div>
                            
                            <div className="grid gap-3">
                                {items.map((item: any, idx) => (
                                <div key={item.id || idx} className="bg-white p-4 rounded-lg border border-gray-200 relative">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Item Image */}
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                            {item.images && item.images.length > 0 ? (
                                                <img src={item.images[0]} alt="Product" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-300">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h5 className="font-medium text-gray-900 flex items-center gap-1">
                                                  {item.productDetails}
                                                  {item.isTashivarItem && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> By Tashivar
                                                    </span>
                                                  )}
                                                </h5>
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${getStatusColor(item.status)}`}>
                                                    {getStatusLabel(item.status)}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Vendor</p>
                                                    <p className="font-medium text-gray-900 flex items-center gap-1">
                                                        <Store className="w-3 h-3 text-gray-400" /> {item.vendorName}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Quantity</p>
                                                    <p className="font-medium text-gray-900">{item.quantity}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{item.unit === 'meters' ? 'Meters' : 'Pieces'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Target Cost</p>
                                                    <p className="font-medium text-gray-900">₹{item.targetPrice || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Offered Cost</p>
                                                    <p className={`font-medium ${item.offeredPrice ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                        {item.offeredPrice ? `₹${item.offeredPrice}` : '-'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Fabric Specifications */}
                                            {(item.fabricColor || item.quality || item.panna || item.work || item.fusing) && (
                                              <div className="mt-3 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                                <p className="text-xs font-semibold text-indigo-900 mb-2 flex items-center gap-1">
                                                  <Package className="w-3 h-3" /> Fabric Specifications
                                                </p>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                                  {item.fabricColor && (
                                                    <div>
                                                      <span className="text-gray-600">Color:</span>
                                                      <span className="ml-1 font-medium text-gray-900">{item.fabricColor}</span>
                                                    </div>
                                                  )}
                                                  {item.quality && (
                                                    <div>
                                                      <span className="text-gray-600">Quality:</span>
                                                      <span className="ml-1 font-medium text-gray-900">{item.quality}</span>
                                                    </div>
                                                  )}
                                                  {item.panna && (
                                                    <div>
                                                      <span className="text-gray-600">Panna:</span>
                                                      <span className="ml-1 font-medium text-gray-900">{item.panna}</span>
                                                    </div>
                                                  )}
                                                  {item.work && (
                                                    <div>
                                                      <span className="text-gray-600">Work:</span>
                                                      <span className="ml-1 font-medium text-gray-900">{item.work}</span>
                                                    </div>
                                                  )}
                                                  {item.fusing && (
                                                    <div>
                                                      <span className="text-gray-600">Fusing:</span>
                                                      <span className="ml-1 font-medium text-gray-900">{item.fusing}</span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {/* Notes Section */}
                                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {item.vendorNotes && (
                                                    <div className="text-xs bg-blue-50 p-2 rounded text-blue-800 border border-blue-100">
                                                        <span className="font-semibold block mb-0.5">Vendor Note:</span>
                                                        {item.vendorNotes}
                                                    </div>
                                                )}
                                                {item.customerNotes && (
                                                    <div className="text-xs bg-purple-50 p-2 rounded text-purple-800 border border-purple-100">
                                                        <span className="font-semibold block mb-0.5">To Customer:</span>
                                                        {item.customerNotes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                   </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {!loading && filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No offline orders found</h3>
          <p className="text-gray-500 mt-2">Create a new order to track offline transactions.</p>
          
          <p className="text-xs text-gray-400 mt-4">Total orders loaded: {requests.length} | Filtered: {filteredRequests.length}</p>
          {searchTerm && (
            <p className="text-xs text-amber-600 mt-2">Active search filter: "{searchTerm}" - Try clearing the search</p>
          )}
          {statusFilter !== 'all' && (
            <p className="text-xs text-amber-600 mt-2">Active status filter: {statusFilter} - Try "Show All"</p>
          )}
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Update Order' : 'New Offline Order'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Customer & General Info */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" /> Customer Details
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Select Customer</label>
                                <CustomerSearchDropdown
                                  value={formData.customerId || ''}
                                  onChange={(id) => {
                                    const customer = buyers.find(b => b.id === id);
                                    setFormData({
                                      ...formData, 
                                      customerId: id,
                                      customerName: customer ? customer.name : formData.customerName
                                    });
                                  }}
                                  onCustomerCreated={loadData}
                                  customers={buyers}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Or Enter Name</label>
                                <input 
                                type="text" 
                                value={formData.customerName}
                                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Customer Name"
                                />
                            </div>
                        </div>
                    </div>

                    <ImageUpload 
                      label="Reference Image"
                      currentImage={formData.referenceImage}
                      onImageUploaded={(url) => setFormData({...formData, referenceImage: url})}
                      onRemove={() => setFormData({...formData, referenceImage: ''})}
                      folder="references"
                      className="bg-white p-4 rounded-xl border border-gray-200"
                    />

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                         <div className="flex items-center gap-2 mb-3">
                           <input 
                              type="checkbox"
                              id="isChallan"
                              checked={formData.isChallan || false}
                              onChange={(e) => setFormData({...formData, isChallan: e.target.checked})}
                              className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                           />
                           <label htmlFor="isChallan" className="text-sm font-bold text-amber-900 cursor-pointer flex items-center gap-1">
                             <DollarSign className="w-4 h-4" /> Is Challan Order? (No immediate payment)
                           </label>
                         </div>
                         
                         {formData.isChallan && (
                           <div className="space-y-3 pl-6 border-l-2 border-amber-300">
                             <div>
                               <label className="block text-xs font-medium text-amber-900 mb-1">Challan Number</label>
                               <input 
                                 type="text" 
                                 value={formData.challanNumber || ''}
                                 onChange={(e) => setFormData({...formData, challanNumber: e.target.value})}
                                 className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white"
                                 placeholder="CH-2025-001"
                               />
                             </div>
                             <div>
                               <label className="block text-xs font-medium text-amber-900 mb-1">Challan Date</label>
                               <input 
                                 type="date" 
                                 value={formData.challanDate || ''}
                                 onChange={(e) => setFormData({...formData, challanDate: e.target.value})}
                                 className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white"
                               />
                             </div>
                           </div>
                         )}
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                         <label className="block text-sm font-semibold text-gray-900 mb-2">Internal Notes</label>
                         <textarea 
                            value={formData.internalNotes || ''}
                            onChange={(e) => setFormData({...formData, internalNotes: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-24 resize-none"
                            placeholder="Private notes for team..."
                         />
                    </div>
                  </div>

                  {/* Right Column: Items */}
                  <div className="md:col-span-2 space-y-4">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Requested Items
                        </h4>
                        
                        {/* Add New Item Box */}
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                            <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-3">Add Item</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                {/* Step 1: Vendor Selection */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Step 1: Select Vendor
                                    </label>
                                    <VendorSearchDropdown
                                      value={newItem.vendorId}
                                      onChange={handleVendorSelect}
                                      vendors={vendors}
                                      disabled={newItem.isTashivarItem}
                                    />
                                </div>

                                {/* Step 2: Product Selection (shows after vendor is selected) */}
                                {newItem.vendorId && !newItem.isTashivarItem && (
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Step 2: Select Product or Add Custom
                                    </label>
                                    <select
                                      value={newItem.productId || ''}
                                      onChange={(e) => handleProductSelect(e.target.value)}
                                      className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm bg-white"
                                    >
                                      <option value="">-- Select Product --</option>
                                      <option value="CUSTOM" style={{ fontWeight: 'bold', color: '#059669' }}>
                                        ➕ Add Custom Product (Not in Catalog)
                                      </option>
                                      {vendorProducts.length > 0 && (
                                        <option disabled>──────────────────</option>
                                      )}
                                      {vendorProducts.map(product => (
                                        <option key={product.id} value={product.id}>
                                          {product.name} - ₹{product.costPrice} ({product.type || product.category})
                                        </option>
                                      ))}
                                    </select>
                                    {vendorProducts.length === 0 && (
                                      <p className="text-xs text-amber-600 mt-1">
                                        No approved products found for this vendor. Select "Add Custom Product" to continue.
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* Product Details (Read-only for catalog, editable for custom) */}
                                {newItem.productId && newItem.productId !== 'CUSTOM' && (
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Product Details (From Catalog)
                                    </label>
                                    <input 
                                        type="text"
                                        value={newItem.productDetails}
                                        readOnly
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-not-allowed"
                                    />
                                  </div>
                                )}
                                
                                {/* Custom Product Details (Editable) */}
                                {newItem.productId === 'CUSTOM' && (
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Custom Product Details ✏️
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="Enter product name (e.g., Designer Saree with Embroidery)"
                                        value={newItem.productDetails}
                                        onChange={(e) => setNewItem({...newItem, productDetails: e.target.value})}
                                        className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm bg-green-50"
                                    />
                                    <p className="text-xs text-green-600 mt-1">
                                      This is a custom product not in the catalog. Enter details manually.
                                    </p>
                                  </div>
                                )}
                                
                                {/* Quantity, Unit & Target Price Row */}
                                <div className="md:col-span-2">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Quantity and Unit */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                          Quantity & Unit
                                        </label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number"
                                                placeholder="Qty"
                                                min="1"
                                                step="0.01"
                                                value={newItem.quantity || ''}
                                                onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})}
                                                className="flex-1 min-w-0 px-3 py-2.5 border border-indigo-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                            <select
                                                value={newItem.unit || 'pieces'}
                                                onChange={(e) => setNewItem({...newItem, unit: e.target.value as 'pieces' | 'meters'})}
                                                className="px-3 py-2.5 border border-indigo-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-28 flex-shrink-0"
                                            >
                                                <option value="pieces">Pieces</option>
                                                <option value="meters">Meters</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Target Price */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                          Target Price (₹)
                                        </label>
                                        <input 
                                            type="number"
                                            placeholder="Enter amount"
                                            min="0"
                                            step="0.01"
                                            value={newItem.targetPrice || ''}
                                            onChange={(e) => setNewItem({...newItem, targetPrice: parseFloat(e.target.value) || 0})}
                                            className="w-full px-3 py-2.5 border border-indigo-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                  </div>
                                </div>

                                {/* Fabric Specifications Section */}
                                <div className="md:col-span-2">
                                  <h6 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                    <Package className="w-3 h-3" /> Fabric Specifications (Optional)
                                  </h6>
                                </div>
                                
                                {/* Fabric Color */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Fabric Color
                                    </label>
                                    <input 
                                        type="text"
                                        list="colorOptions"
                                        placeholder="e.g. Royal Blue"
                                        value={newItem.fabricColor || ''}
                                        onChange={(e) => setNewItem({...newItem, fabricColor: e.target.value})}
                                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm"
                                    />
                                    <datalist id="colorOptions">
                                      <option value="Red" />
                                      <option value="Blue" />
                                      <option value="Green" />
                                      <option value="Yellow" />
                                      <option value="Pink" />
                                      <option value="Purple" />
                                      <option value="Orange" />
                                      <option value="Black" />
                                      <option value="White" />
                                      <option value="Cream" />
                                      <option value="Beige" />
                                      <option value="Brown" />
                                      <option value="Maroon" />
                                      <option value="Navy Blue" />
                                      <option value="Sky Blue" />
                                      <option value="Golden" />
                                      <option value="Silver" />
                                    </datalist>
                                </div>
                                
                                {/* Quality */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Quality
                                    </label>
                                    <select 
                                        value={newItem.quality || ''}
                                        onChange={(e) => setNewItem({...newItem, quality: e.target.value})}
                                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">Select Quality</option>
                                        <option value="Velvet">Velvet</option>
                                        <option value="Armani">Armani</option>
                                        <option value="Pure Silk">Pure Silk</option>
                                        <option value="Art Silk">Art Silk</option>
                                        <option value="Cotton">Cotton</option>
                                        <option value="Premium Cotton">Premium Cotton</option>
                                        <option value="Chanderi">Chanderi</option>
                                        <option value="Banarasi">Banarasi</option>
                                        <option value="Tussar Silk">Tussar Silk</option>
                                        <option value="Georgette">Georgette</option>
                                        <option value="Chiffon">Chiffon</option>
                                        <option value="Crepe">Crepe</option>
                                        <option value="Net">Net</option>
                                        <option value="Organza">Organza</option>
                                        <option value="Satin">Satin</option>
                                        <option value="Silk Blend">Silk Blend</option>
                                        <option value="Linen">Linen</option>
                                        <option value="Khadi">Khadi</option>
                                        <option value="Denim">Denim</option>
                                        <option value="Lycra">Lycra</option>
                                        <option value="Rayon">Rayon</option>
                                        <option value="Modal">Modal</option>
                                        <option value="Viscose">Viscose</option>
                                        <option value="Polyester">Polyester</option>
                                        <option value="Jacquard">Jacquard</option>
                                        <option value="Brocade">Brocade</option>
                                        <option value="Muslin">Muslin</option>
                                        <option value="Lawn">Lawn</option>
                                        <option value="Voile">Voile</option>
                                        <option value="Katan">Katan</option>
                                    </select>
                                </div>
                                
                                {/* Panna */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Panna (Width)
                                    </label>
                                    <select 
                                        value={newItem.panna || ''}
                                        onChange={(e) => setNewItem({...newItem, panna: e.target.value})}
                                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">Select Width</option>
                                        <option value="36 inch">36 inch</option>
                                        <option value="40 inch">40 inch</option>
                                        <option value="42 inch">42 inch</option>
                                        <option value="44 inch">44 inch</option>
                                        <option value="46 inch">46 inch</option>
                                        <option value="48 inch">48 inch</option>
                                        <option value="52 inch">52 inch</option>
                                        <option value="54 inch">54 inch</option>
                                        <option value="58 inch">58 inch</option>
                                        <option value="60 inch">60 inch</option>
                                        <option value="72 inch">72 inch</option>
                                    </select>
                                </div>
                                
                                {/* Quality */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Quality
                                    </label>
                                    <select 
                                        value={newItem.qualityId || ''}
                                        onChange={(e) => {
                                          const quality = qualities.find(q => q.id === e.target.value);
                                          setNewItem({
                                            ...newItem,
                                            qualityId: e.target.value,
                                            quality: quality?.name || '',
                                            colorNumber: ''
                                          });
                                          setAvailableColors(quality?.colors || []);
                                        }}
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">Select Quality</option>
                                        {qualities.map(q => (
                                          <option key={q.id} value={q.id}>{q.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Color Number */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Color Number
                                    </label>
                                    <select 
                                        value={newItem.colorNumber || ''}
                                        onChange={(e) => {
                                          const color = availableColors.find(c => c.number === e.target.value);
                                          setNewItem({
                                            ...newItem,
                                            colorNumber: e.target.value,
                                            fabricColor: color?.name || ''
                                          });
                                        }}
                                        disabled={!newItem.qualityId}
                                        className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm bg-white disabled:bg-gray-100"
                                    >
                                        <option value="">Select Color #</option>
                                        {availableColors.map(color => (
                                          <option key={color.number} value={color.number}>
                                            #{color.number} - {color.name}
                                          </option>
                                        ))}
                                    </select>
                                </div>
                                
                                {/* Work */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Work Type
                                    </label>
                                    <select 
                                        value={newItem.work || ''}
                                        onChange={(e) => {
                                          if (e.target.value === 'ADD_NEW') {
                                            setNewItem({...newItem, work: ''});
                                          } else {
                                            setNewItem({...newItem, work: e.target.value});
                                          }
                                        }}
                                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">Select Work Type</option>
                                        {workTypes.map(type => (
                                          <option key={type} value={type}>{type}</option>
                                        ))}
                                        <option value="ADD_NEW">➕ Add New Work Type...</option>
                                    </select>
                                    {newItem.work === '' && (
                                      <div className="mt-2 flex gap-2">
                                        <input 
                                          type="text"
                                          placeholder="Enter new work type"
                                          value={newWorkType}
                                          onChange={(e) => setNewWorkType(e.target.value)}
                                          className="flex-1 px-2 py-1 border border-green-300 rounded text-xs"
                                        />
                                        <button 
                                          type="button"
                                          onClick={async () => {
                                            if (newWorkType.trim()) {
                                              try {
                                                await workTypesService.addWorkType(newWorkType.trim());
                                                await initializeWorkTypes();
                                                setNewItem({...newItem, work: newWorkType.trim()});
                                                setNewWorkType('');
                                                toast.success('Work type added!');
                                              } catch (err) {
                                                toast.error('Failed to add work type');
                                              }
                                            }
                                          }}
                                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                        >
                                          Add
                                        </button>
                                      </div>
                                    )}
                                </div>
                                
                                {/* Fusing */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Fusing
                                    </label>
                                    <select 
                                        value={newItem.fusing || ''}
                                        onChange={(e) => setNewItem({...newItem, fusing: e.target.value})}
                                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm bg-white"
                                    >
                                        <option value="">Select Fusing</option>
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                        <option value="Single Fusing">Single Fusing</option>
                                        <option value="Double Fusing">Double Fusing</option>
                                        <option value="Not Required">Not Required</option>
                                        <option value="Done">Done</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>

                                {/* Process Costs Section */}
                                <div className="md:col-span-2 bg-green-50 p-4 rounded-lg border border-green-200">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                      💰 Process Costs (Optional)
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {qualityColorService.DEFAULT_PROCESS_COSTS.map(process => (
                                          <div key={process.id}>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              {process.name}
                                            </label>
                                            <input 
                                                type="number"
                                                placeholder="₹ 0"
                                                value={newItem.processCosts?.[process.id] || ''}
                                                onChange={(e) => setNewItem({
                                                  ...newItem,
                                                  processCosts: {
                                                    ...newItem.processCosts,
                                                    [process.id]: parseFloat(e.target.value) || 0
                                                  }
                                                })}
                                                className="w-full px-2 py-1.5 border border-green-300 rounded text-sm"
                                            />
                                          </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-green-700 mt-2">
                                      💡 Add process costs for accurate pricing calculations
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <MultiImageUpload 
                                      label="Product Images (Optional)"
                                      images={newItem.images || []}
                                      onImageAdded={(url) => setNewItem({...newItem, images: [...(newItem.images || []), url]})}
                                      onImageRemoved={(idx) => setNewItem({...newItem, images: newItem.images?.filter((_, i) => i !== idx)})}
                                      folder="products"
                                      maxImages={5}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                     <input 
                                        type="text"
                                        placeholder="Customer Note (e.g. Needs by Friday)"
                                        value={newItem.customerNotes}
                                        onChange={(e) => setNewItem({...newItem, customerNotes: e.target.value})}
                                        className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                     <input 
                                        type="checkbox"
                                        id="tashivarItem"
                                        checked={newItem.isTashivarItem || false}
                                        onChange={(e) => {
                                          setNewItem({
                                            ...newItem, 
                                            isTashivarItem: e.target.checked, 
                                            vendorId: e.target.checked ? '' : newItem.vendorId,
                                            productId: '',
                                            productDetails: ''
                                          });
                                          setVendorProducts([]);
                                        }}
                                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                                    />
                                     <label htmlFor="tashivarItem" className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-1">
                                       <Star className="w-4 h-4 text-amber-500" /> Is Tashivar Item? (Vendor not required - enter details manually)
                                     </label>
                                </div>

                                {/* Manual Product Entry for Tashivar Items */}
                                {newItem.isTashivarItem && (
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Product Details (Manual Entry)
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="Enter product details (e.g. Premium Silk Saree)"
                                        value={newItem.productDetails}
                                        onChange={(e) => setNewItem({...newItem, productDetails: e.target.value})}
                                        className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-amber-50"
                                    />
                                  </div>
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={handleAddItemToForm}
                                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Item to Request
                            </button>
                        </div>

                        {/* Items List */}
                        {formData.items && formData.items.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                            {formData.items.map((item, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col gap-3 relative group">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                            {item.images && item.images.length > 0 ? (
                                                <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5 text-gray-300 m-auto mt-3.5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{item.productDetails}</p>
                                            <p className="text-xs text-gray-500">
                                                {item.vendorName}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Qty: {item.quantity} {item.unit === 'meters' ? 'Meters' : 'Pieces'} • Target: ₹{item.targetPrice}
                                            </p>
                                            {(item.fabricColor || item.quality || item.panna || item.work || item.fusing) && (
                                              <div className="text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded mt-1 flex flex-wrap gap-x-2 gap-y-0.5">
                                                {item.fabricColor && <span>Color: <strong>{item.fabricColor}</strong></span>}
                                                {item.quality && <span>Quality: <strong>{item.quality}</strong></span>}
                                                {item.panna && <span>Panna: <strong>{item.panna}</strong></span>}
                                                {item.work && <span>Work: <strong>{item.work}</strong></span>}
                                                {item.fusing && <span>Fusing: <strong>{item.fusing}</strong></span>}
                                              </div>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleRemoveItem(idx)}
                                        className="text-gray-400 hover:text-rose-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {/* Status & Updates Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-gray-50 p-2 rounded">
                                    <div>
                                        <label className="text-[10px] text-gray-500 font-semibold uppercase">Status</label>
                                        <select 
                                            value={item.status}
                                            onChange={(e) => handleUpdateItemStatus(idx, { status: e.target.value as any })}
                                            className={`text-xs px-2 py-1.5 w-full rounded border ${getStatusColor(item.status)}`}
                                        >
                                            <option value="pending_vendor">To Check</option>
                                            <option value="vendor_checked">Vendor Contacted</option>
                                            <option value="vendor_confirmed">Vendor Confirmed</option>
                                            <option value="vendor_unavailable">Unavailable</option>
                                            <option value="customer_notified">Customer Notified</option>
                                            <option value="customer_approved">Customer Approved</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="converted">Converted</option>
                                        </select>
                                    </div>
                                    
                                    {(item.status === 'vendor_confirmed' || item.status === 'customer_notified' || item.status === 'customer_approved') && (
                                        <>
                                            <div>
                                                <label className="text-[10px] text-gray-500 font-semibold uppercase">Offered Price (Cost)</label>
                                                <input 
                                                    type="number"
                                                    value={item.offeredPrice || ''}
                                                    onChange={(e) => handleUpdateItemStatus(idx, { offeredPrice: parseFloat(e.target.value) || 0 })}
                                                    placeholder="₹0"
                                                    className="text-xs border border-gray-300 rounded px-2 py-1.5 w-full"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] text-gray-500 font-semibold uppercase">Vendor Notes</label>
                                                <input 
                                                    type="text"
                                                    value={item.vendorNotes || ''}
                                                    onChange={(e) => handleUpdateItemStatus(idx, { vendorNotes: e.target.value })}
                                                    placeholder="e.g. Only Blue available"
                                                    className="text-xs border border-gray-300 rounded px-2 py-1.5 w-full"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            ))}
                        </div>
                        ) : (
                        <p className="text-sm text-gray-500 italic text-center py-4">No items added yet.</p>
                        )}
                  </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Modal */}
      {showConversionModal && requestToConvert && (() => {
        const itemsToConvert = requestToConvert.items?.filter(i => i.status === 'customer_approved') || [];
        return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-emerald-50">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600" />
                Convert Approved Items to Orders
              </h3>
              <button onClick={() => setShowConversionModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                <h4 className="text-sm font-semibold text-indigo-900 mb-2">Conversion Summary</h4>
                <div className="space-y-1">
                  <p className="text-sm text-indigo-800">
                    <strong>Customer:</strong> {requestToConvert.customerName}
                  </p>
                  <p className="text-sm text-indigo-800">
                    <strong>Approved Items:</strong> {itemsToConvert.length} item{itemsToConvert.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-indigo-600 mt-2 italic">
                    → {Object.keys(itemsToConvert.reduce((acc, item) => {acc[item.vendorId || 'unknown'] = true; return acc;}, {} as Record<string, boolean>)).length} order{Object.keys(itemsToConvert.reduce((acc, item) => {acc[item.vendorId || 'unknown'] = true; return acc;}, {} as Record<string, boolean>)).length !== 1 ? 's' : ''} will be created (grouped by vendor)
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Items Being Converted:</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {itemsToConvert.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg flex gap-3 border border-gray-200">
                      <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400 m-auto mt-3.5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{item.productDetails}</p>
                        <p className="text-xs text-gray-600">
                          <span className="text-indigo-600 font-medium">{item.vendorName}</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity} {item.unit === 'meters' ? 'Meters' : 'Pieces'} • Cost: ₹{item.offeredPrice || item.targetPrice}
                        </p>
                        {(item.fabricColor || item.quality || item.panna || item.work || item.fusing) && (
                          <div className="text-xs text-indigo-700 bg-white px-2 py-1 rounded mt-1 flex flex-wrap gap-x-2 gap-y-0.5 border border-indigo-100">
                            {item.fabricColor && <span>Color: <strong>{item.fabricColor}</strong></span>}
                            {item.quality && <span>Quality: <strong>{item.quality}</strong></span>}
                            {item.panna && <span>Panna: <strong>{item.panna}</strong></span>}
                            {item.work && <span>Work: <strong>{item.work}</strong></span>}
                            {item.fusing && <span>Fusing: <strong>{item.fusing}</strong></span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Challan Options */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <input 
                    type="checkbox"
                    id="conversionChallan"
                    checked={conversionData.isChallan || false}
                    onChange={(e) => setConversionData({...conversionData, isChallan: e.target.checked})}
                    className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="conversionChallan" className="text-sm font-bold text-amber-900 cursor-pointer flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> Convert as Challan Order? (No immediate payment)
                  </label>
                </div>
                
                {conversionData.isChallan && (
                  <div className="space-y-3 pl-6 border-l-2 border-amber-300">
                    <div>
                      <label className="block text-xs font-medium text-amber-900 mb-1">Challan Number</label>
                      <input 
                        type="text" 
                        value={conversionData.challanNumber || ''}
                        onChange={(e) => setConversionData({...conversionData, challanNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white"
                        placeholder="CH-2026-001"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-amber-900 mb-1">Challan Date</label>
                      <input 
                        type="date" 
                        value={conversionData.challanDate || ''}
                        onChange={(e) => setConversionData({...conversionData, challanDate: e.target.value})}
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowConversionModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConversion}
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Convert to Orders
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceRequest && (() => {
        const items = invoiceRequest.items || [];
        const invoiceItems = items.map((item: any) => ({
          description: item.productDetails,
          qualityNumber: item.qualityNumber,
          colorNumbers: item.colorNumbers || [],
          quantity: item.quantity,
          unit: item.unit || 'pieces',
          rate: item.targetPrice || item.offeredPrice || 0,
          amount: (item.targetPrice || item.offeredPrice || 0) * item.quantity,
          processCosts: item.processCosts || {}
        }));

        const total = invoiceItems.reduce((sum, item) => sum + item.amount, 0);

        return (
          <TashivarInvoice
            type="invoice"
            documentNumber={`OFF-${invoiceRequest.id?.substring(0, 8).toUpperCase()}`}
            date={new Date(invoiceRequest.createdAt).toLocaleDateString('en-IN')}
            buyer={{
              name: invoiceRequest.customerName,
              address: '',
              phone: '',
              gst: ''
            }}
            seller={{
              name: 'Tashivar',
              address: 'Mumbai, Maharashtra',
              phone: '+91 98765 00000',
              gst: ''
            }}
            items={invoiceItems}
            subtotal={total}
            tax={total * 0.18}
            total={total * 1.18}
            notes={invoiceRequest.internalNotes || ''}
            termsAndConditions="Payment terms as agreed. All disputes subject to Mumbai jurisdiction."
            onClose={() => {
              setShowInvoiceModal(false);
              setInvoiceRequest(null);
            }}
          />
        );
      })()}
    </div>
  );
}