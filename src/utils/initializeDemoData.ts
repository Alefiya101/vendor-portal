/**
 * Demo Data Initialization Service
 * 
 * This service initializes the Supabase KV store with demo data
 * for immediate testing of the B2B marketplace system.
 */

import * as productService from '../services/productService';
import * as vendorService from '../services/vendorService';
import * as buyerService from '../services/buyerService';
import * as commissionService from '../services/commissionService';
import * as orderService from '../services/orderService';

export async function initializeDemoData() {
  try {
    console.log('Initializing demo data...');
    
    // Step 1: Create Vendors
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
        status: 'active' as const,
        joiningDate: '2024-06-15',
        productsSupplied: 156,
        totalBusiness: 1240000,
        outstandingPayments: 50000,
        rating: 4.5
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
        status: 'active' as const,
        joiningDate: '2024-08-20',
        productsSupplied: 45,
        totalBusiness: 560000,
        outstandingPayments: 25000,
        rating: 4.7
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
        status: 'active' as const,
        joiningDate: '2024-07-10',
        productsSupplied: 89,
        totalBusiness: 890000,
        outstandingPayments: 35000,
        rating: 4.3
      }
    ];

    for (const vendor of vendors) {
      await vendorService.createVendor(vendor);
    }
    console.log('✓ Created vendors');

    // Step 2: Create Buyers
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
        status: 'active' as const,
        joiningDate: '2024-05-10',
        totalOrders: 47,
        totalBusiness: 2340000,
        outstandingPayments: 120000,
        creditLimit: 500000,
        rating: 4.8
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
        status: 'active' as const,
        joiningDate: '2024-06-20',
        totalOrders: 23,
        totalBusiness: 1120000,
        outstandingPayments: 60000,
        creditLimit: 300000,
        rating: 4.6
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
        status: 'active' as const,
        joiningDate: '2024-07-15',
        totalOrders: 34,
        totalBusiness: 1680000,
        outstandingPayments: 80000,
        creditLimit: 400000,
        rating: 4.7
      }
    ];

    for (const buyer of buyers) {
      await buyerService.createBuyer(buyer);
    }
    console.log('✓ Created buyers');

    // Step 3: Create Products
    const products = [
      {
        id: 'TSV-KRT-001',
        name: 'Premium Cotton Kurta Set',
        type: 'readymade' as const,
        category: 'Kurta',
        vendor: 'Fashion Creations',
        vendorId: 'VEN-001',
        images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300'],
        description: 'Premium quality cotton kurta with intricate embroidery work',
        costPrice: 1100,
        suggestedPrice: 1299,
        moq: 10,
        status: 'approved' as const,
        submittedDate: '2025-01-10',
        quantity: 100,
        totalCost: 110000
      },
      {
        id: 'TSV-SLK-002',
        name: 'Premium Silk Fabric',
        type: 'fabric' as const,
        category: 'Silk',
        vendor: 'Silk Paradise',
        vendorId: 'VEN-002',
        images: ['https://images.unsplash.com/photo-1606014191160-4ffa5176fa72?w=300'],
        description: 'High-quality silk fabric with beautiful texture',
        costPrice: 580,
        suggestedPrice: 650,
        moq: 50,
        status: 'approved' as const,
        submittedDate: '2025-01-11',
        quantity: 150,
        totalCost: 87000
      },
      {
        id: 'TSV-SHR-003',
        name: 'Royal Silk Sherwani',
        type: 'readymade' as const,
        category: 'Sherwani',
        vendor: 'Royal Designs',
        vendorId: 'VEN-003',
        images: ['https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=300'],
        description: 'Luxurious silk sherwani with gold embroidery',
        costPrice: 4200,
        suggestedPrice: 4599,
        moq: 5,
        status: 'pending' as const,
        submittedDate: '2025-01-13'
      }
    ];

    for (const product of products) {
      await productService.createProduct(product);
    }
    console.log('✓ Created products');

    // Step 4: Create Commission Rules
    const commissionRules = [
      {
        id: 'COMM-001',
        productId: 'TSV-KRT-001',
        productName: 'Premium Cotton Kurta Set',
        type: 'multi' as const,
        parties: [
          { role: 'Vendor', name: 'Amit Sharma', phone: '+91 98765 11111', percentage: 70 },
          { role: 'Stitching Master', name: 'Rajesh Tailor', phone: '+91 98765 22222', percentage: 30 }
        ]
      },
      {
        id: 'COMM-002',
        productId: 'TSV-SLK-002',
        productName: 'Premium Silk Fabric',
        type: 'single' as const,
        parties: [
          { role: 'Vendor', name: 'Priya Patel', phone: '+91 98765 22222', percentage: 100 }
        ]
      }
    ];

    for (const rule of commissionRules) {
      await commissionService.createCommissionRule(rule);
    }
    console.log('✓ Created commission rules');

    // Step 5: Create Sample Orders
    const sampleOrders = [
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
            type: 'readymade' as const,
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
        paymentMethod: 'UPI'
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
            type: 'fabric' as const,
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
        paymentMethod: 'Bank Transfer'
      }
    ];

    for (const order of sampleOrders) {
      await orderService.createOrder(order);
    }
    console.log('✓ Created sample orders');

    console.log('✅ Demo data initialization complete!');
    return {
      success: true,
      message: 'Demo data initialized successfully',
      stats: {
        vendors: vendors.length,
        buyers: buyers.length,
        products: products.length,
        commissionRules: commissionRules.length,
        orders: sampleOrders.length
      }
    };
  } catch (error) {
    console.error('Failed to initialize demo data:', error);
    return {
      success: false,
      message: 'Failed to initialize demo data',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to clear all data
export async function clearAllData() {
  try {
    console.log('Clearing all data...');
    // This will be implemented if needed
    localStorage.clear();
    console.log('✅ All data cleared');
    return { success: true, message: 'All data cleared successfully' };
  } catch (error) {
    console.error('Failed to clear data:', error);
    return {
      success: false,
      message: 'Failed to clear data',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
