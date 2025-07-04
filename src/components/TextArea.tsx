import type { TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextArea({ 
  label, 
  error, 
  className = '',
  id,
  rows = 5,
  ...props 
}: TextAreaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
      )}
      
      <textarea
        id={textareaId}
        rows={rows}
        className={`
          w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 
          text-gray-900 dark:text-gray-100 
          border-gray-300 dark:border-gray-700 
          focus:outline-none focus:ring-2 focus:ring-medical-500
          resize-y
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
