import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      id="custom-toast-container"
      className={`fixed bottom-20 left-4 right-4 md:bottom-6 md:right-6 md:left-auto z-50 flex items-center justify-between p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 opacity-100 max-w-sm mx-auto md:mx-0 ${
        toast.type === 'success'
          ? 'bg-[#161b22] border-[#3fb950]/50 text-[#3fb950]'
          : toast.type === 'error'
          ? 'bg-[#161b22] border-[#f85149]/50 text-[#f85149]'
          : 'bg-[#161b22] border-[#58a6ff]/50 text-[#58a6ff]'
      }`}
    >
      <div className="flex items-center gap-3">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
        {toast.type === 'info' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
        <span className="text-sm font-medium text-gray-200">{toast.message}</span>
      </div>
      <button
        id="close-toast-btn"
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors ml-4 focus:outline-none p-1 rounded-md hover:bg-gray-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
