import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PasswordInput } from '../../components/common/PasswordInput';
import { BrandMark } from '../../components/common/BrandMark';
import { AlertCircle, User, ArrowRight, Loader2, ShieldCheck, Lock, CreditCard } from 'lucide-react';

export const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // UP-02: Preserve deep link or default to '/'
  const from = (location.state as any)?.from?.pathname || '/';

  // UP-02: Redirect already authenticated users away from login
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ usernameOrEmail, password });
      navigate(from, { replace: true });
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
    <div className="min-h-screen bg-white grid grid-cols-1 lg:grid-cols-12 font-sans">
      {/* Left Brand Column (Obsidian Editorial Panel) */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 auth-mesh text-white p-10 xl:p-14 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
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
              Trao đổi đồ học tập minh bạch trong khuôn viên trường.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mọi đơn hàng đều được bảo vệ qua cơ chế ký quỹ trung gian và bàn giao linh hoạt 24/7 tại trạm tủ Smart Locker.
            </p>
          </div>

          <div className="space-y-3.5 pt-2 border-t border-white/10">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">Định danh sinh viên eKYC</p>
                <p className="text-xs text-slate-400 mt-0.5">Xác thực CCCD và khuôn mặt để hạn chế tối đa tài khoản ảo.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <CreditCard size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">Ký quỹ PayOS an toàn</p>
                <p className="text-xs text-slate-400 mt-0.5">Tiền chỉ giải ngân khi người mua đã kiểm tra và nhận đồ tại tủ.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Lock size={16} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">Nhận hàng bằng mã PIN 6 số</p>
                <p className="text-xs text-slate-400 mt-0.5">Không cần hẹn giờ gặp mặt, chủ động gửi và lấy bất cứ lúc nào.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © 2026 CampusHub Platform
        </div>
      </div>

      {/* Right Form Column */}
      <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-[#f8fafc] lg:bg-white">
        <div className="w-full max-w-md mx-auto space-y-7 bg-white p-7 sm:p-9 lg:p-0 rounded-2xl lg:rounded-none border border-slate-200/85 lg:border-0 shadow-xs lg:shadow-none">
          <div className="space-y-2">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 mb-2">
              <BrandMark size="sm" tone="dark" />
              <span className="font-display font-bold text-slate-900 text-base tracking-tight">
                Campus<span className="text-emerald-600">Hub</span>
              </span>
            </Link>
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950">
              Đăng nhập tài khoản
            </h1>
            <p className="text-sm text-slate-500">
              Nhập thông tin tài khoản sinh viên của bạn để tiếp tục.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 text-rose-800 p-3.5 rounded-lg border border-rose-200/80 flex items-start gap-2.5 text-xs sm:text-sm">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên đăng nhập hoặc Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    className="block w-full rounded-lg border border-slate-300 pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 text-sm transition"
                    placeholder="username hoặc email@domain.edu.vn"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 transition"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-slate-900 py-2.5 sm:py-3 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60 transition cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-white" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-600">
            <span>Chưa có tài khoản?</span>
            <Link
              to="/register"
              className="font-semibold text-emerald-700 hover:text-emerald-800 transition"
            >
              Đăng ký tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
