/**
 * Quick Demo Setup - Direct localStorage Population
 * 
 * This provides immediate demo data while Supabase edge functions deploy.
 * All data is stored in localStorage and will be synced to Supabase once available.
 */

export function quickDemoSetup() {
  console.log('🚀 Quick Demo Setup - Populating localStorage...');
  
  // Vendors
  const vendors = [
    {
      id: 'VEN-001',
      name: 'Fashion Creations',
      owner: 'Amit Sharma',
      email: 'amit@fashioncreations.com',
      phone: '+91 98765 11111',
      address: '123, Textile Market',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      gst: 'GST123456789',
      pancard: 'ABCDE1234F',
      bankAccount: '1234567890',
      ifscCode: 'HDFC0001234',
      status: 'active',
      joiningDate: '2024-06-15',
      productsSupplied: 156,
      totalBusiness: 1240000,
      outstandingPayments: 50000,
      rating: 4.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'VEN-002',
      name: 'Silk Paradise',
      owner: 'Priya Patel',
      email: 'priya@silkparadise.com',
      phone: '+91 98765 22222',
      address: '45, Silk Market',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395001',
      gst: 'GST987654321',
      pancard: 'FGHIJ5678K',
      bankAccount: '0987654321',
      ifscCode: 'ICIC0005678',
      status: 'active',
      joiningDate: '2024-08-20',
      productsSupplied: 45,
      totalBusiness: 560000,
      outstandingPayments: 25000,
      rating: 4.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'VEN-003',
      name: 'Royal Designs',
      owner: 'Vikram Singh',
      email: 'vikram@royaldesigns.com',
      phone: '+91 98765 33333',
      address: '78, Fashion Street',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001',
      gst: 'GST456789123',
      pancard: 'KLMNO9012P',
      bankAccount: '5432109876',
      ifscCode: 'SBI0009876',
      status: 'active',
      joiningDate: '2024-07-10',
      productsSupplied: 89,
      totalBusiness: 890000,
      outstandingPayments: 35000,
      rating: 4.3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Buyers
  const buyers = [
    {
      id: 'BUY-001',
      name: 'Kumar Fashion Hub',
      businessName: 'Kumar Fashion Hub Pvt Ltd',
      owner: 'Rajesh Kumar',
      email: 'rajesh@kumarfashion.com',
      phone: '+91 98765 43210',
      address: '123, Fashion Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      gst: 'GST111222333',
      pancard: 'QRSTU1234V',
      status: 'active',
      joiningDate: '2024-05-10',
      totalOrders: 47,
      totalBusiness: 2340000,
      outstandingPayments: 120000,
      creditLimit: 500000,
      rating: 4.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'BUY-002',
      name: 'Style Bazaar',
      businessName: 'Style Bazaar Enterprises',
      owner: 'Neha Verma',
      email: 'neha@stylebazaar.com',
      phone: '+91 98765 54321',
      address: '456, Market Road',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      gst: 'GST444555666',
      pancard: 'WXYZZ5678A',
      status: 'active',
      joiningDate: '2024-06-20',
      totalOrders: 23,
      totalBusiness: 1120000,
      outstandingPayments: 60000,
      creditLimit: 300000,
      rating: 4.6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'BUY-003',
      name: 'Metro Mart',
      businessName: 'Metro Mart Fashion Pvt Ltd',
      owner: 'Suresh Reddy',
      email: 'suresh@metromart.com',
      phone: '+91 98765 65432',
      address: '789, Shopping Complex',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      gst: 'GST777888999',
      pancard: 'BBBCC9012D',
      status: 'active',
      joiningDate: '2024-07-15',
      totalOrders: 34,
      totalBusiness: 1680000,
      outstandingPayments: 80000,
      creditLimit: 400000,
      rating: 4.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Products
  const products = [
    {
      id: 'TSV-KRT-001',
      name: 'Premium Cotton Kurta Set',
      type: 'readymade',
      category: 'Kurta',
      vendor: 'Fashion Creations',
      vendorId: 'VEN-001',
      images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300'],
      description: 'Premium quality cotton kurta with intricate embroidery work',
      costPrice: 1100,
      suggestedPrice: 1299,
      moq: 10,
      status: 'approved',
      submittedDate: '2025-01-10',
      quantity: 100,
      totalCost: 110000,
      sku: 'SKU-KRT-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'TSV-SLK-002',
      name: 'Premium Silk Fabric',
      type: 'fabric',
      category: 'Silk',
      vendor: 'Silk Paradise',
      vendorId: 'VEN-002',
      images: ['https://images.unsplash.com/photo-1606014191160-4ffa5176fa72?w=300'],
      description: 'High-quality silk fabric with beautiful texture',
      costPrice: 580,
      suggestedPrice: 650,
      moq: 50,
      status: 'approved',
      submittedDate: '2025-01-11',
      quantity: 150,
      totalCost: 87000,
      sku: 'SKU-SLK-002',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'TSV-SHR-003',
      name: 'Royal Silk Sherwani',
      type: 'readymade',
      category: 'Sherwani',
      vendor: 'Royal Designs',
      vendorId: 'VEN-003',
      images: ['https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=300'],
      description: 'Luxurious silk sherwani with gold embroidery',
      costPrice: 4200,
      suggestedPrice: 4599,
      moq: 5,
      status: 'pending',
      submittedDate: '2025-01-13',
      sku: 'SKU-SHR-003',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'TSV-LHG-004',
      name: 'Designer Lehenga Choli',
      type: 'readymade',
      category: 'Lehenga',
      vendor: 'Fashion Creations',
      vendorId: 'VEN-001',
      images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'],
      description: 'Stunning designer lehenga with mirror work',
      costPrice: 3500,
      suggestedPrice: 3999,
      moq: 8,
      status: 'approved',
      submittedDate: '2025-01-12',
      quantity: 50,
      totalCost: 175000,
      sku: 'SKU-LHG-004',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'TSV-CTN-005',
      name: 'Premium Cotton Fabric',
      type: 'fabric',
      category: 'Cotton',
      vendor: 'Royal Designs',
      vendorId: 'VEN-003',
      images: ['https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=300'],
      description: 'Soft premium cotton fabric for ethnic wear',
      costPrice: 320,
      suggestedPrice: 380,
      moq: 100,
      status: 'approved',
      submittedDate: '2025-01-09',
      quantity: 200,
      totalCost: 64000,
      sku: 'SKU-CTN-005',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Commission Rules
  const commissionRules = [
    {
      id: 'COMM-001',
      productId: 'TSV-KRT-001',
      productName: 'Premium Cotton Kurta Set',
      type: 'multi',
      parties: [
        { role: 'Vendor', name: 'Amit Sharma', phone: '+91 98765 11111', percentage: 70, amount: 139.3 },
        { role: 'Stitching Master', name: 'Rajesh Tailor', phone: '+91 98765 22222', percentage: 30, amount: 59.7 }
      ],
      totalCommissionPercentage: 100,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'COMM-002',
      productId: 'TSV-SLK-002',
      productName: 'Premium Silk Fabric',
      type: 'single',
      parties: [
        { role: 'Vendor', name: 'Priya Patel', phone: '+91 98765 22222', percentage: 100, amount: 70 }
      ],
      totalCommissionPercentage: 100,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'COMM-004',
      productId: 'TSV-LHG-004',
      productName: 'Designer Lehenga Choli',
      type: 'multi',
      parties: [
        { role: 'Vendor', name: 'Amit Sharma', phone: '+91 98765 11111', percentage: 60, amount: 299.4 },
        { role: 'Designer', name: 'Neha Designer', phone: '+91 98765 77777', percentage: 25, amount: 124.75 },
        { role: 'Stitching Master', name: 'Rajesh Tailor', phone: '+91 98765 22222', percentage: 15, amount: 74.85 }
      ],
      totalCommissionPercentage: 100,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Sample Orders
  const orders = [
    {
      id: 'ORD-2025-001',
      date: '2025-01-15',
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
      status: 'pending-approval',
      paymentStatus: 'paid',
      paymentMethod: 'UPI',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'ORD-2025-002',
      date: '2025-01-14',
      buyer: 'Style Bazaar',
      buyerId: 'BUY-002',
      buyerPhone: '+91 98765 54321',
      buyerAddress: '456, Market Road, Delhi - 110001',
      vendor: 'Silk Paradise',
      vendorId: 'VEN-002',
      vendorPhone: '+91 98765 22222',
      products: [
        {
          id: 'TSV-SLK-002',
          name: 'Premium Silk Fabric',
          type: 'fabric',
          quantity: 80,
          costPrice: 580,
          sellingPrice: 650,
          image: 'https://images.unsplash.com/photo-1606014191160-4ffa5176fa72?w=100'
        }
      ],
      subtotal: 52000,
      commission: 5600,
      commissionDistribution: [
        { party: 'Vendor', amount: 5600 }
      ],
      profit: 5600,
      status: 'approved',
      paymentStatus: 'pending',
      paymentMethod: 'Bank Transfer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Save to localStorage
  try {
    localStorage.setItem('tashivar_vendors', JSON.stringify(vendors));
    console.log('✅ Saved vendors to localStorage');
    
    localStorage.setItem('tashivar_buyers', JSON.stringify(buyers));
    console.log('✅ Saved buyers to localStorage');
    
    localStorage.setItem('tashivar_products', JSON.stringify(products));
    console.log('✅ Saved products to localStorage');
    
    localStorage.setItem('tashivar_commission_rules', JSON.stringify(commissionRules));
    console.log('✅ Saved commission rules to localStorage');
    
    localStorage.setItem('tashivar_orders', JSON.stringify(orders));
    console.log('✅ Saved orders to localStorage');
    
    localStorage.setItem('tashivar_commission_transactions', JSON.stringify([]));
    console.log('✅ Initialized commission transactions');

    return {
      success: true,
      message: 'Demo data populated successfully',
      stats: {
        vendors: vendors.length,
        buyers: buyers.length,
        products: products.length,
        commissionRules: commissionRules.length,
        orders: orders.length
      }
    };
  } catch (error) {
    console.error('❌ Failed to populate localStorage:', error);
    return {
      success: false,
      message: 'Failed to populate demo data',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Check if demo data exists
export function hasDemoData(): boolean {
  try {
    const vendors = localStorage.getItem('tashivar_vendors');
    const products = localStorage.getItem('tashivar_products');
    return !!(vendors && products && JSON.parse(vendors).length > 0 && JSON.parse(products).length > 0);
  } catch {
    return false;
  }
}

// Clear all demo data
export function clearDemoData(): void {
  try {
    localStorage.removeItem('tashivar_vendors');
    localStorage.removeItem('tashivar_buyers');
    localStorage.removeItem('tashivar_products');
    localStorage.removeItem('tashivar_commission_rules');
    localStorage.removeItem('tashivar_orders');
    localStorage.removeItem('tashivar_commission_transactions');
    console.log('✅ Cleared all demo data from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear demo data:', error);
  }
}
