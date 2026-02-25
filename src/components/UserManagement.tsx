import React, { useState, useEffect } from 'react';
import { Users, Shield, UserPlus, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import * as adminAuthService from '../services/adminAuthService';
import { AdminUser } from '../services/adminAuthService';
import { toast } from 'sonner@2.0.3';

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Form State
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    phone: '',
    role: 'staff' as AdminUser['role'],
    permissions: [] as string[]
  });

  const availablePermissions = [
    { id: 'orders', label: 'Order Management' },
    { id: 'vendors', label: 'Vendor Management' },
    { id: 'finance', label: 'Billing & Finance' },
    { id: 'products', label: 'Product Management' },
    { id: 'manufacturing', label: 'Manufacturing Orders' },
    { id: 'inventory', label: 'Inventory Management' },
    { id: 'warehouse', label: 'Warehouse Operations' },
    { id: 'commission', label: 'Commission Management' }
  ];

  useEffect(() => {
    loadUsers();
    const user = adminAuthService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAuthService.getAllAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAuthService.createAdminUser(newUser);
      toast.success('User created successfully');
      setShowAddModal(false);
      setNewUser({ username: '', name: '', phone: '', role: 'staff', permissions: [] });
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminAuthService.deleteAdminUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  if (!currentUser || currentUser.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Access Restricted</h3>
        <p className="text-gray-500 max-w-sm mt-2">
          Only the Super Admin can view and manage system users. Please contact your administrator for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage system administrators and staff access</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-medium text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.phone || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize w-fit ${
                          user.role === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'vendor' ? 'bg-orange-100 text-orange-800' :
                          user.role === 'buyer' ? 'bg-emerald-100 text-emerald-800' :
                          user.role === 'stitching-master' ? 'bg-indigo-100 text-indigo-800' :
                          user.role === 'agent' ? 'bg-cyan-100 text-cyan-800' :
                          user.role === 'designer' ? 'bg-pink-100 text-pink-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                        {user.role === 'staff' && user.permissions && (
                          <span className="text-xs text-gray-500 max-w-[200px] whitespace-normal">
                            Access: {user.permissions.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user.role !== 'superadmin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-rose-600 hover:text-rose-900 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Create New User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">×</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. jdoe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={e => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. +1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="staff">Staff (Limited Access)</option>
                  <option value="admin">Admin (Full Access)</option>
                  <option value="vendor">Vendor</option>
                  <option value="buyer">Buyer / Shop Owner</option>
                  <option value="stitching-master">Stitching Master</option>
                  <option value="agent">Agent</option>
                  <option value="designer">Designer</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the role to define the user's portal access.
                </p>
              </div>

              {newUser.role === 'staff' && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availablePermissions.map(perm => (
                      <label key={perm.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                          checked={newUser.permissions.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewUser({ ...newUser, permissions: [...newUser.permissions, perm.id] });
                            } else {
                              setNewUser({ ...newUser, permissions: newUser.permissions.filter(p => p !== perm.id) });
                            }
                          }}
                        />
                        {perm.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                <p className="font-medium mb-1">Default Password</p>
                The initial password will be set to <strong>password123</strong>. The user should change this upon first login.
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}