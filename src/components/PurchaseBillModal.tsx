import React, { useState } from 'react';
import { X, Download, Printer, FileText, Calendar, Package, DollarSign, User, Phone, MapPin, Shirt, Layers, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PurchaseBillModalProps {
  order: any;
  billType: 'fabric' | 'manufacturing';
  onClose: () => void;
  onDelete?: (orderId: string) => void;
}

export function PurchaseBillModal({ order, billType, onClose, onDelete }: PurchaseBillModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const billDate = new Date().toISOString().split('T')[0];
  const billNumber = `BILL-${order.id}-${billType.toUpperCase()}-${Date.now()}`;

  const fabricItems = order.products.filter((p: any) => p.type === 'fabric');
  const readymadeItems = order.products.filter((p: any) => p.type === 'readymade');

  const calculateFabricTotal = () => {
    return fabricItems.reduce((sum: number, item: any) => sum + (item.costPrice * item.quantity), 0);
  };

  const calculateManufacturingTotal = () => {
    return readymadeItems.reduce((sum: number, item: any) => sum + (item.costPrice * item.quantity), 0);
  };

  const handleDownload = () => {
    // In production, this would generate a PDF
    window.print();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(order.id);
      toast.success('Order deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {billType === 'fabric' ? 'Fabric Purchase Bill' : 'Manufacturing Order Bill'}
              </h3>
              <p className="text-sm text-gray-600">{billNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              title="Download PDF"
            >
              <Download className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              title="Print"
            >
              <Printer className="w-5 h-5" strokeWidth={2} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div className="p-8" id="purchase-bill-content">
          {/* Company Header */}
          <div className="mb-8 pb-6 border-b-2 border-gray-900">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">TASHIVAR</h1>
                <p className="text-sm text-gray-600">B2B Fashion Marketplace</p>
                <p className="text-sm text-gray-600">GST: 27AABCT1234A1Z5</p>
                <p className="text-sm text-gray-600">Ph: +91 98765 00000</p>
              </div>
              <div className="text-right">
                <p className={`inline-block px-4 py-2 rounded-lg font-semibold text-white mb-2 ${
                  billType === 'fabric' ? 'bg-blue-600' : 'bg-purple-600'
                }`}>
                  {billType === 'fabric' ? 'FABRIC PURCHASE' : 'MANUFACTURING ORDER'}
                </p>
                <p className="text-sm text-gray-600">Bill No: {billNumber}</p>
                <p className="text-sm text-gray-600">Date: {billDate}</p>
                <p className="text-sm text-gray-600">Order: {order.id}</p>
              </div>
            </div>
          </div>

          {billType === 'fabric' ? (
            // FABRIC PURCHASE BILL
            <>
              {/* Vendor Details */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Fabric Vendor Details
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Vendor Name:</p>
                    <p className="font-medium text-gray-900">{order.vendor}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Vendor ID:</p>
                    <p className="font-medium text-gray-900">{order.vendorId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone:</p>
                    <p className="font-medium text-gray-900">{order.vendorPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">PO Number:</p>
                    <p className="font-medium text-gray-900">
                      {order.purchaseOrderTracking?.poNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fabric Items Table */}
              <div className="mb-6">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Item</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-200">Rate</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-200">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fabricItems.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="px-4 py-3 text-sm">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.id}</p>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity} mtr</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">₹{item.costPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          ₹{(item.costPrice * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Subtotal:</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{calculateFabricTotal().toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">GST (18%):</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{(calculateFabricTotal() * 0.18).toLocaleString()}</td>
                    </tr>
                    <tr className="border-t-2 border-gray-900">
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900">Total Amount:</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 text-lg">
                        ₹{(calculateFabricTotal() * 1.18).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Commission Info */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Commission Details</h4>
                <p className="text-sm text-gray-700">
                  Vendor Commission: ₹{order.commission?.toLocaleString() || '0'} (Single-party - Fabric vendor)
                </p>
              </div>
            </>
          ) : (
            // MANUFACTURING ORDER BILL
            <>
              {/* Multiple Parties */}
              <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-purple-600" />
                  Manufacturing Parties Involved
                </h4>
                <div className="space-y-3">
                  {order.commissionDistribution?.map((party: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-100">
                      <div>
                        <p className="font-medium text-gray-900">{party.party}</p>
                        <p className="text-xs text-gray-600">Commission: ₹{party.amount?.toLocaleString()}</p>
                      </div>
                      <div className="text-right text-sm text-gray-700">
                        <p>{((party.amount / order.commission) * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manufacturing Details */}
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Main Vendor:</p>
                    <p className="font-medium text-gray-900">{order.vendor}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Vendor ID:</p>
                    <p className="font-medium text-gray-900">{order.vendorId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">PO Number:</p>
                    <p className="font-medium text-gray-900">
                      {order.purchaseOrderTracking?.poNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expected Delivery:</p>
                    <p className="font-medium text-gray-900">
                      {order.purchaseOrderTracking?.expectedDeliveryDate || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Readymade Items Table */}
              <div className="mb-6">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Item</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-200">Rate</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 border-b border-gray-200">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readymadeItems.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="px-4 py-3 text-sm">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-600">{item.id}</p>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">{item.quantity} pcs</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900">₹{item.costPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                          ₹{(item.costPrice * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">Subtotal:</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{calculateManufacturingTotal().toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">GST (12%):</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{(calculateManufacturingTotal() * 0.12).toLocaleString()}</td>
                    </tr>
                    <tr className="border-t-2 border-gray-900">
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900">Total Amount:</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 text-lg">
                        ₹{(calculateManufacturingTotal() * 1.12).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Commission Breakdown */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Commission Distribution</h4>
                <div className="space-y-2">
                  {order.commissionDistribution?.map((dist: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{dist.party}:</span>
                      <span className="font-medium text-gray-900">₹{dist.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-indigo-200 flex justify-between font-semibold">
                    <span className="text-gray-900">Total Commission:</span>
                    <span className="text-gray-900">₹{order.commission?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Payment terms: 30 days from delivery</li>
              <li>• Quality inspection required before acceptance</li>
              <li>• All items branded as "By Tashivar"</li>
              <li>• Commission will be paid after delivery confirmation</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-end">
            <div className="text-sm text-gray-600">
              <p>Generated on: {new Date().toLocaleString()}</p>
              <p>Authorized by: Admin</p>
            </div>
            <div className="text-right">
              <div className="border-t border-gray-900 pt-2 mt-8 w-48">
                <p className="text-sm font-medium text-gray-900">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            Download PDF
          </button>
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
              Delete Order
            </button>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                    <p className="text-sm text-gray-600">Are you sure you want to delete this order?</p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>Warning:</strong> This action will soft delete the order. 
                    You can restore it from the admin panel if needed.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2"
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                        Delete Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}