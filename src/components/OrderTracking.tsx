import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle2, Truck, Home, MapPin, Phone, FileText, Download, Clock, Calendar } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';
import { LoadingSpinner, TableSkeleton } from './LoadingSpinner';
import { apiClient, handleApiError } from '../utils/apiClient';
import { toast } from 'sonner';

interface OrderTrackingProps {
  onBack: () => void;
}

export function OrderTracking({ onBack }: OrderTrackingProps) {
  const [selectedOrder, setSelectedOrder] = useState<string | null>('ORD-2025-001');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
      // Fallback to demo data on error
      setOrders([
        {
          id: 'ORD-2025-001',
          date: '2025-12-10',
          status: 'in-transit',
          total: 56847,
          items: 23,
          expectedDelivery: '2025-12-18',
          trackingNumber: 'TRK123456789'
        },
        {
          id: 'ORD-2025-002',
          date: '2025-12-05',
          status: 'delivered',
          total: 34299,
          items: 15,
          expectedDelivery: '2025-12-12',
          deliveredOn: '2025-12-11',
          trackingNumber: 'TRK987654321'
        },
        {
          id: 'ORD-2024-098',
          date: '2025-11-28',
          status: 'delivered',
          total: 89234,
          items: 42,
          expectedDelivery: '2025-12-05',
          deliveredOn: '2025-12-04',
          trackingNumber: 'TRK456789123'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const orderItems = [
    {
      id: '1',
      name: 'Premium Cotton Kurta Set',
      code: 'TSV-KRT-001',
      image: 'https://images.unsplash.com/photo-1699799085041-e288623615ed?w=200',
      quantity: 10,
      price: 1299
    },
    {
      id: '2',
      name: 'Designer Sherwani Collection',
      code: 'TSV-SHW-045',
      image: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=200',
      quantity: 5,
      price: 4599
    },
    {
      id: '3',
      name: 'Indo-Western Blazer Jacket',
      code: 'TSV-IW-023',
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=200',
      quantity: 8,
      price: 2899
    }
  ];

  const trackingHistory = [
    {
      status: 'Order Placed',
      description: 'Your order has been confirmed',
      location: 'Bangalore, Karnataka',
      date: '2025-12-10',
      time: '10:30 AM',
      completed: true
    },
    {
      status: 'Order Processed',
      description: 'Order is being prepared for shipment',
      location: 'Tashivar Warehouse, Mumbai',
      date: '2025-12-11',
      time: '02:15 PM',
      completed: true
    },
    {
      status: 'Shipped',
      description: 'Package picked up by courier',
      location: 'Mumbai Distribution Center',
      date: '2025-12-12',
      time: '09:45 AM',
      completed: true
    },
    {
      status: 'In Transit',
      description: 'Package is on the way to Bangalore',
      location: 'Pune Hub',
      date: '2025-12-14',
      time: '11:20 AM',
      completed: true
    },
    {
      status: 'Out for Delivery',
      description: 'Package will be delivered today',
      location: 'Bangalore Local Facility',
      date: '2025-12-18',
      time: 'Expected by 6:00 PM',
      completed: false
    },
    {
      status: 'Delivered',
      description: 'Package delivered successfully',
      location: 'Bangalore, Karnataka',
      date: '',
      time: '',
      completed: false
    }
  ];

  const currentOrder = orders.find(o => o.id === selectedOrder);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-success text-white">Delivered</Badge>;
      case 'in-transit':
        return <Badge className="bg-info text-white">In Transit</Badge>;
      case 'processing':
        return <Badge className="bg-warning text-white">Processing</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <h1 className="text-xl font-bold text-text-primary">Order Tracking</h1>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="space-y-4">
            <h2 className="font-bold text-text-primary">Your Orders</h2>
            {loading ? (
              <TableSkeleton rows={3} />
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : (
              orders.map((order) => (
                <Card
                  key={order.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedOrder === order.id
                      ? 'border-2 border-primary-600 bg-primary-50'
                      : 'hover:border-primary-300'
                  }`}
                  onClick={() => setSelectedOrder(order.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-text-primary mb-1">{order.id}</p>
                      <p className="text-sm text-text-secondary">{order.items} items</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-tertiary">Order Date:</span>
                      <span className="text-text-primary">{new Date(order.date).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-tertiary">Total Amount:</span>
                      <span className="font-semibold text-text-primary">₹{order.total.toLocaleString()}</span>
                    </div>
                    {order.status === 'delivered' && order.deliveredOn ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-tertiary">Delivered On:</span>
                        <span className="text-success">{new Date(order.deliveredOn).toLocaleDateString('en-IN')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-tertiary">Expected:</span>
                        <span className="text-text-primary">{new Date(order.expectedDelivery).toLocaleDateString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Order Details */}
          {currentOrder && (
            <div className="lg:col-span-2 space-y-6">
              {/* Order Header */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">{currentOrder.id}</h2>
                    <p className="text-text-secondary mb-4">
                      Placed on {new Date(currentOrder.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                    {getStatusBadge(currentOrder.status)}
                  </div>
                  <Button variant="secondary" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Invoice
                  </Button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 p-4 bg-background rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary mb-1">Expected Delivery</p>
                      <p className="font-semibold text-text-primary">
                        {new Date(currentOrder.expectedDelivery).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-text-tertiary mb-1">Tracking Number</p>
                      <p className="font-semibold text-text-primary">{currentOrder.trackingNumber}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tracking Timeline */}
              <Card className="p-6">
                <h3 className="font-semibold text-text-primary mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-600" />
                  Shipment Tracking
                </h3>

                <div className="space-y-6">
                  {trackingHistory.map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.completed
                            ? 'bg-success text-white'
                            : idx === trackingHistory.findIndex(e => !e.completed)
                            ? 'bg-primary-600 text-white animate-pulse'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {event.completed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : idx === trackingHistory.findIndex(e => !e.completed) ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border-2 border-current" />
                          )}
                        </div>
                        {idx < trackingHistory.length - 1 && (
                          <div className={`w-0.5 h-16 ${event.completed ? 'bg-success' : 'bg-gray-200'}`} />
                        )}
                      </div>

                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`font-semibold ${
                            event.completed ? 'text-text-primary' : 'text-text-tertiary'
                          }`}>
                            {event.status}
                          </h4>
                          {event.date && (
                            <span className="text-xs text-text-tertiary">{event.time}</span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{event.description}</p>
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                        {event.date && (
                          <p className="text-xs text-text-tertiary mt-1">
                            {new Date(event.date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-6">
                <h3 className="font-semibold text-text-primary mb-4">Order Items ({orderItems.length})</h3>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-text-tertiary mb-1">SKU: {item.code}</p>
                        <h4 className="font-semibold text-text-primary mb-1">{item.name}</h4>
                        <p className="text-sm text-text-secondary">Quantity: {item.quantity} pieces</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-text-tertiary">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Subtotal</span>
                      <span className="text-text-primary">₹48,191</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">GST (18%)</span>
                      <span className="text-text-primary">₹8,674</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Shipping</span>
                      <span className="text-success">FREE</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold text-text-primary">Total</span>
                      <span className="text-xl font-bold text-primary-600">₹{currentOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Shipping Address */}
              <Card className="p-6">
                <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary-600" />
                  Delivery Address
                </h3>
                <div className="space-y-2 text-text-secondary">
                  <p className="font-semibold text-text-primary">Rajesh Kumar</p>
                  <p>Kumar Fashion Store</p>
                  <p>123, MG Road, Brigade Road</p>
                  <p>Bangalore, Karnataka - 560001</p>
                  <div className="flex items-center gap-2 pt-2">
                    <Phone className="w-4 h-4" />
                    <p>+91 98765 43210</p>
                  </div>
                </div>
              </Card>

              {/* Support */}
              <Card className="p-6 bg-primary-50 border-primary-200">
                <h3 className="font-semibold text-text-primary mb-2">Need Help?</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Contact our support team for any questions about your order
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1">
                    Contact Support
                  </Button>
                  <Button variant="secondary" className="flex-1">
                    Track on Map
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}