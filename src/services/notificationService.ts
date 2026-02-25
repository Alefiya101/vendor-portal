/**
 * Notification Service
 * 
 * Manages system notifications for low stock alerts, order updates,
 * and other important events in the B2B portal.
 */

export interface Notification {
  id: string;
  type: 'low-stock' | 'out-of-stock' | 'new-order' | 'order-update' | 'product-approval' | 'general';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

const STORAGE_KEY = 'tashivar_notifications';

/**
 * Get all notifications
 */
export function getAllNotifications(): Notification[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Get unread notifications
 */
export function getUnreadNotifications(): Notification[] {
  const notifications = getAllNotifications();
  return notifications.filter(n => !n.read);
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  return getUnreadNotifications().length;
}

/**
 * Create a new notification
 */
export function createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
  const notifications = getAllNotifications();
  
  const newNotification: Notification = {
    ...notification,
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  notifications.unshift(newNotification);
  
  // Keep last 100 notifications
  if (notifications.length > 100) {
    notifications.splice(100);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  
  console.log('📬 New notification:', newNotification.title);
  
  return newNotification;
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: string): void {
  const notifications = getAllNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.read = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    console.log('✅ Notification marked as read:', notificationId);
  }
}

/**
 * Mark all notifications as read
 */
export function markAllAsRead(): void {
  const notifications = getAllNotifications();
  notifications.forEach(n => n.read = true);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  console.log('✅ All notifications marked as read');
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: string): void {
  const notifications = getAllNotifications();
  const filtered = notifications.filter(n => n.id !== notificationId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  console.log('🗑️ Notification deleted:', notificationId);
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  console.log('🗑️ All notifications cleared');
}

/**
 * Create low stock alert
 */
export function createLowStockAlert(productName: string, currentStock: number, unit: string): Notification {
  return createNotification({
    type: 'low-stock',
    title: 'Low Stock Alert',
    message: `${productName} is running low (${currentStock} ${unit} remaining)`,
    metadata: { productName, currentStock, unit }
  });
}

/**
 * Create out of stock alert
 */
export function createOutOfStockAlert(productName: string): Notification {
  return createNotification({
    type: 'out-of-stock',
    title: 'Out of Stock',
    message: `${productName} is now out of stock`,
    metadata: { productName }
  });
}

/**
 * Create new order notification
 */
export function createNewOrderNotification(orderId: string, buyer: string, amount: number): Notification {
  return createNotification({
    type: 'new-order',
    title: 'New Order Received',
    message: `Order ${orderId} from ${buyer} (₹${amount.toLocaleString()})`,
    metadata: { orderId, buyer, amount }
  });
}

/**
 * Create order update notification
 */
export function createOrderUpdateNotification(orderId: string, status: string): Notification {
  return createNotification({
    type: 'order-update',
    title: 'Order Status Updated',
    message: `Order ${orderId} is now ${status}`,
    metadata: { orderId, status }
  });
}

/**
 * Create product approval notification
 */
export function createProductApprovalNotification(productName: string, vendorName: string): Notification {
  return createNotification({
    type: 'product-approval',
    title: 'Product Pending Approval',
    message: `${productName} from ${vendorName} requires approval`,
    metadata: { productName, vendorName }
  });
}
