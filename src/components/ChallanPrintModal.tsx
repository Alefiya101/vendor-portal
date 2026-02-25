import React, { useState } from 'react';
import { TashivarInvoice } from './TashivarInvoice';

interface ChallanPrintModalProps {
  challan: any;
  onClose: () => void;
}

export function ChallanPrintModal({ challan, onClose }: ChallanPrintModalProps) {
  // Transform challan data to invoice format
  const invoiceData = {
    type: 'challan' as const,
    documentNumber: challan.challanNumber,
    date: challan.challanDate,
    customerName: challan.customerName,
    customerAddress: challan.customerAddress,
    customerPhone: challan.customerPhone,
    customerGSTIN: challan.customerGSTIN,
    items: challan.items?.map((item: any, index: number) => ({
      srNo: index + 1,
      description: item.name || item.productDetails || item.description,
      quality: item.quality,
      colorNumber: item.colorNumber,
      colorName: item.colorName || item.fabricColor,
      quantity: item.quantity,
      unit: item.unit || 'pieces',
      rate: item.rate || item.sellingPrice || 0,
      amount: item.amount || (item.quantity * (item.rate || item.sellingPrice || 0)),
      processCosts: item.processCosts
    })) || [],
    subtotal: challan.subtotal,
    cgst: challan.cgst || 0,
    sgst: challan.sgst || 0,
    igst: challan.igst || 0,
    totalAmount: challan.totalAmount,
    notes: challan.notes,
    termsAndConditions: [
      'This is a delivery challan for goods sent on approval/consignment',
      'Payment is due after approval and confirmation of goods',
      'Goods remain property of Tashivar until fully paid',
      'Damaged or defective items must be reported within 48 hours',
      'Return policy as per agreed terms'
    ]
  };

  return (
    <TashivarInvoice
      {...invoiceData}
      onClose={onClose}
    />
  );
}
