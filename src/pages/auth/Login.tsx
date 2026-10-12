import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, Lock, User, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ usernameOrEmail, password });
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl mx-auto flex items-center justify-center font-bold text-xl mb-3">
            CH
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Đăng nhập tài khoản
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Chào mừng bạn quay trở lại với CampusHub
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 flex items-center gap-2 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold text-gray-700 mb-1">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="Nhập username hoặc email của bạn..."
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                />
                <User size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-xs font-medium text-purple-600 hover:text-purple-700">
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 rounded-xl bg-purple-600 py-3 px-4 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 disabled:opacity-70 transition shadow-sm"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-semibold text-purple-600 hover:text-purple-700">
            Đăng ký tài khoản (từ 13 tuổi)
          </Link>
        </div>
      </div>
    </div>
  );
};
