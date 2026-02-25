import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, AlertCircle, CheckCircle, Package, Search } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [manualInput, setManualInput] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setIsScanning(true);

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        setError('No camera found. Please connect a camera or enter barcode manually.');
        setIsScanning(false);
        return;
      }

      // Prefer back camera on mobile devices
      const selectedDevice = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back')
      ) || videoInputDevices[0];

      if (videoRef.current) {
        codeReader.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current,
          (result, error) => {
            if (result) {
              const code = result.getText();
              setScannedCode(code);
              setIsScanning(false);
              onScan(code);
              stopScanning();
            }
            if (error && !(error.name === 'NotFoundException')) {
              console.error('Scanning error:', error);
            }
          }
        );
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('Failed to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      setScannedCode(manualInput.trim());
      onScan(manualInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Camera className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Scan Barcode</h2>
              <p className="text-sm text-gray-500">
                Use camera or enter barcode manually
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="p-6">
          {/* Camera View */}
          <div className="mb-6">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
              {isScanning ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-40 border-4 border-blue-500 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                    </div>
                  </div>
                  <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                    Position barcode within the frame
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Camera className="w-16 h-16 mb-4" />
                  <p className="text-sm">Camera not active</p>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="mt-4 flex justify-center">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Stop Camera
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {scannedCode && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Barcode Scanned Successfully!</p>
                <p className="text-sm text-green-700 mt-1 font-mono">{scannedCode}</p>
              </div>
            </div>
          )}

          {/* Manual Input */}
          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter Barcode Manually
            </label>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter barcode number..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
