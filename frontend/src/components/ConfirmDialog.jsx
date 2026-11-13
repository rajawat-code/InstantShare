import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary'
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14281D]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-hard-xl border-2 border-[#14281D] p-6 sm:p-7 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl border-2 border-[#14281D] shadow-hard-sm flex items-center justify-center ${
              confirmVariant === 'danger'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-[#F2B705] text-[#14281D]'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-serif font-black text-[#14281D]">{title}</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#14281D]/80 leading-relaxed font-sans">{message}</p>
          </div>

          <button
            onClick={onCancel}
            className="text-[#14281D]/60 hover:text-[#14281D] p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t-2 border-[#14281D]/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-mono font-bold text-[#14281D] bg-white hover:bg-[#FAF8F5] rounded-xl border-2 border-[#14281D] shadow-hard-sm btn-tactile transition-colors cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 text-xs font-bold font-mono rounded-xl border-2 border-[#14281D] shadow-hard btn-tactile transition-colors cursor-pointer ${
              confirmVariant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#14281D] hover:bg-[#E8590C] text-[#F6F1E9]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

