/**
 * Centralized API Configuration for Tashivar B2B Portal
 * 
 * This file manages all API endpoints and configurations for the application.
 * All services should import API_CONFIG from this file.
 */

// Backend API Base URL - Netlify hosted backend
export const API_BASE_URL = 'https://rococo-sunflower-024f10.netlify.app';

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication & Users
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
  },
  
  users: {
    base: '/api/users',
    byId: (id: string) => `/api/users/${id}`,
    vendors: '/api/vendors',
    buyers: '/api/buyers',
  },
  
  // Products
  products: {
    base: '/api/products',
    byId: (id: string) => `/api/products/${id}`,
    approve: (id: string) => `/api/products/${id}/approve`,
    reject: (id: string) => `/api/products/${id}/reject`,
    pending: '/api/products/pending',
  },
  
  // Inventory
  inventory: {
    base: '/api/inventory',
    byProductId: (productId: string) => `/api/inventory/${productId}`,
    transaction: '/api/inventory/transaction',
    lowStock: '/api/inventory/low-stock',
    stats: '/api/inventory/stats',
  },
  
  // Orders
  orders: {
    base: '/api/orders',
    byId: (id: string) => `/api/orders/${id}`,
    approve: (id: string) => `/api/orders/${id}/approve`,
    forwardToVendor: (id: string) => `/api/orders/${id}/forward-to-vendor`,
    receiveAtWarehouse: (id: string) => `/api/orders/${id}/receive-at-warehouse`,
    dispatchToBuyer: (id: string) => `/api/orders/${id}/dispatch-to-buyer`,
    stats: '/api/orders/stats',
    byStatus: (status: string) => `/api/orders/status/${status}`,
    byBuyer: (buyerId: string) => `/api/orders/buyer/${buyerId}`,
    byVendor: (vendorId: string) => `/api/orders/vendor/${vendorId}`,
  },
  
  // Purchase Orders
  purchaseOrders: {
    base: '/api/purchase-orders',
    byId: (id: string) => `/api/purchase-orders/${id}`,
    acknowledge: (id: string) => `/api/purchase-orders/${id}/acknowledge`,
    dispatch: (id: string) => `/api/purchase-orders/${id}/dispatch`,
  },
  
  // Warehouse
  warehouse: {
    receive: '/api/warehouse/receive',
    dispatch: '/api/warehouse/dispatch',
    transactions: '/api/warehouse/transactions',
    stats: '/api/warehouse/stats',
    scan: '/api/warehouse/scan',
  },
  
  // Commission
  commission: {
    rules: '/api/commission/rules',
    ruleById: (id: string) => `/api/commission/rules/${id}`,
    transactions: '/api/commission/transactions',
    calculate: '/api/commission/calculate',
    pay: (id: string) => `/api/commission/${id}/pay`,
  },
  
  // Finance
  finance: {
    summary: '/api/finance/summary',
    transactions: '/api/finance/transactions',
    sales: '/api/finance/sales',
    purchases: '/api/finance/purchases',
    commissions: '/api/finance/commissions',
    transaction: '/api/finance/transaction',
  },
  
  // Delivery Tracking
  delivery: {
    byOrderId: (orderId: string) => `/api/delivery/${orderId}`,
    create: '/api/delivery',
    update: (id: string) => `/api/delivery/${id}/update`,
    track: (trackingNumber: string) => `/api/delivery/${trackingNumber}/track`,
  },
  
  // Notifications
  notifications: {
    base: '/api/notifications',
    unread: '/api/notifications/unread',
    markAsRead: (id: string) => `/api/notifications/${id}/read`,
    markAllAsRead: '/api/notifications/read-all',
    delete: (id: string) => `/api/notifications/${id}`,
  },
  
  // Analytics & Reports
  analytics: {
    dashboard: '/api/analytics/dashboard',
    sales: '/api/analytics/sales',
    inventory: '/api/analytics/inventory',
  },
  
  reports: {
    sales: '/api/reports/sales',
    inventory: '/api/reports/inventory',
    commission: '/api/reports/commission',
  },
};

/**
 * Helper function to build full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Helper function to create headers with authorization
 */
export function getApiHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    // Add authorization token if available
    const token = localStorage.getItem('tashivar_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * Fallback mode configuration
 * If API is unavailable, fall back to localStorage
 */
export const FALLBACK_CONFIG = {
  enabled: true, // Enable fallback to localStorage
  timeout: 10000, // 10 seconds timeout for API calls
};

/**
 * API Error Handling
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API call wrapper with error handling and fallback support
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  const url = getApiUrl(endpoint);
  const headers = getApiHeaders();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FALLBACK_CONFIG.timeout);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || `HTTP error! status: ${response.status}`,
        errorData
      );
    }
    
    return await response.json();
  } catch (error) {
    if (FALLBACK_CONFIG.enabled && fallbackFn) {
      console.warn(`API call failed, using fallback for ${endpoint}:`, error);
      return fallbackFn();
    }
    throw error;
  }
}

export default {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
  getApiUrl,
  getApiHeaders,
  apiCall,
};
