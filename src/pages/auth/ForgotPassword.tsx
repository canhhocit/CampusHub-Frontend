import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle, Mail, ArrowLeft, ArrowRight } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md bg-white p-7 sm:p-8 rounded-lg shadow-2xs border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-lg mx-auto flex items-center justify-center font-black text-xl mb-3 border border-emerald-200/60 shadow-2xs">
            CH
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Quên mật khẩu?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nhập email tài khoản để nhận liên kết khôi phục mật khẩu
          </p>
        </div>
        
        {status === 'success' ? (
          <div className="bg-emerald-50 text-emerald-800 p-6 rounded-lg border border-emerald-200 flex flex-col items-center gap-3 text-center">
            <CheckCircle size={36} className="text-emerald-600" />
            <h3 className="text-base font-bold text-emerald-900">Đã gửi liên kết khôi phục!</h3>
            <p className="text-xs sm:text-sm text-emerald-700">
              Nếu email này tồn tại trong hệ thống, chúng tôi đã gửi đường dẫn đặt lại mật khẩu đến hòm thư của bạn.
            </p>
            <Link
              to="/login"
              className="mt-3 px-5 py-2.5 bg-emerald-600 text-white rounded-md text-sm font-bold hover:bg-emerald-700 transition shadow-2xs"
            >
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-md border border-red-200 flex items-center gap-2 text-xs sm:text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email tài khoản đã đăng ký
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-md border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm transition"
                  placeholder="VD: example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center items-center gap-2 rounded-md bg-emerald-600 py-2.5 sm:py-3 px-4 text-sm font-bold text-white hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-70 transition shadow-2xs"
              >
                {status === 'loading' ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800">
                <ArrowLeft size={15} /> Quay lại trang Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
