import React from 'react';
import { AlertCircle } from 'lucide-react';
import { sanitizeString, validateEmail, validatePhone, validateGSTIN, validateNumber } from '../utils/security';

interface SecureFormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'date' | 'password';
  value: any;
  onChange: (name: string, value: any) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: string;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
  autoValidate?: boolean; // Auto-validate on blur
  validateAs?: 'email' | 'phone' | 'gstin' | 'number';
  error?: string;
  helperText?: string;
}

export function SecureFormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  disabled = false,
  className = '',
  min,
  max,
  step,
  rows = 3,
  options = [],
  autoValidate = true,
  validateAs,
  error,
  helperText
}: SecureFormFieldProps) {
  const [localError, setLocalError] = React.useState<string>('');
  const [touched, setTouched] = React.useState(false);

  const displayError = error || (touched ? localError : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let newValue = e.target.value;

    // Auto-sanitize text inputs
    if (type === 'text' || type === 'textarea' || type === 'email') {
      newValue = sanitizeString(newValue);
    }

    onChange(name, newValue);
    
    // Clear error when user types
    if (localError) {
      setLocalError('');
    }
  };

  const handleBlur = () => {
    setTouched(true);

    if (!autoValidate || !value) {
      return;
    }

    // Auto-validate based on type or explicit validateAs prop
    const validationType = validateAs || (type === 'email' ? 'email' : type === 'tel' ? 'phone' : undefined);

    switch (validationType) {
      case 'email':
        if (!validateEmail(value)) {
          setLocalError('Invalid email format');
        }
        break;
      case 'phone':
        if (!validatePhone(value)) {
          setLocalError('Invalid phone number');
        }
        break;
      case 'gstin':
        if (!validateGSTIN(value)) {
          setLocalError('Invalid GSTIN format');
        }
        break;
      case 'number':
        if (!validateNumber(value, min, max)) {
          setLocalError(`Number must be${min !== undefined ? ` at least ${min}` : ''}${max !== undefined ? ` at most ${max}` : ''}`);
        }
        break;
    }
  };

  const inputClasses = `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${
    displayError
      ? 'border-rose-300 focus:ring-rose-500 bg-rose-50'
      : 'border-gray-200 focus:ring-indigo-500 bg-white'
  } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''} ${className}`;

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-rose-600 ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={inputClasses}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={inputClasses}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          className={inputClasses}
        />
      )}

      {displayError && (
        <div className="flex items-center gap-1 text-rose-600 text-xs mt-1">
          <AlertCircle className="w-3 h-3" />
          <span>{displayError}</span>
        </div>
      )}

      {helperText && !displayError && (
        <p className="text-xs text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}

// Secure Form Container with batch validation
interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (data: Record<string, any>) => void;
  loading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  className?: string;
}

export function SecureForm({
  children,
  onSubmit,
  loading = false,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  onCancel,
  className = ''
}: SecureFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      data[key] = value;
    });

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {children}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
