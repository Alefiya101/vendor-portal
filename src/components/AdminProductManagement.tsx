import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Trash2, Edit, Check, XCircle, Shirt, Layers as Fabric, Search, Filter, DollarSign, Package, Percent, Users, Phone, QrCode, Scissors, Palette, Factory, AlertCircle } from 'lucide-react';
import { BarcodeGenerator } from './BarcodeGenerator';
import * as productService from '../services/productService';
import * as vendorService from '../services/vendorService';
import * as commissionService from '../services/commissionService';
import * as manufacturingService from '../services/manufacturingService';
import * as orderService from '../services/orderService';
import * as adminAuthService from '../services/adminAuthService';
import { toast } from 'sonner@2.0.3';
import { SearchableDropdown } from './SearchableDropdown';
import { AddPartyModal } from './AddPartyModal';
import { LoadingSpinner, ButtonWithLoading, TableSkeleton, CardSkeleton } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields, validateEmail, validatePhone } from '../utils/security';
import { apiClient, handleApiError } from '../utils/apiClient';

interface Product {
  id: string;
  name: string;
  type: 'readymade' | 'fabric';
  category: string;
  vendor: string;
  vendorId: string;
  images: string[];
  description: string;
  costPrice: number;
  suggestedPrice: number;
  moq: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  quantity?: number;
  totalCost?: number;
  designerId?: string;
  stitchingMasterId?: string;
  stitchingCost?: number;
  vendorCode?: string;
  panna?: string;
  color?: string;
  work?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
  };
}

interface Commission {
  productId: string;
  type: 'single' | 'multi';
  saleCommissionRate?: number;
  saleDistribution?: Array<{
    role: string;
    name: string;
    phone: string;
    percentage: number;
  }>;
  purchaseCommissionRate?: number;
  purchaseDistribution?: Array<{
    role: string;
    name: string;
    phone: string;
    percentage: number;
  }>;
  parties?: Array<{
    role: string;
    name: string;
    phone: string;
    percentage: number;
    amount?: number;
  }>;
}

export function AdminProductManagement() {
  const [activeTab, setActiveTab] = useState<'readymade' | 'fabric'>('readymade');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedProductForCommission, setSelectedProductForCommission] = useState<Product | null>(null);
  const [showBarcodeGenerator, setShowBarcodeGenerator] = useState(false);
  const [selectedItemForBarcode, setSelectedItemForBarcode] = useState<any>(null);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // Add Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    vendorId: '',
    description: '',
    costPrice: '',
    suggestedPrice: '',
    moq: '',
    quantity: '',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'paid' as 'paid' | 'pending',
    // Manufacturing specific
    sourceFabricId: '',
    designerId: '',
    stitchingMasterId: '',
    stitchingCost: '',
    // New fields
    vendorCode: '',
    panna: '',
    color: '',
    work: '',
    bankName: '',
    accountNumber: '',
    ifsc: ''
  });

  const [recordPurchase, setRecordPurchase] = useState(true);

  const [commissionForm, setCommissionForm] = useState({
    type: 'multi' as 'single' | 'multi',
    saleCommissionRate: 20,
    saleDistribution: [
      { role: 'Platform', name: 'Tashivar', phone: '', percentage: 100 }
    ],
    purchaseCommissionRate: 10,
    purchaseDistribution: [
      { role: 'Vendor', name: '', phone: '', percentage: 100 }
    ],
    parties: [] as any[] // Legacy support
  });

  const [images, setImages] = useState<string[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const [commissionRules, setCommissionRules] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsData, vendorsData, rulesData, agentsData] = await Promise.all([
        productService.getAllProducts(),
        vendorService.getAllVendors(),
        commissionService.getAllCommissionRules(),
        adminAuthService.getAllAgents()
      ]);
      setProductList(productsData);
      
      // Convert agents from admin users format to partner format
      const agentPartners = agentsData.map((agent: any) => ({
        id: agent.id || agent.username,
        name: agent.name,
        phone: agent.phone || '',
        type: agent.agentType || 'vendor-agent' // vendor-agent, buyer-agent, etc.
      }));
      
      // Merge vendors and agents for commission dropdowns
      const allPartners = [...vendorsData, ...agentPartners];
      setPartners(allPartners);
      
      console.log('📋 Loaded partners for commission:', {
        vendors: vendorsData.length,
        agents: agentPartners.length,
        total: allPartners.length
      });

      // Create a map of commission rules by productId
      const rulesMap: Record<string, any> = {};
      rulesData.forEach((rule: any) => {
        rulesMap[rule.productId] = rule;
      });
      setCommissionRules(rulesMap);
      
      // Filter for specific roles for dropdowns
      // Vendors are partners with type 'vendor' or undefined (legacy)
      const actualVendors = vendorsData.filter((v: any) => !v.type || v.type === 'vendor');
      setVendors(actualVendors);
      
    } catch (err) {
      console.error('Failed to load product management data:', err);
      const message = handleApiError(err);
      setError(message);
      toast.error(`Failed to load data: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const getPartnersByRole = (role: string) => {
    const typeMap: Record<string, string> = {
      'Vendor': 'vendor',
      'Vendor Agent': 'vendor-agent',
      'Designer': 'designer',
      'Designer Agent': 'designer-agent',
      'Stitching Master': 'stitching-master',
      'Buyer Agent': 'buyer-agent'
    };
    if (role === 'Platform') return [];
    const type = typeMap[role];
    return partners.filter(p => p.type === type || (!p.type && type === 'vendor'));
  };

  const filteredProducts = productList.filter(product => {
    const typeMatch = product.type === activeTab;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    return typeMatch && matchesSearch && matchesFilter;
  });

  const handleApproveProduct = async (productId: string) => {
    const product = productList.find(p => p.id === productId);
    if (product) {
      setSelectedProductForCommission(product);
      setShowCommissionModal(true);
    }
  };

  const handleRejectProduct = async (productId: string) => {
    const product = productList.find(p => p.id === productId);
    if (confirm(`Are you sure you want to reject "${product?.name || 'this product'}"?`)) {
      try {
        setActionLoading(`reject-${productId}`);
        const updatedProduct = await productService.rejectProduct(productId);
        setProductList(productList.map(p => p.id === productId ? updatedProduct : p));
        toast.success(`Product "${product?.name}" rejected`);
      } catch (err) {
        console.error('Failed to reject product:', err);
        toast.error(`Failed to reject product: ${handleApiError(err)}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = productList.find(p => p.id === productId);
    if (confirm(`Are you sure you want to delete "${product?.name || 'this product'}"? This action cannot be undone.`)) {
      try {
        setActionLoading(`delete-${productId}`);
        await productService.deleteProduct(productId);
        setProductList(productList.filter(p => p.id !== productId));
        toast.success(`Product "${product?.name}" deleted successfully`);
      } catch (err) {
        console.error('Failed to delete product:', err);
        toast.error(`Failed to delete product: ${handleApiError(err)}`);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setActiveTab(product.type);
    setProductForm({
      name: product.name,
      category: product.category,
      vendorId: product.vendorId,
      description: product.description,
      costPrice: product.costPrice.toString(),
      suggestedPrice: product.suggestedPrice.toString(),
      moq: '1', // Default, hidden
      quantity: product.quantity?.toString() || '',
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'paid',
      sourceFabricId: '', 
      designerId: product.designerId || '',
      stitchingMasterId: product.stitchingMasterId || '',
      stitchingCost: product.stitchingCost?.toString() || '',
      vendorCode: product.vendorCode || '',
      panna: product.panna || '',
      color: product.color || '',
      work: product.work || '',
      bankName: product.bankDetails?.bankName || '',
      accountNumber: product.bankDetails?.accountNumber || '',
      ifsc: product.bankDetails?.ifsc || ''
    });
    setImages(product.images || []);
    setIsEditing(true);
    setSelectedProductId(product.id);
    setShowAddModal(true);
  };

  const handleConvertToReadymade = (product: Product) => {
    setActiveTab('readymade');
    setRecordPurchase(false);
    setProductForm({
      name: product.name,
      category: product.category,
      vendorId: product.vendorId,
      description: product.description,
      costPrice: product.suggestedPrice.toString(),
      suggestedPrice: '',
      moq: product.moq.toString(),
      quantity: product.quantity?.toString() || '',
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'paid',
      designerId: '',
      stitchingMasterId: '',
      stitchingCost: ''
    });
    setImages(product.images);
    setShowAddModal(true);
    toast.info('Converted to Ready Made form. Cost set to Fabric Selling Price.');
  };

  const handleFabricSelect = (fabricId: string) => {
    if (!fabricId) return;
    const fabric = productList.find(p => p.id === fabricId);
    if (fabric) {
      setRecordPurchase(false);
      setProductForm({
        ...productForm,
        sourceFabricId: fabric.id,
        name: fabric.name,
        category: fabric.category,
        vendorId: fabric.vendorId,
        description: fabric.description,
        costPrice: fabric.suggestedPrice.toString(),
        moq: fabric.moq.toString(),
        quantity: fabric.quantity?.toString() || '',
      });
      setImages(fabric.images);
      toast.info('Loaded details from Fabric. Cost set to Fabric Selling Price.');
    }
  };

  const handleCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductForCommission) {
      toast.error('No product selected for commission');
      return;
    }
    
    try {
      setActionLoading('approve-commission');
      
      // Validate commission percentages
      const saleTotalPercent = commissionForm.saleDistribution.reduce((sum, p) => sum + p.percentage, 0);
      if (Math.abs(saleTotalPercent - 100) > 0.01) {
        toast.error(`Sale commission percentages must total 100% (currently ${saleTotalPercent}%)`);
        setActionLoading(null);
        return;
      }
      
      const purchaseTotalPercent = commissionForm.purchaseDistribution.reduce((sum, p) => sum + p.percentage, 0);
      if (Math.abs(purchaseTotalPercent - 100) > 0.01) {
        toast.error(`Purchase commission percentages must total 100% (currently ${purchaseTotalPercent}%)`);
        setActionLoading(null);
        return;
      }
      
      // Approve product
      const updatedProduct = await productService.approveProduct(selectedProductForCommission.id);
      
      // Create commission rule
      await commissionService.createCommissionRule({
        productId: selectedProductForCommission.id,
        productName: sanitizeString(selectedProductForCommission.name),
        type: commissionForm.type,
        saleCommissionRate: commissionForm.saleCommissionRate,
        saleDistribution: commissionForm.saleDistribution,
        purchaseCommissionRate: commissionForm.purchaseCommissionRate,
        purchaseDistribution: commissionForm.purchaseDistribution
      });
      
      setProductList(productList.map(p => p.id === selectedProductForCommission.id ? updatedProduct : p));
      toast.success(`Product "${selectedProductForCommission.name}" approved with commission structure!`);
      
      setShowCommissionModal(false);
      setSelectedProductForCommission(null);
      resetForms();
    } catch (err) {
      console.error('Failed to approve product with commission:', err);
      toast.error(`Failed to approve product: ${handleApiError(err)}`);
    } finally {
      setActionLoading(null);
    }
  };

  const addParty = (type: 'sale' | 'purchase') => {
    const newParty = { role: 'Platform', name: 'Tashivar', phone: '', percentage: 0 };
    if (type === 'sale') {
      setCommissionForm({
        ...commissionForm,
        saleDistribution: [...commissionForm.saleDistribution, newParty]
      });
    } else {
      setCommissionForm({
        ...commissionForm,
        purchaseDistribution: [...commissionForm.purchaseDistribution, newParty]
      });
    }
  };

  const removeParty = (type: 'sale' | 'purchase', index: number) => {
    if (type === 'sale') {
      const dist = [...commissionForm.saleDistribution];
      dist.splice(index, 1);
      setCommissionForm({ ...commissionForm, saleDistribution: dist });
    } else {
      const dist = [...commissionForm.purchaseDistribution];
      dist.splice(index, 1);
      setCommissionForm({ ...commissionForm, purchaseDistribution: dist });
    }
  };

  const updateParty = (type: 'sale' | 'purchase', index: number, field: string, value: any) => {
    const list = type === 'sale' ? [...commissionForm.saleDistribution] : [...commissionForm.purchaseDistribution];
    const item = { ...list[index] };

    // Platform Identity Lock
    if (item.role === 'Platform' && (field === 'name' || field === 'phone')) {
      return; // Do not allow changing Platform name/phone
    }

    if (field === 'role' && value === 'Platform') {
      item.name = 'Tashivar';
      item.phone = ''; // Platform doesn't need phone
    }

    // @ts-ignore
    item[field] = value;
    list[index] = item;

    if (type === 'sale') {
      setCommissionForm({ ...commissionForm, saleDistribution: list });
    } else {
      setCommissionForm({ ...commissionForm, purchaseDistribution: list });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Convert to Base64 to ensure persistence across reloads (since we don't have a backend storage bucket)
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const resetForms = () => {
    setIsEditing(false);
    setSelectedProductId(null);
    setRecordPurchase(true);
    setProductForm({
      name: '',
      category: '',
      vendorId: '',
      description: '',
      costPrice: '',
      suggestedPrice: '',
      moq: '',
      quantity: '',
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'paid',
      sourceFabricId: '',
      designerId: '',
      stitchingMasterId: '',
      stitchingCost: '',
      vendorCode: '',
      panna: '',
      color: '',
      work: '',
      bankName: '',
      accountNumber: '',
      ifsc: ''
    });
    setCommissionForm({
      type: 'multi',
      saleCommissionRate: 20,
      saleDistribution: [
        { role: 'Platform', name: 'Tashivar', phone: '', percentage: 100 }
      ],
      purchaseCommissionRate: 10,
      purchaseDistribution: [
        { role: 'Vendor', name: '', phone: '', percentage: 100 }
      ],
      parties: []
    });
    setImages([]);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting || actionLoading) {
      console.log('⚠️ Form already submitting, ignoring duplicate submission');
      return;
    }
    
    try {
      setActionLoading(isEditing ? 'update-product' : 'create-product');
      setIsSubmitting(true);

      // Comprehensive validation
      const validation = validateRequiredFields(productForm, [
        'name',
        'category',
        'costPrice',
        'suggestedPrice',
        'quantity'
      ]);
      
      if (!validation.valid) {
        toast.error(`Missing required fields: ${validation.missing.join(', ')}`);
        setIsSubmitting(false);
        setActionLoading(null);
        return;
      }
      
      // Validate numeric fields
      if (isNaN(parseFloat(productForm.costPrice)) || parseFloat(productForm.costPrice) <= 0) {
        toast.error('Cost price must be a positive number');
        setIsSubmitting(false);
        setActionLoading(null);
        return;
      }
      
      if (isNaN(parseFloat(productForm.suggestedPrice)) || parseFloat(productForm.suggestedPrice) <= 0) {
        toast.error('Suggested price must be a positive number');
        setIsSubmitting(false);
        setActionLoading(null);
        return;
      }
      
      if (isNaN(parseInt(productForm.quantity)) || parseInt(productForm.quantity) <= 0) {
        toast.error('Quantity must be a positive number');
        setIsSubmitting(false);
        setActionLoading(null);
        return;
      }

      const selectedVendor = vendors.find((v: any) => v.id === productForm.vendorId);
      
      if (!selectedVendor && activeTab === 'readymade' && !productForm.vendorId) { // Allow INTERNAL or existing vendorId
         // If editing, vendor might be pre-set. If new, need selection.
         // Actually, let's just rely on vendorId
      }
      
      // Calculate total cost based on type
      let totalCost = 0;
      if (activeTab === 'readymade') {
        const materialCost = parseFloat(productForm.quantity || '0') * parseFloat(productForm.costPrice);
        const stitchCost = parseFloat(productForm.quantity || '0') * (parseFloat(productForm.stitchingCost) || 0);
        totalCost = materialCost + stitchCost;
      } else {
        totalCost = parseFloat(productForm.quantity || '0') * parseFloat(productForm.costPrice);
      }

      // Sanitize all inputs
      const commonFields = {
        name: sanitizeString(productForm.name),
        category: sanitizeString(productForm.category),
        vendor: selectedVendor ? sanitizeString(selectedVendor.name) : 'Tashivar Internal',
        vendorId: productForm.vendorId || 'INTERNAL',
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300'],
        description: sanitizeString(productForm.description),
        costPrice: parseFloat(productForm.costPrice),
        suggestedPrice: parseFloat(productForm.suggestedPrice),
        moq: 1, // Default 1
        quantity: parseInt(productForm.quantity),
        totalCost: totalCost,
        vendorCode: productForm.vendorCode ? sanitizeString(productForm.vendorCode) : `OC-${String(productList.length + 1).padStart(4, '0')}`,
        panna: productForm.panna ? sanitizeString(productForm.panna) : undefined,
        color: productForm.color ? sanitizeString(productForm.color) : undefined,
        work: productForm.work ? sanitizeString(productForm.work) : undefined,
        bankDetails: productForm.bankName ? {
          bankName: sanitizeString(productForm.bankName),
          accountNumber: sanitizeString(productForm.accountNumber),
          ifsc: sanitizeString(productForm.ifsc)
        } : undefined,
        designerId: productForm.designerId,
        stitchingMasterId: productForm.stitchingMasterId,
        stitchingCost: parseFloat(productForm.stitchingCost) || 0
      };

      if (isEditing && selectedProductId) {
        // UPDATE EXISTING PRODUCT
        const updatedProduct = await productService.updateProduct(selectedProductId, {
          ...commonFields,
          moq: parseInt(productForm.moq) || 1, // Keep moq if needed
        });
        
        setProductList(productList.map(p => p.id === selectedProductId ? updatedProduct : p));
        toast.success('Product updated successfully');
      } else {
        // CREATE NEW PRODUCT
        const newProduct = await productService.createProduct({
          ...commonFields,
          type: activeTab,
          status: 'approved', // Auto-approve when admin creates
        });
        
        // Create commission rule
        await commissionService.createCommissionRule({
          productId: newProduct.id,
          productName: newProduct.name,
          type: commissionForm.type,
          saleCommissionRate: commissionForm.saleCommissionRate,
          saleDistribution: commissionForm.saleDistribution,
          purchaseCommissionRate: commissionForm.purchaseCommissionRate,
          purchaseDistribution: commissionForm.purchaseDistribution
        });

        // Record Purchase Order for Finance
        if (recordPurchase) {
          await orderService.createOrder({
            buyer: 'Tashivar Platform',
            buyerId: 'ADMIN',
            buyerPhone: '',
            buyerAddress: 'Warehouse',
            vendor: selectedVendor?.name || 'Unknown',
            vendorId: productForm.vendorId,
            products: [{
              id: newProduct.id,
              name: newProduct.name,
              type: activeTab,
              quantity: parseInt(productForm.quantity),
              costPrice: parseFloat(productForm.costPrice),
              sellingPrice: parseFloat(productForm.suggestedPrice),
              image: images[0] || ''
            }],
            subtotal: totalCost,
            commission: 0, // No commission on stock purchase
            commissionDistribution: [],
            profit: 0,
            status: 'delivered', // Stock received
            paymentStatus: productForm.paymentStatus,
            paymentMethod: productForm.paymentMethod,
            purchaseOrderTracking: {
               createdAt: new Date().toISOString(),
               status: 'received'
            }
          });
        } else if (activeTab === 'readymade' && productForm.stitchingMasterId && parseFloat(productForm.stitchingCost) > 0) {
          // Internal Manufacturing: Record Purchase Order for Stitching Service (Labor Cost)
          const stitchingMaster = vendors.find(v => v.id === productForm.stitchingMasterId);
          const stitchingCostPerUnit = parseFloat(productForm.stitchingCost);
          const totalStitchingCost = stitchingCostPerUnit * parseInt(productForm.quantity);

          await orderService.createOrder({
            buyer: 'Tashivar Platform',
            buyerId: 'ADMIN',
            buyerPhone: '',
            buyerAddress: 'Warehouse', 
            vendor: stitchingMaster?.name || 'Unknown Stitching Master',
            vendorId: productForm.stitchingMasterId,
            products: [{
              id: `SVC-${newProduct.id}`,
              name: `Stitching Service: ${newProduct.name}`,
              type: 'readymade',
              quantity: parseInt(productForm.quantity),
              costPrice: stitchingCostPerUnit,
              sellingPrice: 0, // Service is an expense, not sold directly
              image: images[0] || ''
            }],
            subtotal: totalStitchingCost,
            commission: 0,
            commissionDistribution: [],
            profit: 0,
            status: 'delivered', // Service completed
            paymentStatus: productForm.paymentStatus, // Assuming same payment status for labor
            paymentMethod: productForm.paymentMethod,
            purchaseOrderTracking: {
               createdAt: new Date().toISOString(),
               status: 'received'
            }
          });
        }

        // If Ready Made, create manufacturing order
        if (activeTab === 'readymade') {
          const selectedFabric = productList.find(p => p.id === productForm.sourceFabricId);
          const stitchingMaster = vendors.find(v => v.id === productForm.stitchingMasterId);
          const designer = vendors.find(v => v.id === productForm.designerId);
          
          await manufacturingService.createOrder({
            orderNumber: `MO-${Math.floor(Math.random() * 10000)}`,
            sourceFabricId: productForm.sourceFabricId || 'UNKNOWN',
            sourceFabricName: selectedFabric?.name || 'Unknown Fabric',
            sourceFabricImage: selectedFabric?.images?.[0] || images?.[0] || 'https://images.unsplash.com/photo-1519699047748-40ba52c79303?w=300',
            quantity: parseInt(productForm.quantity),
            status: 'completed', // Assuming adding to inventory means it's done
            stitchingMasterId: productForm.stitchingMasterId,
            stitchingMasterName: stitchingMaster?.name || 'Not Assigned',
            designerId: productForm.designerId,
            designerName: designer?.name || 'Not Assigned',
            issuedDate: new Date().toISOString(),
            expectedDate: new Date().toISOString(),
            completedDate: new Date().toISOString(),
            fabricCostPerUnit: parseFloat(productForm.costPrice),
            manufacturingCostPerUnit: parseFloat(productForm.stitchingCost) || 0,
            totalManufacturingCost: totalCost,
            expectedSellingPrice: parseFloat(productForm.suggestedPrice),
            createdProductId: newProduct.id
          });
        }
        
        setProductList([newProduct, ...productList]);
        toast.success(`Product "${sanitizeString(productForm.name)}" created and purchase recorded successfully!`);
      }

      setShowAddModal(false);
      resetForms();
    } catch (err) {
      console.error('Failed to save product:', err);
      toast.error(`Failed to save product: ${handleApiError(err)}`);
    } finally {
      setActionLoading(null);
      setIsSubmitting(false);
    }
  };

  const CommissionSection = () => (
    <div className="bg-gray-50 rounded-xl p-5">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Percent className="w-5 h-5 text-violet-600" />
        Commission Structure
      </h4>

      <div className="grid grid-cols-1 gap-6">
        {/* Purchase Commission - Only for Fabric */}
        {activeTab === 'fabric' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h5 className="font-medium text-gray-900">Purchase Commission</h5>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={commissionForm.purchaseCommissionRate}
                  onChange={(e) => setCommissionForm({ ...commissionForm, purchaseCommissionRate: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>

            <div className="space-y-3">
              {commissionForm.purchaseDistribution.map((party, idx) => (
                <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg relative group">
                  <button
                    type="button"
                    onClick={() => removeParty('purchase', idx)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={party.role}
                        onChange={(e) => {
                          updateParty('purchase', idx, 'role', e.target.value);
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm"
                      >
                        {['Vendor', 'Vendor Agent', 'Designer', 'Designer Agent', 'Stitching Master', 'Platform', 'Buyer Agent'].map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Share (%)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={party.percentage}
                          onChange={(e) => updateParty('purchase', idx, 'percentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm text-right"
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {party.role === 'Platform' ? (
                      <input
                        type="text"
                        value="Tashivar"
                        readOnly
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500 cursor-not-allowed"
                      />
                    ) : (
                      <div>
                        <SearchableDropdown
                          options={getPartnersByRole(party.role).map(p => ({
                            id: p.id,
                            label: p.name,
                            subLabel: p.phone || ''
                          }))}
                          value={party.name ? (partners.find(p => p.name === party.name)?.id || '') : ''}
                          onChange={(selectedId) => {
                            const selected = partners.find(p => p.id === selectedId);
                            if (selected) {
                              updateParty('purchase', idx, 'name', selected.name);
                              updateParty('purchase', idx, 'phone', selected.phone || '');
                            }
                          }}
                          placeholder="Select Party"
                          className="w-full"
                        />
                      </div>
                    )}
                    <input
                      type="tel"
                      value={party.phone}
                      onChange={(e) => updateParty('purchase', idx, 'phone', e.target.value)}
                      placeholder="Phone"
                      readOnly={party.role === 'Platform'}
                      className={`w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm ${party.role === 'Platform' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addParty('purchase')}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Party
              </button>

              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 flex justify-between">
                <span>Total Split:</span>
                <span className="font-bold">
                  {commissionForm.purchaseDistribution.reduce((sum, p) => sum + p.percentage, 0)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sale Commission - Only for Ready Made */}
        {activeTab === 'readymade' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h5 className="font-medium text-gray-900">Sale Commission</h5>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={commissionForm.saleCommissionRate}
                  onChange={(e) => setCommissionForm({ ...commissionForm, saleCommissionRate: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-2 py-1 border border-gray-200 rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>

            <div className="space-y-3">
              {commissionForm.saleDistribution.map((party, idx) => (
                <div key={idx} className="p-3 bg-white border border-gray-200 rounded-lg relative group">
                  <button
                    type="button"
                    onClick={() => removeParty('sale', idx)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={party.role}
                        onChange={(e) => {
                          updateParty('sale', idx, 'role', e.target.value);
                        }}
                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm"
                      >
                        {['Vendor', 'Vendor Agent', 'Designer', 'Designer Agent', 'Stitching Master', 'Platform', 'Buyer Agent'].map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Share (%)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={party.percentage}
                          onChange={(e) => updateParty('sale', idx, 'percentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm text-right"
                        />
                        <span className="text-xs text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {party.role === 'Platform' ? (
                      <input
                        type="text"
                        value="Tashivar"
                        readOnly
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500 cursor-not-allowed"
                      />
                    ) : (
                      <div>
                        <SearchableDropdown
                          options={getPartnersByRole(party.role).map(p => ({
                            id: p.id,
                            label: p.name,
                            subLabel: p.phone || ''
                          }))}
                          value={party.name ? (partners.find(p => p.name === party.name)?.id || '') : ''}
                          onChange={(selectedId) => {
                            const selected = partners.find(p => p.id === selectedId);
                            if (selected) {
                              updateParty('sale', idx, 'name', selected.name);
                              updateParty('sale', idx, 'phone', selected.phone || '');
                            }
                          }}
                          placeholder="Select Party"
                          className="w-full"
                        />
                      </div>
                    )}
                    <input
                      type="tel"
                      value={party.phone}
                      onChange={(e) => updateParty('sale', idx, 'phone', e.target.value)}
                      placeholder="Phone"
                      readOnly={party.role === 'Platform'}
                      className={`w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm ${party.role === 'Platform' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addParty('sale')}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-indigo-600 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Party
              </button>

              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 flex justify-between">
                <span>Total Split:</span>
                <span className="font-bold">
                  {commissionForm.saleDistribution.reduce((sum, p) => sum + p.percentage, 0)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Product Management</h2>
          <p className="text-sm text-gray-600">Manage fabric and ready-made inventory</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <button
              onClick={() => {
                const selectedProducts = productList.filter(p => selectedItems.includes(p.id));
                setSelectedItemForBarcode({
                  type: 'product',
                  data: selectedProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    price: p.suggestedPrice
                  }))
                });
                setShowBarcodeGenerator(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Generate ({selectedItems.length})
            </button>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('readymade')}
          className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'readymade'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shirt className="w-4 h-4" />
          Ready Made
        </button>
        <button
          onClick={() => setActiveTab('fabric')}
          className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'fabric'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Fabric className="w-4 h-4" />
          Fabric
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <p className="text-rose-600 font-medium mb-2">Failed to load products</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => loadData()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No products found</p>
          <p className="text-sm text-gray-400 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Click "+ Add Product" to create your first product'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative h-48">
              <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(product.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, product.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== product.id));
                    }
                  }}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 bg-white shadow-sm cursor-pointer"
                />
              </div>
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-sm ${
                  product.status === 'approved' 
                    ? 'bg-emerald-500/90 text-white' 
                    : product.status === 'pending'
                    ? 'bg-orange-500/90 text-white'
                    : 'bg-rose-500/90 text-white'
                }`}>
                  {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.id}</p>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vendor:</span>
                  <span className="font-medium text-gray-900">{product.vendor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchase Price:</span>
                  <span className="font-medium text-gray-900">₹{product.costPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sale Price:</span>
                  <span className="font-medium text-emerald-600">₹{product.suggestedPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inventory:</span>
                  <span className="font-medium text-gray-900">{product.quantity} pcs</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                  <span className="text-gray-600">Margin:</span>
                  <span className="font-medium text-violet-600">
                    {product.suggestedPrice > 0 
                      ? `${Math.round(((product.suggestedPrice - product.costPrice) / product.suggestedPrice) * 100)}%` 
                      : '0%'}
                  </span>
                </div>
                {commissionRules[product.id] && (
                  <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                    <span className="text-gray-600">Commission:</span>
                    <span className="font-medium text-indigo-600">
                      {product.type === 'fabric' 
                        ? `${commissionRules[product.id].purchaseCommissionRate || 0}% (Purchase)`
                        : `${commissionRules[product.id].saleCommissionRate || 0}% (Sale)`
                      }
                    </span>
                  </div>
                )}
              </div>

              {product.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <ButtonWithLoading
                    onClick={() => handleApproveProduct(product.id)}
                    loading={actionLoading === `approve-${product.id}`}
                    className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </ButtonWithLoading>
                  <ButtonWithLoading
                    onClick={() => handleRejectProduct(product.id)}
                    loading={actionLoading === `reject-${product.id}`}
                    className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </ButtonWithLoading>
                </div>
              )}

              {product.status === 'approved' && (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  {product.type === 'fabric' && (
                    <button
                      onClick={() => handleConvertToReadymade(product)}
                      className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center justify-center gap-2 mb-2"
                    >
                      <Factory className="w-4 h-4" />
                      Convert to Ready Made
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedItemForBarcode({
                        type: 'product',
                        data: {
                          id: product.id,
                          name: product.name,
                          category: product.category,
                          price: product.suggestedPrice
                        }
                      });
                      setShowBarcodeGenerator(true);
                    }}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <QrCode className="w-4 h-4" />
                    Generate Barcode
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <ButtonWithLoading 
                      onClick={() => handleDeleteProduct(product.id)}
                      loading={actionLoading === `delete-${product.id}`}
                      className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </ButtonWithLoading>
                  </div>
                </div>
              )}
            </div>
          </div>
          ))}
        </div>
      )}

      {/* Add Vendor Modal */}
      <AddPartyModal
        isOpen={showAddVendorModal}
        onClose={() => setShowAddVendorModal(false)}
        type="vendor"
        onSuccess={async () => {
          await loadData();
          setShowAddVendorModal(false);
          toast.success('Vendor added successfully');
        }}
      />

      {/* Add Product/Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {isEditing ? 'Edit Product' : `Add ${activeTab === 'readymade' ? 'Ready Made' : 'Fabric'} Product`}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{isEditing ? 'Update product details' : 'Add product to inventory and set commission structure'}</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-6 space-y-6">
              {/* Internal Transfer Selector */}
              {activeTab === 'readymade' && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
                  <label className="block text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Fabric className="w-4 h-4" />
                    Load from Fabric Inventory (Internal Transfer)
                  </label>
                  <select
                    onChange={(e) => handleFabricSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a fabric to convert...</option>
                    {productList
                      .filter(p => p.type === 'fabric' && p.status === 'approved')
                      .map(fabric => (
                        <option key={fabric.id} value={fabric.id}>
                          {fabric.name} (₹{fabric.suggestedPrice}) - {fabric.vendor}
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}

              {/* Product Details Section */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Product Information
                </h4>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Category *</label>
                      <input
                        type="text"
                        placeholder="e.g., Kurta, Sherwani, Silk"
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Product Name / Design Number *</label>
                      <input
                        type="text"
                        placeholder="Enter product name or design number"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        required
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Vendor Code</label>
                      <input
                        type="text"
                        value={productForm.vendorCode}
                        placeholder="Auto-generated (e.g., OC-0001)"
                        readOnly={!isEditing}
                        onChange={(e) => setProductForm({...productForm, vendorCode: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Work</label>
                      <input
                        type="text"
                        placeholder="e.g., Embroidery, Handwork"
                        value={productForm.work}
                        onChange={(e) => setProductForm({...productForm, work: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Panna (Width)</label>
                      <input
                        type="text"
                        placeholder="e.g., 44 inches"
                        value={productForm.panna}
                        onChange={(e) => setProductForm({...productForm, panna: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Color</label>
                      <input
                        type="text"
                        placeholder="e.g., Red, Blue, Multi"
                        value={productForm.color}
                        onChange={(e) => setProductForm({...productForm, color: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Description *</label>
                    <textarea
                      placeholder="Product description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      rows={3}
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Product Images</label>
                    <div className="flex items-center gap-3">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                          <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setImages(images.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-600 hover:bg-indigo-50">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Manufacturing Details - Only for Ready Made */}
              {activeTab === 'readymade' && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-indigo-600" />
                    Manufacturing Details
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Source Fabric *</label>
                    <select
                      value={productForm.sourceFabricId}
                      onChange={(e) => {
                        const fabric = productList.find(p => p.id === e.target.value);
                        if (fabric) {
                          setProductForm({
                            ...productForm,
                            sourceFabricId: fabric.id,
                            costPrice: fabric.suggestedPrice.toString() // Cost is selling price of fabric
                          });
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Source Fabric</option>
                      {productList
                        .filter(p => p.type === 'fabric' && p.status === 'approved')
                        .map(fabric => (
                          <option key={fabric.id} value={fabric.id}>
                            {fabric.name} (Stock: {fabric.quantity}) - ₹{fabric.suggestedPrice}
                          </option>
                        ))
                      }
                    </select>
                    <p className="text-xs text-indigo-600 mt-1">
                      Selecting fabric will automatically set the Cost Price based on Fabric's Selling Price.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Designer</label>
                      <select
                        value={productForm.designerId}
                        onChange={(e) => setProductForm({...productForm, designerId: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Designer</option>
                        {getPartnersByRole('Designer').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Stitching Master *</label>
                      <select
                        value={productForm.stitchingMasterId}
                        onChange={(e) => setProductForm({...productForm, stitchingMasterId: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Stitching Master</option>
                        {getPartnersByRole('Stitching Master').map(sm => (
                          <option key={sm.id} value={sm.id}>{sm.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Manufacturing/Stitching Cost (per pc)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={productForm.stitchingCost}
                      onChange={(e) => setProductForm({...productForm, stitchingCost: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Purchase Details Section */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Purchase Details
                  </h4>
                  {activeTab === 'readymade' && (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${recordPurchase ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                         <div className={`w-4 h-4 rounded-full bg-white transition-transform ${recordPurchase ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <input
                        type="checkbox"
                        checked={recordPurchase}
                        onChange={(e) => setRecordPurchase(e.target.checked)}
                        className="hidden"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {recordPurchase ? 'Record Purchase Transaction' : 'Skip Purchase (Conversion/Internal)'}
                      </span>
                    </label>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {activeTab === 'readymade' ? 'Fabric Vendor' : 'Vendor'} *
                    </label>
                    <div className="flex gap-2">
                      <SearchableDropdown
                        options={vendors.map(v => ({ 
                          id: v.id, 
                          label: v.name, 
                          subLabel: v.owner || v.city 
                        }))}
                        value={productForm.vendorId}
                        onChange={(value) => setProductForm({...productForm, vendorId: value})}
                        placeholder="Select vendor"
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddVendorModal(true)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                        title="Add New Vendor"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Purchase Quantity *</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={productForm.quantity}
                      onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                      required
                      min="1"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {activeTab === 'readymade' ? 'Fabric Cost (per pc)' : 'Cost Price (per pc)'} *
                      </label>
                      <input
                        type="number"
                        placeholder="1100"
                        value={productForm.costPrice}
                        onChange={(e) => setProductForm({...productForm, costPrice: e.target.value})}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Sale Price (to Buyer) *</label>
                      <input
                        type="number"
                        placeholder="1299"
                        value={productForm.suggestedPrice}
                        onChange={(e) => setProductForm({...productForm, suggestedPrice: e.target.value})}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {productForm.quantity && productForm.costPrice && !isEditing && (
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Total Estimated Cost</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        ₹{(
                          (parseFloat(productForm.quantity) * parseFloat(productForm.costPrice)) + 
                          (activeTab === 'readymade' ? (parseFloat(productForm.quantity) * (parseFloat(productForm.stitchingCost) || 0)) : 0)
                        ).toLocaleString()}
                      </p>
                      {activeTab === 'readymade' && (
                        <p className="text-xs text-gray-600 mt-1">Includes Fabric Cost + Stitching Cost</p>
                      )}
                    </div>
                  )}

                  {recordPurchase && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Payment Method *</label>
                        <select
                          value={productForm.paymentMethod}
                          onChange={(e) => setProductForm({...productForm, paymentMethod: e.target.value})}
                          required={recordPurchase}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="UPI">UPI</option>
                          <option value="Cash">Cash</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Payment Status *</label>
                        <select
                          value={productForm.paymentStatus}
                          onChange={(e) => setProductForm({...productForm, paymentStatus: e.target.value as any})}
                          required={recordPurchase}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {recordPurchase && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900">Vendor Bank Details</h5>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Bank Name</label>
                        <input
                          type="text"
                          placeholder="Bank Name"
                          value={productForm.bankName}
                          onChange={(e) => setProductForm({...productForm, bankName: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Account Number</label>
                          <input
                            type="text"
                            placeholder="Account Number"
                            value={productForm.accountNumber}
                            onChange={(e) => setProductForm({...productForm, accountNumber: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">IFSC Code</label>
                          <input
                            type="text"
                            placeholder="IFSC Code"
                            value={productForm.ifsc}
                            onChange={(e) => setProductForm({...productForm, ifsc: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <CommissionSection />

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <ButtonWithLoading
                  type="submit"
                  loading={actionLoading === 'create-product' || actionLoading === 'update-product'}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {isEditing ? 'Update Product' : (recordPurchase ? 'Add Product & Record Purchase' : 'Add Product Only')}
                </ButtonWithLoading>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Commission Modal (for existing products) */}
      {showCommissionModal && selectedProductForCommission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Set Commission for Product</h3>
                  <p className="text-sm text-gray-600 mt-1">Set commission structure for the product</p>
                </div>
                <button
                  onClick={() => setShowCommissionModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCommissionSubmit} className="p-6 space-y-6">
              <CommissionSection />

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowCommissionModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <ButtonWithLoading
                  type="submit"
                  loading={actionLoading === 'approve-commission'}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  Approve Product & Set Commission
                </ButtonWithLoading>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Generator Modal */}
      {showBarcodeGenerator && selectedItemForBarcode && (
        <BarcodeGenerator
          type={selectedItemForBarcode.type}
          data={selectedItemForBarcode.data}
          onClose={() => {
            setShowBarcodeGenerator(false);
            setSelectedItemForBarcode(null);
          }}
        />
      )}
    </div>
  );
}
