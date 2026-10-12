import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle, User, Mail, Lock, UserCheck, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      setSuccess(true);
    } catch (err: any) {
      if (err.response?.data) {
        const d = err.response.data;
        if (d.message) setError(d.message);
        else if (typeof d === 'object') {
          const msgs = Object.values(d).join(', ');
          setError(msgs || 'Đăng ký không thành công.');
        }
      } else {
        setError('Đăng ký không thành công. Vui lòng thử lại sau.');
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
            Tạo tài khoản sinh viên
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Đăng ký để trao đổi đồ cũ và sử dụng Tủ Locker Thông Minh
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl border border-emerald-200 flex flex-col items-center gap-3 text-center">
            <CheckCircle size={40} className="text-emerald-600" />
            <h3 className="text-base font-bold text-emerald-900">Đăng ký thành công!</h3>
            <p className="text-sm text-emerald-700">
              Vui lòng kiểm tra hòm thư email của bạn để nhấn vào liên kết xác thực tài khoản.
            </p>
            <Link
              to="/login"
              className="mt-3 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
            >
              Đến trang Đăng nhập
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 flex items-center gap-2 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <input
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="VD: nguyenvanan"
                  value={formData.username}
                  onChange={handleChange}
                />
                <User size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email sinh viên / cá nhân</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="VD: an.nv@school.edu.vn"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên đầy đủ</label>
              <div className="relative">
                <input
                  name="fullName"
                  type="text"
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="VD: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <UserCheck size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder="Tối thiểu 6 ký tự..."
                  value={formData.password}
                  onChange={handleChange}
                />
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-purple-600 py-3 px-4 text-sm font-semibold text-white hover:bg-purple-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500 disabled:opacity-70 transition shadow-sm mt-2"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          Đã có tài khoản sinh viên?{' '}
          <Link to="/login" className="font-semibold text-purple-600 hover:text-purple-700">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
