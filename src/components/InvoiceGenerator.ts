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

export const printInvoice = (order: any) => {
  const settings = getCompanySettings();

  // Calculate totals
  const subtotal = order.subtotal || order.products.reduce((sum: number, p: any) => sum + ((p.sellingPrice || p.price || 0) * p.quantity), 0);
  const totalQty = order.products.reduce((sum: number, p: any) => sum + p.quantity, 0);
  
  // Tax and Discount config (defaults to standard if not provided)
  const discountRate = order.discountRate !== undefined ? order.discountRate : 0;
  // Use global default if not on order
  const taxRate = order.taxRate !== undefined ? order.taxRate : (settings.defaultGstRate || 5);
  
  const discountAmount = subtotal * (discountRate / 100);
  const taxableAmountGlobal = subtotal - discountAmount;
  
  // Determine GST Type based on place of supply
  // Logic: Compare Order Place of Supply with Company Home State
  const companyState = settings.state || 'Gujarat';
  const placeOfSupply = order.placeOfSupply || order.buyerAddress || companyState;
  
  // Normalize for comparison
  const posNormalized = placeOfSupply.toLowerCase().trim();
  const homeNormalized = companyState.toLowerCase().trim();
  
  // Check if Intra-state (Same State)
  // If POS contains home state name (e.g. "Surat, Gujarat" contains "gujarat")
  const isIntraState = posNormalized === '' || posNormalized.includes(homeNormalized);
  
  // Calculate Tax Amounts
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let taxAmount = 0;

  if (isIntraState) {
      // Intra-state: CGST + SGST
      taxAmount = taxableAmountGlobal * (taxRate / 100);
      cgstAmount = taxAmount / 2;
      sgstAmount = taxAmount / 2;
  } else {
      // Inter-state: IGST
      taxAmount = taxableAmountGlobal * (taxRate / 100);
      igstAmount = taxAmount;
  }
  
  const total = taxableAmountGlobal + taxAmount;

  // Prepare rows (pad to min 15 rows for better page fill)
  let itemsHtml = order.products.map((item: any, index: number) => {
      const itemPrice = item.sellingPrice || item.price || 0;
      const itemTotal = itemPrice * item.quantity;
      
      // Pro-rata discount
      const itemDiscount = itemTotal * (discountRate / 100);
      const taxableValue = itemTotal - itemDiscount;
      
      // Per item tax calculation for display
      const itemTaxAmount = taxableValue * (taxRate / 100);
      const finalTotal = taxableValue + itemTaxAmount;
      
      return `
    <tr class="text-[10px]">
      <td class="border-r border-black px-1 py-1 text-center w-6">${index + 1}</td>
      <td class="border-r border-black px-1 py-1 w-[40%]">
        <div class="font-medium truncate max-w-[250px]">${item.name}</div>
        ${item.type === 'custom' ? '<div class="text-[8px] text-gray-500">Custom Item</div>' : ''}
      </td>
      <td class="border-r border-black px-1 py-1 text-center w-[10%]">${item.hsn || '5407'}</td>
      <td class="border-r border-black px-1 py-1 text-right w-[8%]">${item.quantity}</td>
      <td class="border-r border-black px-1 py-1 text-right w-[10%]">₹${itemPrice.toFixed(2)}</td>
      <td class="border-r border-black px-1 py-1 text-right w-[12%]">₹${taxableValue.toFixed(2)}</td>
      <td class="px-1 py-1 text-right font-medium w-[15%]">₹${finalTotal.toFixed(2)}</td>
    </tr>
  `}).join('');

  // Fill empty rows to maintain height
  const minRows = 12;
  const remainingRows = minRows - order.products.length;
  if (remainingRows > 0) {
    for (let i = 0; i < remainingRows; i++) {
      itemsHtml += `
        <tr class="text-[10px] h-4">
          <td class="border-r border-black px-1 py-1"></td>
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

  // Tax Analysis Row HTML (Detailed Breakdown)
  let taxAnalysisHtml = '';
  if (isIntraState) {
      taxAnalysisHtml = `
        <td class="py-1 px-2 text-right border-r border-black">${(taxRate/2).toFixed(2)}%</td>
        <td class="py-1 px-2 text-right border-r border-black">₹${cgstAmount.toFixed(2)}</td>
        <td class="py-1 px-2 text-right border-r border-black">${(taxRate/2).toFixed(2)}%</td>
        <td class="py-1 px-2 text-right border-r border-black">₹${sgstAmount.toFixed(2)}</td>
      `;
  } else {
      taxAnalysisHtml = `
        <td class="py-1 px-2 text-right border-r border-black">${taxRate.toFixed(2)}%</td>
        <td class="py-1 px-2 text-right border-r border-black">₹${igstAmount.toFixed(2)}</td>
      `;
  }

  const printWindow = window.open('', '', 'height=1123,width=794'); // A4 Dimensions roughly
  
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${order.invoiceNumber || order.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { size: A4; margin: 10mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: 'Times New Roman', Times, serif; }
            .border-black { border-color: #000; }
            table { border-collapse: collapse; }
          </style>
        </head>
        <body class="bg-white max-w-[210mm] mx-auto text-black p-4">
          
          <div class="border border-black">
            
            <!-- Header -->
            <div class="border-b border-black flex">
              <!-- Logo Section -->
              <div class="w-24 p-2 border-r border-black flex items-center justify-center">
                 <div class="w-16 h-16 border-2 border-black flex items-center justify-center font-bold text-2xl bg-gray-100">
                   ${settings.tradeName ? settings.tradeName.charAt(0) : 'T'}
                 </div>
              </div>
              
              <!-- Company Info -->
              <div class="flex-1 text-center p-2 relative">
                <div class="absolute top-1 right-1 border border-black px-2 py-0.5 text-[9px] font-bold bg-gray-100 uppercase">TAX INVOICE</div>
                <div class="text-[9px] font-bold mb-0.5 text-gray-600">|| Shree Ganeshay Namah ||</div>
                <h1 class="text-2xl font-extrabold uppercase tracking-wide">${settings.legalName || 'Tashivar B2B'}</h1>
                <p class="text-[10px] font-bold mt-1 max-w-md mx-auto leading-tight">${settings.address || 'Surat, Gujarat'}</p>
                <p class="text-[10px] mt-1">Phone: ${settings.phone || ''} | Email: ${settings.email || ''}</p>
              </div>
            </div>

            <!-- GST Row -->
            <div class="border-b border-black text-[10px] px-2 py-1.5 font-bold flex justify-between bg-gray-50">
               <span>GSTIN: ${settings.gstin || ''}</span>
               <span>State: ${settings.state} (Code: ${settings.stateCode || '24'})</span>
            </div>

            <!-- Info Grid -->
            <div class="flex border-b border-black text-[10px]">
              <!-- Bill To & Delivery -->
              <div class="w-1/2 border-r border-black">
                <div class="p-2 border-b border-black h-28">
                  <div class="font-bold underline mb-1">Bill To:</div>
                  <div class="font-bold uppercase text-sm">${order.buyer || order.partyName || 'CASH SALE'}</div>
                  <div class="leading-tight mt-1 max-w-[200px]">${order.buyerAddress || 'Surat, Gujarat'}</div>
                  <div class="mt-2 font-bold">GSTIN: ${order.buyerGst || 'Unregistered'}</div>
                </div>
                <div class="p-2 h-20 bg-gray-50/50">
                  <div class="font-bold underline mb-1">Place of Supply:</div>
                  <div class="text-xs uppercase font-bold">${placeOfSupply}</div>
                  <div class="italic text-[9px] text-gray-600 mt-1">
                    ${isIntraState ? '(Intra-State Transaction)' : '(Inter-State Transaction)'}
                  </div>
                </div>
              </div>

              <!-- Invoice Details -->
              <div class="w-1/2">
                <div class="grid grid-cols-2">
                   <div class="p-1.5 border-b border-r border-black font-bold bg-gray-50">Invoice No :</div>
                   <div class="p-1.5 border-b border-black font-bold">${order.invoiceNumber || order.id}</div>
                   
                   <div class="p-1.5 border-b border-r border-black font-bold bg-gray-50">Date :</div>
                   <div class="p-1.5 border-b border-black font-bold">${new Date(order.date).toLocaleDateString('en-GB')}</div>
                   
                   <div class="p-1.5 border-b border-r border-black font-bold bg-gray-50">Reverse Charge :</div>
                   <div class="p-1.5 border-b border-black">No</div>
                   
                   <div class="p-1.5 border-b border-r border-black font-bold bg-gray-50">Payment Mode :</div>
                   <div class="p-1.5 border-b border-black uppercase">${order.paymentMethod || 'Credit'}</div>
                </div>
                
                <!-- Logistics -->
                <div class="border-t border-black">
                   <div class="grid grid-cols-4 text-[9px]">
                      <div class="p-1 border-b border-r border-black font-bold col-span-1 bg-gray-50">Transport :</div>
                      <div class="p-1 border-b border-black col-span-3 font-bold">${order.transportName || '-'}</div>

                      <div class="p-1 border-r border-black font-bold col-span-1 bg-gray-50">LR No :</div>
                      <div class="p-1 col-span-3">${order.trackingId || '-'}</div>
                   </div>
                </div>
              </div>
            </div>

            <!-- Main Table -->
            <table class="w-full table-fixed">
              <thead>
                <tr class="text-[10px] border-b border-black bg-gray-100">
                  <th class="border-r border-black px-1 py-1 w-6">#</th>
                  <th class="border-r border-black px-1 py-1 text-left w-[40%]">Description of Goods</th>
                  <th class="border-r border-black px-1 py-1 w-[10%]">HSN/SAC</th>
                  <th class="border-r border-black px-1 py-1 w-[8%]">Qty</th>
                  <th class="border-r border-black px-1 py-1 w-[10%]">Rate</th>
                  <th class="border-r border-black px-1 py-1 w-[12%]">Taxable</th>
                  <th class="px-1 py-1 w-[15%]">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Tax Analysis Table -->
            <div class="border-t border-black">
                <div class="bg-gray-100 px-2 py-1 border-b border-black flex justify-between items-center">
                    <h4 className="text-[9px] font-bold uppercase">Tax Analysis</h4>
                    <span class="text-[9px] font-medium italic">All amounts in INR</span>
                </div>
                <table class="w-full text-[9px]">
                    <thead>
                        <tr class="bg-gray-50 border-b border-black">
                            <th class="text-left py-1 px-2 font-medium border-r border-black w-24">HSN/SAC</th>
                            <th class="text-right py-1 px-2 font-medium border-r border-black">Taxable Value</th>
                            ${isIntraState ? `
                                <th class="text-right py-1 px-2 font-medium border-r border-black">CGST Rate</th>
                                <th class="text-right py-1 px-2 font-medium border-r border-black">CGST Amt</th>
                                <th class="text-right py-1 px-2 font-medium border-r border-black">SGST Rate</th>
                                <th class="text-right py-1 px-2 font-medium border-r border-black">SGST Amt</th>
                            ` : `
                                <th class="text-right py-1 px-2 font-medium border-r border-black">IGST Rate</th>
                                <th class="text-right py-1 px-2 font-medium border-r border-black">IGST Amt</th>
                            `}
                            <th class="text-right py-1 px-2 font-medium">Total Tax</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="py-1 px-2 border-r border-black">5407</td>
                            <td class="py-1 px-2 text-right border-r border-black">
                                ₹${taxableAmountGlobal.toFixed(2)}
                            </td>
                            ${taxAnalysisHtml}
                            <td class="py-1 px-2 text-right font-bold">
                                 ₹${taxAmount.toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Bottom Section -->
            <div class="flex border-t border-black">
              
              <!-- Left: Bank Details & Terms -->
              <div class="w-[60%] border-r border-black flex flex-col justify-between">
                <div>
                  <div class="bg-gray-100 px-2 py-1 text-[10px] font-bold border-b border-black uppercase">Bank Details</div>
                  <div class="p-2 text-[10px] leading-relaxed grid grid-cols-2 gap-x-4">
                    <div class="font-bold">BANK NAME:</div>
                    <div class="uppercase">${settings.bankName || ''}</div>
                    
                    <div class="font-bold">A/C NO:</div>
                    <div class="font-mono">${settings.accountNumber || ''}</div>
                    
                    <div class="font-bold">IFSC CODE:</div>
                    <div class="font-mono">${settings.ifsc || ''}</div>
                    
                    <div class="font-bold">BRANCH:</div>
                    <div class="uppercase">${settings.branch || ''}</div>
                  </div>
                </div>

                <div class="border-t border-black px-2 py-1.5 text-[10px] font-bold uppercase bg-gray-50 flex gap-2">
                  <span>Amount in Words:</span>
                  <span class="font-extrabold">${numberToWords(total)}</span>
                </div>

                <div class="border-t border-black p-2 text-[8px]">
                  <p class="font-bold underline mb-1">Terms & Conditions</p>
                  <ol class="list-decimal pl-3 space-y-0.5">
                    ${(settings.terms && Array.isArray(settings.terms)) ? 
                      settings.terms.map((t: string) => `<li>${t}</li>`).join('') : 
                      '<li>Subject to Jurisdiction.</li>'}
                  </ol>
                </div>
              </div>

              <!-- Right: Totals -->
              <div class="w-[40%] flex flex-col">
                <div class="flex-1 text-[10px]">
                   <div class="flex justify-between px-2 py-1">
                     <span>Subtotal</span>
                     <span>${subtotal.toFixed(2)}</span>
                   </div>
                   <div class="flex justify-between px-2 py-1">
                     <span>Discount</span>
                     <span>- ${discountAmount.toFixed(2)}</span>
                   </div>
                   
                   <div class="flex justify-between px-2 py-1 font-bold border-t border-dotted border-gray-400 bg-gray-50">
                     <span>Taxable Value</span>
                     <span>${taxableAmountGlobal.toFixed(2)}</span>
                   </div>
                   
                   ${isIntraState ? `
                   <div class="flex justify-between px-2 py-1">
                     <span>Add: SGST @ ${(taxRate/2).toFixed(2)}%</span>
                     <span>${sgstAmount.toFixed(2)}</span>
                   </div>
                   <div class="flex justify-between px-2 py-1">
                     <span>Add: CGST @ ${(taxRate/2).toFixed(2)}%</span>
                     <span>${cgstAmount.toFixed(2)}</span>
                   </div>
                   ` : `
                   <div class="flex justify-between px-2 py-1">
                     <span>Add: IGST @ ${taxRate.toFixed(2)}%</span>
                     <span>${igstAmount.toFixed(2)}</span>
                   </div>
                   `}
                   
                   <div class="flex justify-between px-2 py-1 font-bold bg-gray-100 border-t border-black">
                     <span>Total Tax Amount</span>
                     <span>${taxAmount.toFixed(2)}</span>
                   </div>
                </div>

                <!-- Final Total -->
                <div class="flex justify-between px-2 py-3 text-sm font-bold border-t border-b border-black bg-gray-200">
                   <span>Grand Total</span>
                   <span>₹${total.toFixed(2)}</span>
                </div>

                <!-- Signatures -->
                <div class="flex-1 p-2 text-[10px] flex flex-col justify-end min-h-[80px]">
                   <div class="flex justify-between items-end mt-4">
                      <div class="text-center w-1/2">
                        <div class="h-8 border-b border-gray-400 mb-1 w-20 mx-auto"></div>
                        <p class="text-[8px]">RECEIVER'S SIGN</p>
                      </div>
                      
                      <div class="text-center w-1/2">
                        <div class="font-bold mb-6 text-[8px] uppercase">For, ${settings.legalName || 'TASHIVAR B2B'}</div>
                        <p class="text-[8px]">Authorised Signatory</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

          </div>
          
          <div class="text-center mt-4 text-[8px] text-gray-500">
             This is a Computer Generated Invoice
          </div>

        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  }
};