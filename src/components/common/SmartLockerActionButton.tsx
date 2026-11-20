import React, { useState } from 'react';
import { Lock, Package, Loader2, ShoppingBag, Calendar } from 'lucide-react';

interface SmartLockerActionButtonProps {
  type?: 'button' | 'submit';
  onClick?: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  mode?: 'PURCHASE' | 'RENTAL';
  label?: string;
  className?: string;
  variant?: 'emerald' | 'dark';
  haptic?: boolean;
  showAnimationBeforeAction?: boolean;
}

export const SmartLockerActionButton: React.FC<SmartLockerActionButtonProps> = ({
  type = 'button',
  onClick,
  isLoading = false,
  disabled = false,
  mode = 'PURCHASE',
  label,
  className = '',
  variant = 'emerald',
  haptic = true,
  showAnimationBeforeAction = true,
}) => {
  const [animStage, setAnimStage] = useState<'idle' | 'locking' | 'locked'>('idle');

  const triggerHaptic = () => {
    if (haptic && typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 35, 20]);
      } catch {
        // Safe fallback if permission or platform does not support vibration
      }
    }
  };

  const handleClick = async () => {
    if (disabled || isLoading || animStage !== 'idle') return;

    if (showAnimationBeforeAction) {
      triggerHaptic();
      setAnimStage('locking');

      setTimeout(() => {
        setAnimStage('locked');
        triggerHaptic();

        setTimeout(() => {
          setAnimStage('idle');
          if (onClick) {
            onClick();
          }
        }, 350);
      }, 550);
    } else {
      triggerHaptic();
      if (onClick) {
        onClick();
      }
    }
  };

  const defaultLabel =
    label ||
    (mode === 'PURCHASE'
      ? 'Đặt mua qua Tủ Locker Thông Minh'
      : 'Chọn thời hạn & Thuê qua Locker');

  const bgStyles =
    variant === 'dark'
      ? 'bg-slate-900 hover:bg-slate-800 text-white'
      : 'bg-emerald-600 hover:bg-emerald-700 text-white';

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading || animStage !== 'idle'}
      aria-busy={isLoading || animStage !== 'idle'}
      className={`relative overflow-hidden font-bold rounded-xl transition-all duration-300 min-h-[44px] flex items-center justify-center gap-2 select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${bgStyles} ${
        animStage === 'locking' ? 'animate-locker-morph ring-4 ring-emerald-300/40' : ''
      } ${className}`}
    >
      {/* 1. Loading state from mutation */}
      {isLoading && (
        <div className="flex items-center gap-2">
          <Loader2 size={18} className="animate-spin" />
          <span>Đang xử lý qua Smart Locker...</span>
        </div>
      )}

      {/* 2. Lock-In Animation Stage 1: Parcel Drops into Locker */}
      {!isLoading && animStage === 'locking' && (
        <div className="flex items-center gap-2 py-0.5">
          <div className="relative w-7 h-7 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center shadow-inner">
            <Package size={15} className="text-white animate-locker-parcel" />
          </div>
          <span className="text-xs font-mono font-bold tracking-tight">Đang kẹp khóa ngăn tủ...</span>
        </div>
      )}

      {/* 3. Lock-In Animation Stage 2: Electronic Lock Snaps Shut */}
      {!isLoading && animStage === 'locked' && (
        <div className="flex items-center gap-2 py-0.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center shadow-sm">
            <Lock size={15} className="animate-locker-lock stroke-[2.5]" />
          </div>
          <span className="text-xs font-mono font-bold tracking-tight">Đã khóa ngăn & Ký quỹ!</span>
        </div>
      )}

      {/* 4. Default Idle State */}
      {!isLoading && animStage === 'idle' && (
        <div className="flex items-center gap-2">
          {mode === 'PURCHASE' ? (
            <ShoppingBag size={18} className="shrink-0" />
          ) : (
            <Calendar size={18} className="shrink-0" />
          )}
          <span>{defaultLabel}</span>
        </div>
      )}
    </button>
  );
};
