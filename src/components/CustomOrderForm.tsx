import React, { useState } from 'react';
import { Upload, Camera, X, Plus, ChevronDown, ShoppingBag, Shirt, Palette, Scissors, Layers as Fabric, ArrowRight, FileText, Image as ImageIcon } from 'lucide-react';

interface CustomOrderFormProps {
  onSubmit: (orderData: any) => void;
  onCancel: () => void;
}

export function CustomOrderForm({ onSubmit, onCancel }: CustomOrderFormProps) {
  const [orderType, setOrderType] = useState<'custom-design' | 'approved-design'>('custom-design');
  const [formData, setFormData] = useState({
    productCategory: '',
    productName: '',
    quantity: '',
    targetPrice: '',
    description: '',
    fabricType: '',
    color: '',
    size: '',
    specialRequirements: '',
    urgency: 'normal',
    approvedDesignId: ''
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const approvedDesigns = [
    {
      id: 'AD-001',
      name: 'Royal Silk Sherwani',
      designer: 'Creative Designs Studio',
      category: 'Sherwanis',
      price: 4599,
      image: '🤵',
      description: 'Premium silk sherwani with intricate embroidery',
      manufacturingTime: '15-20 days',
      minOrder: 10
    },
    {
      id: 'AD-002',
      name: 'Designer Lehenga Choli',
      designer: 'Fashion Creations',
      category: 'Lehengas',
      price: 5950,
      image: '👗',
      description: 'Bridal lehenga with handwork and zari',
      manufacturingTime: '20-25 days',
      minOrder: 5
    },
    {
      id: 'AD-003',
      name: 'Embroidered Saree Collection',
      designer: 'Silk Heritage',
      category: 'Sarees',
      price: 4500,
      image: '🥻',
      description: 'Pure silk saree with designer embroidery',
      manufacturingTime: '12-15 days',
      minOrder: 15
    },
    {
      id: 'AD-004',
      name: 'Indo-Western Fusion Wear',
      designer: 'Designer Studio',
      category: 'Fusion Wear',
      price: 2500,
      image: '👘',
      description: 'Modern Indo-Western design with contemporary cuts',
      manufacturingTime: '10-12 days',
      minOrder: 20
    }
  ];

  const handleImageUpload = () => {
    // Simulate image upload
    const newImage = `Image ${uploadedImages.length + 1}`;
    setUploadedImages([...uploadedImages, newImage]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const customOrderData = {
      id: `CO-${Date.now()}`,
      type: orderType,
      ...formData,
      images: uploadedImages,
      status: 'pending-admin-review',
      submittedDate: new Date().toISOString(),
      buyerId: 'BUYER-001',
      buyerName: 'Kumar Fashion Hub'
    };

    onSubmit(customOrderData);
  };

  const selectedDesign = approvedDesigns.find(d => d.id === formData.approvedDesignId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Place Custom Order</h2>
              <p className="text-sm text-gray-600 mt-1">Custom manufacturing order with your specifications</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Order Type Selection */}
        <div className="p-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-900 mb-3">Order Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setOrderType('custom-design')}
              className={`p-4 border-2 rounded-xl transition-all ${
                orderType === 'custom-design'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  orderType === 'custom-design' ? 'bg-blue-600' : 'bg-gray-100'
                }`}>
                  <Camera className={`w-5 h-5 ${orderType === 'custom-design' ? 'text-white' : 'text-gray-600'}`} strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Custom Design</p>
                  <p className="text-xs text-gray-600">Upload your own design</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setOrderType('approved-design')}
              className={`p-4 border-2 rounded-xl transition-all ${
                orderType === 'approved-design'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  orderType === 'approved-design' ? 'bg-blue-600' : 'bg-gray-100'
                }`}>
                  <Palette className={`w-5 h-5 ${orderType === 'approved-design' ? 'text-white' : 'text-gray-600'}`} strokeWidth={2} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Approved Design</p>
                  <p className="text-xs text-gray-600">Choose pre-approved design</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Custom Design Form */}
          {orderType === 'custom-design' && (
            <>
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Upload Design Images *
                </label>
                <div className="space-y-3">
                  <div
                    onClick={() => setShowImageUpload(true)}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900 mb-1">Click to upload design images</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {uploadedImages.map((img, index) => (
                        <div key={index} className="relative bg-gray-100 rounded-lg p-4 border border-gray-200">
                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-600 text-center">{img}</p>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-600">Add More</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Product Category *</label>
                  <select
                    value={formData.productCategory}
                    onChange={(e) => setFormData({...formData, productCategory: e.target.value})}
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="sherwanis">Sherwanis</option>
                    <option value="lehengas">Lehengas</option>
                    <option value="sarees">Sarees</option>
                    <option value="kurtas">Kurta Sets</option>
                    <option value="salwar">Salwar Suits</option>
                    <option value="fusion">Fusion Wear</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    placeholder="e.g., Premium Silk Sherwani"
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="Minimum 10 pieces"
                    min="10"
                    required
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Target Price per Piece</label>
                  <input
                    type="number"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({...formData, targetPrice: e.target.value})}
                    placeholder="₹"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Fabric Type</label>
                  <input
                    type="text"
                    value={formData.fabricType}
                    onChange={(e) => setFormData({...formData, fabricType: e.target.value})}
                    placeholder="e.g., Pure Silk, Cotton, Georgette"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Preferred Color</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="e.g., Royal Blue, Red, Gold"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Size/Measurements</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  placeholder="e.g., S, M, L, XL or Custom measurements"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Detailed Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your requirements in detail - embroidery style, work type, special features, etc."
                  rows={4}
                  required
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Special Requirements</label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                  placeholder="Any special packaging, labeling, or other requirements"
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">Urgency Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['normal', 'urgent', 'very-urgent'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, urgency: level})}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        formData.urgency === level
                          ? level === 'very-urgent' ? 'border-rose-600 bg-rose-50 text-rose-700' :
                            level === 'urgent' ? 'border-orange-600 bg-orange-50 text-orange-700' :
                            'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {level === 'normal' ? 'Normal (20-30 days)' :
                       level === 'urgent' ? 'Urgent (10-15 days)' :
                       'Very Urgent (5-7 days)'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Approved Design Selection */}
          {orderType === 'approved-design' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Select Designer-Approved Product *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {approvedDesigns.map((design) => (
                    <button
                      key={design.id}
                      type="button"
                      onClick={() => setFormData({...formData, approvedDesignId: design.id})}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        formData.approvedDesignId === design.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="text-4xl">{design.image}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">{design.name}</p>
                          <p className="text-xs text-gray-600 mb-2">{design.category} • {design.designer}</p>
                          <p className="text-sm font-semibold text-blue-600">₹{design.price.toLocaleString()}/pc</p>
                          <p className="text-xs text-gray-500 mt-1">Min: {design.minOrder} pcs • {design.manufacturingTime}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDesign && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Design Details</h4>
                    <p className="text-sm text-gray-700 mb-3">{selectedDesign.description}</p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Price per piece</p>
                        <p className="font-semibold text-gray-900">₹{selectedDesign.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Manufacturing Time</p>
                        <p className="font-semibold text-gray-900">{selectedDesign.manufacturingTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Minimum Order</p>
                        <p className="font-semibold text-gray-900">{selectedDesign.minOrder} pieces</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Order Quantity *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      placeholder={`Minimum ${selectedDesign.minOrder} pieces`}
                      min={selectedDesign.minOrder}
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {formData.quantity && parseInt(formData.quantity) >= selectedDesign.minOrder && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Estimated Order Value</p>
                          <p className="text-2xl font-semibold text-emerald-600">
                            ₹{(parseInt(formData.quantity) * selectedDesign.price).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Manufacturing Time</p>
                          <p className="text-lg font-semibold text-gray-900">{selectedDesign.manufacturingTime}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Additional Requirements (Optional)</label>
                    <textarea
                      value={formData.specialRequirements}
                      onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
                      placeholder="Any modifications, special packaging, or other requirements"
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Submit Custom Order
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
