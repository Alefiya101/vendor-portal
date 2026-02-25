import React from 'react';

export function printChallan(challan: any) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the challan');
    return;
  }

  const challanHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Challan - ${challan.challanNumber}</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: #fff;
        }
        
        .challan-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm;
          background: white;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 3px solid #f59e0b;
          padding-bottom: 15px;
        }
        
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #7c2d12;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .company-tagline {
          font-size: 11px;
          color: #666;
          font-style: italic;
          margin-bottom: 8px;
        }
        
        .document-title {
          font-size: 20px;
          font-weight: bold;
          color: #f59e0b;
          margin-top: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .challan-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 15px;
          background: #fffbeb;
          border: 2px solid #fcd34d;
          border-radius: 8px;
        }
        
        .info-section {
          flex: 1;
        }
        
        .info-section h3 {
          font-size: 11px;
          color: #92400e;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        
        .info-row {
          margin-bottom: 4px;
          font-size: 12px;
        }
        
        .info-label {
          font-weight: 600;
          color: #000;
          display: inline-block;
          width: 110px;
        }
        
        .info-value {
          color: #333;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          border: 2px solid #fcd34d;
        }
        
        .items-table thead {
          background: #f59e0b;
          color: white;
        }
        
        .items-table th {
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #d97706;
        }
        
        .items-table td {
          padding: 10px 8px;
          border: 1px solid #fcd34d;
          font-size: 12px;
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #fffbeb;
        }
        
        .items-table tbody tr:hover {
          background: #fef3c7;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .totals-section {
          float: right;
          width: 300px;
          margin-top: 10px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 15px;
          border-bottom: 1px solid #fcd34d;
        }
        
        .total-row.subtotal {
          background: #fffbeb;
          font-size: 13px;
          font-weight: 600;
        }
        
        .total-row.tax {
          background: #fef3c7;
          font-size: 13px;
        }
        
        .total-row.grand-total {
          background: #f59e0b;
          color: white;
          font-size: 15px;
          font-weight: bold;
          border: none;
        }
        
        .total-row.paid {
          background: #d1fae5;
          color: #065f46;
          font-size: 13px;
          font-weight: 600;
        }
        
        .total-row.balance {
          background: ${challan.paidAmount >= challan.totalAmount ? '#d1fae5' : '#fee2e2'};
          color: ${challan.paidAmount >= challan.totalAmount ? '#065f46' : '#991b1b'};
          font-size: 14px;
          font-weight: bold;
        }
        
        .notes-section {
          clear: both;
          margin-top: 100px;
          padding: 15px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        
        .notes-section h4 {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #374151;
          text-transform: uppercase;
        }
        
        .notes-section p {
          font-size: 11px;
          color: #6b7280;
          line-height: 1.5;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #fcd34d;
          text-align: center;
        }
        
        .footer-note {
          font-size: 10px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .signature-section {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
        }
        
        .signature-box {
          text-align: center;
          width: 200px;
        }
        
        .signature-line {
          border-top: 2px solid #000;
          margin-bottom: 5px;
          padding-top: 5px;
        }
        
        .signature-label {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
        }
        
        .challan-notice {
          background: #fef3c7;
          border: 2px dashed #f59e0b;
          padding: 12px;
          margin: 20px 0;
          border-radius: 8px;
          text-align: center;
        }
        
        .challan-notice strong {
          color: #92400e;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .challan-notice p {
          margin-top: 5px;
          font-size: 11px;
          color: #78350f;
        }
        
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #f59e0b;
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: all 0.2s;
        }
        
        .print-button:hover {
          background: #d97706;
          box-shadow: 0 6px 8px rgba(0,0,0,0.15);
        }
      </style>
    </head>
    <body>
      <button onclick="window.print()" class="print-button no-print">🖨️ Print Challan</button>
      
      <div class="challan-container">
        <!-- Header -->
        <div class="header">
          <div class="company-name">Tashivar</div>
          <div class="company-tagline">Premium Indian Ethnic Fashion B2B Portal</div>
          <div class="document-title">Delivery Challan</div>
        </div>
        
        <!-- Challan Notice -->
        <div class="challan-notice">
          <strong>⚠️ Goods on Approval / Consignment</strong>
          <p>This is a delivery challan. Payment can be made after approval of goods.</p>
        </div>
        
        <!-- Challan Info -->
        <div class="challan-info">
          <div class="info-section">
            <h3>📄 Challan Details</h3>
            <div class="info-row">
              <span class="info-label">Challan No:</span>
              <span class="info-value"><strong>${challan.challanNumber}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span class="info-value">${new Date(challan.challanDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Source:</span>
              <span class="info-value">${challan.sourceType === 'order' ? 'Online Order' : 'Offline Order'}</span>
            </div>
          </div>
          
          <div class="info-section">
            <h3>👤 Customer Details</h3>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value"><strong>${challan.customerName}</strong></span>
            </div>
            ${challan.customerPhone ? `
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${challan.customerPhone}</span>
            </div>` : ''}
            ${challan.customerAddress ? `
            <div class="info-row">
              <span class="info-label">Address:</span>
              <span class="info-value">${challan.customerAddress}</span>
            </div>` : ''}
          </div>
        </div>
        
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50px;" class="text-center">#</th>
              <th>Item Description</th>
              <th style="width: 80px;" class="text-center">HSN</th>
              <th style="width: 80px;" class="text-center">Qty</th>
              <th style="width: 100px;" class="text-right">Rate</th>
              <th style="width: 100px;" class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${challan.items.map((item: any, index: number) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>
                  <strong>${item.name}</strong>
                  ${item.description ? `<br><span style="color: #666; font-size: 11px;">${item.description}</span>` : ''}
                </td>
                <td class="text-center">${item.hsn || '5407'}</td>
                <td class="text-center"><strong>${item.quantity} ${item.unit === 'meters' ? 'm' : 'pcs'}</strong></td>
                <td class="text-right">₹${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="text-right"><strong>₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Totals Section -->
        <div class="totals-section">
          <div class="total-row subtotal">
            <span>Subtotal:</span>
            <span>₹${challan.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="total-row tax">
            <span>GST @ 5%:</span>
            <span>₹${challan.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Amount:</span>
            <span>₹${challan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          ${challan.paidAmount > 0 ? `
          <div class="total-row paid">
            <span>Paid Amount:</span>
            <span>₹${challan.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="total-row balance">
            <span>${challan.paidAmount >= challan.totalAmount ? 'Fully Paid ✓' : 'Balance Due'}:</span>
            <span>₹${(challan.totalAmount - challan.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          ` : ''}
        </div>
        
        <div style="clear: both;"></div>
        
        <!-- Notes Section -->
        ${challan.notes ? `
        <div class="notes-section">
          <h4>📝 Notes</h4>
          <p>${challan.notes}</p>
        </div>
        ` : ''}
        
        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">Customer Signature</div>
            <div class="signature-label">Received By</div>
          </div>
          <div class="signature-box">
            <div class="signature-line">Authorized Signatory</div>
            <div class="signature-label">For Tashivar</div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p class="footer-note"><strong>Note:</strong> This is a delivery challan and not an invoice. Payment terms as agreed.</p>
          <p class="footer-note">For any queries, please contact: support@tashivar.com</p>
          <p class="footer-note" style="margin-top: 10px; color: #92400e; font-weight: 600;">Thank you for your business!</p>
        </div>
      </div>
      
      <script>
        // Auto-print on load (optional)
        // window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(challanHTML);
  printWindow.document.close();
}