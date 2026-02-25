import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export function LoadingSpinner({ size = 'md', text, fullScreen = false, overlay = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? 'min-h-screen' : ''}`}>
      <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin`} />
      {text && <p className="text-sm text-gray-600 font-medium">{text}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

export function ButtonWithLoading({ 
  loading, 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button'
}: ButtonLoadingProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${className} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-100 h-12 rounded-t-lg mb-2"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid gap-4 mb-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}
