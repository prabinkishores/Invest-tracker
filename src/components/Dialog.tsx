import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Dialog({
  isOpen,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: DialogProps) {
  if (!isOpen) return null;

  return (
    <div id="modal-overlay" className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        id="modal-card"
        className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 text-red-500 mb-4" id="modal-icon-container">
            <AlertCircle className="w-6 h-6 flex-shrink-0" id="modal-alert-icon" />
            <h3 className="font-display font-medium text-lg text-white" id="modal-title">{title}</h3>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-6" id="modal-description">
            {description}
          </p>
          <div className="flex gap-3" id="modal-actions">
            <button
              id="modal-cancel-btn"
              type="button"
              onClick={onCancel}
              className="flex-1 min-h-[44px] rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-600"
            >
              {cancelText}
            </button>
            <button
              id="modal-confirm-btn"
              type="button"
              onClick={onConfirm}
              className="flex-1 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
