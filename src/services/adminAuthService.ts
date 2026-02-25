import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

export interface AdminUser {
  id: string;
  username: string;
  role: 'superadmin' | 'admin' | 'staff' | 'vendor' | 'buyer' | 'stitching-master' | 'agent' | 'designer';
  name: string;
  phone?: string; // Phone number for agents
  createdAt: string;
  permissions?: string[]; // 'orders', 'vendors', 'finance', 'products', 'manufacturing', 'users'
}

// Initial mock data - In production this would be in Supabase Auth
const DEFAULT_SUPERADMIN: AdminUser = {
  id: 'admin-001',
  username: 'superadmin',
  role: 'superadmin',
  name: 'Super Admin',
  createdAt: new Date().toISOString(),
  permissions: ['orders', 'vendors', 'finance', 'products', 'manufacturing', 'users', 'inventory', 'warehouse', 'commission']
};

// Keys for localStorage
const AUTH_USER_KEY = 'tashivar_admin_user';
const ADMIN_USERS_KEY = 'tashivar_admin_users_list';

// Helper to get all admin users from localStorage
function getAdminUsersFromStorage(): AdminUser[] {
  try {
    const stored = localStorage.getItem(ADMIN_USERS_KEY);
    if (!stored) {
      // Initialize with default superadmin if empty
      const initialUsers = [DEFAULT_SUPERADMIN];
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(initialUsers));
      return initialUsers;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading admin users from localStorage:', error);
    return [DEFAULT_SUPERADMIN];
  }
}

// Helper to save admin users to localStorage
function saveAdminUsersToStorage(users: AdminUser[]): void {
  try {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving admin users to localStorage:', error);
  }
}

// Get all admin users (with Supabase sync)
async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=admin_users`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    let users = data.value;
    
    // If no users in Supabase, initialize with default superadmin
    if (!users || users.length === 0) {
      users = [DEFAULT_SUPERADMIN];
      // Save to Supabase
      await fetch(`${API_URL}/kv`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ key: 'admin_users', value: users })
      });
      console.log('🔧 Initialized Supabase with default Super Admin');
    }
    
    saveAdminUsersToStorage(users);
    console.log('✅ Admin users loaded from Supabase API');
    return users;
  } catch (error) {
    // Silently use localStorage fallback
    const users = getAdminUsersFromStorage();
    console.log(`ℹ️ Using localStorage for admin users (${users.length} users) - API unavailable`);
    return users;
  }
}

// Save all admin users to Supabase (and localStorage backup)
async function saveAdminUsers(users: AdminUser[]): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'admin_users', value: users })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveAdminUsersToStorage(users);
    console.log('✅ Admin users saved to Supabase API');
  } catch (error) {
    console.error('Error saving admin users to API, using localStorage:', error);
    saveAdminUsersToStorage(users);
  }
}

export async function login(username: string, password: string): Promise<AdminUser> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const users = await getAdminUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // MOCK PASSWORD CHECK - In production, use real hashing/auth!
  // For superadmin, hardcoded check. For others, allow any password for demo if strictly needed,
  // but let's enforce a simple "admin123" for generated users for now or a pattern.
  // Actually, let's keep it simple: 
  // Superadmin -> 'Tashivar@2026' (as requested implicitly or set securely)
  // Others -> 'password' (for demo simplicity unless we store passwords)
  
  if (user.role === 'superadmin') {
     if (password !== 'Tashivar@2026') { // Stronger default password
       throw new Error('Invalid credentials');
     }
  } else {
     // For other users created by superadmin
     // We'll assume a default password for this demo since we aren't building a full auth system
     if (password !== 'password123') {
       throw new Error('Invalid credentials');
     }
  }

  // Set current session
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  return user;
}

export function getCurrentUser(): AdminUser | null {
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}

export async function createAdminUser(userData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> {
  // Verify current user is superadmin
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'superadmin') {
    throw new Error('Unauthorized: Only Super Admin can create users');
  }

  const users = await getAdminUsers();
  
  if (users.find(u => u.username === userData.username)) {
    throw new Error('Username already exists');
  }

  const newUser: AdminUser = {
    ...userData,
    id: `admin-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  await saveAdminUsers(users);
  
  console.log('✅ User created:', newUser);
  if (newUser.role === 'agent') {
    console.log('📞 Agent created with phone:', newUser.phone);
  }

  return newUser;
}

export async function deleteAdminUser(userId: string): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'superadmin') {
    throw new Error('Unauthorized');
  }

  if (userId === DEFAULT_SUPERADMIN.id) {
    throw new Error('Cannot delete the default Super Admin');
  }

  const users = await getAdminUsers();
  const filtered = users.filter(u => u.id !== userId);
  await saveAdminUsers(filtered);
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'superadmin') {
    throw new Error('Unauthorized');
  }
  return await getAdminUsers();
}

// Get all agents (for dropdown in vendor/party forms)
export async function getAllAgents(): Promise<AdminUser[]> {
  const users = await getAdminUsers();
  const agents = users.filter(u => u.role === 'agent');
  console.log(`📋 getAllAgents called - Total users: ${users.length}, Agents: ${agents.length}`);
  agents.forEach(agent => {
    console.log(`  👤 Agent: ${agent.name} (${agent.username}) - Phone: ${agent.phone || 'N/A'}`);
  });
  return agents;
}