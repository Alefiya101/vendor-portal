// EMERGENCY DATA RECOVERY - Find ALL possible data locations
import { projectId, publicAnonKey } from './supabase/info';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;

/**
 * EMERGENCY: List ALL keys in the database
 */
export async function listAllDatabaseKeys() {
  console.log('%c🚨 EMERGENCY RECOVERY: SCANNING ALL DATABASE KEYS', 'background: #dc2626; color: white; padding: 8px; font-weight: bold; font-size: 14px;');
  
  try {
    const response = await fetch(`${API_URL}/kv/all-keys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 ALL DATABASE KEYS:', data);
      return data;
    } else {
      console.error('❌ Could not fetch database keys');
    }
  } catch (error) {
    console.error('❌ Error fetching database keys:', error);
  }
  
  return null;
}

/**
 * EMERGENCY: Scan ALL localStorage for any data that looks like orders
 */
export async function scanAllLocalStorage() {
  console.log('%c🔍 SCANNING ALL LOCALSTORAGE', 'background: #2563eb; color: white; padding: 6px; font-weight: bold;');
  
  const results: any = {};
  
  // Get all keys
  const allKeys = Object.keys(localStorage);
  console.log(`\n📋 Found ${allKeys.length} localStorage keys:\n`);
  
  for (const key of allKeys) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;
      
      // Try to parse as JSON
      let parsed;
      try {
        parsed = JSON.parse(value);
      } catch {
        // Not JSON, show first 100 chars
        console.log(`  • ${key}: "${value.substring(0, 100)}..."`);
        continue;
      }
      
      // Check if it's an array with objects
      if (Array.isArray(parsed)) {
        console.log(`  ✅ ${key}: ARRAY with ${parsed.length} items`);
        if (parsed.length > 0) {
          console.log(`     Sample:`, parsed[0]);
          results[key] = parsed;
        }
      } else if (typeof parsed === 'object') {
        console.log(`  • ${key}: OBJECT`);
        console.log(`     Keys:`, Object.keys(parsed).join(', '));
      } else {
        console.log(`  • ${key}: ${typeof parsed}`);
      }
    } catch (error) {
      console.log(`  ✗ ${key}: Error reading`);
    }
  }
  
  return results;
}

/**
 * EMERGENCY: Try to fetch data from ALL possible keys
 */
export async function scanAllPossibleKeys() {
  console.log('%c🔎 DEEP SCAN: CHECKING ALL POSSIBLE KEYS', 'background: #7c3aed; color: white; padding: 6px; font-weight: bold;');
  
  const possibleKeys = [
    // Current
    'offline_orders',
    'tashivar_offline_orders',
    
    // Old names
    'offline_requests',
    'offlineRequests',
    'offline-requests',
    
    // Inquiries
    'inquiries',
    'inquiry',
    'offline_inquiries',
    'offlineInquiries',
    'tashivar_inquiries',
    
    // System
    'system_offline_orders',
    'system_orders',
    'system_requests',
    
    // Alternative spellings
    'requests',
    'orders',
    'offline',
    
    // With prefix
    'tashivar_offline_requests',
    'tashivar_requests',
    'tashivar_offline',
  ];
  
  const foundData: any = {};
  
  console.log(`\n🔍 Checking ${possibleKeys.length} possible keys...\n`);
  
  for (const key of possibleKeys) {
    try {
      // Check API
      const response = await fetch(`${API_URL}/kv?key=${key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.value) {
          const count = Array.isArray(data.value) ? data.value.length : 'object';
          console.log(`  ✅ API["${key}"]: ${count} ${Array.isArray(data.value) ? 'items' : ''}`);
          if (Array.isArray(data.value) && data.value.length > 0) {
            console.log(`     Sample:`, data.value[0]);
            foundData[key] = data.value;
          }
        }
      }
      
      // Check localStorage
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`  ✅ localStorage["${key}"]: ${parsed.length} items`);
            console.log(`     Sample:`, parsed[0]);
            foundData[`localStorage_${key}`] = parsed;
          }
        } catch {}
      }
    } catch (error) {
      // Silent fail, continue checking
    }
  }
  
  console.log('\n============================');
  if (Object.keys(foundData).length > 0) {
    console.log('%c✅ FOUND DATA!', 'background: #16a34a; color: white; padding: 6px; font-weight: bold; font-size: 14px;');
    console.log('Data found in:', Object.keys(foundData));
    return foundData;
  } else {
    console.log('%c❌ NO DATA FOUND', 'background: #dc2626; color: white; padding: 6px; font-weight: bold;');
    return null;
  }
}

/**
 * RUN COMPLETE EMERGENCY RECOVERY
 */
export async function emergencyRecovery() {
  console.clear();
  console.log('%c🚨 EMERGENCY DATA RECOVERY SYSTEM', 'background: #dc2626; color: white; padding: 12px; font-weight: bold; font-size: 16px;');
  console.log('%cSearching for your lost offline orders/inquiries...', 'font-size: 12px; color: #666; margin-bottom: 20px;');
  console.log('\n');
  
  // Step 1: Scan localStorage
  const localData = await scanAllLocalStorage();
  
  console.log('\n\n');
  
  // Step 2: Deep scan all possible keys
  const foundData = await scanAllPossibleKeys();
  
  console.log('\n\n');
  console.log('%c📊 RECOVERY SUMMARY', 'background: #0891b2; color: white; padding: 8px; font-weight: bold;');
  
  if (foundData && Object.keys(foundData).length > 0) {
    console.log('%c✅ YOUR DATA WAS FOUND!', 'color: #16a34a; font-weight: bold; font-size: 14px;');
    console.log('\nData locations:');
    Object.entries(foundData).forEach(([key, value]: any) => {
      console.log(`  • ${key}: ${value.length} records`);
    });
    console.log('\n💾 Full data object:', foundData);
    
    // Offer to restore
    console.log('\n%c🔄 TO RESTORE THIS DATA:', 'background: #f59e0b; color: white; padding: 6px; font-weight: bold;');
    console.log('Run: restoreData(foundData)');
    console.log('Or copy the data above and tell the assistant where it was found.');
    
    return foundData;
  } else {
    console.log('%c❌ No data found in any location', 'color: #dc2626; font-weight: bold;');
    console.log('\nPossible reasons:');
    console.log('  1. Data was never saved (only kept in memory)');
    console.log('  2. Browser cache/localStorage was cleared');
    console.log('  3. Different browser/device was used');
    console.log('  4. Data was saved under a completely different key');
    console.log('\n💡 Next steps:');
    console.log('  • Check browser history for the page URL');
    console.log('  • Check if you have screenshots of the data');
    console.log('  • Let me know what you remember about the inquiries');
    
    return null;
  }
}

/**
 * Restore found data to the current key
 */
export async function restoreData(foundData: any) {
  console.log('%c🔄 RESTORING DATA...', 'background: #7c3aed; color: white; padding: 6px; font-weight: bold;');
  
  // Find the best data source (prefer API over localStorage, prefer non-empty arrays)
  let bestKey = null;
  let bestData = null;
  let maxLength = 0;
  
  for (const [key, value] of Object.entries(foundData)) {
    if (Array.isArray(value) && (value as any[]).length > maxLength) {
      maxLength = (value as any[]).length;
      bestKey = key;
      bestData = value;
    }
  }
  
  if (!bestData) {
    console.error('❌ No valid data to restore');
    return false;
  }
  
  console.log(`✅ Restoring ${maxLength} records from: ${bestKey}`);
  
  try {
    // Save to API
    const response = await fetch(`${API_URL}/kv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ 
        key: 'offline_orders', 
        value: bestData 
      })
    });
    
    if (response.ok) {
      console.log('✅ Saved to API database: offline_orders');
    }
    
    // Save to localStorage
    localStorage.setItem('tashivar_offline_orders', JSON.stringify(bestData));
    console.log('✅ Saved to localStorage: tashivar_offline_orders');
    
    console.log('%c✅ DATA RESTORED SUCCESSFULLY!', 'background: #16a34a; color: white; padding: 8px; font-weight: bold; font-size: 14px;');
    console.log('Please refresh the Offline Orders page to see your data.');
    
    return true;
  } catch (error) {
    console.error('❌ Error restoring data:', error);
    return false;
  }
}

// Expose to window
if (typeof window !== 'undefined') {
  (window as any).emergencyRecovery = emergencyRecovery;
  (window as any).restoreData = restoreData;
  (window as any).scanAllLocalStorage = scanAllLocalStorage;
  (window as any).scanAllPossibleKeys = scanAllPossibleKeys;
  (window as any).listAllDatabaseKeys = listAllDatabaseKeys;
  
  // Show emergency message
  console.log('');
  console.log('%c🚨 EMERGENCY DATA RECOVERY AVAILABLE', 'background: #dc2626; color: white; padding: 10px 16px; border-radius: 4px; font-weight: bold; font-size: 15px;');
  console.log('');
  console.log('%cIf your offline inquiries are missing, run this command:', 'font-size: 13px; color: #dc2626; font-weight: bold;');
  console.log('');
  console.log('%c  emergencyRecovery()', 'font-family: monospace; background: #fee2e2; padding: 8px 16px; color: #dc2626; font-size: 15px; font-weight: bold; border-left: 4px solid #dc2626;');
  console.log('');
  console.log('%cThis will scan EVERY possible location for your data.', 'font-size: 11px; color: #78716c;');
  console.log('');
}