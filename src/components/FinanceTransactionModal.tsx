import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Package, User, Store, Plus, Trash2, Printer, FileText, Download, Search, MapPin, Settings, Save, Edit } from 'lucide-react';
import * as productService from '../services/productService';
import { AddPartyModal } from './AddPartyModal';
import { SearchableDropdown } from './SearchableDropdown';

// GST State Code Map
const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
  '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
  '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal',
  '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh',
  '24': 'Gujarat', '25': 'Daman & Diu', '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
  '34': 'Puducherry', '35': 'Andaman & Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh',
  '38': 'Ladakh', '97': 'Other Territory'
};

// Comprehensive HSN/SAC Categories for Ethnic Fashion Industry
const DEFAULT_HSN_CATEGORIES = [
  // FABRICS
  { label: 'Synthetic Fabrics (Sarees/Material)', hsn: '5407', rate: 5, type: 'goods' },
  { label: 'Cotton Fabrics / Material', hsn: '5208', rate: 5, type: 'goods' },
  { label: 'Silk Fabrics (Pure/Raw)', hsn: '5007', rate: 5, type: 'goods' },
  { label: 'Wool / Pashmina Fabrics', hsn: '5111', rate: 5, type: 'goods' },
  { label: 'Embroidered Fabric (In piece/strips)', hsn: '5810', rate: 12, type: 'goods' },
  { label: 'Zari / Metal Thread Fabric', hsn: '5809', rate: 5, type: 'goods' },
  
  // READYMADE GARMENTS
  { label: 'Apparel / Garments (Sale Value < ₹1000)', hsn: '6203', rate: 5, type: 'goods' },
  { label: 'Apparel / Garments (Sale Value > ₹1000)', hsn: '6203', rate: 12, type: 'goods' },
  { label: 'Sarees / Lehengas (with embroidery/work)', hsn: '6307', rate: 5, type: 'goods' }, // Often classified under made-ups if highly processed or 5407/5007 if fabric dominant. 6307 is "Other made up articles". 5407 is safer for sarees.
  { label: 'Shawls / Scarves / Dupattas', hsn: '6214', rate: 5, type: 'goods' },
  
  // ACCESSORIES & PACKAGING
  { label: 'Packaging Boxes / Cartons', hsn: '4819', rate: 18, type: 'goods' }, // Paper boxes are 12% or 18% depending on type. 18% standard for printed.
  { label: 'Handbags / Potlis', hsn: '4202', rate: 18, type: 'goods' },
  
  // SERVICES (JOB WORK & PROFESSIONAL)
  { label: 'Job Work (Embroidery/Dyeing/Stitching)', hsn: '9988', rate: 5, type: 'service' }, // Critical for Stitching Masters
  { label: 'Fashion Design Services', hsn: '9983', rate: 18, type: 'service' }, // For Designers
  { label: 'Commission / Brokerage Charges', hsn: '9961', rate: 18, type: 'service' }, // For Agents
  { label: 'Tailoring Services (B2C/Custom)', hsn: '9997', rate: 18, type: 'service' },
  { label: 'Transportation (GTA)', hsn: '9965', rate: 5, type: 'service' },
  { label: 'Digital Marketing / Advt Services', hsn: '9983', rate: 18, type: 'service' }
];

interface Category {
  label: string;
  hsn: string;
  rate: number;
  type: string;
}

interface FinanceTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'purchase' | 'sale';
  onSubmit: (data: any) => Promise<void>;
  vendors: any[];
  buyers: any[];
  onRefreshData?: () => Promise<void>;
  initialData?: any;
}

export function FinanceTransactionModal({
  isOpen,
  onClose,
  type,
  onSubmit,
  vendors,
  buyers,
  onRefreshData,
  initialData
}: FinanceTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [itemMode, setItemMode] = useState<'product' | 'custom'>('product');
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  
  // Category Management
  const [categories, setCategories] = useState<Category[]>(DEFAULT_HSN_CATEGORIES);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<Category>({ label: '', hsn: '', rate: 18, type: 'goods' });
  
  const [items, setItems] = useState<Array<{
    type: 'product' | 'custom';
    productId?: string;
    productName: string;
    description?: string;
    quantity: number;
    price: number;
    hsn: string;
    gstRate: number; // GST rate per item
    unit?: string;
  }>>([]);
  
  const [currentItem, setCurrentItem] = useState({
    productId: '',
    productName: '',
    quantity: '',
    price: '',
    description: '',
    hsn: '5407',
    gstRate: 5,
    category: ''
  });
  
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    partyId: '',
    partyName: '',
    partyAddress: '',
    partyPhone: '',
    partyGst: '',
    partyPan: '', // Add PAN card field
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'paid',
    discountType: 'percentage', // 'percentage' or 'fixed'
    discountRate: 0, // For percentage discount
    discountAmount: 0, // For fixed discount
    taxRate: 5, // Default GST rate
    billingAddress: '',
    shippingAddress: '',
    transportName: '',
    transportGst: '',
    trackingNumber: '',
    vehicleNumber: '',
    placeOfSupply: '',
    isManualPlaceOfSupply: false // Track if manually entered
  });

  const [saveCustomItem, setSaveCustomItem] = useState(false);

  useEffect(() => {
    // Load custom categories from localStorage
    const stored = localStorage.getItem('tashivar_custom_categories');
    if (stored) {
      try {
        const customCats = JSON.parse(stored);
        // Merge without duplicates (based on label)
        const merged = [...DEFAULT_HSN_CATEGORIES];
        customCats.forEach((c: Category) => {
           if (!merged.find(m => m.label === c.label)) {
             merged.push(c);
           }
        });
        setCategories(merged);
      } catch (e) {
        console.error('Failed to load custom categories', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      
      if (initialData) {
        // Find partner to fill GST/Address details
        const partyId = type === 'purchase' ? initialData.vendorId : initialData.buyerId;
        const party = type === 'purchase' 
            ? vendors.find(v => v.id === partyId)
            : buyers.find(b => b.id === partyId);
        
        const gst = party?.gst || party?.gstin || '';
        const pos = calculatePlaceOfSupply(gst) || party?.state || '';

        setFormData({
            partyId: partyId || '',
            partyName: (type === 'purchase' ? initialData.vendor : initialData.buyer) || '',
            partyAddress: '',
            partyPhone: (type === 'purchase' ? initialData.vendorPhone : initialData.buyerPhone) || '',
            partyGst: gst,
            partyPan: party?.pan || '', // Add PAN card field
            invoiceNumber: initialData.id,
            date: initialData.date,
            paymentMethod: initialData.paymentMethod || 'Bank Transfer',
            paymentStatus: initialData.paymentStatus || 'paid',
            discountType: initialData.discountType || 'percentage', // 'percentage' or 'fixed'
            discountRate: initialData.discountRate || 0, // For percentage discount
            discountAmount: initialData.discountAmount || 0, // For fixed discount
            taxRate: 5, // Default tax rate if not stored
            billingAddress: initialData.buyerAddress || party?.address || '',
            shippingAddress: initialData.shippingAddress || party?.address || '',
            transportName: initialData.salesOrderTracking?.courierService || '',
            transportGst: '',
            trackingNumber: initialData.salesOrderTracking?.trackingId || '',
            vehicleNumber: initialData.salesOrderTracking?.vehicleNumber || '',
            placeOfSupply: pos,
            isManualPlaceOfSupply: false // Track if manually entered
        });
        
        if (initialData.products) {
             setItems(initialData.products.map((p: any) => ({
                type: p.type === 'custom' ? 'custom' : 'product',
                productId: p.id,
                productName: p.name,
                quantity: p.quantity,
                price: type === 'purchase' ? p.costPrice : p.sellingPrice,
                hsn: p.hsn || '5407',
                gstRate: p.gstRate || 5,
                description: ''
            })));
        }
      } else {
        setItems([]);
        setCurrentItem({ productId: '', productName: '', quantity: '', price: '', description: '', hsn: '5407', gstRate: 5, category: '' });
        setFormData({
            partyId: '',
            partyName: '',
            partyAddress: '',
            partyPhone: '',
            partyGst: '',
            partyPan: '', // Add PAN card field
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'Bank Transfer',
            paymentStatus: 'paid',
            discountType: 'percentage', // 'percentage' or 'fixed'
            discountRate: 0, // For percentage discount
            discountAmount: 0, // For fixed discount
            taxRate: 5,
            billingAddress: '',
            shippingAddress: '',
            transportName: '',
            transportGst: '',
            trackingNumber: '',
            vehicleNumber: '',
            placeOfSupply: '',
            isManualPlaceOfSupply: false // Track if manually entered
        });
      }
      setSaveCustomItem(false);
    }
  }, [isOpen, initialData]);

  const loadProducts = async () => {
    try {
      const allProducts = await productService.getAllProducts();
      setProducts(allProducts);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const calculatePlaceOfSupply = (gstin: string) => {
    if (!gstin || gstin.length < 2) return '';
    const code = gstin.substring(0, 2);
    const state = GST_STATE_CODES[code];
    return state ? `${state} (${code})` : '';
  };

  const handleGstChange = (gst: string) => {
    const pos = calculatePlaceOfSupply(gst);
    setFormData(prev => ({
      ...prev,
      partyGst: gst.toUpperCase(),
      placeOfSupply: pos || prev.placeOfSupply,
      isManualPlaceOfSupply: false // Reset manual flag
    }));
  };

  const handlePartySelect = (id: string) => {
    const party = type === 'purchase' 
      ? vendors.find(v => v.id === id)
      : buyers.find(b => b.id === id);
    
    if (party) {
      const gst = party.gst || party.gstin || '';
      const pos = calculatePlaceOfSupply(gst) || party.state || '';
      
      setFormData(prev => ({
        ...prev,
        partyId: id,
        partyName: party.name,
        partyPhone: party.phone,
        partyGst: gst,
        partyPan: party.pan || '', // Add PAN card field
        placeOfSupply: pos,
        billingAddress: party.address || '',
        shippingAddress: party.address || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, partyId: id }));
    }
  };

  const handleCategorySelect = (selectedLabel: string) => {
    const category = categories.find(c => c.label === selectedLabel);
    
    if (category) {
      setCurrentItem(prev => ({
        ...prev,
        category: selectedLabel,
        hsn: category.hsn,
        gstRate: category.rate
      }));
      setFormData(prev => ({ ...prev, taxRate: category.rate }));
    } else {
      setCurrentItem(prev => ({ ...prev, category: selectedLabel }));
    }
  };

  const handleSaveNewCategory = () => {
    if (!newCategory.label || !newCategory.hsn) {
        alert("Please enter both Label and HSN Code");
        return;
    }
    
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    
    // Save custom only to storage
    const customOnly = updatedCategories.filter(c => !DEFAULT_HSN_CATEGORIES.some(d => d.label === c.label));
    localStorage.setItem('tashivar_custom_categories', JSON.stringify(customOnly));
    
    // Auto select
    setCurrentItem(prev => ({
        ...prev,
        category: newCategory.label,
        hsn: newCategory.hsn,
        gstRate: newCategory.rate
    }));
    setFormData(prev => ({ ...prev, taxRate: newCategory.rate }));
    
    setNewCategory({ label: '', hsn: '', rate: 18, type: 'goods' });
    setShowAddCategory(false);
  };

  const handleAddItem = async () => {
    if (itemMode === 'product' && !currentItem.productId) {
      alert('Please select a product');
      return;
    }
    if (itemMode === 'custom' && !currentItem.productName) {
      alert('Please enter item name');
      return;
    }
    if (!currentItem.quantity || !currentItem.price) {
      alert('Please enter quantity and price');
      return;
    }
    
    let newItem: any = {
      type: itemMode,
      quantity: parseInt(currentItem.quantity),
      price: parseFloat(currentItem.price),
      description: currentItem.description,
      hsn: currentItem.hsn,
      gstRate: currentItem.gstRate
    };

    if (itemMode === 'product') {
      const product = products.find(p => p.id === currentItem.productId);
      newItem.productId = currentItem.productId;
      newItem.productName = product?.name || 'Unknown Product';
      // Use current HSN if valid, otherwise fallback to product or default
      newItem.hsn = currentItem.hsn || product?.hsn || '5407';
      newItem.gstRate = currentItem.gstRate || product?.gstRate || 5;
    } else {
      newItem.productName = currentItem.productName;
      newItem.hsn = currentItem.hsn || '5407';
      newItem.gstRate = currentItem.gstRate || 5;
      
      if (saveCustomItem) {
         try {
           const newProduct = await productService.createProduct({
             name: currentItem.productName,
             type: 'readymade',
             category: 'Custom',
             vendor: 'Tashivar Internal',
             vendorId: 'internal',
             costPrice: parseFloat(currentItem.price),
             suggestedPrice: parseFloat(currentItem.price),
             description: 'Saved custom item',
             status: 'approved',
             hsn: newItem.hsn,
             gstRate: newItem.gstRate
           });
           
           setProducts(prev => [newProduct, ...prev]);
           newItem.productId = newProduct.id;
         } catch (err) {
           console.error("Failed to save custom item:", err);
         }
      }
    }

    // If editing, update the item
    if (editingItemIndex !== null) {
      const updatedItems = [...items];
      updatedItems[editingItemIndex] = newItem;
      setItems(updatedItems);
      setEditingItemIndex(null);
    } else {
      // Otherwise add new item
      setItems([...items, newItem]);
    }
    
    setCurrentItem({ productId: '', productName: '', quantity: '', price: '', description: '', hsn: '5407', gstRate: 5, category: '' });
    setSaveCustomItem(false);
  };

  const handleEditItem = (index: number) => {
    const item = items[index];
    setCurrentItem({
      productId: item.productId || '',
      productName: item.productName,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      description: item.description || '',
      hsn: item.hsn,
      gstRate: item.gstRate,
      category: ''
    });
    setItemMode(item.type);
    setEditingItemIndex(index);
    // Scroll to top of left panel
    const leftPanel = document.querySelector('.w-1/3 .overflow-y-auto');
    if (leftPanel) leftPanel.scrollTop = 0;
  };

  const handleCancelEdit = () => {
    setEditingItemIndex(null);
    setCurrentItem({ productId: '', productName: '', quantity: '', price: '', description: '', hsn: '5407', gstRate: 5, category: '' });
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };
  
  const calculateTotalGST = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      const itemGST = itemTotal * (item.gstRate / 100);
      return sum + itemGST;
    }, 0);
  };
  
  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    const discountAmount = formData.discountType === 'percentage' 
      ? subtotal * (formData.discountRate / 100) 
      : formData.discountAmount;
    const taxableAmount = subtotal - discountAmount;
    
    // If PAN card party (non-GST), calculate GST from item-wise rates
    if (formData.partyPan && !formData.partyGst) {
      const totalGST = calculateTotalGST();
      const gstAfterDiscount = totalGST * (1 - (formData.discountType === 'percentage' ? formData.discountRate / 100 : formData.discountAmount / subtotal));
      return taxableAmount + gstAfterDiscount;
    }
    
    // Regular GST calculation
    const taxAmount = taxableAmount * (formData.taxRate / 100);
    return taxableAmount + taxAmount;
  };

  const handlePrint = () => {
    const tempOrder = {
        id: formData.invoiceNumber,
        invoiceNumber: formData.invoiceNumber,
        date: formData.date,
        buyer: formData.partyName || 'Unknown',
        buyerAddress: formData.billingAddress || '',
        buyerPhone: formData.partyPhone || '',
        buyerGst: formData.partyGst || '', 
        products: items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            type: item.type,
            sellingPrice: item.price,
            price: item.price,
            hsn: item.hsn || '5407'
        })),
        subtotal: calculateTotal(),
        totalAmount: calculateFinalTotal(),
        taxRate: formData.taxRate,
        discountRate: formData.discountRate,
        placeOfSupply: formData.placeOfSupply,
        transportName: formData.transportName,
        transportGst: formData.transportGst,
        trackingNumber: formData.trackingNumber,
        vehicleNumber: formData.vehicleNumber
    };
    
    import('./InvoiceGenerator').then(mod => {
        mod.printInvoice(tempOrder);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    
    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        id: initialData?.id, // Pass existing ID if editing
        partyName: formData.partyName,
        partyId: formData.partyId || 'WALK-IN',
        items: items.map(item => {
           if (item.type === 'custom') {
             return {
               productId: `CUSTOM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
               productName: item.productName,
               productType: 'custom',
               quantity: item.quantity,
               costPrice: type === 'purchase' ? item.price : 0,
               sellingPrice: type === 'sale' ? item.price : 0,
               hsn: item.hsn,
               gstRate: item.gstRate
             };
           } else {
             const product = products.find(p => p.id === item.productId);
             return {
               ...item,
               productType: product?.type || 'readymade',
               costPrice: type === 'purchase' ? item.price : product?.costPrice,
               sellingPrice: type === 'sale' ? item.price : product?.suggestedPrice,
               hsn: item.hsn || product?.hsn,
               gstRate: item.gstRate || product?.gstRate || 5
             };
           }
        }),
        totalAmount: calculateFinalTotal(),
        taxRate: formData.taxRate,
        discountRate: formData.discountRate,
        discountAmount: formData.discountAmount
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit transaction:', err);
      alert('Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Helper function to format date as DD-MM-YYYY
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  // Check if PAN card party (non-GST)
  const isPanParty = formData.partyPan && !formData.partyGst;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <AddPartyModal
        isOpen={showAddPartyModal}
        onClose={() => setShowAddPartyModal(false)}
        type={type === 'purchase' ? 'vendor' : 'buyer'}
        onSuccess={() => {
          if (onRefreshData) {
            onRefreshData();
          }
        }}
      />
      
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex overflow-hidden shadow-2xl">
        
        {/* Left Side: Data Entry */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {type === 'purchase' ? <Store className="w-5 h-5 text-indigo-600" /> : <FileText className="w-5 h-5 text-indigo-600" />}
              {initialData ? 'Edit Transaction' : (type === 'purchase' ? 'Purchase Entry' : 'New Invoice')}
            </h3>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-5">
            {/* Party Details */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">
                {type === 'purchase' ? 'Vendor Details' : 'Customer Details'}
              </label>
              <div className="flex gap-2">
                <SearchableDropdown
                  options={type === 'purchase' 
                    ? vendors.map(v => ({ id: v.id, label: v.name, subLabel: v.city }))
                    : buyers.map(b => ({ id: b.id, label: b.name, subLabel: b.type === 'retailer' ? 'Retailer' : 'Customer' }))
                  }
                  value={formData.partyId}
                  onChange={handlePartySelect}
                  placeholder={`Select ${type === 'purchase' ? 'Vendor' : 'Customer'}`}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowAddPartyModal(true)}
                  className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                  title={`Add New ${type === 'purchase' ? 'Vendor' : 'Customer'}`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                  placeholder="Invoice #"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                  readOnly={!!initialData} // Lock invoice number on edit
                />
              </div>

              {/* GST and Place of Supply */}
              <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-blue-800 mb-1">GSTIN (Optional)</label>
                    <input
                      type="text"
                      value={formData.partyGst}
                      onChange={(e) => handleGstChange(e.target.value)}
                      placeholder="24ABCDE..."
                      className="w-full px-2 py-1.5 bg-white border border-blue-200 rounded text-sm uppercase font-mono"
                      maxLength={15}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-blue-800 mb-1">PAN Card (if no GST)</label>
                    <input
                      type="text"
                      value={formData.partyPan}
                      onChange={(e) => setFormData({...formData, partyPan: e.target.value.toUpperCase()})}
                      placeholder="ABCDE1234F"
                      className="w-full px-2 py-1.5 bg-white border border-blue-200 rounded text-sm uppercase font-mono"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">Place of Supply (Manual Entry)</label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-600" />
                    <input
                      type="text"
                      value={formData.placeOfSupply}
                      onChange={(e) => setFormData({...formData, placeOfSupply: e.target.value, isManualPlaceOfSupply: true})}
                      placeholder="Enter state manually (e.g., Maharashtra)"
                      className="w-full pl-7 pr-2 py-1.5 bg-white border border-blue-200 rounded text-sm"
                    />
                  </div>
                  <p className="text-xs text-blue-700 mt-1">📌 Manual entry: No GST will be applied</p>
                </div>
              </div>
            </div>

            {/* Address Details */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">Billing & Shipping</label>
              <textarea
                value={formData.billingAddress}
                onChange={(e) => setFormData({...formData, billingAddress: e.target.value})}
                placeholder="Billing Address"
                rows={2}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm resize-none"
              />
            </div>

            {/* Item Entry */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-900">Add Items</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setItemMode('product')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      itemMode === 'product' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemMode('custom')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      itemMode === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Custom / Service
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Category / Service Selector for HSN Auto-fill */}
                <div className="space-y-1">
                   <div className="flex justify-between items-center mb-1">
                     <label className="text-xs text-gray-500">Category / Service Type</label>
                     <button 
                       type="button" 
                       onClick={() => setShowAddCategory(!showAddCategory)}
                       className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                     >
                       <Settings className="w-3 h-3" /> Manage
                     </button>
                   </div>
                   
                   {showAddCategory && (
                     <div className="p-3 bg-gray-50 border border-indigo-100 rounded-lg mb-2">
                       <h4 className="text-xs font-bold text-gray-700 mb-2">Add New Category</h4>
                       <div className="grid grid-cols-2 gap-2 mb-2">
                         <input 
                           type="text" 
                           placeholder="Category Name" 
                           className="text-xs p-1.5 border rounded"
                           value={newCategory.label}
                           onChange={e => setNewCategory({...newCategory, label: e.target.value})}
                         />
                         <input 
                           type="text" 
                           placeholder="HSN Code" 
                           className="text-xs p-1.5 border rounded"
                           value={newCategory.hsn}
                           onChange={e => setNewCategory({...newCategory, hsn: e.target.value})}
                         />
                         <div className="flex items-center border rounded bg-white px-2">
                            <span className="text-xs text-gray-500 mr-1">Rate:</span>
                            <input 
                              type="number" 
                              className="text-xs p-1.5 w-full outline-none"
                              value={newCategory.rate}
                              onChange={e => setNewCategory({...newCategory, rate: parseFloat(e.target.value)})}
                            />
                            <span className="text-xs text-gray-500">%</span>
                         </div>
                         <select 
                           className="text-xs p-1.5 border rounded"
                           value={newCategory.type}
                           onChange={e => setNewCategory({...newCategory, type: e.target.value})}
                         >
                           <option value="goods">Goods</option>
                           <option value="service">Service</option>
                         </select>
                       </div>
                       <button 
                         type="button"
                         onClick={handleSaveNewCategory}
                         className="w-full py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700"
                       >
                         Save Category
                       </button>
                     </div>
                   )}

                   <SearchableDropdown
                      options={categories.map(cat => ({ 
                        id: cat.label, 
                        label: cat.label, 
                        subLabel: `HSN: ${cat.hsn}, Rate: ${cat.rate}%`
                      }))}
                      value={currentItem.category}
                      onChange={handleCategorySelect}
                      placeholder="Select Category to Auto-fill HSN"
                      className="w-full"
                   />
                </div>

                {itemMode === 'product' ? (
                  <div className="grid grid-cols-3 gap-2">
                     <div className="col-span-3">
                         <SearchableDropdown
                            options={products.map(p => ({ 
                                id: p.id, 
                                label: p.name, 
                                subLabel: `₹${type === 'purchase' ? p.costPrice : p.suggestedPrice}`
                            }))}
                            value={currentItem.productId}
                            onChange={(val) => {
                              const product = products.find(p => p.id === val);
                              setCurrentItem({
                                ...currentItem, 
                                productId: val,
                                productName: product?.name || '',
                                price: product ? (type === 'purchase' ? product.costPrice : product.suggestedPrice).toString() : '',
                                hsn: product?.hsn || currentItem.hsn || '5407' // Keep current HSN if valid, else default
                              });
                            }}
                            placeholder="Select Product"
                          />
                     </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                        <input
                            type="text"
                            value={currentItem.productName}
                            onChange={(e) => setCurrentItem({...currentItem, productName: e.target.value})}
                            placeholder="Enter Item / Service Name"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                     <label className="text-xs text-gray-500 mb-1 block">HSN/SAC</label>
                     <input
                        type="text"
                        value={currentItem.hsn}
                        onChange={(e) => setCurrentItem({...currentItem, hsn: e.target.value})}
                        placeholder="HSN"
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                     />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                    <input
                      type="number"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})}
                      placeholder="Qty"
                      min="1"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-xs text-gray-500 mb-1 block">Price</label>
                    <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                        <input
                          type="number"
                          value={currentItem.price}
                          onChange={(e) => setCurrentItem({...currentItem, price: e.target.value})}
                          placeholder="Price"
                          min="0"
                          className="w-full pl-5 pr-2 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        />
                    </div>
                  </div>
                </div>

                {/* Hide GST Rate field when PAN card is selected (non-GST party) */}
                {!isPanParty && (
                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">GST Rate (%)</label>
                      <select
                        value={currentItem.gstRate}
                        onChange={(e) => setCurrentItem({...currentItem, gstRate: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                      >
                        <option value={0}>0% - Nil Rated</option>
                        <option value={5}>5% - Essential Goods/Services</option>
                        <option value={12}>12% - Standard Goods</option>
                        <option value={18}>18% - Services</option>
                        <option value={28}>28% - Luxury Items</option>
                      </select>
                    </div>
                  </div>
                )}
                
                {/* Show info message when PAN card party */}
                {isPanParty && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                    <p className="text-xs text-amber-800">📋 <strong>PAN Card Party:</strong> GST will be calculated from item categories automatically</p>
                  </div>
                )}

                {itemMode === 'custom' && (
                  <div className="flex items-center gap-2 px-1">
                    <input 
                      type="checkbox"
                      id="saveCustomItem"
                      checked={saveCustomItem}
                      onChange={(e) => setSaveCustomItem(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="saveCustomItem" className="text-xs text-gray-600">Save item to inventory for future use</label>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2"
                >
                  {editingItemIndex !== null ? (
                    <>
                      <Save className="w-4 h-4" /> Update Item
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add to Bill
                    </>
                  )}
                </button>
                
                {editingItemIndex !== null && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* Payment Details */}
             <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900">Payment & Discount</label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({...formData, paymentStatus: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              {/* Discount Section */}
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-emerald-800">Discount</label>
                  <div className="flex bg-white rounded-lg p-0.5 border border-emerald-200">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, discountType: 'percentage', discountAmount: 0})}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${formData.discountType === 'percentage' ? 'bg-emerald-600 text-white' : 'text-emerald-700'}`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, discountType: 'fixed', discountRate: 0})}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${formData.discountType === 'fixed' ? 'bg-emerald-600 text-white' : 'text-emerald-700'}`}
                    >
                      ₹
                    </button>
                  </div>
                </div>
                <div className="relative">
                  {formData.discountType === 'percentage' ? (
                    <>
                      <input
                        type="number"
                        value={formData.discountRate}
                        onChange={(e) => setFormData({...formData, discountRate: parseFloat(e.target.value) || 0})}
                        placeholder="Discount %"
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-medium">%</span>
                    </>
                  ) : (
                    <>
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-medium">₹</span>
                      <input
                        type="number"
                        value={formData.discountAmount}
                        onChange={(e) => setFormData({...formData, discountAmount: parseFloat(e.target.value) || 0})}
                        placeholder="Fixed amount"
                        className="w-full pl-7 pr-3 py-2 bg-white border border-emerald-200 rounded-lg text-sm"
                        min="0"
                      />
                    </>
                  )}
                </div>
                <p className="text-xs text-emerald-700 mt-1">
                  💰 Discount Amount: ₹{formData.discountType === 'percentage' ? (calculateTotal() * (formData.discountRate / 100)).toLocaleString() : formData.discountAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-white space-y-3">
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-gray-900 text-white rounded-xl text-base font-medium hover:bg-gray-800 shadow-lg flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Save & Close Record'}
            </button>
             <button
              onClick={onClose}
              className="w-full py-2 bg-white text-gray-700 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right Side: Invoice Preview */}
        <div className="flex-1 bg-gray-100 p-8 overflow-y-auto flex flex-col items-center">
          <div className="mb-4 w-full max-w-2xl flex justify-end gap-2 print:hidden">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
          </div>

          {/* Actual Invoice Paper */}
          <div 
            id="invoice-preview"
            className="bg-white w-full max-w-2xl min-h-[800px] shadow-lg p-8 relative text-gray-900"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
                <p className="text-gray-500 mt-2"># {formData.invoiceNumber}</p>
                <p className="text-gray-500 text-sm">Date: {formatDate(formData.date)}</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-indigo-600">Tashivar B2B</h2>
                <p className="text-sm text-gray-500 mt-1">123 Fashion Street, Silk Market</p>
                <p className="text-sm text-gray-500">Surat, Gujarat, India</p>
                <p className="text-sm text-gray-500">support@tashivar.com</p>
              </div>
            </div>

            {/* Bill To & Ship To */}
            <div className="flex gap-8 mb-6">
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Bill To</h3>
                <p className="font-bold text-gray-900">{formData.partyName || 'Customer Name'}</p>
                <p className="text-sm text-gray-500 whitespace-pre-line">{formData.billingAddress || 'Address not provided'}</p>
                {formData.partyGst && (
                  <p className="text-sm text-gray-700 mt-1 font-mono">GSTIN: {formData.partyGst}</p>
                )}
                {isPanParty && (
                  <p className="text-sm text-amber-700 mt-1 font-mono">PAN: {formData.partyPan}</p>
                )}
                {formData.placeOfSupply && (
                  <p className="text-sm text-indigo-600 mt-1 font-medium">Place of Supply: {formData.placeOfSupply}</p>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Ship To</h3>
                <p className="font-bold text-gray-900">{formData.partyName || 'Customer Name'}</p>
                <p className="text-sm text-gray-500 whitespace-pre-line">{formData.shippingAddress || formData.billingAddress || 'Same as billing'}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-3 text-sm font-bold text-gray-600">Item</th>
                  <th className="text-left py-3 text-sm font-bold text-gray-600">HSN</th>
                  <th className="text-right py-3 text-sm font-bold text-gray-600">Qty</th>
                  <th className="text-right py-3 text-sm font-bold text-gray-600">Price</th>
                  {/* Show GST Rate column only for non-PAN parties */}
                  {!isPanParty && (
                    <th className="text-right py-3 text-sm font-bold text-gray-600">GST</th>
                  )}
                  <th className="text-right py-3 text-sm font-bold text-gray-600">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50">
                    <td className="py-3 text-sm text-gray-900">
                      <p className="font-medium">{item.productName}</p>
                      {item.description && <p className="text-gray-500 text-xs">{item.description}</p>}
                    </td>
                    <td className="py-3 text-sm text-gray-500 font-mono">{item.hsn}</td>
                    <td className="py-3 text-right text-sm text-gray-900">{item.quantity}</td>
                    <td className="py-3 text-right text-sm text-gray-900">₹{item.price.toLocaleString()}</td>
                    {/* Show GST Rate only for non-PAN parties */}
                    {!isPanParty && (
                      <td className="py-3 text-right text-sm text-gray-600">{item.gstRate}%</td>
                    )}
                    <td className="py-3 text-right text-sm font-medium text-gray-900">
                      ₹{(item.quantity * item.price).toLocaleString()}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleEditItem(index)}
                          className="text-gray-400 hover:text-indigo-600 p-1"
                          title="Edit item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRemoveItem(index)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={!isPanParty ? 7 : 6} className="py-8 text-center text-gray-400 text-sm">
                      Add items from the left panel to see them here
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
                {(formData.discountRate > 0 || formData.discountAmount > 0) && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>
                      Discount {formData.discountType === 'percentage' ? `(${formData.discountRate}%)` : ''}
                    </span>
                    <span>-₹{(formData.discountType === 'percentage' 
                      ? calculateTotal() * (formData.discountRate / 100) 
                      : formData.discountAmount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Taxable Value</span>
                  <span>₹{(calculateTotal() - (formData.discountType === 'percentage' 
                    ? calculateTotal() * (formData.discountRate / 100) 
                    : formData.discountAmount)).toLocaleString()}</span>
                </div>
                
                {/* For PAN card party: Show total GST calculated from items */}
                {isPanParty ? (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Total GST (Item-wise)</span>
                    <span>₹{(() => {
                      const totalGST = calculateTotalGST();
                      const subtotal = calculateTotal();
                      const discountAmount = formData.discountType === 'percentage' 
                        ? subtotal * (formData.discountRate / 100) 
                        : formData.discountAmount;
                      const gstAfterDiscount = totalGST * (1 - (discountAmount / subtotal));
                      return gstAfterDiscount.toLocaleString();
                    })()}</span>
                  </div>
                ) : (
                  /* For GST party: Show uniform GST rate */
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>GST ({formData.taxRate}%)</span>
                    <span>₹{(() => {
                      const subtotal = calculateTotal();
                      const discountAmount = formData.discountType === 'percentage' 
                        ? subtotal * (formData.discountRate / 100) 
                        : formData.discountAmount;
                      const taxableAmount = subtotal - discountAmount;
                      return (taxableAmount * (formData.taxRate / 100)).toLocaleString();
                    })()}</span>
                  </div>
                )}
                
                <div className="flex justify-between pt-3 border-t border-gray-200 font-bold text-lg text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{calculateFinalTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
