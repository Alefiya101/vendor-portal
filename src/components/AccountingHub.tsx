import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Upload, RefreshCw, CheckCircle, 
  AlertTriangle, DollarSign, Calendar, ArrowRight,
  Database, Shield, PieChart, BarChart3, Receipt, Settings, MapPin, Building, CreditCard, ScrollText
} from 'lucide-react';
import * as financeService from '../services/financeService';
import { toast } from 'sonner@2.0.3';

interface AccountingHubProps {
  orders: any[];
  purchases: any[];
  vendors: any[];
  buyers: any[];
}

export function AccountingHub({ orders, purchases, vendors, buyers }: AccountingHubProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'gstr1' | 'gstr3b' | 'integration' | 'settings'>('overview');
  const [gstData, setGstData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [companySettings, setCompanySettings] = useState<any>(financeService.getCompanySettings());

  useEffect(() => {
    calculateGST();
  }, [orders, purchases, companySettings]);

  const calculateGST = () => {
    setLoading(true);
    try {
      const gstr1 = financeService.getGSTR1Report(orders);
      const gstr3b = financeService.getGSTR3BReport(orders, purchases);
      
      setGstData({
        gstr1,
        gstr3b,
        liability: gstr3b.taxPayable
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to calculate GST data');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    setCompanySettings((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    financeService.setCompanySettings(companySettings);
    // Also update Home State specifically as it's used in logic
    financeService.setHomeState(companySettings.state);
    toast.success('Company Tax Settings Saved Successfully');
    calculateGST(); // Recalculate with new settings
  };

  const handleDownload = (type: 'tally' | 'zoho-sales' | 'zoho-purchase' | 'gstr1' | 'gstr3b') => {
    let content = '';
    let filename = '';
    let mimeType = 'text/csv;charset=utf-8;';

    try {
      switch (type) {
        case 'tally':
          content = financeService.generateTallySalesCSV(orders);
          filename = `Tally_Sales_Register_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'zoho-sales':
          content = financeService.generateZohoSalesCSV(orders);
          filename = `Zoho_Invoices_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'zoho-purchase':
          content = financeService.generateZohoPurchaseCSV(purchases);
          filename = `Zoho_Bills_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'gstr1':
          // JSON format for GST Offline Tool
          content = JSON.stringify(gstData.gstr1, null, 2);
          filename = `GSTR1_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json;charset=utf-8;';
          break;
        case 'gstr3b':
          content = JSON.stringify(gstData.gstr3b, null, 2);
          filename = `GSTR3B_${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json;charset=utf-8;';
          break;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${filename} downloaded successfully`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate export file');
    }
  };

  if (!gstData) return <div className="p-12 text-center">Loading Accounting Data...</div>;

  return (
    <div className="space-y-6">
      {/* Header - Very Light Theme as requested */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-indigo-50 border border-indigo-100 p-6 rounded-xl">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-indigo-900">
            <Shield className="w-6 h-6 text-indigo-600" /> 
            Professional Accounting Hub
          </h2>
          <p className="text-indigo-700 mt-1 text-sm flex items-center gap-2">
            Automated GST Compliance • Place of Supply: <span className="font-semibold bg-white border border-indigo-200 px-2 rounded text-indigo-800">{companySettings.state}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-right px-4 border-r border-indigo-200">
            <p className="text-xs text-indigo-600 uppercase tracking-wide">Current Tax Liability</p>
            <p className="text-xl font-bold text-indigo-900">
              ₹{(gstData.liability.igst + gstData.liability.cgst + gstData.liability.sgst).toLocaleString()}
            </p>
          </div>
          <div className="text-right px-2">
            <p className="text-xs text-indigo-600 uppercase tracking-wide">ITC Available</p>
            <p className="text-xl font-bold text-emerald-600">
              ₹{(gstData.gstr3b.eligibleITC.igst + gstData.gstr3b.eligibleITC.cgst + gstData.gstr3b.eligibleITC.sgst).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 bg-white rounded-t-xl px-2">
        {[
          { id: 'overview', label: 'Tax Overview', icon: PieChart },
          { id: 'gstr1', label: 'GSTR-1 (Sales)', icon: FileText },
          { id: 'gstr3b', label: 'GSTR-3B (Summary)', icon: BarChart3 },
          { id: 'integration', label: 'Export & Sync', icon: Database },
          { id: 'settings', label: 'Tax Settings', icon: Settings }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-6 shadow-sm min-h-[400px]">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-6 rounded-xl">
                <h3 className="text-purple-900 font-semibold mb-2 flex items-center gap-2">
                  Total Output Tax (Sales)
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded border border-purple-200">Liability</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IGST (Inter-state)</span>
                    <span className="font-medium">₹{gstData.gstr3b.outwardSupplies.igst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CGST (Intra-state)</span>
                    <span className="font-medium">₹{gstData.gstr3b.outwardSupplies.cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SGST (Intra-state)</span>
                    <span className="font-medium">₹{gstData.gstr3b.outwardSupplies.sgst.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-purple-100 flex justify-between font-bold text-purple-700">
                    <span>Total</span>
                    <span>₹{(gstData.gstr3b.outwardSupplies.igst + gstData.gstr3b.outwardSupplies.cgst + gstData.gstr3b.outwardSupplies.sgst).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-6 rounded-xl">
                <h3 className="text-emerald-900 font-semibold mb-2 flex items-center gap-2">
                  Eligible ITC (Purchases)
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded border border-emerald-200">Credit</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IGST Credit</span>
                    <span className="font-medium">₹{gstData.gstr3b.eligibleITC.igst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">CGST Credit</span>
                    <span className="font-medium">₹{gstData.gstr3b.eligibleITC.cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SGST Credit</span>
                    <span className="font-medium">₹{gstData.gstr3b.eligibleITC.sgst.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-emerald-100 flex justify-between font-bold text-emerald-700">
                    <span>Total Credit</span>
                    <span>₹{(gstData.gstr3b.eligibleITC.igst + gstData.gstr3b.eligibleITC.cgst + gstData.gstr3b.eligibleITC.sgst).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 p-6 rounded-xl">
                <h3 className="text-gray-900 font-semibold mb-2">Net Payable</h3>
                <div className="flex flex-col justify-center h-32">
                  <p className="text-3xl font-bold text-gray-900 text-center">
                    ₹{(gstData.liability.igst + gstData.liability.cgst + gstData.liability.sgst).toLocaleString()}
                  </p>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Output Tax - Input Tax Credit
                  </p>
                  <button className="mt-4 mx-auto px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                    Pay Now
                  </button>
                </div>
              </div>
            </div>

            {/* Compliance Calendar */}
            <div className="bg-white border border-orange-200 rounded-xl p-6 bg-orange-50/30">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-orange-600" />
                Compliance Calendar
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-orange-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex flex-col items-center justify-center text-orange-700">
                    <span className="text-xs font-bold">NOV</span>
                    <span className="text-lg font-bold">11</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">GSTR-1 Due Date</p>
                    <p className="text-sm text-gray-500">Details of outward supplies</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('gstr1')}
                    className="ml-auto text-sm text-indigo-600 font-medium hover:underline"
                  >
                    Prepare
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-orange-100">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex flex-col items-center justify-center text-orange-700">
                    <span className="text-xs font-bold">NOV</span>
                    <span className="text-lg font-bold">20</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">GSTR-3B Due Date</p>
                    <p className="text-sm text-gray-500">Summary return & payment</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('gstr3b')}
                    className="ml-auto text-sm text-indigo-600 font-medium hover:underline"
                  >
                    Prepare
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GSTR-1 Tab */}
        {activeTab === 'gstr1' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">GSTR-1: Outward Supplies</h3>
                <p className="text-sm text-gray-500">Detailed report of all sales transactions. Place of Supply is crucial here.</p>
              </div>
              <button 
                onClick={() => handleDownload('gstr1')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Download className="w-4 h-4" /> Download JSON (Offline Tool)
              </button>
            </div>

            <div className="space-y-6">
              {/* B2B Table */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  B2B Invoices (Registered Dealers)
                </h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-2">GSTIN/UIN</th>
                        <th className="px-4 py-2">Receiver Name</th>
                        <th className="px-4 py-2">Invoice No</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Value</th>
                        <th className="px-4 py-2">Place of Supply</th>
                        <th className="px-4 py-2 text-right">Taxable</th>
                        <th className="px-4 py-2 text-right">Tax Amt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {gstData.gstr1.b2b.length === 0 ? (
                        <tr><td colSpan={8} className="px-4 py-4 text-center text-gray-500">No B2B invoices found</td></tr>
                      ) : (
                        gstData.gstr1.b2b.map((inv: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono">{inv.gstin}</td>
                            <td className="px-4 py-2">{inv.customerName}</td>
                            <td className="px-4 py-2">{inv.invoiceNumber}</td>
                            <td className="px-4 py-2">{inv.invoiceDate}</td>
                            <td className="px-4 py-2 font-medium">₹{inv.invoiceValue}</td>
                            <td className="px-4 py-2">
                              {inv.placeOfSupply}
                              {inv.isInterState ? 
                                <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1 rounded">IGST</span> : 
                                <span className="ml-2 text-[10px] bg-gray-100 text-gray-700 px-1 rounded">CGST+SGST</span>
                              }
                            </td>
                            <td className="px-4 py-2 text-right">₹{inv.taxableValue}</td>
                            <td className="px-4 py-2 text-right text-red-600">₹{inv.taxAmount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* B2C Large Table */}
              {gstData.gstr1.b2cLarge.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    B2C Large Invoices (Inter-state {'>'} 2.5L)
                  </h4>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="px-4 py-2">Invoice No</th>
                          <th className="px-4 py-2">Date</th>
                          <th className="px-4 py-2">Value</th>
                          <th className="px-4 py-2">Place of Supply</th>
                          <th className="px-4 py-2">Taxable Value</th>
                          <th className="px-4 py-2">Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {gstData.gstr1.b2cLarge.map((inv: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{inv.invoiceNumber}</td>
                            <td className="px-4 py-2">{inv.invoiceDate}</td>
                            <td className="px-4 py-2 font-medium">₹{inv.invoiceValue}</td>
                            <td className="px-4 py-2">{inv.placeOfSupply}</td>
                            <td className="px-4 py-2">₹{inv.taxableValue}</td>
                            <td className="px-4 py-2">{inv.rate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* B2C Small Table */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  B2C Small Invoices (Others)
                </h4>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-2">Place of Supply</th>
                        <th className="px-4 py-2">Rate</th>
                        <th className="px-4 py-2">Taxable Value</th>
                        <th className="px-4 py-2">Cess</th>
                        <th className="px-4 py-2">E-Commerce GSTIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {gstData.gstr1.b2cSmall.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-500">No B2C small invoices found</td></tr>
                      ) : (
                        gstData.gstr1.b2cSmall.map((inv: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{inv.placeOfSupply}</td>
                            <td className="px-4 py-2">{inv.rate}%</td>
                            <td className="px-4 py-2 font-medium">₹{inv.taxableValue}</td>
                            <td className="px-4 py-2">0</td>
                            <td className="px-4 py-2">-</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GSTR-3B Tab */}
        {activeTab === 'gstr3b' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">GSTR-3B: Monthly Summary</h3>
                <p className="text-sm text-gray-500">Consolidated return of outward and inward supplies</p>
              </div>
              <button 
                onClick={() => handleDownload('gstr3b')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Download className="w-4 h-4" /> Download JSON
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">3.1 Details of Outward Supplies</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-white rounded border border-gray-200">
                    <p className="text-gray-500 mb-1">Total Taxable Value</p>
                    <p className="font-bold text-gray-900">₹{gstData.gstr3b.outwardSupplies.taxable.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-gray-200">
                    <p className="text-gray-500 mb-1">Integrated Tax (IGST)</p>
                    <p className="font-bold text-gray-900">₹{gstData.gstr3b.outwardSupplies.igst.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-gray-200">
                    <p className="text-gray-500 mb-1">Central Tax (CGST)</p>
                    <p className="font-bold text-gray-900">₹{gstData.gstr3b.outwardSupplies.cgst.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-gray-200">
                    <p className="text-gray-500 mb-1">State Tax (SGST)</p>
                    <p className="font-bold text-gray-900">₹{gstData.gstr3b.outwardSupplies.sgst.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-4">4. Eligible ITC (Input Tax Credit)</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-white rounded border border-emerald-100">
                    <p className="text-gray-500 mb-1">Total Taxable Value</p>
                    <p className="font-bold text-emerald-900">₹{gstData.gstr3b.eligibleITC.taxable.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-emerald-100">
                    <p className="text-gray-500 mb-1">Integrated Tax (IGST)</p>
                    <p className="font-bold text-emerald-900">₹{gstData.gstr3b.eligibleITC.igst.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-emerald-100">
                    <p className="text-gray-500 mb-1">Central Tax (CGST)</p>
                    <p className="font-bold text-emerald-900">₹{gstData.gstr3b.eligibleITC.cgst.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white rounded border border-emerald-100">
                    <p className="text-gray-500 mb-1">State Tax (SGST)</p>
                    <p className="font-bold text-emerald-900">₹{gstData.gstr3b.eligibleITC.sgst.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab - Completely Revamped */}
        {activeTab === 'settings' && (
          <div>
             <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Tax & Business Settings</h3>
              <p className="text-sm text-gray-600">These details will be used for GST Calculation, Invoicing, and Accounting Reports.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Company Details */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Building className="w-5 h-5 text-indigo-600" />
                    Business Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Legal Business Name</label>
                      <input 
                        type="text"
                        value={companySettings.legalName}
                        onChange={(e) => handleSettingsChange('legalName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Trade Name (Brand)</label>
                      <input 
                        type="text"
                        value={companySettings.tradeName}
                        onChange={(e) => handleSettingsChange('tradeName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">GSTIN</label>
                      <input 
                        type="text"
                        value={companySettings.gstin}
                        onChange={(e) => handleSettingsChange('gstin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Default Tax Rate (%)</label>
                      <input 
                        type="number"
                        value={companySettings.defaultGstRate}
                        onChange={(e) => handleSettingsChange('defaultGstRate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Address & Location
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Registered Address</label>
                      <textarea 
                        value={companySettings.address}
                        onChange={(e) => handleSettingsChange('address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
                        <select 
                          value={companySettings.state}
                          onChange={(e) => handleSettingsChange('state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="Gujarat">Gujarat</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="West Bengal">West Bengal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">State Code</label>
                        <input 
                          type="text"
                          value={companySettings.stateCode}
                          onChange={(e) => handleSettingsChange('stateCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Bank Details */}
              <div className="space-y-6">
                 <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    Bank Details (For Invoice)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Bank Name</label>
                      <input 
                        type="text"
                        value={companySettings.bankName}
                        onChange={(e) => handleSettingsChange('bankName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Account Number</label>
                      <input 
                        type="text"
                        value={companySettings.accountNumber}
                        onChange={(e) => handleSettingsChange('accountNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">IFSC Code</label>
                        <input 
                          type="text"
                          value={companySettings.ifsc}
                          onChange={(e) => handleSettingsChange('ifsc', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Branch Name</label>
                        <input 
                          type="text"
                          value={companySettings.branch}
                          onChange={(e) => handleSettingsChange('branch', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                    <ScrollText className="w-5 h-5 text-indigo-600" />
                    Terms & Conditions
                  </h4>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Invoice Terms (One per line)</label>
                    <textarea 
                      value={Array.isArray(companySettings.terms) ? companySettings.terms.join('\n') : companySettings.terms}
                      onChange={(e) => handleSettingsChange('terms', e.target.value.split('\n'))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-32 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={handleSaveSettings}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-900 text-white font-medium rounded-lg hover:bg-indigo-800 shadow-md"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integration Tab */}
        {activeTab === 'integration' && (
          <div>
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accounting Software Integration</h3>
              <p className="text-gray-600">Sync your Tashivar data with popular accounting platforms. Download formatted files ready for import.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Tally Card */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#1C9F46] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    T
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Tally Prime</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Recommended</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Export your Sales Register in Excel format compatible with Tally import utilities.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleDownload('tally')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" /> Download Sales Register (Excel/CSV)
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                    <RefreshCw className="w-4 h-4" /> Direct Sync (Coming Soon)
                  </button>
                </div>
              </div>

              {/* Zoho Card */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#0069D2] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    Z
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Zoho Books</h4>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Compatible</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Export Invoices and Bills in Zoho's standard CSV import format.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleDownload('zoho-sales')}
                    className="flex items-center justify-center gap-2 px-2 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" /> Sales (CSV)
                  </button>
                  <button 
                    onClick={() => handleDownload('zoho-purchase')}
                    className="flex items-center justify-center gap-2 px-2 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" /> Purchases (CSV)
                  </button>
                  <button className="col-span-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                    <RefreshCw className="w-4 h-4" /> API Connect (Coming Soon)
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-indigo-900">API Access & Automation</h4>
                <p className="text-sm text-indigo-700 mt-1">
                  We are building direct APIs for Tally and Zoho. Once released, you will be able to generate API keys here and automate the sync process entirely.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}