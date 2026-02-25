import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, Download, Filter, 
  ArrowUpRight, ArrowDownRight, DollarSign, 
  Users, Store, Calendar, ChevronRight,
  TrendingUp, Package, Percent, Clock,
  FileText, Target, Award, ShoppingBag
} from 'lucide-react';

interface FinancialReportsProps {
  orders: any[];
  purchases: any[];
  vendors: any[];
  buyers: any[];
}

export function FinancialReports({ orders, purchases, vendors, buyers }: FinancialReportsProps) {
  const [activeTab, setActiveTab] = useState<'payables' | 'receivables' | 'profitloss' | 'commissions' | 'categories' | 'topvendors' | 'monthly'>('payables');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    console.log('📊 FinancialReports received data:', {
      ordersCount: orders.length,
      purchasesCount: purchases.length,
      vendorsCount: vendors.length,
      buyersCount: buyers.length,
      sampleOrder: orders[0],
      samplePurchase: purchases[0],
      sampleVendor: vendors[0],
      sampleBuyer: buyers[0]
    });
    calculateReports();
  }, [orders, purchases, vendors, buyers]);

  const calculateReports = () => {
    // 1. Calculate ALL PARTIES Payables (Vendors, Designers, Stitching Masters, Agents)
    const partyStats = new Map();

    // Initialize all vendors (including designers, stitching masters, agents)
    vendors.forEach(v => {
      partyStats.set(v.id, {
        id: v.id,
        name: v.name,
        type: v.type || 'Vendor',
        totalAmount: 0,
        amountPaid: 0,
        amountPending: 0,
        pendingCount: 0,
        lastTransaction: null,
        transactionType: 'Direct Purchase' // Will be updated if commission found
      });
    });

    // Process PURCHASES for Direct Vendor Payments
    purchases.forEach(purchase => {
      const vId = purchase.vendorId;
      
      let stats = partyStats.get(vId);
      
      if (!stats && purchase.vendor) {
        // Try finding by name if ID doesn't match
        const found = Array.from(partyStats.values()).find(v => v.name === purchase.vendor);
        if (found) stats = found;
      }
      
      if (!stats && vId === 'legacy') {
          if (purchase.vendor && purchase.vendor !== 'Unknown Vendor') {
             const existingTemp = Array.from(partyStats.values()).find(v => v.name === purchase.vendor);
             if (existingTemp) {
                 stats = existingTemp;
             } else {
                 const tempId = `TEMP-${purchase.vendor}`;
                 partyStats.set(tempId, {
                    id: tempId,
                    name: purchase.vendor,
                    type: 'Vendor',
                    totalAmount: 0,
                    amountPaid: 0,
                    amountPending: 0,
                    pendingCount: 0,
                    lastTransaction: null,
                    transactionType: 'Direct Purchase'
                 });
                 stats = partyStats.get(tempId);
             }
          }
      }

      if (stats) {
        const amount = purchase.totalCost || purchase.amount || 0;

        stats.totalAmount += amount;
        
        if (purchase.paymentStatus === 'paid') {
          stats.amountPaid += amount;
        } else if (purchase.paymentStatus === 'pending') {
          stats.amountPending += amount;
          stats.pendingCount++;
        } else if (purchase.paymentStatus === 'partial') {
          stats.amountPaid += (amount * 0.5);
          stats.amountPending += (amount * 0.5);
          stats.pendingCount++;
        }

        if (!stats.lastTransaction || new Date(purchase.date) > new Date(stats.lastTransaction)) {
          stats.lastTransaction = purchase.date;
        }
      }
    });

    // Process COMMISSION DISTRIBUTIONS from Orders
    // This includes all party types: Vendors, Designers, Stitching Masters, Agents
    orders.forEach(order => {
      if (order.commissionDistribution && Array.isArray(order.commissionDistribution)) {
        order.commissionDistribution.forEach(commission => {
          const partyName = commission.party;
          const commissionAmount = commission.amount || 0;

          if (!partyName || commissionAmount === 0) return;

          // Determine party type from the commission label
          let partyType = 'Unknown';
          let searchName = partyName;

          if (partyName.includes('Vendor Agent') || partyName.includes('Agent')) {
            partyType = 'Vendor Agent';
            searchName = partyName.replace(/\s*\(.*?\)\s*/g, '').trim(); // Remove (Vendor Agent) suffix
          } else if (partyName.includes('Designer')) {
            partyType = 'Designer';
            searchName = partyName.replace(/\s*\(.*?\)\s*/g, '').trim();
          } else if (partyName.includes('Stitching Master') || partyName.includes('Stitching')) {
            partyType = 'Stitching Master';
            searchName = partyName.replace(/\s*\(.*?\)\s*/g, '').trim();
          } else if (partyName.includes('Buyer Agent')) {
            partyType = 'Buyer Agent';
            searchName = partyName.replace(/\s*\(.*?\)\s*/g, '').trim();
          } else {
            // Default to Vendor
            partyType = 'Vendor';
            searchName = partyName;
          }

          // Try to find existing party entry
          let stats = null;
          
          // First try exact ID match from vendors list
          const vendorMatch = vendors.find(v => v.name === searchName || v.name === partyName);
          if (vendorMatch) {
            stats = partyStats.get(vendorMatch.id);
          }

          // If not found, search by name in existing stats
          if (!stats) {
            stats = Array.from(partyStats.values()).find(s => 
              s.name === searchName || 
              s.name === partyName ||
              s.name.toLowerCase() === searchName.toLowerCase()
            );
          }

          // If still not found, create new entry
          if (!stats) {
            const newId = `COMMISSION-${partyName}-${Date.now()}`;
            partyStats.set(newId, {
              id: newId,
              name: searchName || partyName,
              type: partyType,
              totalAmount: 0,
              amountPaid: 0,
              amountPending: 0,
              pendingCount: 0,
              lastTransaction: null,
              transactionType: 'Commission'
            });
            stats = partyStats.get(newId);
          }

          if (stats) {
            // Update transaction type to include commission
            if (stats.transactionType === 'Direct Purchase') {
              stats.transactionType = 'Purchase + Commission';
            } else if (stats.transactionType !== 'Purchase + Commission') {
              stats.transactionType = 'Commission';
            }

            stats.totalAmount += commissionAmount;

            // Commission payment status based on order payment status
            if (order.paymentStatus === 'paid') {
              stats.amountPaid += commissionAmount;
            } else if (order.paymentStatus === 'pending') {
              stats.amountPending += commissionAmount;
              stats.pendingCount++;
            } else if (order.paymentStatus === 'partial') {
              stats.amountPaid += (commissionAmount * 0.5);
              stats.amountPending += (commissionAmount * 0.5);
              stats.pendingCount++;
            } else {
              // Default to pending if status unclear
              stats.amountPending += commissionAmount;
              stats.pendingCount++;
            }

            const orderDate = order.date || order.createdDate || new Date().toISOString();
            if (!stats.lastTransaction || new Date(orderDate) > new Date(stats.lastTransaction)) {
              stats.lastTransaction = orderDate;
            }
          }
        });
      }
    });

    const partyReport = Array.from(partyStats.values())
      .filter(p => p.totalAmount > 0) // Only show parties with transactions
      .sort((a, b) => b.amountPending - a.amountPending);

    console.log('💰 Payables Report:', {
      totalParties: Array.from(partyStats.values()).length,
      partiesWithTransactions: partyReport.length,
      sampleParty: partyReport[0]
    });

    // 2. Calculate Customer Receivables (Accounts Receivable)
    const buyerStats = new Map();
    
    buyers.forEach(b => {
      buyerStats.set(b.id, {
        id: b.id,
        name: b.name,
        type: b.type,
        totalSales: 0,
        amountReceived: 0,
        amountPending: 0,
        pendingCount: 0,
        lastTransaction: null
      });
    });

    orders.forEach(order => {
      // Logic for Sales:
      // Type='sale' or buyerId is NOT internal
      if ((order.type === 'sale' || !order.type) && order.buyerId !== 'internal') {
        const bId = order.buyerId;
        
        let stats = buyerStats.get(bId);
        if (!stats) {
             // Try name match
             const found = Array.from(buyerStats.values()).find(b => b.name === order.buyer);
             if (found) stats = found;
        }

        if (stats) {
          const amount = order.subtotal || 0;
          stats.totalSales += amount;

          if (order.paymentStatus === 'paid') {
            stats.amountReceived += amount;
          } else if (order.paymentStatus === 'pending') {
            stats.amountPending += amount;
            stats.pendingCount++;
          } else if (order.paymentStatus === 'partial') {
            stats.amountReceived += (amount * 0.5);
            stats.amountPending += (amount * 0.5);
            stats.pendingCount++;
          }

          if (!stats.lastTransaction || new Date(order.date) > new Date(stats.lastTransaction)) {
            stats.lastTransaction = order.date;
          }
        }
      }
    });

    const buyerReport = Array.from(buyerStats.values())
      .filter(b => b.totalSales > 0)
      .sort((a, b) => b.amountPending - a.amountPending);

    console.log('💵 Receivables Report:', {
      totalBuyers: Array.from(buyerStats.values()).length,
      buyersWithSales: buyerReport.length,
      sampleBuyer: buyerReport[0]
    });

    // 3. Calculate Profit & Loss
    const salesOrders = orders.filter(o => (o.type === 'sale' || !o.type) && o.buyerId !== 'internal');
    const totalRevenue = salesOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
    const totalCost = purchases.reduce((sum, p) => sum + (p.totalCost || p.amount || 0), 0);
    const totalCommissions = salesOrders.reduce((sum, o) => {
      if (o.commissionDistribution && Array.isArray(o.commissionDistribution)) {
        return sum + o.commissionDistribution.reduce((s, c) => s + (c.amount || 0), 0);
      }
      return sum;
    }, 0);

    const grossProfit = totalRevenue - totalCost;
    const netProfit = totalRevenue - totalCost - totalCommissions;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    // 4. Commission Breakdown by Party Type
    const commissionByType = {
      'Vendor': 0,
      'Designer': 0,
      'Stitching Master': 0,
      'Vendor Agent': 0,
      'Buyer Agent': 0,
      'Other': 0
    };

    partyReport.forEach(party => {
      if (party.transactionType === 'Commission' || party.transactionType === 'Purchase + Commission') {
        const type = party.type;
        if (commissionByType[type] !== undefined) {
          commissionByType[type] += party.totalAmount;
        } else {
          commissionByType['Other'] += party.totalAmount;
        }
      }
    });

    // 5. Category-wise Sales Report
    const categoryStats = new Map();
    
    salesOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const category = item.category || 'Uncategorized';
          if (!categoryStats.has(category)) {
            categoryStats.set(category, {
              category,
              totalSales: 0,
              totalQuantity: 0,
              orderCount: 0
            });
          }
          const stats = categoryStats.get(category);
          stats.totalSales += (item.price || 0) * (item.quantity || 0);
          stats.totalQuantity += (item.quantity || 0);
          stats.orderCount++;
        });
      }
    });

    const categoryReport = Array.from(categoryStats.values())
      .sort((a, b) => b.totalSales - a.totalSales);

    // 6. Top Performing Vendors
    const vendorPerformance = new Map();
    
    vendors.forEach(v => {
      vendorPerformance.set(v.id, {
        id: v.id,
        name: v.name,
        type: v.type,
        totalPurchases: 0,
        orderCount: 0,
        commissionEarned: 0
      });
    });

    purchases.forEach(purchase => {
      const vId = purchase.vendorId;
      let stats = vendorPerformance.get(vId);
      
      if (!stats && purchase.vendor && vId === 'legacy') {
        const tempId = `TEMP-${purchase.vendor}`;
        if (!vendorPerformance.has(tempId)) {
          vendorPerformance.set(tempId, {
            id: tempId,
            name: purchase.vendor,
            type: 'Vendor',
            totalPurchases: 0,
            orderCount: 0,
            commissionEarned: 0
          });
        }
        stats = vendorPerformance.get(tempId);
      }

      if (stats) {
        stats.totalPurchases += (purchase.totalCost || purchase.amount || 0);
        stats.orderCount++;
      }
    });

    // Add commission earnings
    partyReport.forEach(party => {
      let stats = vendorPerformance.get(party.id);
      if (!stats) {
        stats = Array.from(vendorPerformance.values()).find(v => v.name === party.name);
      }
      if (stats && (party.transactionType === 'Commission' || party.transactionType === 'Purchase + Commission')) {
        stats.commissionEarned = party.totalAmount;
      }
    });

    const topVendors = Array.from(vendorPerformance.values())
      .filter(v => v.totalPurchases > 0 || v.commissionEarned > 0)
      .sort((a, b) => (b.totalPurchases + b.commissionEarned) - (a.totalPurchases + a.commissionEarned))
      .slice(0, 10);

    // 7. Monthly Revenue Trend (last 12 months)
    const monthlyStats = new Map();
    const now = new Date();
    
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats.set(key, {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: 0,
        costs: 0,
        profit: 0,
        orderCount: 0
      });
    }

    salesOrders.forEach(order => {
      const orderDate = new Date(order.date || order.createdDate);
      const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      const stats = monthlyStats.get(key);
      if (stats) {
        stats.revenue += (order.subtotal || 0);
        stats.orderCount++;
      }
    });

    purchases.forEach(purchase => {
      const purchaseDate = new Date(purchase.date);
      const key = `${purchaseDate.getFullYear()}-${String(purchaseDate.getMonth() + 1).padStart(2, '0')}`;
      const stats = monthlyStats.get(key);
      if (stats) {
        stats.costs += (purchase.totalCost || purchase.amount || 0);
      }
    });

    // Calculate profit for each month
    monthlyStats.forEach(stats => {
      stats.profit = stats.revenue - stats.costs;
    });

    const monthlyReport = Array.from(monthlyStats.values());

    setReportData({
      payables: partyReport,
      receivables: buyerReport,
      profitLoss: {
        totalRevenue,
        totalCost,
        totalCommissions,
        grossProfit,
        netProfit,
        profitMargin,
        totalOrders: salesOrders.length,
        totalPurchases: purchases.length
      },
      commissionBreakdown: Object.entries(commissionByType)
        .map(([type, amount]) => ({ type, amount }))
        .filter(c => c.amount > 0)
        .sort((a, b) => b.amount - a.amount),
      categoryReport,
      topVendors,
      monthlyReport,
      summary: {
        totalPayable: partyReport.reduce((sum, p) => sum + p.amountPending, 0),
        totalReceivable: buyerReport.reduce((sum, b) => sum + b.amountPending, 0),
        totalPaidToParties: partyReport.reduce((sum, p) => sum + p.amountPaid, 0),
        totalReceivedFromBuyers: buyerReport.reduce((sum, b) => sum + b.amountReceived, 0)
      }
    });
  };

  if (!reportData) return <div className="p-8 text-center text-gray-500">Loading reports...</div>;

  const getPartyTypeColor = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'vendor':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'designer':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'stitching master':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'vendor agent':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'buyer agent':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const tabs = [
    { id: 'payables', label: 'Payables', icon: ArrowUpRight },
    { id: 'receivables', label: 'Receivables', icon: ArrowDownRight },
    { id: 'profitloss', label: 'Profit & Loss', icon: TrendingUp },
    { id: 'commissions', label: 'Commissions', icon: Percent },
    { id: 'categories', label: 'Categories', icon: Package },
    { id: 'topvendors', label: 'Top Vendors', icon: Award },
    { id: 'monthly', label: 'Monthly Trends', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">₹{reportData.profitLoss.totalRevenue.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">{reportData.profitLoss.totalOrders} orders</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-gray-500 font-medium">Net Profit</p>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">₹{reportData.profitLoss.netProfit.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">{reportData.profitLoss.profitMargin.toFixed(1)}% margin</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-gray-500 font-medium">Accounts Payable</p>
            <ArrowUpRight className="w-5 h-5 text-rose-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">₹{reportData.summary.totalPayable.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">Pending payments</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-gray-500 font-medium">Accounts Receivable</p>
            <ArrowDownRight className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">₹{reportData.summary.totalReceivable.toLocaleString()}</h3>
          <p className="text-xs text-gray-500 mt-1">To be collected</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Export Button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">
              {tabs.find(t => t.id === activeTab)?.label} Report
            </h3>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Payables Report */}
          {activeTab === 'payables' && (
            <div className="space-y-3">
              {reportData.payables.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payment records found
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 uppercase">
                    <div className="col-span-3">Party Name</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2 text-right">Total Amount</div>
                    <div className="col-span-2 text-right">Paid</div>
                    <div className="col-span-2 text-right">Pending</div>
                    <div className="col-span-1 text-center">Status</div>
                  </div>

                  {reportData.payables.map((party: any, idx: number) => (
                    <div 
                      key={party.id || idx} 
                      className="grid grid-cols-12 gap-4 px-4 py-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="col-span-3">
                        <p className="font-medium text-gray-900">{party.name}</p>
                        <p className="text-xs text-gray-500">{party.transactionType}</p>
                        {party.lastTransaction && (
                          <p className="text-xs text-gray-400">Last: {new Date(party.lastTransaction).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getPartyTypeColor(party.type)}`}>
                          {party.type}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-semibold text-gray-900">₹{party.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-medium text-emerald-600">₹{party.amountPaid.toLocaleString()}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-medium text-rose-600">₹{party.amountPending.toLocaleString()}</p>
                        {party.pendingCount > 0 && (
                          <p className="text-xs text-gray-500">{party.pendingCount} pending</p>
                        )}
                      </div>
                      <div className="col-span-1 text-center">
                        {party.amountPending === 0 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 text-rose-600 rounded-full text-xs font-bold">
                            !
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Receivables Report */}
          {activeTab === 'receivables' && (
            <div className="space-y-3">
              {reportData.receivables.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No receivable records found
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 uppercase">
                    <div className="col-span-3">Customer Name</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2 text-right">Total Sales</div>
                    <div className="col-span-2 text-right">Received</div>
                    <div className="col-span-2 text-right">Pending</div>
                    <div className="col-span-1 text-center">Status</div>
                  </div>

                  {reportData.receivables.map((buyer: any, idx: number) => (
                    <div 
                      key={buyer.id || idx} 
                      className="grid grid-cols-12 gap-4 px-4 py-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="col-span-3">
                        <p className="font-medium text-gray-900">{buyer.name}</p>
                        {buyer.lastTransaction && (
                          <p className="text-xs text-gray-400">Last: {new Date(buyer.lastTransaction).toLocaleDateString()}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {buyer.type || 'Shop Owner'}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-semibold text-gray-900">₹{buyer.totalSales.toLocaleString()}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-medium text-emerald-600">₹{buyer.amountReceived.toLocaleString()}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="font-medium text-rose-600">₹{buyer.amountPending.toLocaleString()}</p>
                        {buyer.pendingCount > 0 && (
                          <p className="text-xs text-gray-500">{buyer.pendingCount} pending</p>
                        )}
                      </div>
                      <div className="col-span-1 text-center">
                        {buyer.amountPending === 0 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-rose-100 text-rose-600 rounded-full text-xs font-bold">
                            !
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Profit & Loss Report */}
          {activeTab === 'profitloss' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-700 font-medium mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-emerald-900">₹{reportData.profitLoss.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 mt-2">{reportData.profitLoss.totalOrders} sales orders</p>
                </div>

                <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-lg p-4">
                  <p className="text-sm text-rose-700 font-medium mb-1">Total Costs</p>
                  <p className="text-3xl font-bold text-rose-900">₹{reportData.profitLoss.totalCost.toLocaleString()}</p>
                  <p className="text-xs text-rose-600 mt-2">{reportData.profitLoss.totalPurchases} purchases</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-700 font-medium mb-1">Total Commissions</p>
                  <p className="text-3xl font-bold text-amber-900">₹{reportData.profitLoss.totalCommissions.toLocaleString()}</p>
                  <p className="text-xs text-amber-600 mt-2">All parties combined</p>
                </div>
              </div>

              <div className="bg-white border-2 border-indigo-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Gross Profit</h4>
                    <p className="text-sm text-gray-500">Revenue - Direct Costs</p>
                  </div>
                  <p className="text-4xl font-bold text-indigo-600">₹{reportData.profitLoss.grossProfit.toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Net Profit</h4>
                    <p className="text-sm text-gray-500">After all commissions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-emerald-600">₹{reportData.profitLoss.netProfit.toLocaleString()}</p>
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      {reportData.profitLoss.profitMargin.toFixed(2)}% profit margin
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Financial Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="font-semibold text-emerald-600">₹{reportData.profitLoss.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">- Direct Costs</span>
                    <span className="font-semibold text-rose-600">₹{reportData.profitLoss.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                    <span className="text-sm font-medium text-gray-700">Gross Profit</span>
                    <span className="font-semibold text-indigo-600">₹{reportData.profitLoss.grossProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">- Commissions</span>
                    <span className="font-semibold text-amber-600">₹{reportData.profitLoss.totalCommissions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-gray-400">
                    <span className="text-sm font-bold text-gray-900">Net Profit</span>
                    <span className="font-bold text-lg text-emerald-600">₹{reportData.profitLoss.netProfit.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commission Breakdown Report */}
          {activeTab === 'commissions' && (
            <div className="space-y-4">
              {reportData.commissionBreakdown.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No commission data found
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-5">
                    <p className="text-sm text-amber-700 font-medium mb-1">Total Commissions</p>
                    <p className="text-4xl font-bold text-amber-900">
                      ₹{reportData.profitLoss.totalCommissions.toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportData.commissionBreakdown.map((item: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${getPartyTypeColor(item.type)}`}>
                            {item.type}
                          </span>
                          <Percent className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₹{item.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {((item.amount / reportData.profitLoss.totalCommissions) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Category-wise Sales Report */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              {reportData.categoryReport.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No category data found
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 uppercase">
                    <div className="col-span-2">Category</div>
                    <div className="text-right">Total Sales</div>
                    <div className="text-right">Quantity</div>
                    <div className="text-right">Orders</div>
                  </div>

                  {reportData.categoryReport.map((cat: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="grid grid-cols-5 gap-4 px-4 py-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="col-span-2 flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="font-medium text-gray-900">{cat.category}</p>
                          <p className="text-xs text-gray-500">
                            Avg: ₹{(cat.totalSales / cat.orderCount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{cat.totalSales.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-700">{cat.totalQuantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-indigo-600">{cat.orderCount}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Top Vendors Report */}
          {activeTab === 'topvendors' && (
            <div className="space-y-3">
              {reportData.topVendors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No vendor performance data found
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 uppercase">
                    <div className="col-span-2">Vendor Name</div>
                    <div className="text-center">Type</div>
                    <div className="text-right">Purchases</div>
                    <div className="text-right">Commissions</div>
                    <div className="text-right">Total Value</div>
                  </div>

                  {reportData.topVendors.map((vendor: any, idx: number) => (
                    <div 
                      key={vendor.id} 
                      className="grid grid-cols-6 gap-4 px-4 py-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{vendor.name}</p>
                          <p className="text-xs text-gray-500">{vendor.orderCount} orders</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getPartyTypeColor(vendor.type)}`}>
                          {vendor.type}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{vendor.totalPurchases.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-600">₹{vendor.commissionEarned.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">
                          ₹{(vendor.totalPurchases + vendor.commissionEarned).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Monthly Trends Report */}
          {activeTab === 'monthly' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-6 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-500 uppercase">
                  <div className="col-span-2">Month</div>
                  <div className="text-right">Revenue</div>
                  <div className="text-right">Costs</div>
                  <div className="text-right">Profit</div>
                  <div className="text-right">Orders</div>
                </div>

                {reportData.monthlyReport.map((month: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="grid grid-cols-6 gap-4 px-4 py-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="col-span-2 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      <p className="font-medium text-gray-900">{month.month}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">₹{month.revenue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-rose-600">₹{month.costs.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${month.profit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        ₹{month.profit.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-700">{month.orderCount}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">12-Month Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-indigo-600 mb-1">Total Revenue</p>
                    <p className="text-xl font-bold text-indigo-900">
                      ₹{reportData.monthlyReport.reduce((sum: number, m: any) => sum + m.revenue, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 mb-1">Total Costs</p>
                    <p className="text-xl font-bold text-indigo-900">
                      ₹{reportData.monthlyReport.reduce((sum: number, m: any) => sum + m.costs, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 mb-1">Total Profit</p>
                    <p className="text-xl font-bold text-emerald-600">
                      ₹{reportData.monthlyReport.reduce((sum: number, m: any) => sum + m.profit, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
