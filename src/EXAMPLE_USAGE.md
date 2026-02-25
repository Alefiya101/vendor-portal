# Complete Example: Secure & Performant Component

## Full Example: Create Order Form

```tsx
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner@2.0.3';
import { SecureFormField } from './SecureFormField';
import { LoadingSpinner, ButtonWithLoading, TableSkeleton } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields, debounce } from '../utils/security';
import { apiClient, handleApiError } from '../utils/apiClient';

interface CreateOrderFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateOrderForm({ onSuccess, onCancel }: CreateOrderFormProps) {
  // ============ STATE ============
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerGSTIN: '',
    productName: '',
    quantity: '',
    notes: ''
  });
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Dropdown data
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // ============ LOAD INITIAL DATA ============
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      
      const [customersData, productsData] = await Promise.all([
        apiClient.get('/customers'),
        apiClient.get('/products')
      ]);
      
      setCustomers(customersData);
      setProducts(productsData);
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
    } finally {
      setInitialLoading(false);
    }
  };

  // ============ DEBOUNCED SEARCH ============
  const searchProducts = async (term: string) => {
    if (!term || term.length < 2) return;
    
    try {
      setSearchLoading(true);
      const results = await apiClient.get(`/products/search?q=${encodeURIComponent(term)}`);
      setProducts(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      searchProducts(term);
    }, 500),
    []
  );

  // ============ FORM HANDLERS ============
  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleProductSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleFieldChange('productName', value);
    debouncedSearch(value);
  };

  // ============ VALIDATION ============
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    const validation = validateRequiredFields(formData, [
      'customerName',
      'customerEmail',
      'customerPhone',
      'productName',
      'quantity'
    ]);

    if (!validation.valid) {
      validation.missing.forEach(field => {
        newErrors[field] = 'This field is required';
      });
    }

    // Quantity validation
    if (formData.quantity) {
      const qty = Number(formData.quantity);
      if (isNaN(qty) || qty <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============ SUBMIT ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Sanitize all string inputs
      const cleanData = {
        customerName: sanitizeString(formData.customerName),
        customerEmail: sanitizeString(formData.customerEmail),
        customerPhone: sanitizeString(formData.customerPhone),
        customerGSTIN: sanitizeString(formData.customerGSTIN),
        productName: sanitizeString(formData.productName),
        quantity: Number(formData.quantity),
        notes: sanitizeString(formData.notes)
      };

      // Submit to API
      await apiClient.post('/orders', cleanData);

      toast.success('Order created successfully!');
      onSuccess();
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDER ============
  
  // Show initial loading skeleton
  if (initialLoading) {
    return (
      <div className="bg-white rounded-xl p-6">
        <LoadingSpinner text="Loading form..." />
      </div>
    );
  }

  // Show error state
  if (error && !customers.length) {
    return (
      <div className="bg-white rounded-xl p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
        <button
          onClick={loadInitialData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Order</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Customer Information</h3>
          
          <SecureFormField
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleFieldChange}
            required
            placeholder="Enter customer name"
            disabled={loading}
            error={errors.customerName}
          />

          <div className="grid grid-cols-2 gap-4">
            <SecureFormField
              label="Email"
              name="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={handleFieldChange}
              required
              placeholder="customer@example.com"
              disabled={loading}
              error={errors.customerEmail}
              validateAs="email"
              autoValidate
            />

            <SecureFormField
              label="Phone"
              name="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={handleFieldChange}
              required
              placeholder="+91 98765 43210"
              disabled={loading}
              error={errors.customerPhone}
              validateAs="phone"
              autoValidate
            />
          </div>

          <SecureFormField
            label="GSTIN"
            name="customerGSTIN"
            value={formData.customerGSTIN}
            onChange={handleFieldChange}
            placeholder="22AAAAA0000A1Z5 (optional)"
            disabled={loading}
            error={errors.customerGSTIN}
            validateAs="gstin"
            helperText="15-digit GSTIN (optional)"
          />
        </div>

        {/* Order Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Order Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Product
              <span className="text-rose-600 ml-1">*</span>
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={handleProductSearch}
              placeholder="Search products..."
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                errors.productName
                  ? 'border-rose-300 focus:ring-rose-500'
                  : 'border-gray-200 focus:ring-indigo-500'
              }`}
            />
            {searchLoading && (
              <p className="text-xs text-gray-500 mt-1">Searching...</p>
            )}
            {errors.productName && (
              <p className="text-xs text-rose-600 mt-1">{errors.productName}</p>
            )}
            
            {/* Product suggestions */}
            {products.length > 0 && formData.productName && (
              <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                {products.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleFieldChange('productName', product.name)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    {product.name} - ₹{product.price}
                  </button>
                ))}
              </div>
            )}
          </div>

          <SecureFormField
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleFieldChange}
            required
            min={1}
            placeholder="1"
            disabled={loading}
            error={errors.quantity}
            validateAs="number"
          />

          <SecureFormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleFieldChange}
            placeholder="Any special instructions..."
            disabled={loading}
            rows={3}
            helperText="Optional notes about the order"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <ButtonWithLoading
            type="submit"
            loading={loading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Create Order
          </ButtonWithLoading>
        </div>
      </form>
    </div>
  );
}
```

## Usage in Parent Component

```tsx
import { CreateOrderForm } from './CreateOrderForm';
import { ErrorBoundary } from './ErrorBoundary';

export function OrdersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleSuccess = () => {
    setShowCreateForm(false);
    // Refresh orders list
    loadOrders();
  };

  return (
    <ErrorBoundary>
      <div className="p-8">
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Create Order
        </button>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CreateOrderForm
                onSuccess={handleSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
```

## What This Example Demonstrates

### ✅ Loading States
- Initial loading with `LoadingSpinner`
- Search loading indicator
- Submit button loading with `ButtonWithLoading`
- Disabled inputs during loading

### ✅ Error Handling
- Wrapped in `ErrorBoundary` (in parent)
- API error handling with `handleApiError`
- Field-level validation errors
- User-friendly error messages

### ✅ Security
- Input sanitization with `sanitizeString`
- Email/phone/GSTIN validation
- Required field validation
- XSS prevention

### ✅ Performance
- Debounced search (500ms)
- Lazy loading of products
- Memoized debounce function
- Efficient re-renders

### ✅ User Experience
- Clear error messages
- Field validation on blur
- Auto-complete suggestions
- Loading indicators
- Disabled state during submission

### ✅ Code Quality
- TypeScript types
- Organized sections
- Reusable components
- Proper error handling
- Clean code structure

---

## Key Takeaways

1. **Always wrap async operations** in try-catch with loading states
2. **Always sanitize inputs** before sending to API
3. **Always validate** on both client and server
4. **Always show loading states** to users
5. **Always handle errors** gracefully
6. **Always debounce** search inputs
7. **Always use** proper TypeScript types
8. **Always test** error scenarios

---

## Copy-Paste Template

Use this as a starting point for new forms:

```tsx
import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { SecureFormField } from './SecureFormField';
import { ButtonWithLoading, LoadingSpinner } from './LoadingSpinner';
import { sanitizeString, validateRequiredFields } from '../utils/security';
import { apiClient, handleApiError } from '../utils/apiClient';

export function MyForm({ onSuccess, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({/* fields */});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const validation = validateRequiredFields(formData, ['field1', 'field2']);
    
    if (!validation.valid) {
      validation.missing.forEach(field => {
        newErrors[field] = 'This field is required';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors');
      return;
    }

    try {
      setLoading(true);
      
      const cleanData = {
        field1: sanitizeString(formData.field1),
        field2: sanitizeString(formData.field2)
      };

      await apiClient.post('/endpoint', cleanData);
      toast.success('Success!');
      onSuccess();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <SecureFormField
        label="Field 1"
        name="field1"
        value={formData.field1}
        onChange={handleFieldChange}
        required
        disabled={loading}
        error={errors.field1}
      />

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-gray-100 rounded-lg"
        >
          Cancel
        </button>
        <ButtonWithLoading
          type="submit"
          loading={loading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Submit
        </ButtonWithLoading>
      </div>
    </form>
  );
}
```

This template includes all best practices and can be customized for any form!
