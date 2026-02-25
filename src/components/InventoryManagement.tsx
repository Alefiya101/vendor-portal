import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Save, Package, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ButtonWithLoading } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields } from '../utils/security';
import { toast } from 'sonner@2.0.3';

interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  stock: number;
  sku: string;
}

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: 'ready-made' | 'fabric';
  description: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  vendorId?: string;
  vendorName?: string;
  location: string;
  lastUpdated: string;
  avgMonthlySales: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked';
  variants?: ProductVariant[];
  imageUrl?: string;
}

interface InventoryManagementProps {
  item?: InventoryItem | null;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

export function InventoryManagement({ item, onClose, onSave }: InventoryManagementProps) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    productName: '',
    sku: '',
    category: 'ready-made',
    description: '',
    currentStock: 0,
    minStock: 20,
    maxStock: 500,
    reorderPoint: 30,
    unit: 'pieces',
    costPrice: 0,
    sellingPrice: 0,
    location: 'Surat Warehouse',
    vendorName: '',
    variants: []
  });
  const [hasVariants, setHasVariants] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData(item);
      setHasVariants(item.variants && item.variants.length > 0);
    } else {
      // Generate new SKU
      const newSku = `SKU-${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, sku: newSku }));
    }
  }, [item]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName?.trim()) {
      newErrors.productName = 'Product name is required';
    }
    if (!formData.sku?.trim()) {
      newErrors.sku = 'SKU is required';
    }
    if (!formData.currentStock || formData.currentStock < 0) {
      newErrors.currentStock = 'Valid stock quantity is required';
    }
    if (!formData.costPrice || formData.costPrice <= 0) {
      newErrors.costPrice = 'Valid cost price is required';
    }
    if (!formData.sellingPrice || formData.sellingPrice <= 0) {
      newErrors.sellingPrice = 'Valid selling price is required';
    }
    if (formData.sellingPrice && formData.costPrice && formData.sellingPrice < formData.costPrice) {
      newErrors.sellingPrice = 'Selling price should be greater than cost price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saving) {
      console.log('⚠️ Already saving, ignoring duplicate submission');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setSaving(true);
      
      const currentStock = formData.currentStock || 0;
      const reorderPoint = formData.reorderPoint || 30;
      const maxStock = formData.maxStock || 500;

      // Validate numeric fields
      if (isNaN(currentStock) || currentStock < 0) {
        toast.error('Current stock must be a non-negative number');
        setSaving(false);
        return;
      }

      let status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'overstocked' = 'in-stock';
      if (currentStock === 0) status = 'out-of-stock';
      else if (currentStock <= reorderPoint) status = 'low-stock';
      else if (currentStock > maxStock) status = 'overstocked';

      // Sanitize inputs
      const inventoryItem: InventoryItem = {
        id: item?.id || `INV-${Date.now()}`,
        productId: item?.productId || `PROD-${Date.now()}`,
        productName: sanitizeString(formData.productName!),
        sku: sanitizeString(formData.sku!),
        category: formData.category!,
        description: sanitizeString(formData.description || ''),
        currentStock,
        minStock: formData.minStock || 20,
        maxStock,
        reorderPoint,
        unit: formData.unit!,
        costPrice: formData.costPrice!,
        sellingPrice: formData.sellingPrice!,
        vendorName: formData.vendorName ? sanitizeString(formData.vendorName) : '',
        location: sanitizeString(formData.location!),
        lastUpdated: new Date().toISOString(),
        avgMonthlySales: item?.avgMonthlySales || 0,
        status,
        variants: hasVariants ? formData.variants : undefined
      };

      onSave(inventoryItem);
      toast.success(`Inventory item "${inventoryItem.productName}" ${item ? 'updated' : 'created'} successfully!`);
    } catch (err) {
      console.error('Error saving inventory:', err);
      toast.error('Failed to save inventory item');
      setSaving(false);
    }
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `VAR-${Date.now()}`,
      size: '',
      color: '',
      stock: 0,
      sku: `${formData.sku}-${(formData.variants?.length || 0) + 1}`
    };
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const removeVariant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter(v => v.id !== id)
    }));
  };

  const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.map(v =>
        v.id === id ? { ...v, [field]: value } : v
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                className={`w-full px-4 py-2 border ${errors.productName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Enter product name"
              />
              {errors.productName && (
                <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className={`w-full px-4 py-2 border ${errors.sku ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono`}
                placeholder="SKU-000000"
              />
              {errors.sku && (
                <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  category: e.target.value as 'ready-made' | 'fabric',
                  unit: e.target.value === 'fabric' ? 'meters' : 'pieces'
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="ready-made">Ready Made</option>
                <option value="fabric">Fabric</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>

            {/* Current Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                  className={`w-full px-4 py-2 border ${errors.currentStock ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                  placeholder="0"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {formData.unit}
                </span>
              </div>
              {errors.currentStock && (
                <p className="text-red-500 text-sm mt-1">{errors.currentStock}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="pieces">Pieces</option>
                <option value="meters">Meters</option>
                <option value="sets">Sets</option>
                <option value="rolls">Rolls</option>
              </select>
            </div>

            {/* Min Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock Level
              </label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="20"
                min="0"
              />
            </div>

            {/* Max Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Stock Level
              </label>
              <input
                type="number"
                value={formData.maxStock}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStock: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="500"
                min="0"
              />
            </div>

            {/* Reorder Point */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Point
              </label>
              <input
                type="number"
                value={formData.reorderPoint}
                onChange={(e) => setFormData(prev => ({ ...prev, reorderPoint: Number(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="30"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value="Surat Warehouse"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price (₹) *
              </label>
              <input
                type="number"
                value={formData.costPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                className={`w-full px-4 py-2 border ${errors.costPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.costPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>
              )}
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: Number(e.target.value) }))}
                className={`w-full px-4 py-2 border ${errors.sellingPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.sellingPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.sellingPrice}</p>
              )}
              {formData.costPrice && formData.sellingPrice && (
                <p className="text-xs text-gray-500 mt-1">
                  Margin: ₹{(formData.sellingPrice - formData.costPrice).toFixed(2)} ({((formData.sellingPrice - formData.costPrice) / formData.costPrice * 100).toFixed(1)}%)
                </p>
              )}
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name
              </label>
              <input
                type="text"
                value={formData.vendorName}
                onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter vendor name"
              />
            </div>

            {/* Variants Section */}
            {formData.category === 'ready-made' && (
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => {
                        setHasVariants(e.target.checked);
                        if (!e.target.checked) {
                          setFormData(prev => ({ ...prev, variants: [] }));
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Product has variants (sizes/colors)</span>
                  </label>
                  {hasVariants && (
                    <button
                      type="button"
                      onClick={addVariant}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Variant
                    </button>
                  )}
                </div>

                {hasVariants && formData.variants && formData.variants.length > 0 && (
                  <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {formData.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                        <input
                          type="text"
                          value={variant.size}
                          onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Size (e.g., S, M, L)"
                        />
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Color"
                        />
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Stock"
                          min="0"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stock Status Preview */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Stock Status Preview</p>
                <p className="text-sm text-blue-700">
                  Current Stock: <strong>{formData.currentStock || 0} {formData.unit}</strong> | 
                  Min: {formData.minStock || 20} | 
                  Max: {formData.maxStock || 500} | 
                  Reorder Point: {formData.reorderPoint || 30}
                </p>
                {formData.currentStock && formData.reorderPoint && formData.currentStock <= formData.reorderPoint && (
                  <p className="text-sm text-yellow-700 mt-1">⚠️ Stock is at or below reorder point</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <ButtonWithLoading
              type="submit"
              loading={saving}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {item ? 'Update Item' : 'Add Item'}
            </ButtonWithLoading>
          </div>
        </form>
      </div>
    </div>
  );
}