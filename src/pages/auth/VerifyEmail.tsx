import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => (!token ? 'error' : 'loading'));
  const [errorMsg, setErrorMsg] = useState(() => (!token ? 'Không tìm thấy mã xác thực email.' : ''));
  const { verifyEmail } = useAuth();

  const pendingVerification = useRef<{ token: string; promise: Promise<void> } | null>(null);

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        if (pendingVerification.current?.token !== token) {
          pendingVerification.current = { token, promise: verifyEmail(token) };
        }
        await pendingVerification.current.promise;
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.');
      }
    };

    verify();
  }, [token, verifyEmail]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md bg-white p-7 sm:p-8 rounded-lg shadow-2xs border border-slate-200 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-slate-600 text-xs sm:text-sm font-medium">Đang xác thực địa chỉ email của bạn...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle size={40} className="text-emerald-600" />
            <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-slate-900">Xác thực thành công!</h2>
            <p className="mt-2 text-slate-600 text-xs sm:text-sm">Tài khoản của bạn đã được kích hoạt và sẵn sàng sử dụng.</p>
            <Link to="/login" className="mt-6 inline-flex justify-center rounded-md bg-emerald-600 py-2.5 px-5 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-2xs">
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <AlertCircle size={40} className="text-red-500" />
            <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-slate-900">Xác thực thất bại</h2>
            <p className="mt-2 text-red-600 text-xs sm:text-sm">{errorMsg}</p>
            <Link to="/login" className="mt-6 inline-flex justify-center rounded-md bg-slate-800 py-2.5 px-5 text-sm font-bold text-white hover:bg-slate-900 transition shadow-2xs">
              Quay lại Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
