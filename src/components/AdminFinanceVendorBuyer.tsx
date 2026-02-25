import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, Plus, X, Edit, Trash2, Link, Store, Users, Phone, MapPin, Mail, Calendar, DollarSign, Package, TrendingUp, Shirt, Layers as Fabric, Search, Filter, User, QrCode, Key, Download, Upload, FileText, ChevronRight, ChevronLeft, Printer, Receipt, ShoppingBag, FileBarChart, Shield, Calculator } from 'lucide-react';
import { BarcodeGenerator } from './BarcodeGenerator';
import { AddExpenseModal } from './AddExpenseModal';
import { FinanceTransactionModal } from './FinanceTransactionModal';
import { FinancialReports } from './FinancialReports';
import { AccountingHub } from './AccountingHub';
import { printInvoice } from './InvoiceGenerator';
import * as financeService from '../services/financeService';
import * as orderService from '../services/orderService';
import * as vendorService from '../services/vendorService';
import * as buyerService from '../services/buyerService';
import * as productService from '../services/productService';
import * as auditLogService from '../services/auditLogService';
import * as adminAuthService from '../services/adminAuthService';
import { toast } from 'sonner@2.0.3';
import { PurchaseOrderList } from './PurchaseOrderList';
import { PurchaseDetailModal } from './PurchaseDetailModal';
import { AuditLogViewer } from './AuditLogViewer';
import { SearchableDropdown } from './SearchableDropdown';

interface FinanceTabProps {
  financeView: 'overview' | 'ledger' | 'purchases' | 'sales' | 'expenses' | 'reports' | 'accounting' | 'audit';
  setFinanceView: (view: 'overview' | 'ledger' | 'purchases' | 'sales' | 'expenses' | 'reports' | 'accounting' | 'audit') => void;
  accountingSummary: any;
  onRefreshData?: () => Promise<void>;
}

interface VendorBuyerTabProps {
  type: 'vendor' | 'buyer' | 'designer' | 'stitching-master' | 'vendor-agent' | 'buyer-agent' | 'designer-agent';
}

export function FinanceTab({ financeView, setFinanceView, accountingSummary, onRefreshData }: FinanceTabProps) {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'purchase' | 'sale'>('purchase');
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [filteredLedger, setFilteredLedger] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Ledger Filters
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerDateFrom, setLedgerDateFrom] = useState('');
  const [ledgerDateTo, setLedgerDateTo] = useState('');

  useEffect(() => {
    loadFinancialData();
  }, []);

  useEffect(() => {
    // Filter Ledger
    let result = ledger;
    if (ledgerSearch) {
      const q = ledgerSearch.toLowerCase();
      result = result.filter(item => 
        item.description.toLowerCase().includes(q) || 
        item.party.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    if (ledgerDateFrom) {
      result = result.filter(item => item.date >= ledgerDateFrom);
    }
    if (ledgerDateTo) {
      result = result.filter(item => item.date <= ledgerDateTo);
    }
    setFilteredLedger(result);
  }, [ledger, ledgerSearch, ledgerDateFrom, ledgerDateTo]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      const [allOrders, vendorsData, buyersData, productsData] = await Promise.all([
        orderService.getAllOrders(),
        vendorService.getAllVendors(),
        buyerService.getAllBuyers(),
        productService.getAllProducts()
      ]);
      
      // Filter out deleted orders
      const orders = allOrders.filter(o => o.status !== 'deleted');
      
      const purchaseRecords = financeService.extractPurchaseRecords(orders);
      
      // Convert legacy products to purchase records for backward compatibility
      const productPurchases = productsData
        .filter((p: any) => p.costPrice && p.quantity)
        .map((p: any) => ({
          id: p.id,
          date: p.createdAt || new Date().toISOString(),
          vendor: p.vendor || 'Unknown Vendor',
          vendorId: p.vendorId || 'legacy',
          product: p.name,
          productType: p.type,
          quantity: p.quantity,
          costPrice: p.costPrice,
          totalCost: (p.quantity || 0) * (p.costPrice || 0),
          amount: (p.quantity || 0) * (p.costPrice || 0), // For display compatibility
          paymentStatus: p.paymentStatus || 'paid',
          paymentMethod: p.paymentMethod || 'Bank Transfer',
          commission: 0,
          commissionDistribution: [],
          status: 'delivered' // Legacy items are already in stock
        }));

      // Combine both sources, sorting by date
      const allPurchases = [...purchaseRecords, ...productPurchases].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const salesRecords = financeService.extractSalesRecords(orders);
      const expensesData = await financeService.getExpenses();
      const ledgerData = financeService.getLedgerEntries(orders, productPurchases);
      
      setPurchases(allPurchases);
      setSales(salesRecords);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
      setLedger(ledgerData);
      setVendors(vendorsData);
      setBuyers(buyersData);
      setOrders(orders);
    } catch (err) {
      console.error('Failed to load financial data:', err);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (data: any) => {
    try {
      const { items } = data;
      
      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * (transactionType === 'sale' ? item.sellingPrice : item.costPrice)), 0);
      
      const profit = transactionType === 'sale' 
        ? items.reduce((sum: number, item: any) => sum + (item.quantity * (item.sellingPrice - item.costPrice)), 0)
        : 0;

      // Create a new order object representing this transaction
      const orderData: any = {
        date: data.date,
        buyer: transactionType === 'sale' ? data.partyName : 'Tashivar Inventory',
        buyerId: transactionType === 'sale' ? data.partyId : 'internal',
        buyerPhone: data.partyPhone || '',
        buyerAddress: data.billingAddress || data.partyAddress || '',
        shippingAddress: data.shippingAddress,
        vendor: transactionType === 'purchase' ? data.partyName : 'Tashivar Inventory',
        vendorId: transactionType === 'purchase' ? data.partyId : 'internal',
        products: items.map((item: any) => ({
          id: item.productId,
          name: item.productName,
          type: item.productType,
          quantity: item.quantity,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
          image: item.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100',
          hsn: item.hsn
        })),
        subtotal: subtotal,
        // Preserve existing commission/profit structure if editing, or recalc
        // Simple recalc for now
        commission: editingTransaction ? editingTransaction.commission : 0, 
        commissionDistribution: editingTransaction ? editingTransaction.commissionDistribution : [],
        profit: profit,
        status: transactionType === 'sale' ? 'delivered' : 'received-at-warehouse',
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        type: transactionType,
        taxRate: data.taxRate, // Persist tax info
        discountRate: data.discountRate,
        salesOrderTracking: (data.transportName || data.trackingNumber || data.vehicleNumber) ? {
          deliveryMethod: 'transport',
          courierService: data.transportName,
          trackingId: data.trackingNumber,
          vehicleNumber: data.vehicleNumber,
          dispatchedAt: data.date,
          status: 'dispatched',
          updates: []
        } : undefined
      };
      
      let orderId;
      if (editingTransaction && editingTransaction.id) {
         orderId = editingTransaction.id;
         await orderService.updateOrder(editingTransaction.id, orderData);
         toast.success('Transaction updated successfully');
         
         auditLogService.logAction(
           'UPDATE',
           'ORDER',
           editingTransaction.id,
           `Updated ${transactionType} transaction (Invoice #${editingTransaction.id})`,
           { changes: orderData, previous: editingTransaction }
         );
      } else {
         const newOrder = await orderService.createOrder(orderData);
         orderId = newOrder.id;
         
         // Update inventory quantities based on transaction type
         for (const item of items) {
           if (item.productId && !item.productId.startsWith('CUSTOM-')) {
             try {
               const product = await productService.getProduct(item.productId);
               if (product) {
                 const currentQuantity = product.quantity || 0;
                 let newQuantity;
                 
                 if (transactionType === 'purchase') {
                   // Add to inventory on purchase
                   newQuantity = currentQuantity + item.quantity;
                 } else {
                   // Reduce from inventory on sale
                   newQuantity = Math.max(0, currentQuantity - item.quantity);
                 }
                 
                 await productService.updateProduct(item.productId, {
                   quantity: newQuantity
                 });
                 
                 console.log(`📦 Updated inventory for ${item.productName}: ${currentQuantity} → ${newQuantity}`);
               }
             } catch (err) {
               console.error(`Failed to update inventory for ${item.productName}:`, err);
             }
           }
         }
         
         toast.success('Transaction recorded successfully');
         
         auditLogService.logAction(
           'CREATE',
           'ORDER',
           newOrder.id,
           `Created new ${transactionType} transaction (Invoice #${newOrder.id})`,
           { data: orderData }
         );
      }

      await loadFinancialData();
      if (onRefreshData) {
        await onRefreshData();
      }
    } catch (err) {
      console.error('Failed to record transaction:', err);
      toast.error('Failed to record transaction');
    }
  };
  
  const handleExpenseSubmit = async (data: any) => {
    try {
      const expense = financeService.saveExpense(data);
      toast.success('Expense recorded successfully');
      
      auditLogService.logAction(
        'CREATE',
        'EXPENSE',
        expense.id,
        `Recorded expense of ₹${data.amount} for ${data.category}`,
        { data }
      );
      
      await loadFinancialData();
      if (onRefreshData) {
        await onRefreshData();
      }
    } catch (err) {
      console.error('Failed to record expense:', err);
      toast.error('Failed to record expense');
    }
  };

  const handleUpdatePurchase = async (id: string, updates: any) => {
    try {
      const purchase = purchases.find(p => p.id === id);
      if (!purchase) return;

      if (purchase.vendorId === 'legacy') {
        // It's a product
        await productService.updateProduct(id, {
          paymentStatus: updates.paymentStatus,
          paymentMethod: updates.paymentMethod,
          // Map other fields if necessary
        });
        auditLogService.logAction('UPDATE', 'PRODUCT', id, `Updated legacy product payment status to ${updates.paymentStatus}`);
      } else {
        // It's an order
        await orderService.updateOrder(id, {
          paymentStatus: updates.paymentStatus,
          paymentMethod: updates.paymentMethod,
          status: updates.status
        });
        auditLogService.logAction('UPDATE', 'ORDER', id, `Updated purchase order status to ${updates.status}/${updates.paymentStatus}`);
      }
      
      toast.success('Purchase updated successfully');
      loadFinancialData();
      if (onRefreshData) {
        onRefreshData();
      }
      setSelectedPurchase(null);
    } catch (err) {
      console.error('Failed to update purchase:', err);
      toast.error('Failed to update purchase');
    }
  };

  const handleEditSale = (sale: any) => {
    let orderId = sale.orderId;
    
    // Fallback if orderId is missing (legacy)
    if (!orderId && sale.id.startsWith('SALE-')) {
       const parts = sale.id.split('-');
       if (parts.length >= 3) {
          orderId = parts.slice(1, -1).join('-');
       }
    }

    const order = orders.find(o => o.id === orderId);
    if (order) {
        setTransactionType('sale');
        setEditingTransaction(order);
        setShowTransactionModal(true);
    } else {
        toast.error('Order details not found for editing');
    }
  };

  const handleEditPurchase = (purchase: any) => {
    // Check if it's a real order or legacy product
    // Use orderId if available (for split records), otherwise try id
    const lookupId = purchase.orderId || purchase.id;
    const order = orders.find(o => o.id === lookupId);
    
    if (order) {
        setTransactionType('purchase');
        setEditingTransaction(order);
        setShowTransactionModal(true);
    } else if (purchase.vendorId === 'legacy') {
        toast.error('Cannot edit legacy inventory items here. Please use Product Management.');
    } else {
        // Fallback for legacy ID formats if necessary
        const parts = purchase.id.split('-');
        if (parts.length >= 3 && parts[0] === 'PUR') {
           // Try extracting middle part: PUR-{ORD-ID}-{INDEX}
           // But order ID might contain hyphens too.
           // safest is to rely on orderId property which we added to service.
           toast.error('Purchase order details not found');
        } else {
           toast.error('Purchase order details not found');
        }
    }
  };

  const handleDeletePurchase = async (purchase: any) => {
    if (confirm('Are you sure you want to delete this purchase record? (Soft Delete)')) {
      try {
        setLoading(true);
        // If it's an order
        if (purchase.id.startsWith('ORD-') || orders.some(o => o.id === purchase.id)) {
            await orderService.deleteOrder(purchase.id);
            auditLogService.logAction(
                'SOFT_DELETE', 
                'ORDER', 
                purchase.id, 
                `Deleted purchase order from ${purchase.vendor}`
            );
            toast.success('Purchase record deleted');
            loadFinancialData();
            if (onRefreshData) onRefreshData();
        } else {
            // For legacy items, we might need to delete product
             if (purchase.vendorId === 'legacy' || purchase.id.startsWith('PROD-')) {
                 // Try to delete product
                 // Assuming product ID is the purchase ID here
                 await productService.deleteProduct(purchase.id);
                 auditLogService.logAction('DELETE', 'PRODUCT', purchase.id, `Deleted legacy inventory item: ${purchase.product}`);
                 toast.success('Inventory item deleted');
                 loadFinancialData();
                 if (onRefreshData) onRefreshData();
             } else {
                 toast.error('Cannot delete this item type.');
             }
        }
      } catch (err) {
        console.error('Failed to delete purchase:', err);
        toast.error('Failed to delete purchase');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrintSaleInvoice = (sale: any) => {
    let orderId = sale.orderId;
    
    // Fallback if orderId is missing (legacy)
    if (!orderId && sale.id.startsWith('SALE-')) {
       // Try to extract: SALE-{orderId}-{index}
       const parts = sale.id.split('-');
       // If parts has at least 3 segments (SALE, ID..., INDEX)
       if (parts.length >= 3) {
          // Join everything between first and last part
          orderId = parts.slice(1, -1).join('-');
       }
    }

    const order = orders.find(o => o.id === orderId);
    if (order) {
      printInvoice(order);
    } else {
      toast.error('Order details not found for printing');
    }
  };

  const handleDeleteSale = async (sale: any) => {
    if (confirm('Are you sure you want to delete this sales bill? This will remove the entire order record.')) {
      try {
        setLoading(true);
        let orderId = sale.orderId;
        
        // Fallback logic similar to print
        if (!orderId && sale.id.startsWith('SALE-')) {
           const parts = sale.id.split('-');
           if (parts.length >= 3) {
              orderId = parts.slice(1, -1).join('-');
           }
        }
        
        if (!orderId) {
             orderId = sale.id; // Try using sale ID as order ID if not prefixed
        }

        // Verify if order exists
        const order = orders.find(o => o.id === orderId);
        if (!order) {
            // It might be a legacy product sale if we had those, but currently sales are order-based.
            // Or maybe the ID extraction failed.
            if (sale.id.startsWith('SALE-')) {
                 // Try one more extraction strategy: everything after SALE-
                 orderId = sale.id.substring(5);
                 // Remove trailing index like -0, -1
                 if (orderId.match(/-\d+$/)) {
                    orderId = orderId.replace(/-\d+$/, '');
                 }
            }
        }
        
        await orderService.deleteOrder(orderId);
        
        auditLogService.logAction(
           'SOFT_DELETE',
           'ORDER',
           orderId,
           `Deleted Sales Bill to ${sale.buyer}`
        );

        toast.success('Sales bill deleted successfully');
        loadFinancialData();
        if (onRefreshData) {
          onRefreshData();
        }
      } catch (err) {
        console.error('Failed to delete sales bill:', err);
        toast.error('Failed to delete sales bill');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => {
            setTransactionType('sale');
            setShowTransactionModal(true);
          }}
          className="group relative overflow-hidden bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left hover:bg-emerald-100"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">New Transaction</p>
              <h3 className="text-xl font-bold">Add Sales Bill</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </button>

        <button 
          onClick={() => {
            setTransactionType('purchase');
            setShowTransactionModal(true);
          }}
          className="group relative overflow-hidden bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left hover:bg-blue-100"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Inventory</p>
              <h3 className="text-xl font-bold">Add Purchase</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </button>

        <button 
          onClick={() => setShowExpenseModal(true)}
          className="group relative overflow-hidden bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left hover:bg-rose-100"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-rose-600 mb-1">Operational</p>
              <h3 className="text-xl font-bold">Add Expense</h3>
            </div>
            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-rose-600" />
            </div>
          </div>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Dashboard', icon: TrendingUp },
            { id: 'sales', label: 'Sales History', icon: Receipt },
            { id: 'purchases', label: 'Purchase Records', icon: ShoppingBag },
            { id: 'expenses', label: 'Expenses', icon: DollarSign },
            { id: 'ledger', label: 'Full Ledger', icon: FileText },
            { id: 'reports', label: 'Reports', icon: FileBarChart },
            { id: 'accounting', label: 'GST & Accounting', icon: Calculator },
            { id: 'audit', label: 'Audit Logs', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setFinanceView(tab.id as any)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  financeView === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {financeView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">₹{(accountingSummary.totalSales / 100000).toFixed(2)}L</p>
                <div className="mt-2 flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> Revenue
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">₹{(accountingSummary.totalPurchases / 100000).toFixed(2)}L</p>
                <div className="mt-2 flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                  <ShoppingBag className="w-3 h-3 mr-1" /> Inventory Cost
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm text-gray-500 mb-1">Net Profit</p>
                  <p className="text-2xl font-bold text-emerald-600">₹{(accountingSummary.netProfit / 100000).toFixed(2)}L</p>
                  <div className="mt-2 flex items-center text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded w-fit">
                    <TrendingUp className="w-3 h-3 mr-1" /> Performance
                  </div>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                  <TrendingUp className="w-24 h-24 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity (Mini Ledger) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Recent Transactions
                </h3>
                <button 
                  onClick={() => setFinanceView('ledger')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  View Full Ledger <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3">Party</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ledger.slice(0, 5).map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-600">{entry.date}</td>
                        <td className="px-6 py-3 font-medium text-gray-900">{entry.description}</td>
                        <td className="px-6 py-3 text-gray-600">{entry.party}</td>
                        <td className={`px-6 py-3 text-right font-medium ${
                          entry.debit > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {entry.debit > 0 ? `-₹${entry.debit.toLocaleString()}` : `+₹${entry.credit.toLocaleString()}`}
                        </td>
                      </tr>
                    ))}
                    {ledger.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No recent transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Financial Health Breakdown */}
          <div className="space-y-6">
            {/* Profit Logic */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Financial Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Gross Profit</span>
                  <span className="font-medium">₹{(accountingSummary.grossProfit / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-medium text-rose-600">-₹{(accountingSummary.totalExpenses / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Commissions</span>
                  <span className="font-medium text-rose-600">-₹{(accountingSummary.totalCommission / 100000).toFixed(2)}L</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Net Profit</span>
                  <span className="font-bold text-emerald-600">₹{(accountingSummary.netProfit / 100000).toFixed(2)}L</span>
                </div>
              </div>
            </div>

            {/* Cash Flow Status */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Cash Flow Status</h3>
              <div className="space-y-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">Receivables</span>
                    <ArrowDownRight className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-xl font-bold text-orange-700">₹{(accountingSummary.receivables / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-orange-600 mt-1">Pending from buyers</p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Payables</span>
                    <ArrowUpRight className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-xl font-bold text-purple-700">₹{(accountingSummary.payables / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-purple-600 mt-1">Due to vendors/agents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {financeView === 'ledger' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">General Ledger</h2>
              <p className="text-sm text-gray-600">Complete history of all financial transactions</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const header = ["Date", "ID", "Description", "Party", "Debit", "Credit", "Balance", "Payment Method"];
                  const rows = filteredLedger.map(l => [
                    l.date, l.id, l.description, l.party, l.debit, l.credit, l.balance, l.paymentMethod
                  ].join(","));
                  const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "ledger.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="date"
                value={ledgerDateFrom}
                onChange={(e) => setLedgerDateFrom(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="self-center text-gray-400">-</span>
              <input
                type="date"
                value={ledgerDateTo}
                onChange={(e) => setLedgerDateTo(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Ref ID</th>
                    <th className="px-6 py-4">Particulars</th>
                    <th className="px-6 py-4">Party</th>
                    <th className="px-6 py-4 text-right text-rose-700">Debit (Out)</th>
                    <th className="px-6 py-4 text-right text-emerald-700">Credit (In)</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 whitespace-nowrap text-gray-600">
                          {entry.date}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap font-mono text-xs text-gray-500">
                          {entry.id}
                        </td>
                        <td className="px-6 py-3 text-gray-900 font-medium">
                          {entry.description}
                          <div className="text-xs text-gray-500 font-normal mt-0.5">{entry.paymentMethod}</div>
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {entry.party}
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-rose-600">
                          {entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-emerald-600">
                          {entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '-'}
                        </td>
                        <td className={`px-6 py-3 text-right font-bold ${
                          entry.balance < 0 ? 'text-rose-600' : 'text-indigo-600'
                        }`}>
                          ₹{entry.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {financeView === 'purchases' && (
        <>
          <PurchaseOrderList 
            purchases={purchases}
            loading={loading}
            onAddPurchase={() => {
              setTransactionType('purchase');
              setShowTransactionModal(true);
            }}
            onViewPurchase={(purchase) => setSelectedPurchase(purchase)}
            onEditPurchase={handleEditPurchase}
            onDeletePurchase={handleDeletePurchase}
          />
          {selectedPurchase && (
            <PurchaseDetailModal 
              purchase={selectedPurchase} 
              onClose={() => setSelectedPurchase(null)} 
              onUpdate={handleUpdatePurchase}
            />
          )}
        </>
      )}

      {financeView === 'sales' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Sales History</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  const header = ["ID", "Date", "Buyer", "Product", "Type", "Quantity", "Price", "Revenue", "Profit", "Payment"];
                  const rows = sales.map(s => [
                    s.id, s.date, s.buyer, s.product, s.productType, s.quantity, s.sellingPrice, s.totalRevenue, s.profit, s.paymentStatus
                  ].join(","));
                  const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows].join("\n");
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "sales.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => {
                  setTransactionType('sale');
                  setShowTransactionModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                Add Sales Bill
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Bill No</th>
                  <th className="px-6 py-3">Buyer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3 text-right">Revenue</th>
                  <th className="px-6 py-3 text-right">Profit</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Receipt className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium mb-1">No Sales Records Found</p>
                        <p className="text-sm text-gray-400">Click "Add Sales Bill" to create your first sale</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-600">{sale.date}</td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-500">{sale.id.split('-')[1] || sale.id}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">{sale.buyer}</td>
                      <td className="px-6 py-3 text-gray-600">
                        {sale.quantity} x {sale.product}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-emerald-600">
                        ₹{sale.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-indigo-600">
                        ₹{sale.profit.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          sale.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          sale.paymentStatus === 'partial' ? 'bg-orange-100 text-orange-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {sale.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right flex justify-end gap-2">
                        <button 
                          onClick={() => handlePrintSaleInvoice(sale)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-600"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditSale(sale)}
                          className="p-1 hover:bg-blue-50 rounded text-blue-600"
                          title="Edit Sale"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSale(sale)}
                          className="p-1 hover:bg-rose-50 rounded text-rose-600"
                          title="Delete Sale"
                        >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {financeView === 'expenses' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Expenses Log</h3>
            <button 
              onClick={() => setShowExpenseModal(true)}
              className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-100"
            >
              Add Expense
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Vendor/Payee</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(expenses && Array.isArray(expenses) ? expenses : []).map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-600">{expense.date}</td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium uppercase tracking-wide">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-900">{expense.description}</td>
                    <td className="px-6 py-3 text-gray-600">{expense.vendor || '-'}</td>
                    <td className="px-6 py-3 text-right font-medium text-rose-600">
                      ₹{expense.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-gray-500 capitalize">
                      {expense.paymentStatus || 'paid'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {financeView === 'reports' && (
        <FinancialReports 
          orders={orders}
          purchases={purchases}
          vendors={vendors}
          buyers={buyers}
        />
      )}

      {financeView === 'accounting' && (
        <AccountingHub 
          orders={orders}
          purchases={purchases}
          vendors={vendors}
          buyers={buyers}
        />
      )}

      {financeView === 'audit' && (
        <AuditLogViewer />
      )}

      <FinanceTransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
            setShowTransactionModal(false);
            setEditingTransaction(null);
        }}
        type={transactionType}
        onSubmit={handleTransactionSubmit}
        vendors={vendors}
        buyers={buyers}
        initialData={editingTransaction}
      />

      <AddExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleExpenseSubmit}
        vendors={vendors}
      />
    </div>
  );
}

export function VendorBuyerManagement({ type }: VendorBuyerTabProps) {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPartners();
  }, [type]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      if (type === 'buyer') {
        const data = await buyerService.getAllBuyers();
        setPartners(data);
      } else {
        const data = await vendorService.getVendorsByType(type);
        setPartners(data);
      }
    } catch (err) {
      console.error('Failed to load partners:', err);
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePartner = async (data: any) => {
    try {
      let updatedPartner;
      if (type === 'buyer') {
        if (data.id) {
           updatedPartner = await buyerService.updateBuyer(data.id, data);
        } else {
           updatedPartner = await buyerService.createBuyer({
             ...data,
             businessName: data.name,
             status: 'active'
           });
        }
      } else {
        if (data.id) {
           updatedPartner = await vendorService.updateVendor(data.id, data);
        } else {
           updatedPartner = await vendorService.createVendor({
             ...data,
             type: type as any,
             status: 'active'
           });
        }
      }
      
      if (data.id) {
        setPartners(prev => prev.map(p => p.id === data.id ? updatedPartner : p));
        toast.success('Partner updated successfully');
      } else {
        setPartners(prev => [updatedPartner, ...prev]);
        toast.success('Partner added successfully');
      }
      setEditingPartner(null);
    } catch (err) {
      console.error('Failed to save partner:', err);
      toast.error('Failed to save partner');
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;
    try {
      if (type === 'buyer') {
        await buyerService.deleteBuyer(id);
      } else {
        await vendorService.deleteVendor(id);
      }
      setPartners(prev => prev.filter(p => p.id !== id));
      toast.success('Partner deleted successfully');
    } catch (err) {
      console.error('Failed to delete partner:', err);
      toast.error('Failed to delete partner');
    }
  };

  const handleViewDetails = (partner: any) => {
    setSelectedPartner(partner);
  };

  const handleCopyLink = () => {
    const baseUrl = window.location.origin;
    let app = '';
    switch (type) {
      case 'buyer': app = 'buyer'; break;
      case 'vendor': app = 'vendor'; break;
      case 'designer': 
      case 'stitching-master': app = 'manufacturing'; break;
      case 'vendor-agent':
      case 'buyer-agent':
      case 'designer-agent': app = 'agent'; break;
      default: return;
    }
    const url = `${baseUrl}?app=${app}`;
    navigator.clipboard.writeText(url);
    toast.success('Portal link copied to clipboard');
  };

  const getTitle = () => {
    switch (type) {
      case 'vendor': return 'Vendors';
      case 'buyer': return 'Buyers';
      case 'designer': return 'Designers';
      case 'stitching-master': return 'Stitching Masters';
      case 'vendor-agent': return 'Vendor Agents';
      case 'buyer-agent': return 'Buyer Agents';
      case 'designer-agent': return 'Designer Agents';
      default: return 'Partners';
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone && p.phone.includes(searchQuery)) ||
    (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{getTitle()} Management</h2>
          <p className="text-sm text-gray-600">Manage your {getTitle().toLowerCase()} directory</p>
        </div>
        <button
          onClick={() => {
            setEditingPartner(null);
            setShowAddModal(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add New {type.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${getTitle().toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">No {getTitle().toLowerCase()} found</h3>
          <p className="text-xs text-gray-500">Add a new partner to get started</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => (
            <div key={partner.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative group">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setEditingPartner(partner);
                    setShowAddModal(true);
                  }}
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Edit Partner"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleCopyLink()}
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Copy Portal Link"
                >
                  <Link className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeletePartner(partner.id)}
                  className="text-gray-400 hover:text-rose-600 transition-colors"
                  title="Delete Partner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-between items-start mb-4 pr-16">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-600">{partner.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                    <p className="text-xs text-gray-500">{partner.id}</p>
                    {partner.type && type === 'buyer' && (
                       <span className={`text-[10px] uppercase font-bold tracking-wider ${
                         partner.type === 'retailer' ? 'text-indigo-600' : 'text-emerald-600'
                       }`}>
                         {partner.type === 'retailer' ? 'Retailer (B2B)' : 'Direct Customer'}
                       </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{partner.phone}</span>
                </div>
                {partner.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{partner.email}</span>
                  </div>
                )}
                {partner.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{partner.city}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Business</p>
                  <p className="font-medium text-gray-900">₹{(partner.totalBusiness || 0).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleViewDetails(partner)}
                  className="text-sm text-indigo-600 font-medium hover:underline"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPartnerModal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          setEditingPartner(null);
        }} 
        type={type}
        onSubmit={handleSavePartner}
        initialData={editingPartner}
      />
      
      <PartnerDetailsModal
        partner={selectedPartner}
        onClose={() => setSelectedPartner(null)}
        onEdit={(partner: any) => {
          setSelectedPartner(null);
          setEditingPartner(partner);
          setShowAddModal(true);
        }}
      />
    </div>
  );
}

function AddPartnerModal({ isOpen, onClose, type, onSubmit, initialData }: any) {
  const [loading, setLoading] = useState(false);
  const [customerType, setCustomerType] = useState('direct');
  const [agents, setAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gst: '',
    pancard: '',
    bankAccount: '',
    ifscCode: '',
    creditLimit: '',
    agentId: '',
    agentCommission: '',
    commissionRate: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        owner: initialData.owner || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        address: initialData.address || '',
        city: initialData.city || '',
        state: initialData.state || '',
        pincode: initialData.pincode || '',
        gst: initialData.gst || '',
        pancard: initialData.pancard || '',
        bankAccount: initialData.bankAccount || '',
        ifscCode: initialData.ifscCode || '',
        creditLimit: initialData.creditLimit || '',
        agentId: initialData.agentId || '',
        agentCommission: initialData.agentCommission || '',
        commissionRate: initialData.commissionRate || ''
      });
      if (initialData.type) {
        setCustomerType(initialData.type === 'retailer' ? 'retailer' : 'direct');
      }
    } else {
      setFormData({
        name: '',
        owner: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gst: '',
        pancard: '',
        bankAccount: '',
        ifscCode: '',
        creditLimit: '',
        agentId: '',
        agentCommission: '',
        commissionRate: ''
      });
    }

    if (isOpen && ['vendor', 'designer', 'stitching-master'].includes(type)) {
      // Load agents from adminAuthService (database-synced)
      adminAuthService.getAllAgents().then(allAgents => {
        console.log('🔍 Loaded agents for dropdown:', allAgents.length);
        setAgents(allAgents);
      }).catch(err => {
        console.error('❌ Error loading agents:', err);
        setAgents([]);
      });
    }
  }, [initialData, isOpen, type]);
  
  if (!isOpen) return null;

  const getTitle = () => {
    const action = initialData ? 'Edit' : 'Add New';
    switch (type) {
      case 'vendor': return `${action} Vendor`;
      case 'buyer': return `${action} Buyer`;
      case 'designer': return `${action} Designer`;
      case 'stitching-master': return `${action} Stitching Master`;
      case 'vendor-agent': return `${action} Vendor Agent`;
      case 'buyer-agent': return `${action} Buyer Agent`;
      case 'designer-agent': return `${action} Designer Agent`;
      default: return `${action} Partner`;
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    try {
      setLoading(true);
      
      // Find agent name if selected
      const selectedAgent = agents.find(a => a.id === formData.agentId);

      await onSubmit({
        ...formData,
        id: initialData?.id, // Pass ID for updates
        type: type === 'buyer' ? customerType : undefined,
        creditLimit: formData.creditLimit ? Number(formData.creditLimit) : 0,
        agentCommission: formData.agentCommission ? Number(formData.agentCommission) : 0,
        commissionRate: formData.commissionRate ? Number(formData.commissionRate) : 0,
        agentName: selectedAgent ? selectedAgent.name : undefined
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isVendor = type === 'vendor' || type.includes('designer') || type.includes('master');
  const isBuyer = type === 'buyer';
  const showAgentSelection = ['vendor', 'designer', 'stitching-master'].includes(type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl my-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basic Info */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 border-b pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Business / Partner Name</label>
                <input 
                  placeholder="e.g. Tashivar Fashions" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person (Owner)</label>
                <input 
                  placeholder="Owner Name" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.owner}
                  onChange={e => setFormData({...formData, owner: e.target.value})}
                />
              </div>

              {isBuyer && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Customer Type</label>
                  <select
                    value={customerType}
                    onChange={e => setCustomerType(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="direct">In-Store / Direct Customer</option>
                    <option value="retailer">Retailer (B2B)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  placeholder="+91..." 
                  className="w-full p-2 border rounded-lg"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  placeholder="email@example.com" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 border-b pb-2">Address Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Address</label>
                <textarea 
                  placeholder="Street, Building, Area..." 
                  className="w-full p-2 border rounded-lg"
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                <input 
                  placeholder="City" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                <input 
                  placeholder="State" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                <input 
                  placeholder="Pincode" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.pincode}
                  onChange={e => setFormData({...formData, pincode: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Financial & Tax */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 border-b pb-2">Financial & Tax Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">GST Number</label>
                <input 
                  placeholder="GSTIN" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.gst}
                  onChange={e => setFormData({...formData, gst: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">PAN Card</label>
                <input 
                  placeholder="PAN Number" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.pancard}
                  onChange={e => setFormData({...formData, pancard: e.target.value})}
                />
              </div>

              {isVendor && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Bank Account Number</label>
                    <input 
                      placeholder="Account Number" 
                      className="w-full p-2 border rounded-lg"
                      value={formData.bankAccount}
                      onChange={e => setFormData({...formData, bankAccount: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input 
                      placeholder="IFSC Code" 
                      className="w-full p-2 border rounded-lg"
                      value={formData.ifscCode}
                      onChange={e => setFormData({...formData, ifscCode: e.target.value})}
                    />
                  </div>
                  
                  {/* Vendor Specific: Commission Rate */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Partner Commission Rate (%)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 10" 
                      className="w-full p-2 border rounded-lg"
                      value={formData.commissionRate}
                      onChange={e => setFormData({...formData, commissionRate: e.target.value})}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">If this partner earns commission (e.g. Designer)</p>
                  </div>
                </>
              )}

              {isBuyer && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Credit Limit (₹)</label>
                  <input 
                    type="number"
                    placeholder="0" 
                    className="w-full p-2 border rounded-lg"
                    value={formData.creditLimit}
                    onChange={e => setFormData({...formData, creditLimit: e.target.value})}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Agent Information */}
          {showAgentSelection && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3 border-b pb-2">Agent Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Associated Agent</label>
                  <SearchableDropdown
                    options={agents.map(agent => ({
                      id: agent.id,
                      label: agent.name,
                      subLabel: agent.phone || agent.type || 'Agent'
                    }))}
                    value={formData.agentId}
                    onChange={(value) => setFormData({...formData, agentId: value})}
                    placeholder="Search and select agent..."
                  />
                </div>
                
                {formData.agentId && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Agent Commission (%)</label>
                    <input 
                      type="number"
                      placeholder="e.g. 5" 
                      className="w-full p-2 border rounded-lg"
                      value={formData.agentCommission}
                      onChange={e => setFormData({...formData, agentCommission: e.target.value})}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Applied on every purchase order</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-500"
          >
            {loading ? 'Saving...' : 'Save Partner'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnerDetailsModal({ partner, onClose, onEdit }: any) {
  if (!partner) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl my-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-gray-600">{partner.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
              <p className="text-xs text-gray-500">{partner.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit(partner)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
            <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Owner / Contact Person</p>
                  <p className="text-sm font-medium text-gray-900">{partner.owner || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{partner.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{partner.phone || 'N/A'}</p>
                </div>
                {partner.type && (
                  <div>
                    <p className="text-xs text-gray-500">Partner Type</p>
                    <span className="inline-block px-2 py-1 mt-1 text-xs font-medium bg-gray-100 rounded-full capitalize">
                      {partner.type.replace('-', ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Address</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Full Address</p>
                  <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{partner.address || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">City</p>
                    <p className="text-sm font-medium text-gray-900">{partner.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">State</p>
                    <p className="text-sm font-medium text-gray-900">{partner.state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pincode</p>
                    <p className="text-sm font-medium text-gray-900">{partner.pincode || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Financial Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">GST Number</p>
                  <p className="text-sm font-medium text-gray-900">{partner.gst || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">PAN Card</p>
                  <p className="text-sm font-medium text-gray-900">{partner.pancard || 'N/A'}</p>
                </div>
                {partner.bankAccount && (
                  <div>
                    <p className="text-xs text-gray-500">Bank Account</p>
                    <p className="text-sm font-medium text-gray-900">{partner.bankAccount}</p>
                  </div>
                )}
                {partner.ifscCode && (
                  <div>
                    <p className="text-xs text-gray-500">IFSC Code</p>
                    <p className="text-sm font-medium text-gray-900">{partner.ifscCode}</p>
                  </div>
                )}
                {partner.creditLimit > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Credit Limit</p>
                    <p className="text-sm font-medium text-emerald-600">₹{partner.creditLimit.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Agent & Commissions</h4>
              <div className="space-y-3">
                {partner.commissionRate > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Partner Commission</p>
                    <p className="text-sm font-medium text-indigo-600">{partner.commissionRate}%</p>
                  </div>
                )}
                {partner.agentId ? (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">Associated Agent</p>
                      <p className="text-sm font-medium text-gray-900">{partner.agentName || 'Linked Agent'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Agent Commission</p>
                      <p className="text-sm font-medium text-indigo-600">{partner.agentCommission || 0}%</p>
                    </div>
                  </>
                ) : (
                   <p className="text-sm text-gray-400 italic">No agent associated</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}