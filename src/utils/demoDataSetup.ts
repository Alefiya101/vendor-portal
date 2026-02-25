import * as orderService from '../services/orderService';

// Demo data setup for customer presentation
export async function setupDemoData() {
  console.log('🚀 Setting up demo data...');
  
  const demoOrders = [
    // Order 1: Pending Approval (Fresh order)
    {
      buyer: 'Kumar Fashion Hub',
      buyerId: 'BUY-001',
      buyerPhone: '+91 98765 43210',
      buyerAddress: '123, Fashion Street, Andheri West, Mumbai, Maharashtra - 400053',
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
          image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200'
        },
        {
          id: 'TSV-KRT-002',
          name: 'Embroidered Kurti',
          type: 'readymade',
          quantity: 30,
          costPrice: 850,
          sellingPrice: 999,
          image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200'
        }
      ],
      subtotal: 94920,
      commission: 13920,
      commissionDistribution: [
        { party: 'Vendor', amount: 9744 },
        { party: 'Stitching Master', amount: 4176 }
      ],
      profit: 13920,
      paymentStatus: 'paid',
      paymentMethod: 'UPI'
    },
    
    // Order 2: Approved (Ready to forward to vendor)
    {
      buyer: 'Rajesh Textiles',
      buyerId: 'BUY-002',
      buyerPhone: '+91 98765 54321',
      buyerAddress: '456, Textile Market, Surat, Gujarat - 395003',
      vendor: 'Elite Designers',
      vendorId: 'VEN-002',
      vendorPhone: '+91 98765 22222',
      products: [
        {
          id: 'TSV-SHW-001',
          name: 'Royal Silk Sherwani',
          type: 'readymade',
          quantity: 25,
          costPrice: 4200,
          sellingPrice: 4599,
          image: 'https://images.unsplash.com/photo-1583391733981-5aba2d7ba342?w=200'
        }
      ],
      subtotal: 114975,
      commission: 9975,
      commissionDistribution: [
        { party: 'Vendor', amount: 5985 },
        { party: 'Designer', amount: 2494 },
        { party: 'Stitching Master', amount: 1496 }
      ],
      profit: 9975,
      paymentStatus: 'paid',
      paymentMethod: 'Bank Transfer',
      // Add custom PO with multi-party tracking
      customPO: {
        parties: [
          {
            id: 'PARTY-001',
            type: 'vendor',
            name: 'Elite Designers',
            contactPerson: 'Amit Sharma',
            phone: '+91 98765 22222',
            email: 'amit@elitedesigners.com',
            commissionPercentage: 60,
            commissionAmount: 5985,
            items: [],
            notes: 'Main vendor for sherwani production'
          },
          {
            id: 'PARTY-002',
            type: 'designer',
            name: 'Creative Designs Studio',
            contactPerson: 'Priya Patel',
            phone: '+91 98765 33333',
            email: 'priya@creativedesigns.com',
            commissionPercentage: 25,
            commissionAmount: 2494,
            items: [],
            notes: 'Design and embroidery work'
          },
          {
            id: 'PARTY-003',
            type: 'stitching-master',
            name: 'Expert Tailors',
            contactPerson: 'Rajesh Kumar',
            phone: '+91 98765 44444',
            email: 'rajesh@experttailors.com',
            commissionPercentage: 15,
            commissionAmount: 1496,
            items: [],
            notes: 'Stitching and finishing'
          }
        ]
      },
      // Add vendor dispatches tracking
      vendorDispatches: {
        'PARTY-001': {
          accepted: true,
          acceptedAt: '2025-01-16T10:00:00Z',
          dispatchedAt: '2025-01-18T09:00:00Z',
          dispatchDate: '2025-01-18',
          deliveryMethod: 'courier',
          courierService: 'Delhivery',
          trackingId: 'DELH123456789',
          estimatedDelivery: '2025-01-20',
          quantity: '25',
          notes: 'All items packaged carefully',
          receivedAt: null,
        },
        'PARTY-002': {
          accepted: true,
          acceptedAt: '2025-01-16T11:00:00Z',
          dispatchedAt: null,
        },
        'PARTY-003': {
          accepted: true,
          acceptedAt: '2025-01-16T12:00:00Z',
          dispatchedAt: null,
        }
      }
    },
    
    // Order 3: Fabric order
    {
      buyer: 'Sharma Boutique',
      buyerId: 'BUY-003',
      buyerPhone: '+91 98765 98765',
      buyerAddress: '789, MG Road, Bengaluru, Karnataka - 560001',
      vendor: 'Silk Weavers Co.',
      vendorId: 'VEN-003',
      vendorPhone: '+91 98765 33333',
      products: [
        {
          id: 'TSV-FAB-001',
          name: 'Premium Banarasi Silk',
          type: 'fabric',
          quantity: 100,
          costPrice: 1500,
          sellingPrice: 1799,
          image: 'https://images.unsplash.com/photo-1610819120805-437e4e7a3d9b?w=200'
        }
      ],
      subtotal: 179900,
      commission: 29900,
      commissionDistribution: [
        { party: 'Vendor', amount: 29900 }
      ],
      profit: 29900,
      paymentStatus: 'paid',
      paymentMethod: 'UPI'
    },
    
    // Order 4: Mixed order
    {
      buyer: 'Fashion Zone',
      buyerId: 'BUY-004',
      buyerPhone: '+91 98765 11122',
      buyerAddress: '321, Commercial Street, Pune, Maharashtra - 411001',
      vendor: 'Fashion Creations',
      vendorId: 'VEN-001',
      vendorPhone: '+91 98765 11111',
      products: [
        {
          id: 'TSV-LNG-001',
          name: 'Designer Lehenga Choli',
          type: 'readymade',
          quantity: 15,
          costPrice: 6500,
          sellingPrice: 7299,
          image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200'
        },
        {
          id: 'TSV-SLW-001',
          name: 'Salwar Kameez Set',
          type: 'readymade',
          quantity: 40,
          costPrice: 1200,
          sellingPrice: 1499,
          image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200'
        }
      ],
      subtotal: 169425,
      commission: 21885,
      commissionDistribution: [
        { party: 'Vendor', amount: 15320 },
        { party: 'Stitching Master', amount: 6565 }
      ],
      profit: 21885,
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card'
    },
    
    // Order 5: Large order
    {
      buyer: 'Metro Fashion Store',
      buyerId: 'BUY-005',
      buyerPhone: '+91 98765 77788',
      buyerAddress: '555, Fashion District, Delhi - 110001',
      vendor: 'Elite Designers',
      vendorId: 'VEN-002',
      vendorPhone: '+91 98765 22222',
      products: [
        {
          id: 'TSV-KRT-003',
          name: 'Casual Cotton Kurta',
          type: 'readymade',
          quantity: 100,
          costPrice: 650,
          sellingPrice: 799,
          image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200'
        },
        {
          id: 'TSV-SRT-001',
          name: 'Silk Saree Collection',
          type: 'readymade',
          quantity: 50,
          costPrice: 2800,
          sellingPrice: 3199,
          image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=200'
        }
      ],
      subtotal: 239850,
      commission: 34850,
      commissionDistribution: [
        { party: 'Vendor', amount: 24395 },
        { party: 'Stitching Master', amount: 10455 }
      ],
      profit: 34850,
      paymentStatus: 'pending',
      paymentMethod: 'Net Banking'
    }
  ];

  try {
    const createdOrders = [];
    
    for (const orderData of demoOrders) {
      console.log(`Creating order for ${orderData.buyer}...`);
      const order = await orderService.createOrder(orderData);
      createdOrders.push(order);
      
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Demo data setup complete!');
    console.log(`Created ${createdOrders.length} orders`);
    
    return createdOrders;
  } catch (error) {
    console.error('❌ Error setting up demo data:', error);
    throw error;
  }
}

// Function to demo the complete workflow on one order
export async function demoCompleteWorkflow() {
  console.log('🎬 Starting complete workflow demo...');
  
  try {
    // 1. Create a new order
    console.log('Step 1: Creating order...');
    const orderData = {
      buyer: 'DEMO - VIP Fashion Store',
      buyerId: 'BUY-DEMO',
      buyerPhone: '+91 98765 00000',
      buyerAddress: 'DEMO Address, Fashion Street, Mumbai - 400001',
      vendor: 'DEMO Vendor',
      vendorId: 'VEN-DEMO',
      vendorPhone: '+91 98765 99999',
      products: [
        {
          id: 'DEMO-001',
          name: 'DEMO Premium Kurta',
          type: 'readymade',
          quantity: 10,
          costPrice: 1000,
          sellingPrice: 1200,
          image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=200'
        }
      ],
      subtotal: 12000,
      commission: 2000,
      commissionDistribution: [
        { party: 'Vendor', amount: 1400 },
        { party: 'Stitching Master', amount: 600 }
      ],
      profit: 2000,
      paymentStatus: 'paid',
      paymentMethod: 'UPI'
    };
    
    const order = await orderService.createOrder(orderData);
    console.log('✅ Order created:', order.id);
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. Approve order
    console.log('Step 2: Approving order...');
    const approvedOrder = await orderService.approveOrder(order.id);
    console.log('✅ Order approved');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Forward to vendor
    console.log('Step 3: Forwarding to vendor...');
    const forwardedOrder = await orderService.forwardToVendor(order.id, {
      poNumber: `PO-DEMO-${Date.now()}`,
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliveryMethod: 'courier',
      courierService: 'Delhivery',
      notes: 'DEMO: Rush order - Please prioritize'
    });
    console.log('✅ Order forwarded to vendor');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Vendor accepts
    console.log('Step 4: Vendor accepting PO...');
    const acceptedOrder = await orderService.vendorAcceptPO(order.id);
    console.log('✅ Vendor accepted PO');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. Vendor dispatches
    console.log('Step 5: Vendor dispatching...');
    const dispatchedOrder = await orderService.vendorDispatch(order.id, {
      deliveryMethod: 'courier',
      courierService: 'Delhivery',
      trackingId: `DELH${Date.now()}`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    console.log('✅ Vendor dispatched to warehouse');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 6. Receive at warehouse
    console.log('Step 6: Receiving at warehouse...');
    const receivedOrder = await orderService.receiveAtWarehouse(order.id, {
      receivedDate: new Date().toISOString().split('T')[0],
      receivedBy: 'Warehouse Manager',
      condition: 'good',
      notes: 'All items in perfect condition'
    });
    console.log('✅ Received at warehouse');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 7. Dispatch to buyer
    console.log('Step 7: Dispatching to buyer...');
    const dispatchedToBuyer = await orderService.dispatchToBuyer(order.id, {
      deliveryMethod: 'courier',
      courierService: 'BlueDart',
      trackingId: `BD${Date.now()}`,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Expedited delivery requested'
    });
    console.log('✅ Dispatched to buyer');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 8. Mark as delivered
    console.log('Step 8: Marking as delivered...');
    const deliveredOrder = await orderService.markAsDelivered(order.id, {
      deliveredDate: new Date().toISOString().split('T')[0],
      deliveredTo: 'Store Manager',
      deliveryNotes: 'Delivered successfully and accepted by customer'
    });
    console.log('✅ Order delivered');
    
    console.log('🎉 Complete workflow demo finished!');
    console.log('Order journey:', order.id, '→', deliveredOrder.status);
    
    return deliveredOrder;
  } catch (error) {
    console.error('❌ Error in workflow demo:', error);
    throw error;
  }
}

// Clear all demo data
export async function clearDemoData() {
  console.log('🧹 Clearing demo data...');
  try {
    const allOrders = await orderService.getAllOrders();
    
    for (const order of allOrders) {
      await orderService.deleteOrder(order.id);
      console.log(`Deleted order: ${order.id}`);
    }
    
    console.log('✅ All demo data cleared!');
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    throw error;
  }
}