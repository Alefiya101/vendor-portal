import React, { useState } from 'react';
import { Trash2, RefreshCw, CheckCircle } from 'lucide-react';
import { cleanupAllDuplicates, syncCleanedDataToSupabase } from '../utils/cleanupDuplicates';
import { toast } from 'sonner';

export function DuplicateCleanupButton() {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<{
    products: { before: number; after: number; removed: number };
    inventory: { before: number; after: number; removed: number };
    totalRemoved: number;
  } | null>(null);

  const handleCleanup = async () => {
    if (!confirm('⚠️ This will remove all duplicate products and inventory entries. Continue?')) {
      return;
    }

    setIsCleaningUp(true);
    setCleanupResult(null);

    try {
      // Run cleanup
      const result = cleanupAllDuplicates();
      setCleanupResult(result);

      // Sync to backend
      await syncCleanedDataToSupabase();

      if (result.totalRemoved > 0) {
        toast.success(`Removed ${result.totalRemoved} duplicate entries!`, {
          description: `Products: ${result.products.removed}, Inventory: ${result.inventory.removed}`
        });
        
        // Reload page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.info('No duplicates found! Database is clean.', {
          description: 'All entries are unique.'
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Failed to clean up duplicates');
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleCleanup}
        disabled={isCleaningUp}
        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove duplicate products and inventory entries"
      >
        {isCleaningUp ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Cleaning...</span>
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Clean Duplicates</span>
          </>
        )}
      </button>

      {cleanupResult && cleanupResult.totalRemoved > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <div className="text-xs text-green-700">
            <div className="font-semibold">Removed {cleanupResult.totalRemoved} duplicates</div>
            <div className="text-green-600">
              Products: {cleanupResult.products.removed} | Inventory: {cleanupResult.inventory.removed}
            </div>
          </div>
        </div>
      )}

      {cleanupResult && cleanupResult.totalRemoved === 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-blue-700 font-medium">Database is clean! No duplicates found.</span>
        </div>
      )}
    </div>
  );
}
