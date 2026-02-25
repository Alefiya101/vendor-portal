import React, { useState } from 'react';
import { ShoppingBag, Store, Scissors, ShieldCheck, Users, Briefcase, LayoutGrid, ArrowRight, Lock, Key, X, User } from 'lucide-react';
import * as adminAuthService from '../services/adminAuthService';

interface TashivarHubProps {
  onSelectApp: (app: 'admin' | 'vendor' | 'buyer' | 'manufacturing' | 'agent') => void;
}

export function TashivarHub({ onSelectApp }: TashivarHubProps) {
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await adminAuthService.login(username, password);
      onSelectApp('admin');
      setShowAdminAuth(false);
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-serif text-xl font-bold">
            T
          </div>
          <span className="text-xl font-serif font-bold text-gray-900 tracking-wide">TASHIVAR</span>
        </div>
        <div className="text-sm text-gray-500 font-medium hidden md:block">
          Enterprise B2B Ecosystem
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
            Select Your Portal
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to the Tashivar B2B Ecosystem. Please select the application portal relevant to your role to continue.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {/* Admin App - Restricted */}
          <div 
            onClick={() => setShowAdminAuth(true)}
            className="group bg-slate-900 rounded-2xl p-8 border border-gray-800 hover:shadow-2xl hover:shadow-gray-900/20 transition-all cursor-pointer relative overflow-hidden text-white"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-32 h-32 text-white" />
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform backdrop-blur-sm border border-white/10">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
              Admin Console
              <span className="text-xs bg-rose-500/80 px-2 py-1 rounded text-white font-medium border border-rose-500/50">
                RESTRICTED
              </span>
            </h3>
            <p className="text-gray-400 mb-6 line-clamp-2">
              Super Admin Access Only. Restricted to authorized personnel.
            </p>
            <div className="flex items-center text-white font-semibold group-hover:gap-3 transition-all">
              Secure Login <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          {/* Buyer App */}
          <div 
            onClick={() => onSelectApp('buyer')}
            className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-indigo-600 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-indigo-600">
              <ShoppingBag className="w-32 h-32" />
            </div>
            <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Store className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Shop Owner Portal</h3>
            <p className="text-gray-600 mb-6 line-clamp-2">
              Browse products, place orders, track shipments, and manage your retail inventory.
            </p>
            <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-3 transition-all">
              Enter Marketplace <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          {/* Vendor App */}
          <div 
            onClick={() => onSelectApp('vendor')}
            className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-emerald-600 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-600">
              <Store className="w-32 h-32" />
            </div>
            <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Vendor Central</h3>
            <p className="text-gray-600 mb-6 line-clamp-2">
              Manage products, receive orders, handle dispatch, and track payments and commissions.
            </p>
            <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-3 transition-all">
              Manage Business <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          {/* Manufacturing App */}
          <div 
            onClick={() => onSelectApp('manufacturing')}
            className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-rose-600 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-rose-600">
              <Scissors className="w-32 h-32" />
            </div>
            <div className="w-14 h-14 bg-rose-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Scissors className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Manufacturing Hub</h3>
            <p className="text-gray-600 mb-6 line-clamp-2">
              For Designers and Stitching Masters to receive job orders and update manufacturing status.
            </p>
            <div className="flex items-center text-rose-600 font-semibold group-hover:gap-3 transition-all">
              Access Jobs <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>

          {/* Agent App */}
          <div 
            onClick={() => onSelectApp('agent')}
            className="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-amber-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
              <Users className="w-32 h-32" />
            </div>
            <div className="w-14 h-14 bg-amber-500 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Agent Portal</h3>
            <p className="text-gray-600 mb-6 line-clamp-2">
              For Vendor Agents and Buyer Agents to facilitate trade, manage clients, and track commissions.
            </p>
            <div className="flex items-center text-amber-600 font-semibold group-hover:gap-3 transition-all">
              Agent Access <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>
            &copy; 2026 Tashivar B2B Portal. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
            <a href="#" className="hover:text-gray-900">Support</a>
          </div>
        </div>
      </footer>

      {/* Admin Auth Modal */}
      {showAdminAuth && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Authorized Access Only
              </h3>
              <button 
                onClick={() => {
                  setShowAdminAuth(false);
                  setError('');
                  setUsername('');
                  setPassword('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAdminAccess} className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-200">
                  <User className="w-8 h-8 text-slate-700" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Admin Login</h4>
                <p className="text-sm text-gray-500 mt-2">
                  Please enter your administrator credentials.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                  />
                </div>

                {error && (
                  <p className="text-xs text-rose-600 mt-2 font-medium text-center animate-pulse bg-rose-50 p-2 rounded">
                    {error}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Secure Login
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <span className="text-xs text-gray-400">
                    Restricted Area • Super Admin Access Only
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}