import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md",
    secondary: "bg-accent-500 hover:bg-accent-600 text-white shadow-sm hover:shadow-md",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50",
    ghost: "text-primary-600 hover:bg-primary-50",
    success: "bg-success text-white hover:bg-green-600 shadow-sm",
    danger: "bg-error text-white hover:bg-red-600 shadow-sm"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
