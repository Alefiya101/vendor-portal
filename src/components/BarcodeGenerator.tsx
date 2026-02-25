import React, { useRef } from 'react';
import { Printer, Download, Package, User } from 'lucide-react';
import Barcode from 'react-barcode';

interface BarcodeGeneratorProps {
  type: 'product' | 'vendor';
  data: any | any[];
  onClose: () => void;
}

export function BarcodeGenerator({ type, data, onClose }: BarcodeGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const isBulk = Array.isArray(data);
  const items = isBulk ? data : [data];

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const windowPrint = window.open('', '', 'width=800,height=600');
    if (!windowPrint) return;

    windowPrint.document.write(`
      <html>
        <head>
          <title>Print Barcode - ${data.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .barcode-container {
              text-align: center;
              border: 2px solid #000;
              padding: 20px;
              background: white;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    windowPrint.document.close();
    windowPrint.focus();
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 250);
  };

  const handleDownload = () => {
    const svg = printRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `barcode-${data.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {type === 'product' ? (
              <Package className="w-6 h-6 text-blue-600" />
            ) : (
              <User className="w-6 h-6 text-purple-600" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {type === 'product' ? 'Product Barcode' : 'Vendor Barcode'}
              </h2>
              <p className="text-sm text-gray-500">
                Generate and print barcode for {data.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Barcode Display */}
        <div className="p-8">
          <div
            ref={printRef}
            className={isBulk ? "grid grid-cols-2 gap-6 print:grid-cols-2" : ""}
          >
            {items.map((item: any, idx: number) => (
              <div
                key={idx}
                className={`barcode-container border-2 border-gray-300 rounded-lg bg-white text-center flex flex-col items-center justify-center ${isBulk ? 'p-4 page-break-inside-avoid' : 'p-8'}`}
                style={{ pageBreakInside: 'avoid' }}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 truncate max-w-[250px]">{item.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-semibold text-lg text-gray-800">ID: {item.id}</p>
                    {type === 'product' && item.category && (
                      <p>Category: {item.category}</p>
                    )}
                    {type === 'product' && item.price && (
                      <p>Price: ₹{item.price.toLocaleString()}</p>
                    )}
                    {type === 'vendor' && item.owner && (
                      <p>Owner: {item.owner}</p>
                    )}
                    {type === 'vendor' && item.phone && (
                      <p>Contact: {item.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center my-4 w-full overflow-hidden">
                  <Barcode
                    value={item.id}
                    format="CODE128"
                    width={isBulk ? 1.5 : 2}
                    height={isBulk ? 60 : 80}
                    displayValue={true}
                    fontSize={14}
                    margin={10}
                  />
                </div>

                <div className="mt-2 pt-2 border-t border-gray-200 w-full">
                  <p className="text-xs text-gray-500">Tashivar B2B</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Barcode
          </button>
        </div>
      </div>
    </div>
  );
}
