import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PasswordInput } from '../../components/common/PasswordInput';
import { BrandMark } from '../../components/common/BrandMark';
import {
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  UserCheck,
  Calendar,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Lock,
  CreditCard,
} from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, register } = useAuth();
  const navigate = useNavigate();

  // UP-02: Redirect already authenticated user
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Max birthdate for 13 years old (memoized for render purity)
  const maxBirthDate = useMemo(() => {
    return new Date(Date.now() - 13 * 365.25 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
  }, []);

  // UP-02: Password strength meter matching WCAG
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, label: '', color: '', text: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Yếu', color: 'bg-rose-500', text: 'text-rose-600' };
    if (score === 2) return { score: 2, label: 'Trung bình', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score === 3) return { score: 3, label: 'Khá', color: 'bg-slate-700', text: 'text-slate-700' };
    return { score: 4, label: 'Mạnh', color: 'bg-emerald-600', text: 'text-emerald-700' };
  }, [formData.password]);

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

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
      });
      setSuccess(true);
    } catch (err: any) {
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.message) {
          setError(errorData.message);
        } else if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          setError(String(firstError) || 'Đăng ký không thành công.');
        } else {
          setError('Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
        }
      } else {
        setError('Lỗi kết nối máy chủ. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-12 font-sans">
      {/* Left Brand Column */}
      <div className="hidden lg:flex lg:col-span-5 auth-mesh text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <BrandMark size="md" tone="emerald" />
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-white block leading-none">
                CampusHub
              </span>
              <span className="text-[11px] text-slate-400">Chợ sinh viên &amp; Smart Locker</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="space-y-3">
            <h2 className="font-display text-3xl font-bold tracking-tight leading-tight text-white">
              Một tài khoản cho mọi giao dịch sinh viên.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Đăng bán giáo trình cũ, cho thuê thiết bị học tập và nhận thanh toán trực tiếp về ví cá nhân chỉ trong vài phút.
            </p>
          </div>

          <div className="space-y-3.5 pt-2 border-t border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">Cộng đồng đã xác thực</p>
                <p className="text-xs text-slate-400 mt-0.5">Hỗ trợ xác minh CCCD tự động giúp giao dịch tin cậy hơn.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Lock size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">Gửi và lấy đồ chủ động</p>
                <p className="text-xs text-slate-400 mt-0.5">Không phụ thuộc lịch học trùng nhau nhờ tủ Smart Locker 24/7.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CreditCard size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">Ký quỹ minh bạch</p>
                <p className="text-xs text-slate-400 mt-0.5">Giải ngân tự động qua ví nội bộ, hỗ trợ rút về ngân hàng nhanh chóng.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © 2026 CampusHub Platform
        </div>
      </div>

      {/* Right Form Column */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-[#f8fafc] lg:bg-white">
        <div className="w-full max-w-lg mx-auto space-y-6 bg-white p-7 sm:p-9 lg:p-0 rounded-2xl lg:rounded-none border border-slate-200/85 lg:border-0 shadow-xs lg:shadow-none">
          <div className="space-y-1.5">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-2">
              <BrandMark size="sm" tone="dark" />
              <span className="font-display font-bold text-slate-900 text-base tracking-tight">
                Campus<span className="text-emerald-600">Hub</span>
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950">
              Tạo tài khoản mới
            </h1>
            <p className="text-sm text-slate-500">
              Điền thông tin cơ bản để bắt đầu mua bán và giao nhận qua Smart Locker.
            </p>
          </div>

          {success ? (
            <div className="bg-emerald-50 text-emerald-950 p-6 sm:p-7 rounded-xl border border-emerald-200/80 flex flex-col items-center gap-3.5 text-center">
              <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-semibold text-emerald-950">
                  Đăng ký tài khoản thành công
                </h2>
                <p className="text-xs sm:text-sm text-emerald-800 max-w-sm leading-relaxed">
                  Chúng tôi đã gửi email xác thực tài khoản. Vui lòng kiểm tra hộp thư (kể cả mục spam) và nhấn vào liên kết kích hoạt.
                </p>
              </div>
              <Link
                to="/login"
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-slate-800 transition"
              >
                <span>Đi đến trang đăng nhập</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-50 text-rose-800 p-3.5 rounded-lg border border-rose-200/80 flex items-start gap-2.5 text-xs sm:text-sm">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="username" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tên đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      autoComplete="username"
                      className="block w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 text-sm transition"
                      placeholder="VD: sinhvien_k64"
                      value={formData.username}
                      onChange={handleChange}
                    />
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      autoComplete="name"
                      className="block w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 text-sm transition"
                      placeholder="VD: Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    <UserCheck size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="block w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 text-sm transition"
                      placeholder="sinhvien@school.edu.vn"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Ngày sinh <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      max={maxBirthDate}
                      required
                      className="block w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 text-sm transition"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <PasswordInput
                  id="password"
                  name="password"
                  label="Mật khẩu"
                  required
                  autoComplete="new-password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={formData.password}
                  onChange={handleChange}
                />

                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  required
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'Mật khẩu xác nhận không khớp'
                      : undefined
                  }
                />
              </div>

              {formData.password && (
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200/80" aria-live="polite">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600 font-medium">Độ mạnh mật khẩu:</span>
                    <span className={`font-semibold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="w-full grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`rounded-full h-full transition-colors ${
                          level <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-lg bg-slate-900 py-2.5 sm:py-3 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60 transition cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Đang xử lý đăng ký...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng ký tài khoản</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
            <span>Đã có tài khoản?</span>
            <Link
              to="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800 transition"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
