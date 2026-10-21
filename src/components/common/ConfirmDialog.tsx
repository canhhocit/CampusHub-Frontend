import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'success';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'primary',
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
        );
      case 'success':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-orange-100 text-[#eb6e34] flex items-center justify-center shrink-0">
            <Info size={20} />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      default:
        return 'bg-[#eb6e34] hover:bg-[#d85e25] text-white';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={!isLoading}>
      <div className="flex gap-4">
        {getIcon()}
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 ${getConfirmButtonClasses()}`}
        >
          {isLoading && (
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
