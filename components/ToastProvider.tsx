'use client';

import { useState, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { message, type = 'info' } = event.detail;
      const id = Date.now().toString();
      
      setToasts(prev => [...prev, { id, message, type }]);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 5000);
    };

    window.addEventListener('showToast', handleToast as EventListener);
    
    return () => {
      window.removeEventListener('showToast', handleToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-success-500 to-success-600 border-success-200';
      case 'error':
        return 'bg-gradient-to-r from-danger-500 to-danger-600 border-danger-200';
      case 'warning':
        return 'bg-gradient-to-r from-warning-500 to-warning-600 border-warning-200';
      default:
        return 'bg-gradient-to-r from-primary-500 to-primary-600 border-primary-200';
    }
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <>
      {children}
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${getToastStyles(toast.type)} text-white p-4 rounded-xl shadow-2xl border-2 animate-slide-up flex items-center space-x-3`}
          >
            <span className="text-xl">{getToastIcon(toast.type)}</span>
            <div className="flex-1">
              <p className="font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white hover:text-gray-200 transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}