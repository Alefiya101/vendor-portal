import React from 'react';
import { ArrowLeft, Download, Mail, Printer, CheckCircle2, Calendar, Package, Building2, Phone, MapPin } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';

interface InvoiceScreenProps {
  onBack: () => void;
}

export function InvoiceScreen({ onBack }: InvoiceScreenProps) {
  const invoice = {
    number: 'INV-2025-001-456',
    date: '2025-12-15',
    dueDate: '2025-12-30',
    orderNumber: 'ORD-2025-156',
    status: 'paid',
    gstNumber: '29AAAAA0000A1Z5',
    
    // Seller (Tashivar)
    seller: {
      name: 'Tashivar Distribution Pvt. Ltd.',
      address: '456, Fashion District, MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      gstin: '27AABCT1332L1ZB',
      phone: '+91 22 1234 5678',
      email: 'orders@tashivar.com'
    },

    // Buyer
    buyer: {
      name: 'Kumar Fashion Store',
      contact: 'Rajesh Kumar',
      address: '123, MG Road, Brigade Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      gstin: '29AAAAA0000A1Z5',
      phone: '+91 98765 43210',
      email: 'kumar.fashion@example.com'
    },

    // Items
    items: [
      {
        id: '1',
        sku: 'TSV-KRT-001',
        name: 'Premium Cotton Kurta Set',
        description: 'Premium quality cotton kurta with matching pajama - Size L, Color: Ivory',
        hsn: '6203',
        quantity: 10,
        unit: 'PCS',
        price: 1299,
        discount: 0,
        taxRate: 18
      },
      {
        id: '2',
        sku: 'TSV-SHW-045',
        name: 'Designer Sherwani Collection',
        description: 'Premium silk sherwani with intricate embroidery - Size XL, Color: Gold',
        hsn: '6204',
        quantity: 5,
        unit: 'PCS',
        price: 4599,
        discount: 0,
        taxRate: 18
      },
      {
        id: '3',
        sku: 'TSV-IW-023',
        name: 'Indo-Western Blazer Jacket',
        description: 'Velvet blazer jacket with modern design - Size L, Color: Navy',
        hsn: '6203',
        quantity: 8,
        unit: 'PCS',
        price: 2899,
        discount: 0,
        taxRate: 18
      }
    ],

    // Payment Info
    payment: {
      method: 'UPI',
      transactionId: 'TXN20251215123456',
      paidDate: '2025-12-15'
    }
  };

  const calculateItemTotal = (item: typeof invoice.items[0]) => {
    const baseAmount = item.quantity * item.price;
    const discountAmount = baseAmount * (item.discount / 100);
    return baseAmount - discountAmount;
  };

  const calculateItemTax = (item: typeof invoice.items[0]) => {
    const baseAmount = calculateItemTotal(item);
    return baseAmount * (item.taxRate / 100);
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  const totalTax = invoice.items.reduce((sum, item) => sum + calculateItemTax(item), 0);
  const grandTotal = subtotal + totalTax;

  // Group tax by rate for summary
  const taxSummary = invoice.items.reduce((acc: any, item) => {
    const rate = item.taxRate;
    if (!acc[rate]) {
      acc[rate] = { rate, amount: 0, cgst: 0, sgst: 0 };
    }
    const tax = calculateItemTax(item);
    acc[rate].amount += tax;
    acc[rate].cgst += tax / 2;
    acc[rate].sgst += tax / 2;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-3">
              <Button variant="secondary" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Email</span>
              </Button>
              <Button variant="secondary" className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button variant="primary" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Invoice Card */}
        <Card className="p-8 sm:p-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8 pb-8 border-b-2 border-border">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">Tashivar</h1>
                  <p className="text-text-secondary">Tax Invoice</p>
                </div>
              </div>
              <div className="text-sm text-text-secondary space-y-1">
                <p className="font-semibold text-text-primary">{invoice.seller.name}</p>
                <p>{invoice.seller.address}</p>
                <p>{invoice.seller.city}, {invoice.seller.state} - {invoice.seller.pincode}</p>
                <p className="flex items-center gap-2 mt-2">
                  <Phone className="w-3 h-3" />
                  {invoice.seller.phone}
                </p>
                <p>{invoice.seller.email}</p>
                <p className="mt-2"><span className="font-medium">GSTIN:</span> {invoice.seller.gstin}</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <h2 className="text-3xl font-bold text-primary-600 mb-4">{invoice.number}</h2>
              {invoice.status === 'paid' && (
                <Badge className="bg-success text-white mb-4 inline-flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  PAID
                </Badge>
              )}
              <div className="text-sm space-y-2">
                <div>
                  <p className="text-text-tertiary">Invoice Date</p>
                  <p className="font-semibold text-text-primary">
                    {new Date(invoice.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-text-tertiary">Order Number</p>
                  <p className="font-semibold text-text-primary">{invoice.orderNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
            <div>
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-600" />
                Bill To
              </h3>
              <div className="text-sm text-text-secondary space-y-1">
                <p className="font-semibold text-text-primary text-base">{invoice.buyer.name}</p>
                <p>Contact: {invoice.buyer.contact}</p>
                <p>{invoice.buyer.address}</p>
                <p>{invoice.buyer.city}, {invoice.buyer.state} - {invoice.buyer.pincode}</p>
                <p className="flex items-center gap-2 mt-2">
                  <Phone className="w-3 h-3" />
                  {invoice.buyer.phone}
                </p>
                <p>{invoice.buyer.email}</p>
                <p className="mt-2"><span className="font-medium">GSTIN:</span> {invoice.buyer.gstin}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" />
                Ship To
              </h3>
              <div className="text-sm text-text-secondary space-y-1">
                <p className="font-semibold text-text-primary text-base">{invoice.buyer.name}</p>
                <p>{invoice.buyer.address}</p>
                <p>{invoice.buyer.city}, {invoice.buyer.state} - {invoice.buyer.pincode}</p>
              </div>

              {invoice.status === 'paid' && invoice.payment && (
                <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                  <h4 className="font-semibold text-success mb-2 text-sm">Payment Information</h4>
                  <div className="text-xs text-text-secondary space-y-1">
                    <p>Method: {invoice.payment.method}</p>
                    <p>Transaction ID: {invoice.payment.transactionId}</p>
                    <p>Paid on: {new Date(invoice.payment.paidDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-text-primary">#</th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-text-primary">Item Details</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-text-primary">HSN</th>
                    <th className="text-center py-3 px-2 text-sm font-semibold text-text-primary">Qty</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-text-primary">Rate</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-text-primary">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="py-4 px-2 text-sm text-text-tertiary">{idx + 1}</td>
                      <td className="py-4 px-2">
                        <p className="font-semibold text-text-primary mb-1">{item.name}</p>
                        <p className="text-xs text-text-secondary mb-1">SKU: {item.sku}</p>
                        <p className="text-xs text-text-tertiary">{item.description}</p>
                      </td>
                      <td className="py-4 px-2 text-center text-sm text-text-primary">{item.hsn}</td>
                      <td className="py-4 px-2 text-center text-sm text-text-primary">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-4 px-2 text-right text-sm text-text-primary">
                        ₹{item.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-2 text-right font-semibold text-text-primary">
                        ₹{calculateItemTotal(item).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tax Summary */}
            <div className="order-2 md:order-1">
              <h3 className="font-semibold text-text-primary mb-3">Tax Summary</h3>
              <div className="space-y-2">
                {Object.values(taxSummary).map((tax: any) => (
                  <div key={tax.rate} className="text-sm">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-text-secondary">GST @ {tax.rate}%</span>
                      <span className="font-medium text-text-primary">₹{Math.round(tax.amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 text-xs text-text-tertiary pl-4">
                      <span>CGST ({tax.rate / 2}%)</span>
                      <span>₹{Math.round(tax.cgst).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 text-xs text-text-tertiary pl-4">
                      <span>SGST ({tax.rate / 2}%)</span>
                      <span>₹{Math.round(tax.sgst).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <p className="text-xs text-text-tertiary mb-2">Amount in Words:</p>
                <p className="text-sm font-semibold text-text-primary">
                  Rupees {new Intl.NumberFormat('en-IN').format(Math.round(grandTotal))} Only
                </p>
              </div>
            </div>

            {/* Amount Summary */}
            <div className="order-1 md:order-2">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Subtotal</span>
                  <span className="font-medium text-text-primary">₹{Math.round(subtotal).toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Total Tax</span>
                  <span className="font-medium text-text-primary">₹{Math.round(totalTax).toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t-2 border-border">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-text-primary">Grand Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{Math.round(grandTotal).toLocaleString()}
                    </span>
                  </div>
                </div>

                {invoice.status === 'paid' && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-success font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Amount Paid
                      </span>
                      <span className="text-xl font-bold text-success">
                        ₹{Math.round(grandTotal).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Signature */}
          <div className="mt-12 pt-8 border-t-2 border-border grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-text-primary mb-3">Terms & Conditions</h3>
              <ul className="text-xs text-text-secondary space-y-1">
                <li>• Payment terms: Net 30 days from invoice date</li>
                <li>• All disputes subject to Mumbai jurisdiction</li>
                <li>• Goods once sold cannot be returned</li>
                <li>• Interest @ 18% p.a. will be charged on delayed payments</li>
                <li>• Please quote invoice number for all correspondence</li>
              </ul>
            </div>

            <div className="text-right">
              <p className="text-sm text-text-secondary mb-8">For {invoice.seller.name}</p>
              <div className="border-t border-text-tertiary inline-block px-8 pt-2">
                <p className="text-sm font-medium text-text-primary">Authorized Signatory</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-text-tertiary">
              This is a computer-generated invoice and does not require a physical signature.
            </p>
            <p className="text-xs text-text-tertiary mt-1">
              Thank you for your business with Tashivar B2B Portal
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
