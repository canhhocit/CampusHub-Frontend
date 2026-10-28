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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-7 bg-white p-7 sm:p-8 rounded-lg shadow-2xs border border-slate-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-lg mx-auto flex items-center justify-center font-black text-xl mb-3 border border-emerald-200/60 shadow-2xs">
            CH
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Đăng ký thành viên
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mạng lưới tủ locker thông minh & chợ đồ dùng sinh viên (Từ đủ 13 tuổi trở lên)
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 text-emerald-800 p-6 rounded-lg border border-emerald-200 flex flex-col items-center gap-3 text-center">
            <CheckCircle size={36} className="text-emerald-600" />
            <h3 className="text-base font-bold text-emerald-900">Đăng ký thành công!</h3>
            <p className="text-xs sm:text-sm text-emerald-700">
              Vui lòng kiểm tra email của bạn để nhấn vào liên kết xác thực tài khoản.
            </p>
            <Link
              to="/login"
              className="mt-3 px-5 py-2.5 bg-emerald-600 text-white rounded-md text-sm font-bold hover:bg-emerald-700 transition shadow-2xs"
            >
              Đến trang Đăng nhập
            </Link>
          </div>
        ) : (
          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-md border border-red-200 flex items-center gap-2 text-xs sm:text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <input
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-md border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm transition"
                  placeholder="VD: nguyenvanan"
                  value={formData.username}
                  onChange={handleChange}
                />
                <User size={18} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email cá nhân</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-md border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm transition"
                  placeholder="VD: an.nguyen@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên đầy đủ</label>
              <div className="relative">
                <input
                  name="fullName"
                  type="text"
                  required
                  className="block w-full rounded-md border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm transition"
                  placeholder="VD: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <UserCheck size={18} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày sinh <span className="text-emerald-700 font-normal">(Yêu cầu từ đủ 13 tuổi trở lên)</span>
              </label>
              <div className="relative">
                <input
                  name="dateOfBirth"
                  type="date"
                  max={maxBirthDate}
                  required
                  className="block w-full rounded-md border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm transition"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
                <Calendar size={18} className="absolute left-3 top-3 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Người dùng hệ thống phải từ đủ 13 tuổi trở lên theo quy định.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 text-sm transition"
                  placeholder="Tối thiểu 6 ký tự..."
                  value={formData.password}
                  onChange={handleChange}
                />
                <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-md bg-emerald-600 py-2.5 sm:py-3 px-4 text-sm font-bold text-white hover:bg-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-70 transition shadow-2xs mt-2"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <div className="text-center text-xs sm:text-sm text-slate-600 pt-3 border-t border-slate-100">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
