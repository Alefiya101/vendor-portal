import React, { useState } from 'react';
import { ArrowLeft, Trash2, Plus, Minus, Tag, Percent, Truck, CreditCard, Building2, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { Badge } from './Badge';
import { ButtonWithLoading, LoadingSpinner } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields, validatePhone, validateGSTIN } from '../utils/security';
import { toast } from 'sonner@2.0.3';
import { apiClient, handleApiError } from '../utils/apiClient';

interface CartAndCheckoutProps {
  onBack: () => void;
  onOrderSuccess: () => void;
}

export function CartAndCheckout({ onBack, onOrderSuccess }: CartAndCheckoutProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'payment'>('cart');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);

  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'Premium Cotton Kurta Set',
      code: 'TSV-KRT-001',
      image: 'https://images.unsplash.com/photo-1699799085041-e288623615ed?w=200',
      price: 1299,
      quantity: 10,
      color: 'Ivory',
      size: 'L',
      moq: 10
    },
    {
      id: '2',
      name: 'Designer Sherwani Collection',
      code: 'TSV-SHW-045',
      image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=200',
      price: 4599,
      quantity: 5,
      color: 'Gold',
      size: 'XL',
      moq: 5
    },
    {
      id: '3',
      name: 'Indo-Western Blazer Jacket',
      code: 'TSV-IW-023',
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=200',
      price: 2899,
      quantity: 8,
      color: 'Navy',
      size: 'L',
      moq: 8
    }
  ]);

  const [shippingAddress, setShippingAddress] = useState({
    name: 'Rajesh Kumar',
    businessName: 'Kumar Fashion Store',
    phone: '+91 98765 43210',
    address: '123, MG Road, Brigade Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    gst: '29AAAAA0000A1Z5'
  });

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(item.moq, newQuantity) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'FIRST50') {
      setAppliedCoupon('FIRST50');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? subtotal * 0.05 : 0;
  const gstAmount = (subtotal - discountAmount) * 0.18;
  const shippingCharges = subtotal >= 50000 ? 0 : 500;
  const total = subtotal - discountAmount + gstAmount + shippingCharges;

  const handlePlaceOrder = () => {
    if (step === 'cart') {
      setStep('checkout');
    } else if (step === 'checkout') {
      setStep('payment');
    } else if (step === 'payment' && paymentMethod) {
      // Simulate payment processing
      setProcessingOrder(true);
      setTimeout(() => {
        onOrderSuccess();
        setProcessingOrder(false);
      }, 1000);
    }
  };

  const validateAndPlaceOrder = async () => {
    if (step === 'payment' && paymentMethod) {
      setLoading(true);
      const requiredFields = ['name', 'businessName', 'phone', 'address', 'city', 'state', 'pincode'];
      const validationErrors = validateRequiredFields(shippingAddress, requiredFields);
      if (validationErrors.length > 0) {
        toast.error(`Please fill in the following fields: ${validationErrors.join(', ')}`);
        setLoading(false);
        return;
      }

      const phoneError = validatePhone(shippingAddress.phone);
      if (phoneError) {
        toast.error(phoneError);
        setLoading(false);
        return;
      }

      const gstError = validateGSTIN(shippingAddress.gst);
      if (gstError) {
        toast.error(gstError);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.post('/orders', {
          cartItems,
          shippingAddress,
          paymentMethod,
          appliedCoupon,
          subtotal,
          discountAmount,
          gstAmount,
          shippingCharges,
          total
        });
        if (response.status === 201) {
          onOrderSuccess();
        } else {
          handleApiError(response);
        }
      } catch (error) {
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Continue Shopping</span>
            </button>

            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'cart' ? 'bg-primary-600 text-white' : 'bg-background text-text-tertiary'}`}>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">1</div>
                <span className="hidden sm:block text-sm font-medium">Cart</span>
              </div>
              <div className="w-8 h-0.5 bg-border"></div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'checkout' ? 'bg-primary-600 text-white' : 'bg-background text-text-tertiary'}`}>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">2</div>
                <span className="hidden sm:block text-sm font-medium">Address</span>
              </div>
              <div className="w-8 h-0.5 bg-border"></div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${step === 'payment' ? 'bg-primary-600 text-white' : 'bg-background text-text-tertiary'}`}>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">3</div>
                <span className="hidden sm:block text-sm font-medium">Payment</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Step */}
            {step === 'cart' && (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-text-primary">Shopping Cart</h1>
                  <p className="text-text-secondary">{cartItems.length} items</p>
                </div>

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <Card key={item.id} className="p-4 sm:p-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-text-tertiary mb-1">SKU: {item.code}</p>
                              <h3 className="font-semibold text-text-primary mb-1">{item.name}</h3>
                              <p className="text-sm text-text-secondary mb-2">By Tashivar</p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="px-2 py-1 bg-background rounded text-text-secondary">
                                  Color: {item.color}
                                </span>
                                <span className="px-2 py-1 bg-background rounded text-text-secondary">
                                  Size: {item.size}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-error hover:text-error/80 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center border-2 border-border rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= item.moq}
                                className="w-10 h-10 flex items-center justify-center hover:bg-background transition-colors disabled:opacity-50"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || item.moq)}
                                className="w-16 h-10 text-center border-x-2 border-border font-medium focus:outline-none"
                              />
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-background transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-text-tertiary mb-1">₹{item.price} × {item.quantity}</p>
                              <p className="text-xl font-bold text-text-primary">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Coupon */}
                <Card className="p-6">
                  <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary-600" />
                    Apply Coupon Code
                  </h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button variant="secondary" onClick={applyCoupon}>
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="mt-3 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-success font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Coupon "{appliedCoupon}" applied - 5% discount
                      </span>
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                        }}
                        className="text-error text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Badge className="bg-primary-50 text-primary-600">FIRST50 - 5% off</Badge>
                    <Badge className="bg-primary-50 text-primary-600">BULK100 - Free shipping</Badge>
                  </div>
                </Card>
              </>
            )}

            {/* Checkout Step */}
            {step === 'checkout' && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-2">Shipping Address</h1>
                  <p className="text-text-secondary">Confirm your delivery address</p>
                </div>

                <Card className="p-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-text-primary">Contact Person</label>
                      <Input
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-text-primary">Business Name</label>
                      <Input
                        value={shippingAddress.businessName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, businessName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-sm font-medium text-text-primary">Phone Number</label>
                      <Input
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="block text-sm font-medium text-text-primary">Address</label>
                      <Input
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-text-primary">City</label>
                      <Input
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-text-primary">State</label>
                      <Input
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-text-primary">Pincode</label>
                      <Input
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-text-primary">GST Number (Optional)</label>
                      <Input
                        value={shippingAddress.gst}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, gst: e.target.value })}
                      />
                    </div>
                  </div>
                </Card>

                {/* Delivery Timeline */}
                <Card className="p-6">
                  <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary-600" />
                    Estimated Delivery
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-text-primary font-medium">5-7 Business Days</p>
                      <p className="text-sm text-text-secondary">Expected delivery by Dec 25, 2025</p>
                    </div>
                    {shippingCharges === 0 && (
                      <Badge className="bg-success text-white">Free Shipping</Badge>
                    )}
                  </div>
                </Card>
              </>
            )}

            {/* Payment Step */}
            {step === 'payment' && (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-2">Payment Method</h1>
                  <p className="text-text-secondary">Choose your preferred payment option</p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setPaymentMethod('credit-debit')}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'credit-debit'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-border hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary mb-1">Credit / Debit Card</h3>
                        <p className="text-sm text-text-secondary">Visa, Mastercard, RuPay accepted</p>
                      </div>
                      {paymentMethod === 'credit-debit' && (
                        <CheckCircle2 className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'upi'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-border hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary mb-1">UPI Payment</h3>
                        <p className="text-sm text-text-secondary">GooglePay, PhonePe, Paytm & more</p>
                      </div>
                      {paymentMethod === 'upi' && (
                        <CheckCircle2 className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('net-banking')}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'net-banking'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-border hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary mb-1">Net Banking</h3>
                        <p className="text-sm text-text-secondary">All major banks supported</p>
                      </div>
                      {paymentMethod === 'net-banking' && (
                        <CheckCircle2 className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('credit-terms')}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      paymentMethod === 'credit-terms'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-border hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Percent className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary mb-1">Credit Terms (7/15/30 days)</h3>
                        <p className="text-sm text-text-secondary">Available for verified buyers</p>
                      </div>
                      {paymentMethod === 'credit-terms' && (
                        <CheckCircle2 className="w-6 h-6 text-primary-600" />
                      )}
                    </div>
                  </button>
                </div>

                {!paymentMethod && (
                  <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-text-secondary">Please select a payment method to continue</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold text-text-primary mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span className="font-medium text-text-primary">₹{subtotal.toLocaleString()}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Discount (5%)</span>
                    <span className="font-medium text-success">-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">GST (18%)</span>
                  <span className="font-medium text-text-primary">₹{gstAmount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Shipping Charges</span>
                  {shippingCharges === 0 ? (
                    <span className="font-medium text-success">FREE</span>
                  ) : (
                    <span className="font-medium text-text-primary">₹{shippingCharges.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold text-text-primary">Total Amount</span>
                <span className="text-2xl font-bold text-primary-600">₹{Math.round(total).toLocaleString()}</span>
              </div>

              <ButtonWithLoading
                variant="primary"
                className="w-full mb-4"
                onClick={validateAndPlaceOrder}
                disabled={step === 'payment' && !paymentMethod}
                loading={loading}
                processing={processingOrder}
              >
                {step === 'cart' && 'Proceed to Checkout'}
                {step === 'checkout' && 'Continue to Payment'}
                {step === 'payment' && 'Place Order'}
              </ButtonWithLoading>

              {step === 'cart' && subtotal < 50000 && (
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-primary-600">
                    Add ₹{(50000 - subtotal).toLocaleString()} more to get FREE shipping
                  </p>
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-2 text-xs text-text-tertiary">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    Secure payment gateway
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    100% payment protection
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}