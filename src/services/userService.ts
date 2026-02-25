import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'shop-owner' | 'vendor' | 'designer' | 'stitching-master' | 'vendor-agent' | 'buyer-agent';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  businessName?: string;
  location?: string;
}

// Helper functions for localStorage fallback
function getUsersFromStorage(): User[] {
  try {
    const stored = localStorage.getItem('tashivar_users');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    return [];
  }
}

function saveUsersToStorage(users: User[]): void {
  try {
    localStorage.setItem('tashivar_users', JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=users`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    let users = data.value || [];
    
    // Ensure admin exists
    if (!users.find((u: User) => u.role === 'admin')) {
      const defaultAdmin: User = {
        id: 'USR-ADMIN-001',
        name: 'Admin',
        email: 'admin@tashivar.com',
        phone: '+91 98765 00000',
        role: 'admin',
        status: 'active',
        permissions: [
          'view_overview', 'manage_orders', 'manage_products', 'manage_inventory',
          'manage_warehouse', 'view_finance', 'manage_commission', 'manage_users',
          'manage_vendors', 'manage_buyers'
        ],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      users = [defaultAdmin, ...users];
    }

    saveUsersToStorage(users);
    console.log('✅ Users loaded from Supabase API');
    return users;
  } catch (error) {
    // Silently use localStorage fallback
    const users = getUsersFromStorage();
    console.log(`ℹ️ Using localStorage for users (${users.length} items) - API unavailable`);
    return users;
  }
}

// Get single user
export async function getUser(userId: string): Promise<User | null> {
  try {
    const users = await getAllUsers();
    return users.find(u => u.id === userId) || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// Create new user
export async function createUser(userData: Partial<User>): Promise<User> {
  const newUser: User = {
    id: userData.id || `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: userData.name!,
    email: userData.email!,
    phone: userData.phone!,
    role: userData.role!,
    status: userData.status || 'active',
    permissions: userData.permissions || [],
    createdAt: new Date().toISOString(),
    lastLogin: userData.lastLogin,
    businessName: userData.businessName,
    location: userData.location
  };
  
  try {
    const users = await getAllUsers();
    users.unshift(newUser);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'users', value: users })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveUsersToStorage(users);
    return newUser;
  } catch (error) {
    console.error('Error creating user via API, using localStorage:', error);
    const users = getUsersFromStorage();
    users.unshift(newUser);
    saveUsersToStorage(users);
    return newUser;
  }
}

// Update user
export async function updateUser(userId: string, updates: Partial<User>): Promise<User> {
  try {
    const users = await getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      throw new Error('User not found');
    }
    
    users[index] = {
      ...users[index],
      ...updates
    };
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'users', value: users })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveUsersToStorage(users);
    return users[index];
  } catch (error) {
    console.error('Error updating user via API, using localStorage:', error);
    const users = getUsersFromStorage();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      saveUsersToStorage(users);
      return users[index];
    }
    throw error;
  }
}

// Delete user
export async function deleteUser(userId: string): Promise<void> {
  try {
    const users = await getAllUsers();
    const filtered = users.filter(u => u.id !== userId);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'users', value: filtered })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveUsersToStorage(filtered);
  } catch (error) {
    console.error('Error deleting user via API, using localStorage:', error);
    const users = getUsersFromStorage();
    const filtered = users.filter(u => u.id !== userId);
    saveUsersToStorage(filtered);
  }
}

// Get users by role
export async function getUsersByRole(role: string): Promise<User[]> {
  const users = await getAllUsers();
  return users.filter(u => u.role === role);
}