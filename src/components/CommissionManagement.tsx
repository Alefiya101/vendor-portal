import React, { useState, useEffect } from 'react';
import { Percent, Users, DollarSign, TrendingUp, Check, X, Edit, Plus, Phone, User, Shirt, Package, Settings, Search, Filter, Download, ChevronDown, Layers as Fabric, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import * as commissionService from '../services/commissionService';
import * as productService from '../services/productService';
import { toast } from 'sonner@2.0.3';
import { LoadingSpinner, ButtonWithLoading, TableSkeleton, CardSkeleton } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields } from '../utils/security';
import { handleApiError } from '../utils/apiClient';

interface CommissionSetting {
  id: string;
  product: string;
  productId: string;
  productType: 'readymade' | 'fabric';
  vendor: string;
  costPrice: number;
  sellingPrice: number;
  totalCommission: number;
  commissionRate: number;
  distribution: Array<{
    party: string;
    percentage: number;
    amount: number;
    contactPerson: string;
    phone: string;
    paymentStatus?: 'pending' | 'paid';
  }>;
}

export function CommissionManagement() {
  const [activeView, setActiveView] = useState<'settings' | 'payments' | 'history' | 'defaults'>('settings');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'readymade' | 'fabric'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDefaultsModal, setShowDefaultsModal] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<CommissionSetting | null>(null);
  const [loading, setLoading] = useState(false);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSetting[]>([]);
  const [commissionTransactions, setCommissionTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalProducts: 0,
    totalCommission: 0,
    pendingPayments: 0,
    paidOut: 0
  });

  // Default commission rates
  const [defaultRates, setDefaultRates] = useState({
    fabric: {
      rate: 12,
      distribution: [
        { role: 'Vendor', percentage: 100 }
      ]
    },
    readymade: {
      rate: 18,
      distribution: [
        { role: 'Vendor', percentage: 70 },
        { role: 'Stitching Master', percentage: 30 },
        { role: 'Designer', percentage: 0 }
      ]
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rules, transactions, summary] = await Promise.all([
        commissionService.getAllCommissionRules(),
        commissionService.getAllCommissionTransactions(),
        commissionService.getCommissionSummary()
      ]);
      
      // Convert commission rules to settings format
      const settings: CommissionSetting[] = await Promise.all(
        rules.map(async (rule) => {
          const product = await productService.getProduct(rule.productId);
          return {
            id: rule.id,
            product: rule.productName,
            productId: rule.productId,
            productType: product?.type || 'readymade',
            vendor: product?.vendor || 'Unknown',
            costPrice: product?.costPrice || 0,
            sellingPrice: product?.suggestedPrice || 0,
            totalCommission: rule.totalCommissionPercentage,
            commissionRate: rule.type === 'fabric' ? 12 : 18,
            distribution: (rule.parties || []).map(p => ({
              party: p.role,
              percentage: p.percentage,
              amount: p.amount || 0,
              contactPerson: p.name,
              phone: p.phone,
              paymentStatus: 'pending' as const
            }))
          };
        })
      );
      
      setCommissionSettings(settings);
      setCommissionTransactions(transactions);
      setStats({
        totalProducts: settings.length,
        totalCommission: summary.totalCommission || 0,
        pendingPayments: summary.pendingCommission || 0,
        paidOut: summary.paidCommission || 0
      });
    } catch (err) {
      console.error('Failed to load commission data:', err);
      toast.error('Failed to load commission data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (transactionId: string, partyName: string) => {
    try {
      setLoading(true);
      await commissionService.markCommissionPaid(transactionId, partyName);
      await loadData(); // Reload data
      toast.success('Commission marked as paid');
    } catch (err) {
      console.error('Failed to mark commission as paid:', err);
      toast.error('Failed to mark commission as paid');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const filteredCommissions = commissionSettings.filter(setting => {
    const matchesSearch = setting.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         setting.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         setting.vendor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || setting.productType === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleEditCommission = (commission: CommissionSetting) => {
    setSelectedCommission(commission);
    setShowEditModal(true);
  };

  const handleSaveDefaults = () => {
    console.log('Saving default commission rates:', defaultRates);
    setShowDefaultsModal(false);
    toast.success('Default commission rates saved');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Commission Management</h2>
          <p className="text-gray-600 mt-1">Manage commission structures and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDefaultsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            <Settings className="w-4 h-4" strokeWidth={2} />
            Default Rates
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            <Download className="w-4 h-4" strokeWidth={2} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">Total Products</p>
            <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-violet-600" strokeWidth={2} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
          <p className="text-xs text-gray-500 mt-1">With commission set</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">Total Commission</p>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" strokeWidth={2} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">₹{stats.totalCommission.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Per unit sold</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">Pending Payments</p>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" strokeWidth={2} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">₹{stats.pendingPayments.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">To be paid</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">Paid Out</p>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" strokeWidth={2} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">₹{stats.paidOut.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: 'settings', label: 'Commission Settings', icon: Percent },
          { id: 'payments', label: 'Payment Tracking', icon: DollarSign },
          { id: 'history', label: 'History', icon: Clock },
          { id: 'defaults', label: 'Default Rates', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors ${
                activeView === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Commission Settings View */}
      {activeView === 'settings' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="readymade">Ready Made</option>
              <option value="fabric">Fabric</option>
            </select>
          </div>

          {/* Commission List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading commission settings...</p>
              </div>
            ) : filteredCommissions.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Percent className="w-8 h-8 text-violet-600" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Commission Settings Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Commission settings are automatically created when products are added and approved. 
                  Add products to start managing commission rates and distributions.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3">What is Commission Management?</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                      <span><strong>Set Commission Rates:</strong> Define commission percentages for each product (typically 12% for fabric, 18% for ready-made)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                      <span><strong>Distribution Management:</strong> Split commission among vendors, stitching masters, designers, and agents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                      <span><strong>Payment Tracking:</strong> Track pending and completed commission payments to all parties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                      <span><strong>Default Rates:</strong> Set default commission structures that auto-apply to new products</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              filteredCommissions.map((setting) => (
                <div key={setting.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  {/* Product Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        setting.productType === 'fabric' ? 'bg-blue-100' : 'bg-violet-100'
                      }`}>
                        {setting.productType === 'fabric' ? (
                          <Fabric className={`w-6 h-6 ${setting.productType === 'fabric' ? 'text-blue-600' : 'text-violet-600'}`} strokeWidth={2} />
                        ) : (
                          <Shirt className="w-6 h-6 text-violet-600" strokeWidth={2} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{setting.product}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            setting.productType === 'fabric' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-violet-100 text-violet-700'
                          }`}>
                            {setting.productType === 'fabric' ? 'Fabric' : 'Ready Made'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {setting.productId} • {setting.vendor}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>Cost: ₹{setting.costPrice}</span>
                          <span>•</span>
                          <span>Selling: ₹{setting.sellingPrice}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">
                            Margin: ₹{(setting.sellingPrice - setting.costPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Total Commission</p>
                      <p className="text-2xl font-semibold text-gray-900">₹{setting.totalCommission}</p>
                      <p className="text-xs text-violet-600 font-medium">{setting.commissionRate}% of cost</p>
                    </div>
                  </div>

                  {/* Commission Distribution */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Commission Distribution</h4>
                      <button
                        onClick={() => handleEditCommission(setting)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Edit className="w-3 h-3" strokeWidth={2} />
                        Edit
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {setting.distribution.map((dist, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900">{dist.party}</p>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  dist.paymentStatus === 'paid' 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {dist.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {dist.contactPerson} • {dist.phone}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">₹{dist.amount.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{dist.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Distribution Bar */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs text-gray-600 flex-1">Distribution</p>
                        <p className="text-xs font-medium text-gray-900">100%</p>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                        {setting.distribution.map((dist, idx) => (
                          <div
                            key={idx}
                            style={{ width: `${dist.percentage}%` }}
                            className={`${
                              idx === 0 ? 'bg-indigo-500' :
                              idx === 1 ? 'bg-violet-500' :
                              'bg-purple-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Default Rates View */}
      {activeView === 'defaults' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Default Commission Rates</h3>
            
            {/* Fabric Default */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Fabric className="w-5 h-5 text-blue-600" strokeWidth={2} />
                <h4 className="font-medium text-gray-900">Fabric Products</h4>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{defaultRates.fabric.rate}%</p>
                  </div>
                  <button className="px-3 py-1.5 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">
                    Edit Rate
                  </button>
                </div>
                <div className="space-y-2">
                  {defaultRates.fabric.distribution.map((dist, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{dist.role}</span>
                      <span className="font-medium text-gray-900">{dist.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ready Made Default */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shirt className="w-5 h-5 text-violet-600" strokeWidth={2} />
                <h4 className="font-medium text-gray-900">Ready Made Products</h4>
              </div>
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{defaultRates.readymade.rate}%</p>
                  </div>
                  <button className="px-3 py-1.5 bg-white border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">
                    Edit Rate
                  </button>
                </div>
                <div className="space-y-2">
                  {defaultRates.readymade.distribution.map((dist, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{dist.role}</span>
                      <span className="font-medium text-gray-900">{dist.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">About Default Rates</h4>
                <p className="text-sm text-gray-700">
                  These rates are automatically applied when you add new products or approve vendor submissions. 
                  You can customize the commission structure for individual products after approval.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Default Rates Modal */}
      {showDefaultsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Edit Default Commission Rates</h3>
                  <p className="text-sm text-gray-600 mt-1">Set default rates for new products</p>
                </div>
                <button
                  onClick={() => setShowDefaultsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Fabric Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Fabric Products Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={defaultRates.fabric.rate}
                  onChange={(e) => setDefaultRates({
                    ...defaultRates,
                    fabric: { ...defaultRates.fabric, rate: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Ready Made Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Ready Made Products Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={defaultRates.readymade.rate}
                  onChange={(e) => setDefaultRates({
                    ...defaultRates,
                    readymade: { ...defaultRates.readymade, rate: parseInt(e.target.value) }
                  })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Ready Made Distribution */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Ready Made Commission Distribution
                </label>
                <div className="space-y-3">
                  {defaultRates.readymade.distribution.map((dist, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={dist.role}
                        readOnly
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                      <div className="relative w-32">
                        <input
                          type="number"
                          value={dist.percentage}
                          onChange={(e) => {
                            const newDist = [...defaultRates.readymade.distribution];
                            newDist[idx].percentage = parseInt(e.target.value);
                            setDefaultRates({
                              ...defaultRates,
                              readymade: { ...defaultRates.readymade, distribution: newDist }
                            });
                          }}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total: {defaultRates.readymade.distribution.reduce((sum, d) => sum + d.percentage, 0)}% 
                  {defaultRates.readymade.distribution.reduce((sum, d) => sum + d.percentage, 0) !== 100 && (
                    <span className="text-rose-600 ml-1">(Must equal 100%)</span>
                  )}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDefaultsModal(false)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDefaults}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}