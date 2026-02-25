import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

export async function calculateFinanceSummary(orders: any[], products: any[] = []) {
  const expenses = await getExpenses();
  let totalPurchases = 0;
  let totalSales = 0;
  let totalCommission = 0;
  let pendingPayments = 0;
  let receivables = 0;
  let totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate purchases from Orders (Purchase Orders)
  orders.forEach(order => {
    // Check for Purchase Orders (Internal Inventory)
    if (order.buyerId === 'internal' || order.type === 'purchase') {
      const orderCost = order.products.reduce((sum: number, product: any) => {
        return sum + (product.costPrice * product.quantity);
      }, 0);
      totalPurchases += orderCost;
    } 
    // Sales Orders
    else {
      totalSales += order.subtotal || 0;
      totalCommission += order.commission || 0;
      
      // Receivables (orders delivered but payment pending)
      if (order.status === 'delivered' && order.paymentStatus === 'pending') {
        receivables += order.subtotal || 0;
      }
    }

    // Pending payments (general)
    if (order.paymentStatus === 'pending') {
      if (order.buyerId !== 'internal') {
         pendingPayments += order.subtotal || 0;
      }
    }
  });

  // Calculate purchases from Products (Legacy/Direct Inventory)
  // We add this to reflect the value of stock added directly
  products.forEach(product => {
    if (product.costPrice && product.quantity) {
      // Note: This might double count if the product is also in a Purchase Order.
      // Ideally, we should filter out products that originated from POs if possible.
      // For now, consistent with the Purchases List view which combines both.
       totalPurchases += (product.costPrice * product.quantity);
    }
  });

  const grossProfit = totalSales - totalPurchases;
  const netProfit = grossProfit - totalCommission - totalExpenses;

  // Payables (commission to be paid + pending purchase payments)
  // Approximate pending purchase payments from orders where buyerId='internal' and paymentStatus='pending'
  const pendingPurchasePayments = orders
    .filter(o => (o.buyerId === 'internal' || o.type === 'purchase') && o.paymentStatus === 'pending')
    .reduce((sum, o) => sum + (o.totalAmount || o.subtotal || 0), 0);

  const payables = (totalCommission * 0.3) + pendingPurchasePayments; 

  return {
    totalPurchases,
    totalSales,
    totalCommission,
    totalExpenses,
    grossProfit,
    netProfit,
    pendingPayments, // This is actually Receivables (money incoming pending)? 
    // In original code: pendingPayments += order.subtotal if paymentStatus='pending'.
    // If buyerId != internal, it's money incoming.
    receivables,
    payables
  };
}

// Helper for expenses (localStorage)
function getExpensesFromStorage(): any[] {
  try {
    const stored = localStorage.getItem('tashivar_expenses');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

// Helper to save expenses to localStorage
function saveExpensesToStorage(expenses: any[]): void {
  try {
    localStorage.setItem('tashivar_expenses', JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses to localStorage:', error);
  }
}

// Get all expenses (with Supabase sync)
export async function getExpenses(): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=expenses`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const expenses = data.value || [];
    
    saveExpensesToStorage(expenses);
    console.log('✅ Expenses loaded from Supabase API');
    return expenses;
  } catch (error) {
    // Silently use localStorage fallback
    const expenses = getExpensesFromStorage();
    console.log(`ℹ️ Using localStorage for expenses (${expenses.length} items) - API unavailable`);
    return expenses;
  }
}

// Save all expenses to Supabase (and localStorage backup)
async function saveExpenses(expenses: any[]): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'expenses', value: expenses })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveExpensesToStorage(expenses);
    console.log('✅ Expenses saved to Supabase API');
  } catch (error) {
    console.error('Error saving expenses to API, using localStorage:', error);
    saveExpensesToStorage(expenses);
  }
}

export async function saveExpense(expense: any): Promise<any> {
  const expenses = await getExpenses();
  const newExpense = { 
    ...expense, 
    id: `EXP-${Date.now()}`, 
    date: expense.date || new Date().toISOString().split('T')[0] 
  };
  expenses.unshift(newExpense);
  await saveExpenses(expenses);
  return newExpense;
}

// Extract purchase records from orders
export function extractPurchaseRecords(orders: any[]) {
  const purchases: any[] = [];

  // Filter for Purchase Orders (Stock Purchase)
  // Identifying feature: buyerId is 'internal' or 'Tashivar Inventory' OR explicitly type='purchase'
  const purchaseOrders = orders.filter(o => o.buyerId === 'internal' || o.buyer === 'Tashivar Inventory' || o.type === 'purchase');

  purchaseOrders.forEach(order => {
    order.products.forEach((product: any, index: number) => {
      purchases.push({
        id: `PUR-${order.id}-${index}`,
        orderId: order.id,
        date: order.date || new Date().toISOString().split('T')[0],
        vendor: order.vendor,
        vendorId: order.vendorId,
        product: product.name,
        productType: product.type,
        quantity: product.quantity,
        costPrice: product.costPrice,
        totalCost: product.costPrice * product.quantity,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        commission: order.commission || 0,
        commissionDistribution: order.commissionDistribution || []
      });
    });
  });

  return purchases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Extract sales records from orders
export function extractSalesRecords(orders: any[]) {
  const sales: any[] = [];

  // Filter for Sales Orders (Exclude Internal Purchases)
  // Accept orders with type === 'sale' OR orders without 'purchase' type that have valid buyers
  const salesOrders = orders.filter(o => {
    // Explicit sale type check
    if (o.type === 'sale') return true;
    
    // Legacy check: not a purchase and has a real buyer
    return o.buyerId !== 'internal' && o.buyer !== 'Tashivar Inventory' && o.type !== 'purchase';
  });

  console.log(`💰 Extracting sales from ${orders.length} orders, found ${salesOrders.length} sales orders`);

  salesOrders.forEach(order => {
    order.products.forEach((product: any, index: number) => {
      const totalRevenue = product.sellingPrice * product.quantity;
      const totalCost = (product.costPrice || 0) * product.quantity;
      const profit = totalRevenue - totalCost;

      sales.push({
        id: `SALE-${order.id}-${index}`,
        orderId: order.id,
        date: order.date || new Date().toISOString().split('T')[0],
        buyer: order.buyer,
        buyerId: order.buyerId,
        buyerPhone: order.buyerPhone,
        buyerAddress: order.buyerAddress,
        product: product.name,
        productType: product.type,
        quantity: product.quantity,
        costPrice: product.costPrice || 0,
        sellingPrice: product.sellingPrice,
        totalRevenue,
        totalCost,
        profit,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        salesOrderTracking: order.salesOrderTracking
      });
    });
  });

  return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLedgerEntries(orders: any[], additionalPurchases: any[] = []) {
  const entries: any[] = [];
  const expenses = getExpensesFromStorage();

  // Process Expenses (Debit)
  expenses.forEach(exp => {
    entries.push({
      id: exp.id,
      date: exp.date,
      description: `EXPENSE: ${exp.category} - ${exp.description}`,
      type: 'expense',
      debit: exp.amount,
      credit: 0,
      party: exp.vendor || 'Operational',
      paymentMethod: exp.paymentMethod,
      balance: 0 // Will be calculated later
    });
  });

  // Process Sales (Credit) and Commissions (Debit)
  const salesOrders = orders.filter(o => o.buyerId !== 'internal' && o.buyer !== 'Tashivar Inventory' && o.type !== 'purchase');
  salesOrders.forEach(order => {
    // Sales Revenue (Credit)
    entries.push({
      id: `SALE-${order.id}`,
      date: order.date || new Date().toISOString().split('T')[0],
      description: `SALE: Order #${order.id} to ${order.buyer}`,
      type: 'sale',
      debit: 0,
      credit: order.subtotal,
      party: order.buyer,
      paymentMethod: order.paymentMethod,
      balance: 0
    });

    // Commission Paid (Debit)
    if (order.commission && order.commission > 0) {
      entries.push({
        id: `COMM-${order.id}`,
        date: order.date || new Date().toISOString().split('T')[0],
        description: `COMMISSION: Order #${order.id}`,
        type: 'commission',
        debit: order.commission,
        credit: 0,
        party: 'Multiple Vendors',
        paymentMethod: 'System',
        balance: 0
      });
    }
  });

  // Process Order-based Purchases (Debit)
  const purchaseOrders = orders.filter(o => o.buyerId === 'internal' || o.buyer === 'Tashivar Inventory' || o.type === 'purchase');
  purchaseOrders.forEach(order => {
    let totalCost = 0;
    order.products.forEach((p: any) => {
      totalCost += (p.costPrice * p.quantity);
    });

    entries.push({
      id: `PUR-${order.id}`,
      date: order.date || new Date().toISOString().split('T')[0],
      description: `PURCHASE: Stock from ${order.vendor}`,
      type: 'purchase',
      debit: totalCost,
      credit: 0,
      party: order.vendor,
      paymentMethod: order.paymentMethod,
      balance: 0
    });
  });

  // Process Additional/Legacy Purchases (Debit)
  additionalPurchases.forEach(purchase => {
    entries.push({
      id: `PUR-${purchase.id}`,
      date: purchase.date,
      description: `PURCHASE: ${purchase.product} from ${purchase.vendor}`,
      type: 'purchase',
      debit: purchase.totalCost || purchase.amount,
      credit: 0,
      party: purchase.vendor,
      paymentMethod: purchase.paymentMethod,
      balance: 0
    });
  });

  // Sort by Date Ascending for Balance Calculation
  entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate Running Balance
  let balance = 0;
  return entries.map(entry => {
    balance += (entry.credit - entry.debit);
    return { ...entry, balance };
  }).reverse(); // Return most recent first
}

// Get product-wise performance
export function getProductPerformance(orders: any[]) {
  const productMap = new Map();

  orders.forEach(order => {
    order.products.forEach((product: any) => {
      const key = product.id;
      
      if (!productMap.has(key)) {
        productMap.set(key, {
          productId: product.id,
          productName: product.name,
          productType: product.type,
          totalQuantitySold: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          orderCount: 0
        });
      }

      const stats = productMap.get(key);
      stats.totalQuantitySold += product.quantity;
      stats.totalRevenue += product.sellingPrice * product.quantity;
      stats.totalCost += product.costPrice * product.quantity;
      stats.totalProfit += (product.sellingPrice - product.costPrice) * product.quantity;
      stats.orderCount += 1;
    });
  });

  return Array.from(productMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// Get vendor-wise performance
export function getVendorPerformance(orders: any[]) {
  const vendorMap = new Map();

  orders.forEach(order => {
    const key = order.vendorId;

    if (!vendorMap.has(key)) {
      vendorMap.set(key, {
        vendorId: order.vendorId,
        vendorName: order.vendor,
        totalOrders: 0,
        totalPurchases: 0,
        totalCommissionPaid: 0,
        productCount: 0
      });
    }

    const stats = vendorMap.get(key);
    stats.totalOrders += 1;
    
    order.products.forEach((product: any) => {
      stats.totalPurchases += product.costPrice * product.quantity;
      stats.productCount += product.quantity;
    });
    
    stats.totalCommissionPaid += order.commission || 0;
  });

  return Array.from(vendorMap.values()).sort((a, b) => b.totalPurchases - a.totalPurchases);
}

// Get buyer-wise performance
export function getBuyerPerformance(orders: any[]) {
  const buyerMap = new Map();

  orders.forEach(order => {
    const key = order.buyerId;

    if (!buyerMap.has(key)) {
      buyerMap.set(key, {
        buyerId: order.buyerId,
        buyerName: order.buyer,
        totalOrders: 0,
        totalSpent: 0,
        totalProfit: 0
      });
    }

    const stats = buyerMap.get(key);
    stats.totalOrders += 1;
    stats.totalSpent += order.subtotal || 0;
    stats.totalProfit += order.profit || 0;
  });

  return Array.from(buyerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

// Get monthly revenue trends
export function getMonthlyTrends(orders: any[]) {
  const monthMap = new Map();

  orders.forEach(order => {
    const date = new Date(order.date || Date.now());
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthKey,
        revenue: 0,
        profit: 0,
        orders: 0
      });
    }

    const stats = monthMap.get(monthKey);
    stats.revenue += order.subtotal || 0;
    stats.profit += order.profit || 0;
    stats.orders += 1;
  });

  return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
}

// --- GST & Advanced Accounting Functions ---

export function getHomeState(): string {
  const settings = getCompanySettings();
  return settings.state || 'Gujarat';
}

export function setHomeState(state: string) {
  const settings = getCompanySettings();
  settings.state = state;
  setCompanySettings(settings);
}

export function getCompanySettings() {
  try {
    const stored = localStorage.getItem('tashivar_company_settings');
    return stored ? JSON.parse(stored) : {
      legalName: 'Tashivar B2B',
      tradeName: 'Tashivar',
      gstin: '24BIKPJ7559L1ZN',
      address: '123 Fashion Street, Silk Market, Ring Road, Surat',
      state: 'Gujarat',
      stateCode: '24',
      phone: '8460624650, 8460718505',
      email: 'support@tashivar.com',
      bankName: 'HDFC BANK',
      accountNumber: '50200074639826',
      ifsc: 'HDFC0009027',
      branch: 'SAHARA DARWAJA',
      defaultGstRate: 5,
      terms: [
        "Payment to be made by A/c. Payee's cheque or demand draft only.",
        "Any complaint for the goods should be made within 15 days after that no complaint will be entertained.",
        "Interest @24 % p.a. will be charged after the due date of the bill.",
        "Subject to SURAT Jurisdiction Only."
      ]
    };
  } catch (err) {
    return {};
  }
}

export function setCompanySettings(settings: any) {
  localStorage.setItem('tashivar_company_settings', JSON.stringify(settings));
}

// Helper: Calculate Tax Breakdown
function calculateTaxBreakdown(amount: number, taxRate: number = 5, placeOfSupply: string, homeState: string = getHomeState()) {
  const taxableValue = amount / (1 + (taxRate / 100));
  const taxAmount = amount - taxableValue;
  
  // Normalize strings
  const pos = placeOfSupply?.toLowerCase().trim() || '';
  const home = homeState.toLowerCase().trim();
  
  // Check if Intra-state (Same State)
  // Logic: if pos contains home state name OR home state code (e.g. MH)
  // This is a simplified check. In production, use strict State Codes (27 for MH).
  const isIntraState = pos === '' || pos.includes(home);
  
  return {
    taxableValue: parseFloat(taxableValue.toFixed(2)),
    taxAmount: parseFloat(taxAmount.toFixed(2)),
    cgst: isIntraState ? parseFloat((taxAmount / 2).toFixed(2)) : 0,
    sgst: isIntraState ? parseFloat((taxAmount / 2).toFixed(2)) : 0,
    igst: !isIntraState ? parseFloat(taxAmount.toFixed(2)) : 0,
    isInterState: !isIntraState,
    homeState: homeState // Return for UI display
  };
}

export function getGSTR1Report(orders: any[]) {
  // Filter for Sales (Outward Supplies)
  const salesOrders = orders.filter(o => o.buyerId !== 'internal' && o.buyer !== 'Tashivar Inventory' && o.type !== 'purchase' && o.status !== 'cancelled');
  const settings = getCompanySettings();
  const defaultRate = settings.defaultGstRate || 5;

  const b2b: any[] = [];
  const b2cLarge: any[] = [];
  const b2cSmall: any[] = [];
  
  salesOrders.forEach(order => {
    // Determine GST Rate (Default 5% for textiles)
    const taxRate = order.taxRate || defaultRate; 
    // Prioritize explicit placeOfSupply, then buyerAddress, then fallback to Home State (Intra)
    const pos = order.placeOfSupply || order.buyerAddress || getHomeState();
    const taxInfo = calculateTaxBreakdown(order.subtotal || 0, taxRate, pos);

    const entry = {
      invoiceNumber: order.id,
      invoiceDate: order.date,
      invoiceValue: order.subtotal,
      placeOfSupply: pos,
      rate: taxRate,
      taxableValue: taxInfo.taxableValue,
      cess: 0,
      gstin: order.buyerGst || '', // Needs to be captured in order
      customerName: order.buyer
    };

    // Classify
    if (entry.gstin && entry.gstin.length > 5) {
      b2b.push({ ...entry, ...taxInfo });
    } else if (order.subtotal > 250000 && taxInfo.isInterState) {
      b2cLarge.push({ ...entry, ...taxInfo });
    } else {
      b2cSmall.push({ ...entry, ...taxInfo });
    }
  });

  return { b2b, b2cLarge, b2cSmall, all: [...b2b, ...b2cLarge, ...b2cSmall] };
}

export function getGSTR3BReport(orders: any[], purchases: any[]) {
  const gstr1 = getGSTR1Report(orders);
  
  // 3.1 Details of Outward Supplies
  const outward = gstr1.all.reduce((acc, curr) => ({
    taxable: acc.taxable + curr.taxableValue,
    igst: acc.igst + curr.igst,
    cgst: acc.cgst + curr.cgst,
    sgst: acc.sgst + curr.sgst
  }), { taxable: 0, igst: 0, cgst: 0, sgst: 0 });

  // 4. Eligible ITC (Purchases)
  const itc = purchases.reduce((acc, curr) => {
    // Simplified purchase tax logic
    const amount = curr.totalCost || curr.amount || 0;
    const taxInfo = calculateTaxBreakdown(amount, 5, curr.vendorAddress || '', getHomeState()); // Need vendor address in purchases
    
    return {
      taxable: acc.taxable + taxInfo.taxableValue,
      igst: acc.igst + taxInfo.igst,
      cgst: acc.cgst + taxInfo.cgst,
      sgst: acc.sgst + taxInfo.sgst
    };
  }, { taxable: 0, igst: 0, cgst: 0, sgst: 0 });

  return {
    outwardSupplies: outward,
    eligibleITC: itc,
    taxPayable: {
      igst: Math.max(0, outward.igst - itc.igst),
      cgst: Math.max(0, outward.cgst - itc.cgst),
      sgst: Math.max(0, outward.sgst - itc.sgst)
    }
  };
}

// Generate Excel-compatible CSV for Tally Import (Standard 'Sales Register' format)
export function generateTallySalesCSV(orders: any[]) {
  const sales = getGSTR1Report(orders).all;
  
  const header = "Date,Voucher Type,Voucher No,Party Name,GSTIN/UIN,Place of Supply,Product Name,Qty,Rate,Taxable Value,CGST Amount,SGST Amount,IGST Amount,Total Invoice Amount\n";
  
  const rows = sales.map(s => {
    // Find original order to get product details (simplified to first product or aggregated)
    return `${s.invoiceDate},Sales,${s.invoiceNumber},"${s.customerName}",${s.gstin},"${s.placeOfSupply}","Textile Goods",1,${s.taxableValue},${s.taxableValue},${s.cgst},${s.sgst},${s.igst},${s.invoiceValue}`;
  }).join("\n");

  return header + rows;
}

// Generate Zoho Books 'Invoices' CSV Import Format
export function generateZohoSalesCSV(orders: any[]) {
  const sales = getGSTR1Report(orders).all;
  
  // Zoho standard columns (minimal required)
  const header = "Invoice Number,Invoice Date,Customer Name,Place of Supply,Item Name,Item Price,Item Tax %,Item Tax Amount,Total\n";
  
  const rows = sales.map(s => {
    return `${s.invoiceNumber},${s.invoiceDate},"${s.customerName}","${s.placeOfSupply}","Textile Goods",${s.taxableValue},${s.rate},${(s.cgst + s.sgst + s.igst).toFixed(2)},${s.invoiceValue}`;
  }).join("\n");

  return header + rows;
}

// Generate Zoho Books 'Bills' (Purchases) CSV Import Format
export function generateZohoPurchaseCSV(purchases: any[]) {
  const header = "Bill Number,Bill Date,Vendor Name,Item Name,Account,Quantity,Rate,Tax %,Total\n";
  
  const rows = purchases.map(p => {
    return `${p.id},${p.date},"${p.vendor}","${p.product || 'Material'}","Cost of Goods Sold",${p.quantity || 1},${p.costPrice || p.amount || 0},5,${p.totalCost || p.amount || 0}`;
  }).join("\n");

  return header + rows;
}