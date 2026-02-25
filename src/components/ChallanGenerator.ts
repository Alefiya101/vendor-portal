import { getCompanySettings } from '../services/financeService';

// Convert number to words (Indian numbering system simplified)
function numberToWords(amount: number): string {
  const words = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (amount === 0) return 'Zero';
  
  const num = Math.floor(amount);
  
  // This is a simplified version. For a real B2B app, use a library like number-to-words
  return `Rupees ${num} Only`; 
}

export const printChallan = (challan: any) => {
  const settings = getCompanySettings();

  // Calculate totals
  const subtotal = challan.subtotal || 0;
  const taxAmount = challan.taxAmount || 0;
  const totalAmount = challan.totalAmount || 0;
  const paidAmount = challan.paidAmount || 0;
  const balanceAmount = totalAmount - paidAmount;
  
  const totalQty = challan.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  // Prepare rows
  let itemsHtml = challan.items?.map((item: any, index: number) => {
    return `
    <tr class="text-[10px]">
      <td class="border-r border-black px-1 py-1 text-center w-6">${index + 1}</td>
      <td class="border-r border-black px-1 py-1 w-[40%]">
        <div class="font-medium">${item.name}</div>
        ${item.description ? `<div class="text-[8px] text-gray-600">${item.description}</div>` : ''}
      </td>
      <td class="border-r border-black px-1 py-1 text-center w-[10%]">${item.hsn || '5407'}</td>
      <td class="border-r border-black px-1 py-1 text-right w-[8%]">${item.quantity}</td>
      <td class="border-r border-black px-1 py-1 text-right w-[10%]">₹${item.rate.toFixed(2)}</td>
      <td class="px-1 py-1 text-right font-medium w-[15%]">₹${item.amount.toFixed(2)}</td>
    </tr>
  `}).join('') || '';

  // Fill empty rows
  const minRows = 12;
  const remainingRows = minRows - (challan.items?.length || 0);
  if (remainingRows > 0) {
    for (let i = 0; i < remainingRows; i++) {
      itemsHtml += `
        <tr class="text-[10px] h-4">
          <td class="border-r border-black px-1 py-1"></td>
          <td class="border-r border-black px-1 py-1"></td>
          <td class="border-r border-black px-1 py-1"></td>
          <td class="border-r border-black px-1 py-1"></td>
          <td class="border-r border-black px-1 py-1"></td>
          <td class="px-1 py-1"></td>
        </tr>
      `;
    }
  }

  const challanHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Delivery Challan - ${challan.challanNumber}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { 
        size: A4;
        margin: 0.5cm;
      }
      body { margin: 0; padding: 0; }
      .no-print { display: none; }
    }
    body { 
      font-family: 'Arial', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  </style>
</head>
<body class="bg-white">
  <div class="max-w-[210mm] mx-auto bg-white p-4">
    <!-- Print Button -->
    <div class="no-print mb-4 flex justify-end">
      <button onclick="window.print()" class="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
        Print Challan
      </button>
    </div>

    <!-- Challan Container -->
    <div class="border-4 border-double border-black p-3">
      <!-- Header Section -->
      <div class="border-2 border-black p-2 mb-2">
        <div class="text-center mb-1">
          <h1 class="text-2xl font-bold uppercase tracking-wide">${settings.companyName || 'Tashivar'}</h1>
          <p class="text-[10px] mt-0.5">${settings.address || 'Business Address'}</p>
          <p class="text-[10px]">
            ${settings.city ? settings.city + ', ' : ''}${settings.state || ''} ${settings.pincode ? '- ' + settings.pincode : ''}
          </p>
          ${settings.phone ? `<p class="text-[10px]">Phone: ${settings.phone}</p>` : ''}
          ${settings.email ? `<p class="text-[10px]">Email: ${settings.email}</p>` : ''}
        </div>
        ${settings.gstin ? `
        <div class="border-t border-gray-300 pt-1 mt-1 grid grid-cols-2 gap-1 text-[9px]">
          <div><span class="font-semibold">GSTIN:</span> ${settings.gstin}</div>
          ${settings.panNo ? `<div><span class="font-semibold">PAN:</span> ${settings.panNo}</div>` : ''}
        </div>
        ` : ''}
      </div>

      <!-- Challan Title -->
      <div class="bg-amber-100 border-2 border-amber-600 p-2 mb-2 text-center">
        <h2 class="text-xl font-bold uppercase tracking-widest">DELIVERY CHALLAN</h2>
        <p class="text-[9px] text-amber-800 mt-0.5 italic">Goods sent on approval / consignment basis</p>
      </div>

      <!-- Challan Details & Customer Info -->
      <div class="grid grid-cols-2 gap-2 mb-2">
        <!-- Challan Info -->
        <div class="border border-black p-2">
          <div class="text-[10px] space-y-0.5">
            <div class="flex justify-between">
              <span class="font-semibold">Challan No:</span>
              <span class="font-bold">${challan.challanNumber}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">Challan Date:</span>
              <span>${new Date(challan.challanDate).toLocaleDateString('en-IN')}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold">Source Type:</span>
              <span class="uppercase text-[9px] bg-gray-100 px-1 py-0.5 rounded">${challan.sourceType.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="border border-black p-2">
          <div class="text-[9px] mb-1 font-semibold uppercase border-b border-gray-300 pb-0.5">Customer Details:</div>
          <div class="text-[10px] space-y-0.5">
            <div class="font-semibold">${challan.customerName}</div>
            ${challan.customerAddress ? `<div class="text-[9px]">${challan.customerAddress}</div>` : ''}
            ${challan.customerPhone ? `<div>Phone: ${challan.customerPhone}</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div class="border-2 border-black mb-2">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100 text-[9px] font-bold uppercase">
              <th class="border-r border-black px-1 py-1.5 text-center">Sr</th>
              <th class="border-r border-black px-1 py-1.5 text-left">Description of Goods</th>
              <th class="border-r border-black px-1 py-1.5 text-center">HSN</th>
              <th class="border-r border-black px-1 py-1.5 text-center">Qty</th>
              <th class="border-r border-black px-1 py-1.5 text-right">Rate</th>
              <th class="px-1 py-1.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody class="border-t-2 border-black">
            ${itemsHtml}
            <!-- Totals Row -->
            <tr class="border-t-2 border-black bg-gray-50 font-bold text-[10px]">
              <td colspan="3" class="border-r border-black px-1 py-1 text-right">TOTAL:</td>
              <td class="border-r border-black px-1 py-1 text-right">${totalQty}</td>
              <td class="border-r border-black px-1 py-1"></td>
              <td class="px-1 py-1 text-right">₹${subtotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Amount Summary -->
      <div class="grid grid-cols-2 gap-2 mb-2">
        <!-- Amount in Words -->
        <div class="border border-black p-2">
          <div class="text-[9px] font-semibold mb-1">Total Amount (in words):</div>
          <div class="text-[10px] font-medium uppercase">${numberToWords(totalAmount)}</div>
        </div>

        <!-- Amount Breakdown -->
        <div class="border-2 border-black">
          <table class="w-full text-[10px]">
            <tr class="border-b border-black">
              <td class="px-2 py-1 font-semibold">Subtotal:</td>
              <td class="px-2 py-1 text-right">₹${subtotal.toFixed(2)}</td>
            </tr>
            ${taxAmount > 0 ? `
            <tr class="border-b border-black">
              <td class="px-2 py-1 font-semibold">Tax Amount:</td>
              <td class="px-2 py-1 text-right">₹${taxAmount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr class="bg-amber-50 border-b-2 border-black">
              <td class="px-2 py-1 font-bold">Total Amount:</td>
              <td class="px-2 py-1 text-right font-bold">₹${totalAmount.toFixed(2)}</td>
            </tr>
            ${paidAmount > 0 ? `
            <tr class="bg-emerald-50 border-b border-black">
              <td class="px-2 py-1 font-semibold text-emerald-700">Amount Paid:</td>
              <td class="px-2 py-1 text-right font-semibold text-emerald-700">₹${paidAmount.toFixed(2)}</td>
            </tr>
            <tr class="bg-amber-50">
              <td class="px-2 py-1 font-bold text-amber-700">Balance Due:</td>
              <td class="px-2 py-1 text-right font-bold text-amber-700">₹${balanceAmount.toFixed(2)}</td>
            </tr>
            ` : ''}
          </table>
        </div>
      </div>

      <!-- Important Notes -->
      <div class="border-2 border-amber-600 bg-amber-50 p-2 mb-2">
        <div class="text-[9px] font-bold uppercase mb-1 text-amber-900">Important Notes:</div>
        <ul class="text-[8px] space-y-0.5 list-disc list-inside text-amber-900">
          <li>This is a delivery challan, not an invoice. Payment is due upon customer approval.</li>
          <li>Goods remain the property of the supplier until full payment is received.</li>
          <li>Customer may inspect goods and return unwanted items within agreed timeframe.</li>
          <li>This challan will be converted to a tax invoice upon payment confirmation.</li>
          ${challan.notes ? `<li><strong>Note:</strong> ${challan.notes}</li>` : ''}
        </ul>
      </div>

      <!-- Payment History (if any) -->
      ${challan.paymentHistory && challan.paymentHistory.length > 0 ? `
      <div class="border border-black p-2 mb-2">
        <div class="text-[9px] font-bold uppercase mb-1">Payment History:</div>
        <table class="w-full text-[8px]">
          <thead class="bg-gray-100 border-b border-gray-300">
            <tr>
              <th class="px-1 py-0.5 text-left">Date</th>
              <th class="px-1 py-0.5 text-left">Method</th>
              <th class="px-1 py-0.5 text-right">Amount</th>
              <th class="px-1 py-0.5 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${challan.paymentHistory.map((payment: any) => `
            <tr class="border-b border-gray-200">
              <td class="px-1 py-0.5">${new Date(payment.date).toLocaleDateString('en-IN')}</td>
              <td class="px-1 py-0.5">${payment.method}</td>
              <td class="px-1 py-0.5 text-right font-semibold">₹${payment.amount.toFixed(2)}</td>
              <td class="px-1 py-0.5 text-[7px]">${payment.notes || '-'}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Signatures -->
      <div class="grid grid-cols-3 gap-4 border-t-2 border-black pt-8 mt-2">
        <div class="text-center">
          <div class="border-t border-black pt-1 text-[9px] font-semibold">Prepared By</div>
        </div>
        <div class="text-center">
          <div class="border-t border-black pt-1 text-[9px] font-semibold">Checked By</div>
        </div>
        <div class="text-center">
          <div class="border-t border-black pt-1 text-[9px] font-semibold">Customer Signature</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-4 text-center text-[8px] text-gray-600 italic">
        <p>This is a computer-generated challan and does not require a signature.</p>
        <p class="mt-0.5">For any queries, please contact us at ${settings.phone || '[Phone]'} or ${settings.email || '[Email]'}</p>
      </div>
    </div>
  </div>

  <script>
    // Auto print on load (optional)
    // window.onload = function() { window.print(); }
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(challanHtml);
    printWindow.document.close();
  }
};
