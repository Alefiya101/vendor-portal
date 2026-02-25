import { toast } from 'sonner@2.0.3';

export interface AdminUser {
  id: string;
  username: string; // Used for login
  password?: string; // In a real app, this would be hashed. For demo/MVP with localStorage, we'll store plain text or simple hash.
  name: string;
  role: 'superadmin' | 'admin' | 'viewer';
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive';
}

const STORAGE_KEY = 'tashivar_admin_users';

// Initialize with Superadmin if empty
function initializeSuperadmin() {
  const users = getAdminUsers();
  if (users.length === 0) {
    const superadmin: AdminUser = {
      id: 'SA-001',
      username: 'superadmin',
      password: 'password', // Default password
      name: 'Super Admin',
      role: 'superadmin',
      permissions: ['all'],
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    saveAdminUsers([superadmin]);
    console.log('Initialized Superadmin user');
  }
}

// Helper to get users from storage
function getAdminUsers(): AdminUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading admin users', error);
    return [];
  }
}

// Helper to save users to storage
function saveAdminUsers(users: AdminUser[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving admin users', error);
  }
}

// --- Public API ---

export const getAdmins = async (): Promise<AdminUser[]> => {
  initializeSuperadmin(); // Ensure superadmin exists
  // Return users without passwords for security in UI
  return getAdminUsers().map(({ password, ...user }) => user as AdminUser);
};

export const createAdmin = async (userData: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> => {
  const users = getAdminUsers();
  
  // Check for duplicate username
  if (users.some(u => u.username === userData.username)) {
    throw new Error('Username already exists');
  }

  const newUser: AdminUser = {
    ...userData,
    id: `ADM-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  users.push(newUser);
  saveAdminUsers(users);
  return newUser;
};

export const updateAdmin = async (id: string, updates: Partial<AdminUser>): Promise<AdminUser> => {
  const users = getAdminUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) throw new Error('User not found');
  
  // Prevent modifying Superadmin username/role if it's the original superadmin
  if (users[index].role === 'superadmin' && users[index].username === 'superadmin') {
     if (updates.role && updates.role !== 'superadmin') {
       throw new Error('Cannot change role of the main Superadmin');
     }
     if (updates.status === 'inactive') {
        throw new Error('Cannot deactivate the main Superadmin');
     }
  }

  users[index] = { ...users[index], ...updates };
  saveAdminUsers(users);
  return users[index];
};

export const deleteAdmin = async (id: string): Promise<void> => {
  const users = getAdminUsers();
  const userToDelete = users.find(u => u.id === id);
  
  if (userToDelete?.role === 'superadmin') {
    throw new Error('Cannot delete Superadmin');
  }

  const filtered = users.filter(u => u.id !== id);
  saveAdminUsers(filtered);
};

export const authenticateAdmin = async (username: string, accessCode: string): Promise<AdminUser | null> => {
  initializeSuperadmin();
  const users = getAdminUsers();
  const user = users.find(u => u.username === username && u.password === accessCode && u.status === 'active');
  
  if (user) {
    // Update last login
    user.lastLogin = new Date().toISOString();
    updateAdmin(user.id, { lastLogin: user.lastLogin });
    const { password, ...safeUser } = user;
    return safeUser as AdminUser;
  }
  
  return null;
};
