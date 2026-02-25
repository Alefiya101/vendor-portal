import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';
  
  return (
    <div className={`bg-surface rounded-lg shadow-md ${paddingClasses[padding]} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}
