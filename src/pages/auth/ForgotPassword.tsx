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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl mx-auto flex items-center justify-center font-bold text-xl mb-3">
            CH
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Quên mật khẩu?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Nhập email tài khoản để nhận liên kết khôi phục mật khẩu
          </p>
        </div>
        
        {status === 'success' ? (
          <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl border border-emerald-200 flex flex-col items-center gap-3 text-center">
            <CheckCircle size={40} className="text-emerald-600" />
            <h3 className="text-base font-bold text-emerald-900">Đã gửi liên kết khôi phục!</h3>
            <p className="text-sm text-emerald-700">
              Nếu email này tồn tại trong hệ thống, chúng tôi đã gửi đường dẫn đặt lại mật khẩu đến hòm thư của bạn.
            </p>
            <Link
              to="/login"
              className="mt-3 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
            >
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 flex items-center gap-2 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
                Email sinh viên đã đăng ký
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="VD: sinhvien@school.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-purple-600 py-3 px-4 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 disabled:opacity-70 transition shadow-sm"
              >
                {status === 'loading' ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700">
                <ArrowLeft size={15} /> Quay lại trang Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
