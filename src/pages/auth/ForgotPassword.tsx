import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle, Mail, ArrowLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      await forgotPassword(email);
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-6 bg-white p-7 sm:p-9 rounded-2xl shadow-xs border border-slate-200/90">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-lg shadow-sm">
            CH
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Quên mật khẩu?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Nhập email tài khoản để nhận đường dẫn khôi phục mật khẩu
          </p>
        </div>
        
        {status === 'success' ? (
          <div className="bg-emerald-50 text-emerald-900 p-6 sm:p-7 rounded-2xl border border-emerald-200/80 flex flex-col items-center gap-3.5 text-center animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">Đã gửi liên kết khôi phục!</h2>
              <p className="text-xs sm:text-sm text-emerald-700 max-w-sm">
                Nếu email này tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu đến hòm thư của bạn. Vui lòng kiểm tra email.
              </p>
            </div>
            <Link
              to="/login"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-800 transition shadow-xs"
            >
              <span>Quay lại Đăng nhập</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <form className="space-y-4 pt-1" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="bg-rose-50 text-rose-800 p-3.5 rounded-xl border border-rose-200/80 flex items-start gap-2.5 text-xs sm:text-sm animate-in fade-in duration-150">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email tài khoản đã đăng ký <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-100 text-xs sm:text-sm transition hover:border-slate-400"
                  placeholder="VD: sinhvien@school.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-slate-900 py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60 transition shadow-xs cursor-pointer mt-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Đang gửi liên kết...</span>
                </>
              ) : (
                <>
                  <span>Gửi liên kết khôi phục</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition">
                <ArrowLeft size={15} /> Quay lại trang Đăng nhập
              </Link>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Liên kết khôi phục an toàn có hiệu lực giới hạn thời gian</span>
          </div>
        </div>
      </div>
    </div>
  );
};
