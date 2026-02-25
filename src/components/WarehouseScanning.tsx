import React, { useState } from 'react';
import { Warehouse, TruckIcon, PackageCheck, QrCode, ChevronRight, Calendar, User, Package, AlertCircle, CheckCircle2, XCircle, Search } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

interface ScannedItem {
  id: string;
  code: string;
  name: string;
  type: 'product' | 'vendor';
  category?: string;
  vendor?: string;
  quantity?: number;
  status: 'found' | 'not-found';
  scannedAt: string;
}

interface WarehouseScanningProps {
  mode: 'receiving' | 'dispatching';
}

export function WarehouseScanning({ mode }: WarehouseScanningProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ScannedItem | null>(null);
  const [receiveQuantity, setReceiveQuantity] = useState('');
  const [notes, setNotes] = useState('');

  // Mock data for demonstration
  const mockInventory = {
    'TSV-KRT-001': {
      id: 'TSV-KRT-001',
      name: 'Premium Cotton Kurta Set',
      category: 'Kurta',
      vendor: 'Fashion Creations',
      currentStock: 100,
      type: 'product' as const
    },
    'TSV-SLK-002': {
      id: 'TSV-SLK-002',
      name: 'Premium Silk Fabric',
      category: 'Silk',
      vendor: 'Silk Paradise',
      currentStock: 50,
      type: 'product' as const
    },
    'VEN-001': {
      id: 'VEN-001',
      name: 'Fashion Creations',
      owner: 'Amit Sharma',
      phone: '+91 98765 11111',
      type: 'vendor' as const
    },
    'VEN-002': {
      id: 'VEN-002',
      name: 'Silk Paradise',
      owner: 'Priya Patel',
      phone: '+91 98765 22222',
      type: 'vendor' as const
    }
  };

  const handleScan = (code: string) => {
    const item = mockInventory[code as keyof typeof mockInventory];
    
    const scannedItem: ScannedItem = {
      id: code,
      code: code,
      name: item ? item.name : 'Unknown',
      type: item ? item.type : 'product',
      category: 'category' in item ? item.category : undefined,
      vendor: 'vendor' in item ? item.vendor : undefined,
      quantity: 'currentStock' in item ? item.currentStock : undefined,
      status: item ? 'found' : 'not-found',
      scannedAt: new Date().toISOString()
    };

    setScannedItems([scannedItem, ...scannedItems]);
    setSelectedItem(scannedItem);
    setShowScanner(false);
  };

  const handleProcessItem = () => {
    if (!selectedItem) return;

    const updatedItems = scannedItems.map(item => {
      if (item.code === selectedItem.code) {
        // Update quantity in inventory (mock)
        const qty = parseInt(receiveQuantity) || 0;
        
        // Save to localStorage
        const inventoryKey = 'tashivar_inventory';
        const existingInventory = JSON.parse(localStorage.getItem(inventoryKey) || '[]');
        
        if (mode === 'receiving') {
          // Add stock
          const itemIndex = existingInventory.findIndex((inv: any) => inv.productId === selectedItem.code);
          if (itemIndex >= 0) {
            existingInventory[itemIndex].currentStock += qty;
          }
        } else {
          // Reduce stock
          const itemIndex = existingInventory.findIndex((inv: any) => inv.productId === selectedItem.code);
          if (itemIndex >= 0) {
            existingInventory[itemIndex].currentStock -= qty;
          }
        }
        
        localStorage.setItem(inventoryKey, JSON.stringify(existingInventory));
        
        return {
          ...item,
          quantity: qty,
          notes: notes
        };
      }
      return item;
    });

    setScannedItems(updatedItems);
    setSelectedItem(null);
    setReceiveQuantity('');
    setNotes('');
  };

  const getStatusColor = (status: 'found' | 'not-found') => {
    return status === 'found' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBg = (status: 'found' | 'not-found') => {
    return status === 'found' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {mode === 'receiving' ? (
              <TruckIcon className="w-8 h-8 text-blue-600" />
            ) : (
              <PackageCheck className="w-8 h-8 text-purple-600" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === 'receiving' ? 'Warehouse Receiving' : 'Warehouse Dispatch'}
              </h1>
              <p className="text-gray-600 mt-1">
                {mode === 'receiving' 
                  ? 'Scan items arriving at the warehouse' 
                  : 'Scan items leaving the warehouse'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanning Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Scan Items</h2>
                  <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <QrCode className="w-5 h-5" />
                    Open Scanner
                  </button>
                </div>
              </div>

              {/* Scanned Items List */}
              <div className="p-6">
                {scannedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No items scanned yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Click "Open Scanner" to start scanning
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scannedItems.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedItem(item)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedItem?.code === item.code
                            ? 'border-blue-500 bg-blue-50'
                            : getStatusBg(item.status)
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {item.status === 'found' ? (
                                <CheckCircle2 className={`w-5 h-5 ${getStatusColor(item.status)}`} />
                              ) : (
                                <XCircle className={`w-5 h-5 ${getStatusColor(item.status)}`} />
                              )}
                              <span className="font-semibold text-gray-900">{item.name}</span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p className="font-mono">{item.code}</p>
                              {item.category && <p>Category: {item.category}</p>}
                              {item.vendor && <p>Vendor: {item.vendor}</p>}
                              {item.quantity !== undefined && (
                                <p>Current Stock: {item.quantity} units</p>
                              )}
                              <p className="text-xs text-gray-400">
                                Scanned: {new Date(item.scannedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Item Details</h2>
              </div>

              <div className="p-6">
                {selectedItem ? (
                  <div className="space-y-4">
                    {/* Item Info */}
                    <div>
                      <div className="flex items-start gap-3 mb-4">
                        <Package className="w-8 h-8 text-blue-600 flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{selectedItem.name}</h3>
                          <p className="text-sm text-gray-500 font-mono">{selectedItem.code}</p>
                        </div>
                      </div>

                      {selectedItem.status === 'found' ? (
                        <div className="space-y-3">
                          {selectedItem.category && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Category:</span>
                              <span className="font-medium text-gray-900">{selectedItem.category}</span>
                            </div>
                          )}
                          {selectedItem.vendor && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Vendor:</span>
                              <span className="font-medium text-gray-900">{selectedItem.vendor}</span>
                            </div>
                          )}
                          {selectedItem.quantity !== undefined && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Current Stock:</span>
                              <span className="font-medium text-gray-900">{selectedItem.quantity} units</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-800">
                              Item not found in inventory. Please verify the barcode.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Process Form */}
                    {selectedItem.status === 'found' && (
                      <div className="pt-4 border-t border-gray-200 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {mode === 'receiving' ? 'Quantity Received' : 'Quantity Dispatched'}
                          </label>
                          <input
                            type="number"
                            value={receiveQuantity}
                            onChange={(e) => setReceiveQuantity(e.target.value)}
                            placeholder="Enter quantity..."
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                        </div>

                        <button
                          onClick={handleProcessItem}
                          disabled={!receiveQuantity || parseInt(receiveQuantity) <= 0}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          {mode === 'receiving' ? 'Confirm Receipt' : 'Confirm Dispatch'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      Select a scanned item to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Scanned</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{scannedItems.length}</p>
              </div>
              <QrCode className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Successfully Found</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {scannedItems.filter(item => item.status === 'found').length}
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Not Found</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {scannedItems.filter(item => item.status === 'not-found').length}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
