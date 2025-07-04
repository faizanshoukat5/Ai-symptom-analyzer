import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Size classes
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base'
  };
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-medical-600 text-white hover:bg-medical-700 dark:bg-medical-500 dark:hover:bg-medical-600',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    outline: 'border border-medical-500 text-medical-600 bg-transparent hover:bg-medical-50 dark:text-medical-300 dark:hover:bg-gray-800',
    ghost: 'bg-transparent text-medical-600 hover:bg-medical-50 dark:text-medical-300 dark:hover:bg-gray-800'
  };
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  
  return (
    <button
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
