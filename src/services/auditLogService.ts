// Audit Log Service
// Stores logs in localStorage for simplicity, mimicking the other services.

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SOFT_DELETE' | 'RESTORE';
  entityType: 'ORDER' | 'PRODUCT' | 'VENDOR' | 'BUYER' | 'EXPENSE';
  entityId: string;
  details: string;
  performedBy: string; // 'Admin' or specific user if available
  metadata?: any; // Store previous values or specific changes
}

const STORAGE_KEY = 'tashivar_audit_logs';

export function getLogs(): AuditLogEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse audit logs', error);
    return [];
  }
}

export function logAction(
  action: AuditLogEntry['action'],
  entityType: AuditLogEntry['entityType'],
  entityId: string,
  details: string,
  metadata?: any,
  performedBy: string = 'Admin'
): AuditLogEntry {
  try {
    const logs = getLogs();
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId,
      details,
      performedBy, 
      metadata
    };
    
    // Keep only last 1000 logs to prevent storage bloat
    const updatedLogs = [newLog, ...logs].slice(0, 1000);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    return newLog;
  } catch (error) {
    console.error('Failed to save audit log', error);
    // Return a dummy log if failed, so the app doesn't crash
    return {
        id: 'error',
        timestamp: new Date().toISOString(),
        action,
        entityType,
        entityId,
        details,
        performedBy
    };
  }
}

export function clearLogs() {
  localStorage.removeItem(STORAGE_KEY);
}