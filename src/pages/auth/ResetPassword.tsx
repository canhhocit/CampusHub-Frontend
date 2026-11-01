import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PasswordInput } from '../../components/common/PasswordInput';
import { AlertCircle, CheckCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password.length < 6) {
      setStatus('error');
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    
    setStatus('loading');
    setErrorMsg('');
    try {
      await resetPassword({ token, newPassword: password });
      setStatus('success');
      setTimeout(() => navigate('/login'), 2200);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Liên kết có thể không hợp lệ hoặc đã hết hạn.');
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 py-10 px-4 font-sans">
        <div className="text-center p-7 sm:p-9 bg-white rounded-2xl shadow-xs border border-slate-200/90 max-w-md w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Liên kết không hợp lệ</h2>
          <p className="text-slate-600 text-xs sm:text-sm">Đường dẫn đặt lại mật khẩu thiếu token hoặc đã bị sửa đổi.</p>
          <Link
            to="/login"
            className="mt-3 inline-flex justify-center items-center gap-2 rounded-xl bg-slate-900 py-2.5 px-5 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition shadow-xs"
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-6 bg-white p-7 sm:p-9 rounded-2xl shadow-xs border border-slate-200/90">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-lg shadow-sm">
            CH
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Đặt lại mật khẩu mới
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Nhập mật khẩu mới an toàn cho tài khoản của bạn
          </p>
        </div>
        
        {status === 'success' ? (
          <div className="bg-emerald-50 text-emerald-900 p-6 sm:p-7 rounded-2xl border border-emerald-200/80 flex flex-col items-center gap-3.5 text-center animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle size={28} />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900">Đặt lại mật khẩu thành công!</h2>
              <p className="text-xs sm:text-sm text-emerald-700">Đang tự động chuyển hướng đến trang Đăng nhập...</p>
            </div>
          </div>
        ) : (
          <form className="space-y-4 pt-1" onSubmit={handleSubmit}>
            {status === 'error' && (
              <div className="bg-rose-50 text-rose-800 p-3.5 rounded-xl border border-rose-200/80 flex items-start gap-2.5 text-xs sm:text-sm animate-in fade-in duration-150">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <PasswordInput
                id="password"
                name="password"
                label="Mật khẩu mới"
                required
                autoComplete="new-password"
                placeholder="Tối thiểu 6 ký tự..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                required
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPassword && password !== confirmPassword ? 'Mật khẩu xác nhận không khớp' : undefined}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-slate-900 py-2.5 sm:py-3 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60 transition shadow-xs cursor-pointer mt-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Đang cập nhật mật khẩu...</span>
                </>
              ) : (
                <>
                  <span>Cập nhật mật khẩu</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Mật khẩu mới được mã hóa bảo mật theo tiêu chuẩn BCrypt</span>
          </div>
        </div>
      </div>
    </div>
  );
};
