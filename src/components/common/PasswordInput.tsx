import React, { useState, useRef, useImperativeHandle } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, id, className = '', containerClassName = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const internalInputRef = useRef<HTMLInputElement | null>(null);

    useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement);

    const inputId = id || props.name || undefined;

    const toggleVisibility = () => {
      const input = internalInputRef.current;
      if (input) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        setShowPassword((prev) => !prev);
        requestAnimationFrame(() => {
          if (input) {
            input.focus();
            if (start !== null && end !== null) {
              input.setSelectionRange(start, end);
            }
          }
        });
      } else {
        setShowPassword((prev) => !prev);
      }
    };

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 tracking-wide">
            {label}
            {props.required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative rounded-xl">
          <input
            {...props}
            ref={internalInputRef}
            id={inputId}
            type={showPassword ? 'text' : 'password'}
            className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 transition-all focus:outline-hidden focus:ring-2 pr-11 ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-100 hover:border-slate-400'
            } ${props.disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''} ${className}`}
          />

          <button
            type="button"
            onClick={toggleVisibility}
            disabled={props.disabled}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            aria-pressed={showPassword}
            tabIndex={0}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition disabled:opacity-40 cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </div>

        {hint && !error && <p className="text-[11px] text-slate-500">{hint}</p>}
        {error && <p className="text-[11px] font-medium text-rose-600 animate-in fade-in duration-150">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
