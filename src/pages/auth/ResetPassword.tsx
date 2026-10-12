import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle, Lock, ArrowRight } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setErrorMsg('Không tìm thấy mã xác thực khôi phục mật khẩu.');
      return;
    }
    
    setStatus('loading');
    setErrorMsg('');
    try {
      await resetPassword({ token, newPassword: password });
      setStatus('success');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Liên kết có thể không hợp lệ hoặc đã hết hạn.');
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
          <AlertCircle size={48} className="text-red-500 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Liên kết không hợp lệ</h2>
          <p className="mt-2 text-gray-600 text-sm">Đường dẫn đặt lại mật khẩu thiếu token hoặc đã bị sửa đổi.</p>
          <Link
            to="/login"
            className="mt-6 inline-flex justify-center rounded-xl bg-purple-600 py-2.5 px-4 text-sm font-semibold text-white hover:bg-purple-700 transition"
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl mx-auto flex items-center justify-center font-bold text-xl mb-3">
            CH
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Đặt lại mật khẩu mới
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Vui lòng nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>
        
        {status === 'success' ? (
          <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl border border-emerald-200 flex flex-col items-center gap-3 text-center">
            <CheckCircle size={40} className="text-emerald-600" />
            <h3 className="text-base font-bold text-emerald-900">Đặt lại mật khẩu thành công!</h3>
            <p className="text-sm text-emerald-700">Đang tự động chuyển hướng đến trang Đăng nhập...</p>
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
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="Tối thiểu 6 ký tự..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-purple-600 py-3 px-4 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 disabled:opacity-70 transition shadow-sm"
              >
                {status === 'loading' ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
