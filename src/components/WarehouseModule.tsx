import React, { useState, useEffect } from 'react';
import { Warehouse, TruckIcon, PackageCheck, Package, ArrowDownToLine, ArrowUpFromLine, BarChart3 } from 'lucide-react';
import { WarehouseScanning } from './WarehouseScanning';
import * as warehouseService from '../services/warehouseService';

export function WarehouseModule() {
  const [activeMode, setActiveMode] = useState<'menu' | 'receiving' | 'dispatching'>('menu');
  const [stats, setStats] = useState({
    totalItems: 0,
    receivedToday: 0,
    dispatchedToday: 0,
    pendingReceiving: 0,
    pendingDispatching: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentActivity();
  }, [activeMode]);

  const loadStats = () => {
    const warehouseStats = warehouseService.getWarehouseStats();
    setStats(warehouseStats);
  };

  const loadRecentActivity = () => {
    const transactions = warehouseService.getTodayTransactions();
    setRecentActivity(transactions.slice(0, 10)); // Show last 10 transactions
  };

  if (activeMode === 'receiving') {
    return (
      <div>
        <button
          onClick={() => setActiveMode('menu')}
          className="mb-4 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back to Warehouse Menu
        </button>
        <WarehouseScanning mode="receiving" />
      </div>
    );
  }

  if (activeMode === 'dispatching') {
    return (
      <div>
        <button
          onClick={() => setActiveMode('menu')}
          className="mb-4 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back to Warehouse Menu
        </button>
        <WarehouseScanning mode="dispatching" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Warehouse className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Warehouse Management</h1>
            <p className="text-gray-600 mt-1">
              Scan and manage inventory with barcode technology
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalItems}</p>
              <p className="text-sm text-green-600 mt-1">↑ 12% this month</p>
            </div>
            <Package className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Received Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.receivedToday}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.pendingReceiving} pending verification</p>
            </div>
            <ArrowDownToLine className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dispatched Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.dispatchedToday}</p>
              <p className="text-sm text-gray-500 mt-1">{stats.pendingDispatching} in transit</p>
            </div>
            <ArrowUpFromLine className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receiving Station */}
        <div
          onClick={() => setActiveMode('receiving')}
          className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
              <TruckIcon className="w-8 h-8 text-white" />
            </div>
            <ArrowDownToLine className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Receiving Station</h3>
          <p className="text-gray-700 mb-4">
            Scan items arriving at the warehouse from vendors and suppliers
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
              Scan barcodes to verify items
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
              Update stock quantities automatically
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
              Track receiving history
            </li>
          </ul>
          <div className="mt-6 flex items-center gap-2 text-green-600 font-semibold group-hover:gap-3 transition-all">
            Start Receiving
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Dispatch Station */}
        <div
          onClick={() => setActiveMode('dispatching')}
          className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-xl border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all hover:shadow-lg group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
              <PackageCheck className="w-8 h-8 text-white" />
            </div>
            <ArrowUpFromLine className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Dispatch Station</h3>
          <p className="text-gray-700 mb-4">
            Scan items leaving the warehouse for delivery to buyers
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
              Verify items before dispatch
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
              Reduce stock automatically
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
              Track dispatch history
            </li>
          </ul>
          <div className="mt-6 flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
            Start Dispatching
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No warehouse activity today</p>
              <p className="text-sm text-gray-400 mt-1">
                Start receiving or dispatching items to see activity here
              </p>
            </div>
          ) : (
            recentActivity.map((transaction) => {
              const timeAgo = new Date(transaction.timestamp).toLocaleString('en-IN', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
              });
              
              return (
                <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'receiving' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {transaction.type === 'receiving' ? (
                        <ArrowDownToLine className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpFromLine className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{transaction.productName}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.type === 'receiving' ? 'Received' : 'Dispatched'} {transaction.quantity} {transaction.unit} • {timeAgo}
                      </p>
                      {transaction.location && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Location: {transaction.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.qualityStatus === 'passed' 
                          ? 'bg-green-500' 
                          : transaction.qualityStatus === 'failed'
                          ? 'bg-rose-500'
                          : 'bg-gray-400'
                      }`}></div>
                      <span className="text-sm text-gray-600 capitalize">
                        {transaction.qualityStatus || 'Completed'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}