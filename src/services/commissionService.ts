import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

export interface CommissionRule {
  id: string;
  productId: string;
  productName: string;
  type: 'single' | 'multi';
  parties?: Array<{
    role: string;
    name: string;
    phone: string;
    percentage: number;
    amount?: number;
  }>;
  // New fields for split commission
  saleCommissionRate?: number;
  saleDistribution?: Array<{
    role: string;
    name: string;
    phone: string;
    percentage: number;
  }>;
  purchaseCommissionRate?: number;
  purchaseDistribution?: Array<{
    role: string;
    name: string;
    phone: string;
    percentage: number;
  }>;
  totalCommissionPercentage: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CommissionTransaction {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  orderDate: string;
  buyer: string;
  buyerId: string;
  totalAmount: number;
  commissionAmount: number;
  distribution: Array<{
    party: string;
    role: string;
    percentage: number;
    amount: number;
    status: 'pending' | 'paid';
  }>;
  status: 'pending' | 'partially-paid' | 'paid';
  createdAt?: string;
  updatedAt?: string;
}

// Helper functions for localStorage fallback
function getCommissionRulesFromStorage(): CommissionRule[] {
  try {
    const stored = localStorage.getItem('tashivar_commission_rules');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading commission rules from localStorage:', error);
    return [];
  }
}

function saveCommissionRulesToStorage(rules: CommissionRule[]): void {
  try {
    localStorage.setItem('tashivar_commission_rules', JSON.stringify(rules));
  } catch (error) {
    console.error('Error saving commission rules to localStorage:', error);
  }
}

function getCommissionTransactionsFromStorage(): CommissionTransaction[] {
  try {
    const stored = localStorage.getItem('tashivar_commission_transactions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading commission transactions from localStorage:', error);
    return [];
  }
}

function saveCommissionTransactionsToStorage(transactions: CommissionTransaction[]): void {
  try {
    localStorage.setItem('tashivar_commission_transactions', JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving commission transactions to localStorage:', error);
  }
}

// Get all commission rules
export async function getAllCommissionRules(): Promise<CommissionRule[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=commission_rules`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const rules = data.value || [];
    
    saveCommissionRulesToStorage(rules);
    console.log('✅ Commission rules loaded from Supabase API');
    return rules;
  } catch (error) {
    // Silently use localStorage fallback - this is expected behavior
    const rules = getCommissionRulesFromStorage();
    console.log(`ℹ️ Using localStorage for commission rules (${rules.length} items) - API unavailable`);
    return rules;
  }
}

// Create commission rule
export async function createCommissionRule(ruleData: Partial<CommissionRule>): Promise<CommissionRule> {
  const newRule: CommissionRule = {
    id: ruleData.id || `COM-${Date.now()}`,
    productId: ruleData.productId!,
    productName: ruleData.productName!,
    type: ruleData.type!,
    parties: ruleData.parties,
    saleCommissionRate: ruleData.saleCommissionRate || 0,
    saleDistribution: ruleData.saleDistribution || [],
    purchaseCommissionRate: ruleData.purchaseCommissionRate || 0,
    purchaseDistribution: ruleData.purchaseDistribution || [],
    totalCommissionPercentage: ruleData.totalCommissionPercentage || 0,
    status: ruleData.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    const rules = await getAllCommissionRules();
    // Remove existing rule for the same product if any
    const filtered = rules.filter(r => r.productId !== newRule.productId);
    filtered.unshift(newRule);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'commission_rules', value: filtered })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveCommissionRulesToStorage(filtered);
    return newRule;
  } catch (error) {
    console.error('Error creating commission rule via API, using localStorage:', error);
    const rules = getCommissionRulesFromStorage();
    const filtered = rules.filter(r => r.productId !== newRule.productId);
    filtered.unshift(newRule);
    saveCommissionRulesToStorage(filtered);
    return newRule;
  }
}

// Get commission rule by product
export async function getCommissionRuleByProduct(productId: string): Promise<CommissionRule | null> {
  const rules = await getAllCommissionRules();
  return rules.find(r => r.productId === productId && r.status === 'active') || null;
}

// Update commission rule
export async function updateCommissionRule(ruleId: string, updates: Partial<CommissionRule>): Promise<CommissionRule> {
  try {
    const rules = await getAllCommissionRules();
    const index = rules.findIndex(r => r.id === ruleId);
    
    if (index === -1) {
      throw new Error('Commission rule not found');
    }
    
    rules[index] = {
      ...rules[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'commission_rules', value: rules })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveCommissionRulesToStorage(rules);
    return rules[index];
  } catch (error) {
    console.error('Error updating commission rule via API, using localStorage:', error);
    const rules = getCommissionRulesFromStorage();
    const index = rules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      rules[index] = { ...rules[index], ...updates, updatedAt: new Date().toISOString() };
      saveCommissionRulesToStorage(rules);
      return rules[index];
    }
    throw error;
  }
}

// Get all commission transactions
export async function getAllCommissionTransactions(): Promise<CommissionTransaction[]> {
  try {
    const response = await fetch(`${API_URL}/kv?key=commission_transactions`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const transactions = data.value || [];
    
    saveCommissionTransactionsToStorage(transactions);
    console.log('✅ Commission transactions loaded from Supabase API');
    return transactions;
  } catch (error) {
    // Silently use localStorage fallback - this is expected behavior
    const transactions = getCommissionTransactionsFromStorage();
    console.log(`ℹ️ Using localStorage for commission transactions (${transactions.length} items) - API unavailable`);
    return transactions;
  }
}

// Create commission transaction (when order is placed)
export async function createCommissionTransaction(transactionData: Partial<CommissionTransaction>): Promise<CommissionTransaction> {
  const newTransaction: CommissionTransaction = {
    id: transactionData.id || `COMTXN-${Date.now()}`,
    orderId: transactionData.orderId!,
    productId: transactionData.productId!,
    productName: transactionData.productName!,
    orderDate: transactionData.orderDate || new Date().toISOString().split('T')[0],
    buyer: transactionData.buyer!,
    buyerId: transactionData.buyerId!,
    totalAmount: transactionData.totalAmount!,
    commissionAmount: transactionData.commissionAmount!,
    distribution: transactionData.distribution!,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    const transactions = await getAllCommissionTransactions();
    transactions.unshift(newTransaction);
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'commission_transactions', value: transactions })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveCommissionTransactionsToStorage(transactions);
    return newTransaction;
  } catch (error) {
    console.error('Error creating commission transaction via API, using localStorage:', error);
    const transactions = getCommissionTransactionsFromStorage();
    transactions.unshift(newTransaction);
    saveCommissionTransactionsToStorage(transactions);
    return newTransaction;
  }
}

// Mark commission as paid for a specific party
export async function markCommissionPaid(transactionId: string, partyName: string): Promise<CommissionTransaction> {
  try {
    const transactions = await getAllCommissionTransactions();
    const index = transactions.findIndex(t => t.id === transactionId);
    
    if (index === -1) {
      throw new Error('Commission transaction not found');
    }
    
    const transaction = transactions[index];
    const updatedDistribution = transaction.distribution.map(d => 
      d.party === partyName ? { ...d, status: 'paid' as const } : d
    );
    
    const allPaid = updatedDistribution.every(d => d.status === 'paid');
    const somePaid = updatedDistribution.some(d => d.status === 'paid');
    
    transactions[index] = {
      ...transaction,
      distribution: updatedDistribution,
      status: allPaid ? 'paid' : (somePaid ? 'partially-paid' : 'pending'),
      updatedAt: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ key: 'commission_transactions', value: transactions })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    saveCommissionTransactionsToStorage(transactions);
    return transactions[index];
  } catch (error) {
    console.error('Error updating commission transaction via API, using localStorage:', error);
    const transactions = getCommissionTransactionsFromStorage();
    const index = transactions.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      const transaction = transactions[index];
      const updatedDistribution = transaction.distribution.map(d => 
        d.party === partyName ? { ...d, status: 'paid' as const } : d
      );
      const allPaid = updatedDistribution.every(d => d.status === 'paid');
      const somePaid = updatedDistribution.some(d => d.status === 'paid');
      transactions[index] = {
        ...transaction,
        distribution: updatedDistribution,
        status: allPaid ? 'paid' : (somePaid ? 'partially-paid' : 'pending'),
        updatedAt: new Date().toISOString()
      };
      saveCommissionTransactionsToStorage(transactions);
      return transactions[index];
    }
    throw error;
  }
}

// Get commission summary
export async function getCommissionSummary() {
  const transactions = await getAllCommissionTransactions();
  
  let totalCommission = 0;
  let pendingCommission = 0;
  let paidCommission = 0;
  const partyBreakdown = new Map<string, { pending: number; paid: number }>();
  
  transactions.forEach(txn => {
    totalCommission += txn.commissionAmount;
    
    txn.distribution.forEach(dist => {
      if (!partyBreakdown.has(dist.party)) {
        partyBreakdown.set(dist.party, { pending: 0, paid: 0 });
      }
      
      const stats = partyBreakdown.get(dist.party)!;
      if (dist.status === 'paid') {
        stats.paid += dist.amount;
        paidCommission += dist.amount;
      } else {
        stats.pending += dist.amount;
        pendingCommission += dist.amount;
      }
    });
  });
  
  return {
    totalCommission,
    pendingCommission,
    paidCommission,
    partyBreakdown: Array.from(partyBreakdown.entries()).map(([party, stats]) => ({
      party,
      ...stats
    }))
  };
}