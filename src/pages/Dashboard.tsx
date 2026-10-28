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
      iconColor: 'text-[#eb6e34] bg-orange-50',
      badge: 'Khám phá',
    },
    {
      title: 'Tin Đăng Của Tôi',
      description: 'Quản lý bài đăng bán, chỉnh sửa thông tin hoặc ẩn/hiện tin',
      to: '/marketplace/my-listings',
      icon: Package,
      iconColor: 'text-blue-600 bg-blue-50',
      badge: 'Quản lý',
    },
    {
      title: 'Đơn Mua & Nhận Đồ',
      description: 'Theo dõi tiến độ đơn mua, nhận mã PIN mở tủ Smart Locker',
      to: '/orders/buying',
      icon: Inbox,
      iconColor: 'text-emerald-600 bg-emerald-50',
      badge: 'Đơn hàng',
    },
    {
      title: 'Đơn Bán & Gửi Đồ',
      description: 'Xác nhận đơn, nhận chỉ định ngăn tủ và gửi đồ cho người mua',
      to: '/orders/selling',
      icon: Send,
      iconColor: 'text-indigo-600 bg-indigo-50',
      badge: 'Bán hàng',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        <UserNavTabs />

        {/* Main Profile & Welcome Card */}
        <div className="bg-white rounded-lg shadow-2xs border border-slate-200 overflow-hidden p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-lg shadow-2xs shrink-0">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Xin chào, {user?.fullName || user?.username}!
                  </h1>
                  {user?.identityVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={13} className="text-emerald-600" /> Đã duyệt CCCD
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <ShieldAlert size={13} className="text-amber-600" /> Chưa xác minh CCCD
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Tài khoản thành viên sinh viên • {user?.email || user?.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                to="/marketplace/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                <Plus size={15} />
                Đăng bán đồ cũ
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                title="Đăng xuất"
              >
                <LogOut size={15} />
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Verification Callout if not verified */}
          {!user?.identityVerified && (
            <div className="mt-5 p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-sm font-bold text-amber-900">
                    Xác minh căn cước công dân (CCCD)
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Xác minh danh tính giúp bạn đủ điều kiện đăng bán sản phẩm và nhận mã PIN mở tủ Smart Locker an toàn.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/verify-identity')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap self-start sm:self-auto transition shadow-xs flex items-center gap-1.5"
              >
                Xác minh ngay <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Core Services Grid */}
          <div className="mt-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Dịch Vụ & Luồng Giao Dịch
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {quickServices.map((service) => {
                const Icon = service.icon;
                return (
                  <button
                    key={service.to}
                    type="button"
                    onClick={() => navigate(service.to)}
                    className="p-4 bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-all group shadow-2xs hover:shadow-xs flex items-start gap-3.5"
                  >
                    <div
                      className={`p-2.5 rounded-lg ${service.iconColor} group-hover:scale-105 transition-transform shrink-0`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                          {service.title}
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shrink-0">
                          {service.badge}
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

          {/* Smart Locker Guide / Assurance Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-[#eb6e34]" />
              <span>Giao dịch an toàn 100% qua Tủ Thông Minh CampusHub Smart Locker.</span>
            </div>
            <Link
              to="/about-guide"
              className="text-[#eb6e34] hover:underline font-semibold flex items-center gap-1"
            >
              Xem cẩm nang hướng dẫn <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
