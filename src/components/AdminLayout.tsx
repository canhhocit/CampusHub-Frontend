import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Lock,
  FileText,
  Home,
  LogOut,
  Menu,
  X,
  Clock,
  Shield,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  badge?: string;
  badgeColor?: string;
  isExternal?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' - ' +
        now.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navSections: NavSection[] = [
    {
      title: 'BÁO CÁO & GIÁM SÁT',
      items: [
        {
          to: '/admin/dashboard',
          label: 'Tổng quan & Báo cáo',
          badge: 'Live',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
          icon: LayoutDashboard,
          active: location.pathname === '/admin/dashboard',
        },
      ],
    },
    {
      title: 'QUẢN TRỊ NGHIỆP VỤ',
      items: [
        {
          to: '/admin/users',
          label: 'Người dùng & CCCD',
          icon: Users,
          active: location.pathname.startsWith('/admin/users'),
        },
        {
          to: '/admin/lockers',
          label: 'Tủ Locker Thông minh',
          icon: Lock,
          active: location.pathname.startsWith('/admin/lockers'),
        },
      ],
    },
    {
      title: 'AN NINH & BẢO MẬT',
      items: [
        {
          to: '/admin/audit',
          label: 'Nhật ký Hệ thống (Audit)',
          icon: FileText,
          active: location.pathname.startsWith('/admin/audit'),
        },
      ],
    },
    {
      title: 'ĐIỀU HƯỚNG NHANH',
      items: [
        {
          to: '/',
          label: 'Cổng Dịch vụ CampusHub',
          icon: Home,
          isExternal: true,
          active: false,
        },
      ],
    },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/admin/dashboard') return 'Báo cáo Vận hành & Giám sát Hệ thống';
    if (location.pathname.startsWith('/admin/users')) return 'Quản lý Tài khoản & Định danh CCCD';
    if (location.pathname.startsWith('/admin/lockers')) return 'Quản lý Hệ thống Tủ Thông minh';
    if (location.pathname.startsWith('/admin/audit')) return 'Nhật ký Hoạt động Toàn diện (Audit Logs)';
    return 'Cổng Quản trị Viên';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar Navigation Menu Bar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-slate-800 print:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Brand & Portal Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/60">
            <Link to="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-600/20 ring-1 ring-purple-400/30">
                <ShieldCheck size={22} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-base tracking-tight flex items-center gap-1.5">
                  CampusHub
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Admin
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Bảng điều hành & Báo cáo</span>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-md"
              aria-label="Đóng thanh điều hướng"
            >
              <X size={20} />
            </button>
          </div>

          {/* System Health Status Indicator */}
          <div className="px-5 py-3 mx-4 mt-4 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">Hệ thống: Bình thường</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950/80 text-emerald-400 rounded-sm font-mono border border-emerald-800/40">
              ONLINE
            </span>
          </div>

          {/* Nav Links / Groups */}
          <nav className="px-4 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-17rem)]">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        item.active
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 ring-1 ring-purple-400/40 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={item.active ? 'text-white' : 'text-slate-400'}
                        />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                        {item.isExternal && (
                          <ExternalLink size={14} className="text-slate-500" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom User Profile & Sign Out Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {user?.fullName || user?.username || 'Quản trị viên'}
                </div>
                <div className="text-[11px] text-purple-300 flex items-center gap-1">
                  <Shield size={11} /> Quản trị viên tối cao
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất khỏi Cổng Quản trị"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0"
              aria-label="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-4 sm:px-6 lg:px-8 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Mở thanh điều hướng"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center text-sm">
              <span className="text-slate-400 font-medium hidden sm:inline">Cổng Quản trị</span>
              <ChevronRight size={14} className="text-slate-400 mx-1.5 hidden sm:inline" />
              <span className="text-slate-900 font-bold truncate">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right Header: Clock, Quick Home Link & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {currentTime && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
                <Clock size={14} className="text-purple-600" />
                <span className="font-mono">{currentTime}</span>
              </div>
            )}

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
            >
              <Home size={14} />
              Cổng dịch vụ
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden lg:inline">
                {user?.username || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
