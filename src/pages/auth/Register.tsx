import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle, User, Mail, Lock, UserCheck, Calendar, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  // Max birthdate for 13 years old
  const maxBirthDate = new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.dateOfBirth) {
      setError('Vui lòng chọn ngày sinh.');
      return;
    }

    const age = calculateAge(formData.dateOfBirth);
    if (age < 13) {
      setError('Bạn phải từ đủ 13 tuổi trở lên để tham gia sử dụng hệ thống.');
      return;
    }

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
          <div className="w-12 h-12 bg-[#eb6e34]/10 text-[#eb6e34] rounded-xl mx-auto flex items-center justify-center font-bold text-xl mb-3">
            CH
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Đăng ký thành viên
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Mạng lưới tủ locker thông minh & trao đổi đồ dùng toàn thành phố (Dành cho công dân từ 13 tuổi trở lên)
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
              className="mt-3 px-5 py-2.5 bg-[#eb6e34] text-white rounded-xl text-sm font-semibold hover:bg-[#d85d26] transition"
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
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#eb6e34] focus:outline-hidden focus:ring-2 focus:ring-[#eb6e34] text-sm"
                  placeholder="VD: nguyenvanan"
                  value={formData.username}
                  onChange={handleChange}
                />
                <User size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email cá nhân</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#eb6e34] focus:outline-hidden focus:ring-2 focus:ring-[#eb6e34] text-sm"
                  placeholder="VD: an.nguyen@example.com"
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
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#eb6e34] focus:outline-hidden focus:ring-2 focus:ring-[#eb6e34] text-sm"
                  placeholder="VD: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <UserCheck size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ngày sinh <span className="text-[#eb6e34] font-normal">(Yêu cầu từ đủ 13 tuổi trở lên)</span>
              </label>
              <div className="relative">
                <input
                  name="dateOfBirth"
                  type="date"
                  max={maxBirthDate}
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#eb6e34] focus:outline-hidden focus:ring-2 focus:ring-[#eb6e34] text-sm"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Hệ thống mở rộng toàn thành phố và bắt buộc người dùng từ đủ 13 tuổi trở lên.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#eb6e34] focus:outline-hidden focus:ring-2 focus:ring-[#eb6e34] text-sm"
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
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-[#eb6e34] py-3 px-4 text-sm font-semibold text-white hover:bg-[#d85d26] focus:outline-hidden focus:ring-2 focus:ring-[#eb6e34] disabled:opacity-70 transition shadow-sm mt-2"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-100">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-[#eb6e34] hover:text-[#d85d26]">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
