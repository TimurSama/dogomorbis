'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800 bg-green-900/20 border-green-800 text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 bg-red-900/20 border-red-800 text-red-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 bg-blue-900/20 border-blue-800 text-blue-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 bg-yellow-900/20 border-yellow-800 text-yellow-200',
};

export function ToastComponent({ toast, onRemove }: ToastProps) {
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${toastColors[toast.type]}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium">
            {toast.title}
          </h4>
          {toast.message && (
            <p className="mt-1 text-sm opacity-90">
              {toast.message}
            </p>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={() => onRemove(toast.id)}
            className="inline-flex rounded-md p-1.5 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

