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
  Clock,
  XCircle,
  User,
  ShieldCheck,
  Wallet,
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
      title: 'Khám phá chợ sinh viên',
      description: 'Tìm kiếm giáo trình, máy tính, đồ điện tử và vật dụng ký túc xá.',
      to: '/marketplace',
      icon: ShoppingBag,
    },
    {
      title: 'Tin đăng của tôi',
      description: 'Quản lý sản phẩm đang bán, cập nhật giá, ẩn hoặc mở lại tin đăng.',
      to: '/marketplace/my-listings',
      icon: Package,
    },
    {
      title: 'Đơn mua & Nhận tủ',
      description: 'Theo dõi trạng thái thanh toán và lấy mã PIN mở ngăn tủ Smart Locker.',
      to: '/orders/buying',
      icon: Inbox,
    },
    {
      title: 'Đơn bán & Gửi hàng',
      description: 'Xác nhận đơn hàng mới, xem ngăn tủ được cấp phát và gửi đồ.',
      to: '/orders/selling',
      icon: Send,
    },
    {
      title: 'Ví tiền & Rút tiền',
      description: 'Kiểm tra số dư giải ngân, lịch sử giao dịch và tài khoản ngân hàng.',
      to: '/wallet',
      icon: Wallet,
    },
    {
      title: 'Hồ sơ & Bảo mật',
      description: 'Cập nhật thông tin cá nhân, đổi mật khẩu và quản lý trạng thái eKYC.',
      to: '/profile',
      icon: User,
    },
  ];

  const pipelineSteps = [
    {
      step: '01',
      title: 'Đặt đơn & Ký quỹ',
      description: 'Người mua thanh toán qua PayOS. Hệ thống giữ tiền ký quỹ cho đến khi bàn giao thành công.',
    },
    {
      step: '02',
      title: 'Gửi đồ vào Smart Locker',
      description: 'Hệ thống cấp ngăn tủ trống tại trạm KTX. Người bán đến gửi đồ và xác nhận đóng ngăn.',
    },
    {
      step: '03',
      title: 'Nhận bằng mã PIN & Giải ngân',
      description: 'Người mua nhập mã PIN 6 số mở tủ 24/7. Sau khi nhận hàng, tiền tự động cộng vào ví người bán.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-[1280px] mx-auto space-y-6">
        <UserNavTabs />

        {/* Account Summary Header */}
        <section className="bg-white rounded-2xl border border-slate-200/85 p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 text-white font-semibold flex items-center justify-center text-xl shrink-0">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                {user?.identityVerified && (
                  <span
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white"
                    title="Đã xác thực CCCD"
                  >
                    <ShieldCheck size={13} strokeWidth={2.5} />
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                    {user?.fullName || user?.username}
                  </h1>
                  {user?.identityReviewStatus === 'APPROVED' || user?.identityVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      Đã xác thực CCCD
                    </span>
                  ) : user?.identityReviewStatus === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                      <Clock size={13} className="text-amber-600" />
                      Đang chờ duyệt CCCD
                    </span>
                  ) : user?.identityReviewStatus === 'REJECTED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
                      <XCircle size={13} className="text-rose-600" />
                      Hồ sơ CCCD bị từ chối
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      <ShieldAlert size={13} className="text-slate-500" />
                      Chưa xác thực CCCD
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-500">
                  @{user?.username} · {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                to="/marketplace/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-[13px] font-semibold transition"
              >
                <Plus size={15} />
                <span>Đăng bán đồ cũ</span>
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs sm:text-[13px] font-medium transition"
              >
                <User size={15} className="text-slate-400" />
                <span>Cài đặt hồ sơ</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-lg text-xs sm:text-[13px] font-medium transition"
              >
                <LogOut size={15} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {!user?.identityVerified && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/85 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h3 className="text-sm font-semibold text-amber-950">
                    Hoàn tất xác minh căn cước công dân (eKYC)
                  </h3>
                  <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                    Xác minh CCCD để mở khóa quyền đăng bán sản phẩm, đặt thuê đồ và nhận mã PIN mở ngăn tủ Smart Locker.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/verify-identity')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap self-start sm:self-auto transition inline-flex items-center gap-1.5 shrink-0"
              >
                <span>Xác minh ngay</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>

        {/* Workspace Shortcuts */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Quản lý giao dịch &amp; Tài khoản
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickServices.map((service) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.to}
                  type="button"
                  onClick={() => navigate(service.to)}
                  className="p-5 bg-white hover:border-slate-300 border border-slate-200/85 rounded-xl text-left transition-all duration-200 group shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-emerald-50 text-slate-700 group-hover:text-emerald-700 border border-slate-200/70 group-hover:border-emerald-200 flex items-center justify-center transition-colors shrink-0">
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {service.title}
                      </h3>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Clean 3-Step Smart Locker Process */}
        <section className="bg-white rounded-2xl border border-slate-200/85 p-6 shadow-[var(--shadow-card)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Quy trình giao nhận qua Smart Locker
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ba bước chuẩn hóa bảo vệ quyền lợi cả người mua và người bán.
              </p>
            </div>
            <Link
              to="/about-guide"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
            >
              <span>Xem hướng dẫn chi tiết</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pipelineSteps.map((item) => (
              <div key={item.step} className="space-y-1.5">
                <span className="inline-block text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded">
                  Bước {item.step}
                </span>
                <h3 className="text-sm font-semibold text-slate-900 pt-1">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
