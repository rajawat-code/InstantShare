import React from 'react';
import { useUser } from '../context/UserContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotification = () => {
  const { toast, closeToast } = useUser();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#14281D] flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#E8590C] flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-[#14281D] flex-shrink-0" />,
  };

  const borders = {
    success: 'bg-[#FAF8F5] text-[#14281D]',
    error: 'bg-rose-50 text-rose-950',
    info: 'bg-[#FAF8F5] text-[#14281D]',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl shadow-hard-lg border-2 border-[#14281D] ${
          borders[toast.type] || borders.info
        }`}
      >
        {icons[toast.type] || icons.info}
        <div className="flex-1 text-xs font-mono font-bold">{toast.message}</div>
        <button
          onClick={closeToast}
          className="text-[#14281D]/60 hover:text-[#14281D] p-1 rounded-md transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;

