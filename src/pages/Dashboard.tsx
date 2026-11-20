import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ShoppingBag,
  Package,
  Inbox,
  Send,
  LogOut,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Plus,
  Lock,
  Clock,
  XCircle,
  User,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { UserNavTabs } from '../components/UserNavTabs';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const quickServices = [
    {
      title: 'Chợ Trao Đổi Đồ Cũ',
      description: 'Khám phá giáo trình, đồ điện tử, thiết bị học tập ký túc xá',
      to: '/marketplace',
      icon: ShoppingBag,
      iconColor: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20',
      badge: 'Khám phá',
      tag: 'HOT',
    },
    {
      title: 'Tin Đăng Của Tôi',
      description: 'Quản lý bài đăng bán, chỉnh sửa thông tin hoặc ẩn/hiện tin',
      to: '/marketplace/my-listings',
      icon: Package,
      iconColor: 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20',
      badge: 'Quản lý',
      tag: 'Bán đồ',
    },
    {
      title: 'Đơn Mua & Nhận Đồ',
      description: 'Theo dõi tiến độ đơn mua, nhận mã PIN mở tủ Smart Locker 24/7',
      to: '/orders/buying',
      icon: Inbox,
      iconColor: 'text-teal-400 bg-teal-500/10 border border-teal-500/20',
      badge: 'Đơn mua',
      tag: 'Lấy đồ',
    },
    {
      title: 'Đơn Bán & Gửi Hàng',
      description: 'Xác nhận đơn, nhận chỉ định ngăn tủ và gửi đồ cho người mua',
      to: '/orders/selling',
      icon: Send,
      iconColor: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20',
      badge: 'Đơn bán',
      tag: 'Gửi đồ',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        <UserNavTabs />

        {/* 1. Digital Student ID Card & Welcome Spotlight */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 lg:p-10 border border-slate-800 shadow-xl">
          {/* Ambient Lighting Orbs */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
            {/* Student Identity Left Area */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 font-black flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 ring-4 ring-white/10 shrink-0">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                {user?.identityVerified && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-md">
                    <ShieldCheck size={14} className="stroke-[2.5]" />
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Xin chào, {user?.fullName || user?.username}!
                  </h1>
                  {user?.identityReviewStatus === 'APPROVED' || user?.identityVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 size={12} className="text-emerald-400" /> Đã duyệt CCCD
                    </span>
                  ) : user?.identityReviewStatus === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Clock size={12} className="text-amber-400" /> Đang chờ duyệt CCCD
                    </span>
                  ) : user?.identityReviewStatus === 'REJECTED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <XCircle size={12} className="text-rose-400" /> CCCD bị từ chối
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      <ShieldAlert size={12} className="text-slate-400" /> Chưa nộp CCCD
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                  <span>Thành viên sinh viên KTX</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-slate-300 font-mono text-xs">{user?.email || user?.username}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions Right Area */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl text-xs font-semibold transition"
              >
                <User size={15} />
                <span>Hồ sơ &amp; Bảo mật</span>
              </Link>
              <Link
                to="/marketplace/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={16} />
                <span>Đăng bán đồ cũ</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition"
                title="Đăng xuất"
              >
                <LogOut size={15} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Verification Banner if not verified */}
          {!user?.identityVerified && (
            <div className="mt-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-amber-200">
                    Xác minh căn cước công dân (CCCD)
                  </h3>
                  <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                    Xác minh danh tính giúp tài khoản của bạn đủ điều kiện đăng bán sản phẩm và nhận mã PIN mở tủ Smart Locker 24/7 an toàn.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/verify-identity')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold whitespace-nowrap self-start sm:self-auto transition shadow-md flex items-center gap-1.5 shrink-0"
              >
                <span>Xác minh ngay</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Digital Badge Metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Trạng thái tài khoản</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-live-pulse" />
                Hoạt động
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Bảo mật Escrow</span>
              <span className="text-sm font-bold text-cyan-400 flex items-center gap-1 mt-0.5">
                <ShieldCheck size={14} />
                Kích hoạt 100%
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Tủ Smart Locker</span>
              <span className="text-sm font-bold text-teal-400 flex items-center gap-1 mt-0.5">
                <Lock size={14} />
                Sẵn sàng 24/7
              </span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 font-medium block">Vai trò thành viên</span>
              <span className="text-sm font-bold text-indigo-300 flex items-center gap-1 mt-0.5">
                <Sparkles size={14} />
                Sinh viên KTX
              </span>
            </div>
          </div>
        </div>

        {/* 2. Core Transaction & Services Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Dịch Vụ &amp; Luồng Giao Dịch Nhanh</span>
            </h2>
            <span className="text-xs text-slate-400">Chọn dịch vụ để thao tác</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickServices.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.to}
                  type="button"
                  onClick={() => navigate(service.to)}
                  className="p-5 bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-emerald-400 rounded-2xl text-left transition-all duration-300 group shadow-xs hover:shadow-lg hover:-translate-y-1 flex items-start gap-4"
                >
                  <div className={`p-3 rounded-xl ${service.iconColor} group-hover:scale-110 transition-transform shrink-0`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {service.title}
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full shrink-0">
                        {service.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Smart Locker Guide / Assurance Callout */}
        <div className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Lock size={16} />
            </div>
            <div>
              <span className="font-bold text-slate-900 block sm:inline">Giao dịch an toàn 100% qua Smart Locker.</span>
              <span className="text-slate-600 sm:ml-1">Người mua mở tủ kiểm tra đồ thành công thì người bán mới nhận tiền.</span>
            </div>
          </div>
          <Link
            to="/about-guide"
            className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-xs shrink-0 hover:underline"
          >
            <span>Cẩm nang hướng dẫn</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
