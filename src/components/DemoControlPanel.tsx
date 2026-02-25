import React, { useState } from 'react';
import { Play, Trash2, Package, CheckCircle, AlertCircle, Loader, Database, Zap } from 'lucide-react';
import { setupDemoData, demoCompleteWorkflow, clearDemoData } from '../utils/demoDataSetup';
import { initializeDemoData, clearAllData } from '../utils/initializeDemoData';
import { quickDemoSetup, clearDemoData as clearQuickDemo, hasDemoData } from '../utils/quickDemoSetup';

interface DemoControlPanelProps {
  onDataUpdated?: () => void;
}

export function DemoControlPanel({ onDataUpdated }: DemoControlPanelProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleSetupDemo = async () => {
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Setting up demo data...' });
      
      await setupDemoData();
      
      setMessage({ type: 'success', text: '✅ Demo data created successfully! 5 orders added.' });
      
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Error setting up demo:', error);
      setMessage({ type: 'error', text: '❌ Failed to setup demo data. Check console for details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDatabase = async () => {
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Initializing complete database with vendors, buyers, products, and orders...' });
      
      const result = await initializeDemoData();
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ Database initialized! Created ${result.stats?.vendors} vendors, ${result.stats?.buyers} buyers, ${result.stats?.products} products, and ${result.stats?.orders} orders.`
        });
      } else {
        setMessage({ type: 'error', text: `❌ ${result.message}` });
      }
      
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      setMessage({ type: 'error', text: '❌ Failed to initialize database. Check console for details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkflow = async () => {
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Running complete workflow demo (8 steps)...' });
      
      await demoCompleteWorkflow();
      
      setMessage({ type: 'success', text: '🎉 Complete workflow demo finished! Check the orders tab to see the completed order.' });
      
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Error in workflow demo:', error);
      setMessage({ type: 'error', text: '❌ Workflow demo failed. Check console for details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all orders? This cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Clearing all data...' });
      
      await clearDemoData();
      
      setMessage({ type: 'success', text: '✅ All data cleared successfully!' });
      
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      setMessage({ type: 'error', text: '❌ Failed to clear data. Check console for details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSetup = async () => {
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Setting up quick demo data...' });
      
      const result = quickDemoSetup();
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ Quick demo created! ${result.stats?.vendors} vendors, ${result.stats?.buyers} buyers, ${result.stats?.products} products, ${result.stats?.orders} orders.`
        });
      } else {
        setMessage({ type: 'error', text: `❌ ${result.message}` });
      }
      
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Error setting up quick demo:', error);
      setMessage({ type: 'error', text: '❌ Failed to setup quick demo data. Check console for details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearQuickDemo = () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Clearing all data...' });
      
      clearQuickDemo();
      
      setMessage({ type: 'success', text: '✅ All data cleared successfully!' });
      
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      setMessage({ type: 'error', text: '❌ Failed to clear data. Check console for details.' });
    } finally {
      setLoading(false);
    }
  };

  const getMessageStyles = () => {
    if (!message) return '';
    
    switch (message.type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <Play className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Demo Control Panel</h3>
          <p className="text-sm text-gray-600">Quick setup for customer demonstration</p>
        </div>
      </div>

      {message && (
        <div className={`border rounded-lg p-3 mb-4 flex items-start gap-2 ${getMessageStyles()}`}>
          {message.type === 'success' && <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" strokeWidth={2} />}
          {message.type === 'error' && <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" strokeWidth={2} />}
          {message.type === 'info' && <Loader className="w-5 h-5 mt-0.5 flex-shrink-0 animate-spin" strokeWidth={2} />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-3">
        <button
          onClick={handleQuickDemoSetup}
          disabled={loading}
          className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-violet-500 to-indigo-600 border-2 border-violet-300 rounded-lg hover:from-violet-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-white">Quick Demo Setup</p>
            <p className="text-xs text-violet-100 mt-1">Instant data ⚡</p>
          </div>
        </button>

        <button
          onClick={handleSetupDemo}
          disabled={loading}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-violet-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-violet-600" strokeWidth={2} />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">Setup Demo Data</p>
            <p className="text-xs text-gray-600 mt-1">Create 5 sample orders</p>
          </div>
        </button>

        <button
          onClick={handleCompleteWorkflow}
          disabled={loading}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-emerald-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-600" strokeWidth={2} />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">Run Full Workflow</p>
            <p className="text-xs text-gray-600 mt-1">Demo all 8 stages</p>
          </div>
        </button>

        <button
          onClick={handleClearData}
          disabled={loading}
          className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-rose-200 rounded-lg hover:border-rose-400 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-rose-600" strokeWidth={2} />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-900">Clear All Data</p>
            <p className="text-xs text-gray-600 mt-1">Remove all data</p>
          </div>
        </button>
      </div>

      <div className="mt-4 p-3 bg-white/60 rounded-lg border border-violet-200">
        <p className="text-xs text-gray-600">
          <strong className="text-gray-900">Demo Guide:</strong><br/>
          1. Click "Quick Demo Setup" for instant demo data (works offline!) ⚡<br/>
          2. Click "Setup Demo Data" to create 5 sample orders in different stages<br/>
          3. Click "Run Full Workflow" to see a complete order lifecycle (8 automated steps)<br/>
          4. Navigate through different tabs to explore features<br/>
          5. Use "Clear All Data" to reset when starting a new demo
        </p>
      </div>
    </div>
  );
}