import React, { useState } from 'react';
import { ArrowLeft, Star, Heart, Share2, Package, Truck, Shield, CheckCircle2, Plus, Minus, ShoppingCart, Info } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Card } from './Card';

interface ProductDetailProps {
  onBack: () => void;
  onAddToCart: () => void;
}

export function ProductDetail({ onBack, onAddToCart }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Ivory');
  const [selectedSize, setSelectedSize] = useState('L');
  const [quantity, setQuantity] = useState(10);

  const product = {
    id: '1',
    name: 'Premium Cotton Kurta Set',
    code: 'TSV-KRT-001',
    price: 1299,
    mrp: 2499,
    discount: 48,
    rating: 4.5,
    reviews: 234,
    moq: 10,
    stock: 500,
    images: [
      'https://images.unsplash.com/photo-1699799085041-e288623615ed?w=800',
      'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800',
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800',
      'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=800'
    ],
    colors: [
      { name: 'Ivory', hex: '#FFFFF0', available: true },
      { name: 'Navy', hex: '#000080', available: true },
      { name: 'Maroon', hex: '#800000', available: true },
      { name: 'Olive', hex: '#808000', available: false }
    ],
    sizes: [
      { name: 'S', available: true, stock: 120 },
      { name: 'M', available: true, stock: 200 },
      { name: 'L', available: true, stock: 150 },
      { name: 'XL', available: true, stock: 80 },
      { name: 'XXL', available: true, stock: 50 },
      { name: '3XL', available: false, stock: 0 }
    ],
    fabric: 'Premium Cotton',
    occasion: 'Casual, Festive, Party',
    pattern: 'Solid',
    fit: 'Regular Fit',
    care: 'Dry Clean Only',
    description: 'Elevate your ethnic wear collection with this premium cotton kurta set. Perfect for both casual and festive occasions, this versatile piece features superior craftsmanship and comfortable fit. The set includes kurta and matching pajama.',
    features: [
      'Premium quality 100% cotton fabric',
      'Superior stitching and finishing',
      'Pre-shrunk and colorfast',
      'Breathable and comfortable',
      'Machine washable (gentle cycle)',
      'Multiple size options available'
    ],
    specifications: {
      'Fabric': 'Premium Cotton',
      'Pattern': 'Solid',
      'Sleeve': 'Full Sleeve',
      'Collar': 'Mandarin Collar',
      'Fit': 'Regular Fit',
      'Length': 'Knee Length',
      'Occasion': 'Casual, Festive',
      'Wash Care': 'Dry Clean Recommended'
    }
  };

  const bulkPricing = [
    { min: 10, max: 49, price: 1299, discount: 48 },
    { min: 50, max: 99, price: 1199, discount: 52 },
    { min: 100, max: 199, price: 1099, discount: 56 },
    { min: 200, max: null, price: 999, discount: 60 }
  ];

  const getCurrentPrice = () => {
    for (const tier of bulkPricing) {
      if (quantity >= tier.min && (tier.max === null || quantity <= tier.max)) {
        return tier.price;
      }
    }
    return product.price;
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > product.moq) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Products</span>
            </button>

            <div className="flex items-center gap-3">
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors">
                <Share2 className="w-5 h-5 text-text-secondary" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors">
                <Heart className="w-5 h-5 text-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Product Details */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx
                      ? 'border-primary-600 ring-2 ring-primary-200'
                      : 'border-border hover:border-primary-300'
                  }`}
                >
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-text-tertiary mb-1">SKU: {product.code}</p>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">{product.name}</h1>
                  <p className="text-text-secondary">By Tashivar</p>
                </div>
                <Badge variant="error" className="bg-error text-white">
                  {product.discount}% OFF
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= product.rating
                            ? 'fill-accent-400 text-accent-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-text-primary">{product.rating}</span>
                </div>
                <span className="text-text-tertiary">|</span>
                <button className="text-primary-600 hover:underline">
                  {product.reviews} Reviews
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="bg-primary-50 rounded-xl p-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-primary-600">
                  ₹{getCurrentPrice().toLocaleString()}
                </span>
                <span className="text-xl text-text-tertiary line-through">
                  ₹{product.mrp.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-text-secondary">Price per piece (excl. GST)</p>
              {quantity >= 50 && (
                <div className="mt-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <p className="text-sm text-success font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    You're saving ₹{((product.price - getCurrentPrice()) * quantity).toLocaleString()} on this order!
                  </p>
                </div>
              )}
            </div>

            {/* Bulk Pricing Tiers */}
            <Card className="p-4">
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary-600" />
                Bulk Pricing Tiers
              </h3>
              <div className="space-y-2">
                {bulkPricing.map((tier, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      quantity >= tier.min && (tier.max === null || quantity <= tier.max)
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-text-primary">
                        {tier.min}+ {tier.max ? `- ${tier.max}` : ''} pieces
                      </span>
                      <div className="text-right">
                        <p className="font-bold text-text-primary">₹{tier.price}</p>
                        <p className="text-xs text-success">{tier.discount}% off</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Select Color: <span className="text-primary-600">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => color.available && setSelectedColor(color.name)}
                    disabled={!color.available}
                    className={`group relative ${!color.available && 'cursor-not-allowed opacity-50'}`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        selectedColor === color.name
                          ? 'border-primary-600 ring-2 ring-primary-200'
                          : 'border-border hover:border-primary-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-text-tertiary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Select Size: <span className="text-primary-600">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => size.available && setSelectedSize(size.name)}
                    disabled={!size.available}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                      selectedSize === size.name
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : size.available
                        ? 'border-border hover:border-primary-300 text-text-primary'
                        : 'border-border text-text-tertiary cursor-not-allowed opacity-50'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">
                Quantity (MOQ: {product.moq} pieces)
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-border rounded-lg">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= product.moq}
                    className="w-12 h-12 flex items-center justify-center hover:bg-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || product.moq;
                      setQuantity(Math.max(product.moq, val));
                    }}
                    className="w-20 h-12 text-center border-x-2 border-border font-semibold focus:outline-none"
                  />
                  <button
                    onClick={incrementQuantity}
                    className="w-12 h-12 flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-secondary">
                    Total: <span className="text-xl font-bold text-text-primary">₹{(getCurrentPrice() * quantity).toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-text-tertiary mt-1">{product.stock} pieces available</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button variant="secondary" className="flex-1">
                <Heart className="w-5 h-5 mr-2" />
                Add to Wishlist
              </Button>
              <Button variant="primary" className="flex-1" onClick={onAddToCart}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-xs font-medium text-text-primary">Quality</p>
                <p className="text-xs text-text-tertiary">Assured</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-xs font-medium text-text-primary">Fast</p>
                <p className="text-xs text-text-tertiary">Delivery</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-xs font-medium text-text-primary">Secure</p>
                <p className="text-xs text-text-tertiary">Payment</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="space-y-6">
          <div className="border-b border-border">
            <nav className="flex gap-8">
              <button className="pb-4 border-b-2 border-primary-600 text-primary-600 font-medium">
                Description
              </button>
              <button className="pb-4 border-b-2 border-transparent text-text-secondary hover:text-text-primary">
                Specifications
              </button>
              <button className="pb-4 border-b-2 border-transparent text-text-secondary hover:text-text-primary">
                Reviews ({product.reviews})
              </button>
            </nav>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Description */}
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Product Description</h3>
              <p className="text-text-secondary leading-relaxed mb-6">{product.description}</p>

              <h4 className="font-semibold text-text-primary mb-3">Key Features</h4>
              <ul className="space-y-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-text-secondary">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-xl font-bold text-text-primary mb-4">Specifications</h3>
              <div className="space-y-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex py-3 border-b border-border">
                    <span className="w-1/3 text-text-tertiary">{key}</span>
                    <span className="w-2/3 font-medium text-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
