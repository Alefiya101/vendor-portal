# Barcode System Guide

## Overview
The Tashivar B2B Portal now includes a comprehensive barcode system for product and vendor management, along with warehouse scanning capabilities for inventory tracking.

## Features

### 1. Barcode Generation
- **Product Barcodes**: Generate printable barcodes for all approved products
- **Vendor Barcodes**: Generate printable barcodes for all registered vendors
- **Print & Download**: Print barcodes directly or download as PNG images
- **Information Display**: Barcodes include ID, name, category/owner, and price/contact info

### 2. Barcode Scanner
- **Camera-based Scanning**: Use device camera to scan barcodes
- **Manual Entry**: Enter barcode numbers manually as fallback
- **Real-time Detection**: Instant recognition and item lookup
- **Multi-device Support**: Works on desktop webcams and mobile cameras

### 3. Warehouse Management
- **Receiving Station**: Scan items arriving from vendors
- **Dispatch Station**: Scan items leaving for buyers
- **Stock Tracking**: Automatic inventory updates on scan
- **Activity History**: Track all warehouse movements

## How to Use

### Generate Barcodes

#### For Products:
1. Go to **Admin Dashboard** → **Products**
2. Find an approved product
3. Click **Generate Barcode** button
4. Print or download the barcode

#### For Vendors:
1. Go to **Admin Dashboard** → **Vendors**
2. Find a vendor
3. Click **Generate Barcode** button
4. Print or download the barcode

### Warehouse Scanning

#### Receiving Items:
1. Go to **Admin Dashboard** → **Warehouse**
2. Click **Receiving Station**
3. Click **Open Scanner** to activate camera
4. Scan incoming items or enter barcode manually
5. Enter quantity received
6. Add notes (optional)
7. Click **Confirm Receipt**

#### Dispatching Items:
1. Go to **Admin Dashboard** → **Warehouse**
2. Click **Dispatch Station**
3. Click **Open Scanner** to activate camera
4. Scan outgoing items or enter barcode manually
5. Enter quantity dispatched
6. Add notes (optional)
7. Click **Confirm Dispatch**

## Technical Details

### Barcode Format
- **Type**: CODE128
- **Encoding**: Product/Vendor IDs
- **Examples**: 
  - Product: `TSV-KRT-001`
  - Vendor: `VEN-001`

### Components

#### BarcodeGenerator.tsx
- Generates visual barcodes using `react-barcode`
- Provides print and download functionality
- Displays item information alongside barcode

#### BarcodeScanner.tsx
- Uses `@zxing/library` for barcode scanning
- Camera access with device selection
- Manual input fallback option
- Real-time scanning with visual feedback

#### WarehouseScanning.tsx
- Main scanning interface for warehouse operations
- Tracks scanned items with status
- Manages quantity updates
- Saves transaction history

#### WarehouseModule.tsx
- Dashboard for warehouse management
- Quick stats and activity overview
- Navigation to receiving/dispatching stations

### Inventory Integration
- Scanned items automatically update inventory
- Stock increases on receiving
- Stock decreases on dispatching
- Changes persist in localStorage
- Real-time status updates

## Browser Compatibility
- **Desktop**: Works with webcam-enabled devices
- **Mobile**: Uses rear camera by default
- **Permissions**: Requires camera access permission

## Best Practices

1. **Print Quality**: Use high-quality printers for clear barcodes
2. **Lighting**: Ensure good lighting when scanning
3. **Distance**: Hold barcode 6-12 inches from camera
4. **Backup**: Always use manual entry if scanner fails
5. **Verification**: Double-check quantities before confirming

## Troubleshooting

### Scanner Not Working
- Check camera permissions in browser
- Ensure camera is not in use by another app
- Try manual entry as fallback
- Refresh the page and try again

### Barcode Not Recognized
- Ensure barcode is printed clearly
- Check lighting conditions
- Try different angles
- Use manual entry with the barcode number

### Inventory Not Updating
- Verify item exists in inventory system
- Check that barcode matches product ID
- Confirm quantity entered is valid
- Review localStorage permissions

## Future Enhancements
- Batch scanning for multiple items
- Export scan history reports
- Integration with external barcode printers
- Mobile app for dedicated scanning
- QR code support for additional data
