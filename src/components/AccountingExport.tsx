import React from 'react';
import { Download, FileText, Share2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface GSTReportData {
  invoiceDate: string;
  invoiceNumber: string;
  customerName: string;
  gstin: string;
  state: string;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  totalValue: number;
  hsn: string;
}

export function generateGSTR1Data(orders: any[], companyState = 'Maharashtra'): GSTReportData[] {
  return orders
    .filter(o => o.type === 'sale' || (!o.type && o.buyerId !== 'internal'))
    .map(order => {
      // Basic Tax Logic (Simplified for demonstration)
      // Assuming prices are TAX EXCLUSIVE for B2B or we reverse calculate
      // For now, let's assume the 'subtotal' is the taxable value + tax? 
      // Or usually in these systems, you might have specific tax fields.
      // If not present, we will simulate a 5% GST structure for ethnic wear.
      
      const isInterState = order.buyerAddress?.toLowerCase().includes(companyState.toLowerCase()) === false;
      const taxRate = 0.05; // 5% for fabric/apparel usually
      const totalAmount = order.subtotal || 0;
      
      // Reverse calculate if we assume subtotal includes tax, OR forward calculate if subtotal is base.
      // Let's assume subtotal is the Transaction Value (Taxable Value) to make it cleaner for a "Billing Software" that adds tax on top.
      // Wait, usually subtotal is sum of products. Let's assume Taxable Value = Subtotal.
      
      const taxableValue = totalAmount;
      const taxAmount = taxableValue * taxRate;
      
      const igst = isInterState ? taxAmount : 0;
      const cgst = isInterState ? 0 : taxAmount / 2;
      const sgst = isInterState ? 0 : taxAmount / 2;
      
      return {
        invoiceDate: order.date,
        invoiceNumber: order.id,
        customerName: order.buyer,
        gstin: order.gstin || '', // We need to make sure we capture this in Order or Buyer profile
        state: extractState(order.buyerAddress),
        taxableValue: taxableValue,
        igst: parseFloat(igst.toFixed(2)),
        cgst: parseFloat(cgst.toFixed(2)),
        sgst: parseFloat(sgst.toFixed(2)),
        totalValue: parseFloat((taxableValue + taxAmount).toFixed(2)),
        hsn: '6204' // Standard HSN for Women's Suits/Kurtis
      };
    });
}

function extractState(address: string): string {
  if (!address) return '';
  // Very naive extraction, usually this should be a structured field
  const parts = address.split(',');
  const lastPart = parts[parts.length - 1];
  // Remove pincode
  return lastPart.replace(/\d+/g, '').trim();
}

export function downloadCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    toast.error('No data to export');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => {
      const val = row[fieldName];
      return typeof val === 'string' ? `"${val}"` : val;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function downloadTallyXML(data: GSTReportData[]) {
  // Simplified Tally XML generation
  // In a real app, this would use a proper XML builder and strictly follow Tally's TDL schema
  let xml = `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>`;
      
  data.forEach(inv => {
    xml += `
    <TALLYMESSAGE xmlns:UDF="TallyUDF">
      <VOUCHER VCHTYPE="Sales" ACTION="Create">
        <DATE>${inv.invoiceDate.replace(/-/g, '')}</DATE>
        <VOUCHERNUMBER>${inv.invoiceNumber}</VOUCHERNUMBER>
        <PARTYLEDGERNAME>${inv.customerName}</PARTYLEDGERNAME>
        <EFFECTIVEDATE>${inv.invoiceDate.replace(/-/g, '')}</EFFECTIVEDATE>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>${inv.customerName}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${inv.totalValue}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>Sales Account</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${inv.taxableValue}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        ${inv.igst > 0 ? `
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>IGST Output</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${inv.igst}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}
        ${inv.cgst > 0 ? `
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>CGST Output</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${inv.cgst}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>SGST Output</LEDGERNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <AMOUNT>${inv.sgst}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>` : ''}
      </VOUCHER>
    </TALLYMESSAGE>`;
  });
  
  xml += `
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const blob = new Blob([xml], { type: 'text/xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'tally_import.xml';
  link.click();
}

export function AccountingReports({ orders }: { orders: any[] }) {
  const gstr1Data = generateGSTR1Data(orders);
  
  // GSTR-3B Summary
  const gstr3b = {
    outwardTaxable: gstr1Data.reduce((sum, row) => sum + row.taxableValue, 0),
    outwardIGST: gstr1Data.reduce((sum, row) => sum + row.igst, 0),
    outwardCGST: gstr1Data.reduce((sum, row) => sum + row.cgst, 0),
    outwardSGST: gstr1Data.reduce((sum, row) => sum + row.sgst, 0),
  };

  return (
    <div className="space-y-8">
      {/* GST Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">GSTR-3B Summary</h3>
              <p className="text-sm text-gray-500">Overview of Outward Supplies (Sales)</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Taxable Value</span>
              <span className="font-medium">₹{gstr3b.outwardTaxable.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total IGST</span>
              <span className="font-medium text-rose-600">₹{gstr3b.outwardIGST.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total CGST + SGST</span>
              <span className="font-medium text-rose-600">₹{(gstr3b.outwardCGST + gstr3b.outwardSGST).toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-gray-900">
              <span>Total Tax Liability</span>
              <span>₹{(gstr3b.outwardIGST + gstr3b.outwardCGST + gstr3b.outwardSGST).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Data for Accounting</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Download your data in formats compatible with popular accounting software.
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={() => downloadCSV(gstr1Data, 'gstr1_sales.csv')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium hover:bg-emerald-100"
            >
              <Download className="w-4 h-4" /> CSV (Zoho)
            </button>
            <button 
              onClick={() => downloadTallyXML(gstr1Data)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-medium hover:bg-amber-100"
            >
              <Share2 className="w-4 h-4" /> XML (Tally)
            </button>
          </div>
        </div>
      </div>

      {/* GSTR-1 Detailed Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">GSTR-1: Outward Supplies Detail</h3>
          <button 
             onClick={() => downloadCSV(gstr1Data, 'gstr1_detailed.csv')}
             className="text-sm text-indigo-600 font-medium hover:underline"
          >
            Download Full Report
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Invoice No</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3 text-right">Taxable Val</th>
                <th className="px-4 py-3 text-right">IGST</th>
                <th className="px-4 py-3 text-right">CGST</th>
                <th className="px-4 py-3 text-right">SGST</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gstr1Data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{row.invoiceDate}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-900">{row.customerName}</td>
                  <td className="px-4 py-3 text-gray-500">{row.state}</td>
                  <td className="px-4 py-3 text-right">₹{row.taxableValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{row.igst > 0 ? `₹${row.igst}` : '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{row.cgst > 0 ? `₹${row.cgst}` : '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{row.sgst > 0 ? `₹${row.sgst}` : '-'}</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">₹{row.totalValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}