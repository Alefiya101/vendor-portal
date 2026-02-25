import React, { useRef } from 'react';
import { Printer, Download, X } from 'lucide-react';

interface InvoiceItem {
  srNo: number;
  description: string;
  quality?: string;
  colorNumber?: string;
  colorName?: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  processCosts?: Record<string, number>;
}

interface TashivarInvoiceProps {
  type: 'challan' | 'invoice';
  documentNumber: string;
  date: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  customerGSTIN?: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalAmount: number;
  notes?: string;
  termsAndConditions?: string[];
  onClose?: () => void;
}

export function TashivarInvoice({
  type,
  documentNumber,
  date,
  customerName,
  customerAddress,
  customerPhone,
  customerGSTIN,
  items,
  subtotal,
  cgst = 0,
  sgst = 0,
  igst = 0,
  totalAmount,
  notes,
  termsAndConditions,
  onClose
}: TashivarInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${type === 'challan' ? 'Delivery Challan' : 'Tax Invoice'} - ${documentNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: 600; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: 700; }
            .border-b { border-bottom: 2px solid #000; }
            .mt-4 { margin-top: 16px; }
            .mb-2 { margin-bottom: 8px; }
            .p-4 { padding: 16px; }
            .bg-gray-50 { background-color: #f9fafb; }
            @media print {
              @page { margin: 10mm; }
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownload = () => {
    handlePrint();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = '';
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
    if (remainder > 0) result += convertLessThanThousand(remainder);

    return result.trim();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            {type === 'challan' ? 'Delivery Challan' : 'Tax Invoice'}
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Invoice Content */}
        <div ref={printRef} className="p-8 bg-white">
          {/* Header */}
          <div className="border-b-4 border-indigo-600 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-indigo-600 mb-2">TASHIVAR</h1>
                <p className="text-sm text-gray-600 font-medium mb-1">Premium Ethnic Fashion B2B Portal</p>
                <p className="text-xs text-gray-500">123, Fashion Street, Mumbai, Maharashtra - 400001</p>
                <p className="text-xs text-gray-500">Phone: +91 98765 00000 | Email: info@tashivar.com</p>
                <p className="text-xs text-gray-500 font-medium mt-1">GSTIN: 27AABCT1234C1Z5</p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-indigo-50 border-2 border-indigo-600 px-4 py-2 rounded-lg">
                  <p className="text-xs font-medium text-indigo-600 uppercase">{type === 'challan' ? 'Delivery Challan' : 'Tax Invoice'}</p>
                  <p className="text-lg font-bold text-indigo-900 mt-1">{documentNumber}</p>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  <span className="font-medium">Date:</span> {formatDate(date)}
                </p>
              </div>
            </div>
          </div>

          {/* Buyer Details */}
          <div className="mb-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Bill To:</h3>
            <div className="space-y-1">
              <p className="text-base font-bold text-gray-900">{customerName}</p>
              {customerAddress && <p className="text-sm text-gray-700">{customerAddress}</p>}
              {customerPhone && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Phone:</span> {customerPhone}
                </p>
              )}
              {customerGSTIN && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">GSTIN:</span> {customerGSTIN}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-center" style={{ width: '50px' }}>Sr. No.</th>
                <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-left">Description of Goods</th>
                <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-center" style={{ width: '100px' }}>Quality</th>
                <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-center" style={{ width: '80px' }}>Color #</th>
                <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-center" style={{ width: '80px' }}>Qty</th>
                <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-right" style={{ width: '100px' }}>Rate</th>
                <th className="border border-gray-300 px-3 py-2 text-xs font-bold text-gray-900 text-right" style={{ width: '120px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-center font-medium">{item.srNo}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900">
                      <div className="font-medium">{item.description}</div>
                      {item.colorName && (
                        <div className="text-xs text-gray-600 mt-1">Color: {item.colorName}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700 text-center">{item.quality || '-'}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-700 text-center font-medium">
                      {item.colorNumber ? `#${item.colorNumber}` : '-'}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-center font-medium">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right">₹ {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="border border-gray-300 px-3 py-2 text-sm text-gray-900 text-right font-medium">₹ {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  {/* Process Costs Row */}
                  {item.processCosts && Object.keys(item.processCosts).length > 0 && (
                    <tr className="bg-blue-50">
                      <td className="border border-gray-300 px-3 py-1.5" colSpan={2}>
                        <div className="text-xs font-medium text-blue-900 pl-4">Process Costs:</div>
                      </td>
                      <td className="border border-gray-300 px-3 py-1.5 text-xs text-gray-700" colSpan={5}>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {Object.entries(item.processCosts).map(([key, value]) => {
                            if (value > 0) {
                              const processName = key.charAt(0).toUpperCase() + key.slice(1);
                              return (
                                <span key={key} className="text-gray-700">
                                  <span className="font-medium">{processName}:</span> ₹{value.toLocaleString('en-IN')}
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {/* Spacer Rows */}
              {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
                <tr key={`spacer-${i}`}>
                  <td className="border border-gray-300 px-3 py-4 text-center text-gray-400">-</td>
                  <td className="border border-gray-300 px-3 py-4"></td>
                  <td className="border border-gray-300 px-3 py-4"></td>
                  <td className="border border-gray-300 px-3 py-4"></td>
                  <td className="border border-gray-300 px-3 py-4"></td>
                  <td className="border border-gray-300 px-3 py-4"></td>
                  <td className="border border-gray-300 px-3 py-4"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-end mb-6">
            <div className="w-96 border border-gray-300">
              <div className="flex justify-between border-b border-gray-300 px-4 py-2 bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                <span className="text-sm font-bold text-gray-900">₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {type === 'invoice' && (
                <>
                  {cgst > 0 && (
                    <div className="flex justify-between border-b border-gray-300 px-4 py-2">
                      <span className="text-sm text-gray-700">CGST @ 2.5%:</span>
                      <span className="text-sm text-gray-900">₹ {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {sgst > 0 && (
                    <div className="flex justify-between border-b border-gray-300 px-4 py-2">
                      <span className="text-sm text-gray-700">SGST @ 2.5%:</span>
                      <span className="text-sm text-gray-900">₹ {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {igst > 0 && (
                    <div className="flex justify-between border-b border-gray-300 px-4 py-2">
                      <span className="text-sm text-gray-700">IGST @ 5%:</span>
                      <span className="text-sm text-gray-900">₹ {igst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex justify-between px-4 py-3 bg-indigo-600">
                <span className="text-sm font-bold text-white">Total Amount:</span>
                <span className="text-lg font-bold text-white">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="mb-6 border border-gray-300 rounded-lg p-4 bg-gray-50">
            <p className="text-sm">
              <span className="font-bold text-gray-900">Amount in Words: </span>
              <span className="text-gray-700 italic">{numberToWords(Math.floor(totalAmount))} Rupees Only</span>
            </p>
          </div>

          {/* Notes */}
          {notes && (
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-900 mb-2">Notes:</p>
              <p className="text-xs text-gray-700 italic">{notes}</p>
            </div>
          )}

          {/* Terms and Conditions */}
          {termsAndConditions && termsAndConditions.length > 0 && (
            <div className="mb-6 border-t border-gray-300 pt-4">
              <p className="text-xs font-bold text-gray-900 mb-2 uppercase">Terms and Conditions:</p>
              <ul className="list-decimal list-inside space-y-1">
                {termsAndConditions.map((term, index) => (
                  <li key={index} className="text-xs text-gray-700">{term}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-end border-t-2 border-gray-300 pt-6 mt-8">
            <div>
              <p className="text-xs text-gray-600 mb-1">
                <span className="font-medium">Prepared By:</span> Tashivar Admin
              </p>
              <p className="text-xs text-gray-500 italic">This is a computer-generated document</p>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 w-48 mb-2 mt-12"></div>
              <p className="text-xs font-bold text-gray-900">Authorized Signatory</p>
              <p className="text-xs text-gray-600 mt-1">For TASHIVAR</p>
            </div>
          </div>

          {/* Brand Footer */}
          <div className="text-center mt-8 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-indigo-600">By Tashivar</span> - Your Trusted Partner in Ethnic Fashion B2B
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
