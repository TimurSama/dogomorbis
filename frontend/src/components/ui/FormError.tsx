'use client';

import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  error?: string | null;
  className?: string;
}

export function FormError({ error, className = '' }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className={`flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm ${className}`}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

