// Manual Data Recovery Utility
// This file provides manual recovery functions that can be run from browser console

import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

/**
 * Manual recovery function - can be called from browser console
 * Usage: window.recoverOfflineData()
 */
export async function recoverOfflineData() {
  console.log('🔧 MANUAL DATA RECOVERY TOOL');
  console.log('============================');
  
  const possibleKeys = [
    'offline_requests',
    'inquiries',
    'offline_orders',
    'tashivar_offline_requests',
    'system_offline_orders'
  ];
  
  const results: any = {
    api: {},
    localStorage: {}
  };
  
  // Check API
  console.log('\n📡 Checking API Database...');
  for (const key of possibleKeys) {
    try {
      const response = await fetch(`${API_URL}/kv?key=${key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const count = Array.isArray(data.value) ? data.value.length : 0;
        results.api[key] = { found: !!data.value, count, data: data.value };
        
        if (count > 0) {
          console.log(`  ✅ ${key}: ${count} records`);
        } else {
          console.log(`  ○ ${key}: empty`);
        }
      } else {
        console.log(`  ✗ ${key}: not found`);
        results.api[key] = { found: false, count: 0 };
      }
    } catch (error) {
      console.log(`  ✗ ${key}: error - ${error}`);
      results.api[key] = { found: false, error: String(error) };
    }
  }
  
  // Check localStorage
  console.log('\n💾 Checking Browser LocalStorage...');
  for (const key of possibleKeys) {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        const count = Array.isArray(parsed) ? parsed.length : 0;
        results.localStorage[key] = { found: true, count, data: parsed };
        
        if (count > 0) {
          console.log(`  ✅ ${key}: ${count} records`);
        } else {
          console.log(`  ○ ${key}: empty`);
        }
      } else {
        console.log(`  ✗ ${key}: not found`);
        results.localStorage[key] = { found: false, count: 0 };
      }
    } catch (error) {
      console.log(`  ✗ ${key}: error - ${error}`);
      results.localStorage[key] = { found: false, error: String(error) };
    }
  }
  
  // Show all localStorage keys
  console.log('\n🗂️  All LocalStorage Keys:');
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    console.log(`  • ${key}`);
  });
  
  console.log('\n============================');
  console.log('📊 RECOVERY RESULTS:');
  console.log('Full results object:', results);
  
  // Find data
  const foundInApi = Object.entries(results.api).find(([key, val]: any) => val.count > 0);
  const foundInLocal = Object.entries(results.localStorage).find(([key, val]: any) => val.count > 0);
  
  if (foundInApi) {
    console.log(`\n✅ DATA FOUND in API: ${foundInApi[0]} (${foundInApi[1].count} records)`);
    console.log('Sample record:', foundInApi[1].data[0]);
  }
  
  if (foundInLocal) {
    console.log(`\n✅ DATA FOUND in localStorage: ${foundInLocal[0]} (${foundInLocal[1].count} records)`);
    console.log('Sample record:', foundInLocal[1].data[0]);
  }
  
  if (!foundInApi && !foundInLocal) {
    console.log('\n❌ NO DATA FOUND in any location');
    console.log('💡 Your data may have been cleared or never saved');
  }
  
  return results;
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).recoverOfflineData = recoverOfflineData;
  
  // Show helpful message in console
  console.log('%c🔧 DATA RECOVERY TOOL AVAILABLE', 'background: #f59e0b; color: white; padding: 8px 12px; border-radius: 4px; font-weight: bold; font-size: 14px;');
  console.log('%cYour offline orders may have been stored under old keys:', 'font-size: 12px; color: #78716c;');
  console.log('%c  • offline_requests', 'font-family: monospace; color: #059669; font-size: 11px;');
  console.log('%c  • inquiries', 'font-family: monospace; color: #059669; font-size: 11px;');
  console.log('');
  console.log('%cTo search for your data, run:', 'font-size: 12px; color: #78716c;');
  console.log('%c  recoverOfflineData()', 'font-family: monospace; background: #f3f4f6; padding: 4px 8px; color: #1f2937; font-size: 13px;');
  console.log('');
  console.log('%cThis will search the API database and localStorage for your missing data.', 'font-size: 11px; color: #9ca3af;');
}