import React, { useState, useEffect } from 'react';
import { Send, Check, Loader2 } from 'lucide-react';

export interface AnimatedSendButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isPending?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  defaultText?: string;
  loadingText?: string;
  successText?: string;
  className?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  variant?: 'emerald' | 'slate' | 'indigo';
  ariaLabel?: string;
}

export const AnimatedSendButton: React.FC<AnimatedSendButtonProps> = ({
  type = 'submit',
  onClick,
  isPending = false,
  isSuccess = false,
  disabled = false,
  defaultText = 'Gửi đi',
  loadingText = 'Đang gửi...',
  successText = 'Thành công!',
  className = '',
  icon: IconComponent = Send,
  variant = 'emerald',
  ariaLabel,
}) => {
  const [internalFlying, setInternalFlying] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);

  // Trigger airplane takeoff when pending starts
  useEffect(() => {
    if (isPending) {
      setInternalFlying(true);
    } else {
      setInternalFlying(false);
    }
  }, [isPending]);

  // Handle success state with auto-retention
  useEffect(() => {
    if (isSuccess) {
      setShowSuccessState(true);
      const timer = setTimeout(() => {
        setShowSuccessState(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  // Variant backgrounds
  const variantStyles = {
    emerald: 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs hover:shadow-md hover:shadow-emerald-600/20',
    slate: 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow-md hover:shadow-slate-900/30',
    indigo: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xs hover:shadow-md',
  };

  const successStyle = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30 scale-[1.02]';

  return (
    <button
      type={type}
      disabled={disabled || isPending}
      onClick={onClick}
      aria-label={ariaLabel || defaultText}
      className={`relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
        showSuccessState ? successStyle : variantStyles[variant]
      } ${className}`}
    >
      {/* State 1: Success State */}
      {showSuccessState ? (
        <span className="inline-flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center animate-pop-check">
            <Check size={14} className="stroke-[3] text-white" />
          </span>
          <span>{successText}</span>
        </span>
      ) : isPending ? (
        /* State 2: Flying / Loading State */
        <span className="inline-flex items-center gap-2">
          {internalFlying ? (
            <span className="relative inline-flex items-center justify-center w-4 h-4">
              <IconComponent size={15} className="animate-plane-takeoff text-white" />
              <Loader2 size={14} className="animate-spin text-white/80 absolute inset-0 m-auto" />
            </span>
          ) : (
            <Loader2 size={14} className="animate-spin text-white" />
          )}
          <span>{loadingText}</span>
        </span>
      ) : (
        /* State 3: Normal Idle State */
        <span className="inline-flex items-center gap-2 group">
          <span className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <IconComponent size={15} />
          </span>
          <span>{defaultText}</span>
        </span>
      )}
    </button>
  );
};
