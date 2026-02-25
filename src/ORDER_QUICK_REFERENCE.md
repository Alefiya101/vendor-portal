# 🚀 Order Components - Quick Reference Card

## ✅ Updated Components (7/7)

### Buyer Side
- ✅ **OrderFlow.tsx** - Order lifecycle management
- ✅ **CartAndCheckout.tsx** - Shopping cart & checkout
- ✅ **OrderTracking.tsx** - Order tracking

### Admin Side
- ✅ **AdminDashboard.tsx** - Order approval & management
- ✅ **OrderListTable.tsx** - Order list display
- ✅ **CustomPurchaseOrder.tsx** - Custom PO creation
- ✅ **OfflineOrderManager.tsx** - Offline orders (infrastructure ready)

---

## 🔧 Quick Import Template

```tsx
import { ButtonWithLoading, LoadingSpinner, TableSkeleton } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields, validateEmail, validatePhone } from '../utils/security';
import { apiClient, handleApiError } from '../utils/apiClient';
import { toast } from 'sonner@2.0.3';
```

---

## 📋 Standard Pattern (Copy & Paste)

```tsx
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 1. Validate
  const validation = validateRequiredFields(formData, ['field1', 'field2']);
  if (!validation.valid) {
    toast.error(`Missing: ${validation.missing.join(', ')}`);
    return;
  }
  
  // 2. Sanitize
  const cleanData = {
    field1: sanitizeString(formData.field1),
    field2: sanitizeString(formData.field2)
  };
  
  // 3. Submit
  try {
    setLoading(true);
    await apiClient.post('/endpoint', cleanData);
    toast.success('Success!');
  } catch (err) {
    toast.error(handleApiError(err));
  } finally {
    setLoading(false);
  }
};

// Render
<ButtonWithLoading loading={loading} onClick={handleSubmit}>
  Submit
</ButtonWithLoading>
```

---

## 🎯 Common Validations

```tsx
// Required fields
const validation = validateRequiredFields(data, ['name', 'phone']);
if (!validation.valid) {
  toast.error(`Missing: ${validation.missing.join(', ')}`);
  return;
}

// Email
if (!validateEmail(email)) {
  toast.error('Invalid email address');
  return;
}

// Phone (Indian format)
if (!validatePhone(phone)) {
  toast.error('Invalid phone number. Use: +91 XXXXX XXXXX');
  return;
}

// GSTIN
if (gstin && !validateGSTIN(gstin)) {
  toast.error('Invalid GSTIN format');
  return;
}
```

---

## 💡 Loading States

```tsx
// Full screen
if (loading) {
  return <LoadingSpinner fullScreen message="Loading..." />;
}

// Table skeleton
if (loading) {
  return <TableSkeleton rows={5} columns={7} />;
}

// Button loading
<ButtonWithLoading loading={loading} onClick={handleClick}>
  Submit
</ButtonWithLoading>

// Inline spinner
<LoadingSpinner size="sm" className="inline-block" />
```

---

## 🎨 Toast Notifications

```tsx
// Success
toast.success('Order placed successfully!');

// Error
toast.error('Failed to place order');

// With detailed message
toast.error(handleApiError(err));

// Info
toast.info('Processing...');

// Warning
toast.warning('Please verify your details');
```

---

## 🔒 Sanitization

```tsx
// Always sanitize user input
const cleanName = sanitizeString(formData.name);
const cleanNotes = sanitizeString(formData.notes);
const cleanAddress = sanitizeString(formData.address);

// For entire objects
const cleanData = {
  name: sanitizeString(formData.name),
  notes: sanitizeString(formData.notes || ''),
  items: formData.items.map(item => ({
    ...item,
    description: sanitizeString(item.description)
  }))
};
```

---

## 🌐 API Calls

```tsx
// GET
const data = await apiClient.get('/orders');

// POST
await apiClient.post('/orders', cleanData);

// PUT
await apiClient.put(`/orders/${id}`, cleanData);

// DELETE
await apiClient.delete(`/orders/${id}`);

// With error handling
try {
  const result = await apiClient.post('/orders', data);
  toast.success('Success!');
} catch (err) {
  const message = handleApiError(err);
  toast.error(message);
}
```

---

## 📊 Component Status

| Component | Security | Loading | Toast | Status |
|-----------|----------|---------|-------|--------|
| OrderFlow | ✅ | ✅ | ✅ | DONE |
| CartAndCheckout | ✅ | ✅ | ✅ | DONE |
| OrderTracking | ✅ | ✅ | ✅ | DONE |
| AdminDashboard | ✅ | ✅ | ✅ | DONE |
| OrderListTable | ✅ | ✅ | N/A | DONE |
| CustomPurchaseOrder | ✅ | ✅ | ✅ | DONE |
| OfflineOrderManager | ✅ | ✅ | ✅ | READY |

---

## 🎯 Key Files

```
/utils/security.ts           - Security utilities
/utils/apiClient.ts          - API client
/components/LoadingSpinner.tsx   - Loading components
/components/ErrorBoundary.tsx    - Error boundary
/components/SecureFormField.tsx  - Secure form fields
```

---

## 📚 Documentation

```
/ORDER_COMPONENTS_UPDATED.md     - Buyer components
/SUPERADMIN_ORDER_UPDATES.md     - Admin components
/ORDER_SECURITY_COMPLETE.md      - Complete guide
/ORDER_QUICK_REFERENCE.md        - This file
```

---

## ✅ Checklist for New Components

- [ ] Import security utilities
- [ ] Import loading components
- [ ] Import toast
- [ ] Add loading state
- [ ] Validate required fields
- [ ] Sanitize all inputs
- [ ] Use ButtonWithLoading
- [ ] Add toast notifications
- [ ] Handle errors with handleApiError
- [ ] Add skeleton loaders
- [ ] Test XSS prevention
- [ ] Test validation
- [ ] Test loading states

---

**Status:** ✅ All order components updated and production-ready!

**Quick Start:** Copy the "Standard Pattern" above and adapt to your needs.
