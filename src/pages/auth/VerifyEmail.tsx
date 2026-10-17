import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const { verifyEmail } = useAuth();

  const pendingVerification = useRef<{ token: string; promise: Promise<void> } | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Không tìm thấy mã xác thực email.');
      return;
    }

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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm">Đang xác thực địa chỉ email của bạn...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle size={48} className="text-emerald-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Xác thực thành công!</h2>
            <p className="mt-2 text-gray-600 text-sm">Tài khoản của bạn đã được kích hoạt và sẵn sàng sử dụng.</p>
            <Link to="/login" className="mt-6 inline-flex justify-center rounded-xl bg-purple-600 py-2.5 px-5 text-sm font-semibold text-white hover:bg-purple-700 transition">
              Đăng nhập ngay
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <AlertCircle size={48} className="text-red-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Xác thực thất bại</h2>
            <p className="mt-2 text-red-600 text-sm">{errorMsg}</p>
            <Link to="/login" className="mt-6 inline-flex justify-center rounded-xl bg-gray-700 py-2.5 px-5 text-sm font-semibold text-white hover:bg-gray-800 transition">
              Quay lại Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
