import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrandMark } from './common/BrandMark';
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
  CreditCard,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  badge?: string;
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
        }) +
          ' · ' +
          now.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navSections: NavSection[] = [
    {
      title: 'Tổng quan',
      items: [
        {
          to: '/admin/dashboard',
          label: 'Báo cáo vận hành',
          icon: LayoutDashboard,
          active: location.pathname === '/admin/dashboard',
        },
      ],
    },
    {
      title: 'Nghiệp vụ',
      items: [
        {
          to: '/admin/payouts',
          label: 'Duyệt rút tiền',
          icon: CreditCard,
          active: location.pathname.startsWith('/admin/payouts'),
        },
        {
          to: '/admin/disputes',
          label: 'Giải quyết khiếu nại',
          icon: ShieldAlert,
          active: location.pathname.startsWith('/admin/disputes'),
        },
        {
          to: '/admin/users',
          label: 'Người dùng & CCCD',
          icon: Users,
          active: location.pathname.startsWith('/admin/users'),
        },
        {
          to: '/admin/lockers',
          label: 'Hệ thống Smart Locker',
          icon: Lock,
          active: location.pathname.startsWith('/admin/lockers'),
        },
      ],
    },
    {
      title: 'Kiểm soát',
      items: [
        {
          to: '/admin/audit',
          label: 'Nhật ký hệ thống',
          icon: FileText,
          active: location.pathname.startsWith('/admin/audit'),
        },
        {
          to: '/',
          label: 'Quay về sàn giao dịch',
          icon: Home,
          isExternal: true,
          active: false,
        },
      ],
    },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/admin/dashboard') return 'Báo cáo vận hành';
    if (location.pathname.startsWith('/admin/payouts')) return 'Quản lý yêu cầu rút tiền';
    if (location.pathname.startsWith('/admin/disputes')) return 'Giải quyết khiếu nại đơn hàng';
    if (location.pathname.startsWith('/admin/users')) return 'Tài khoản & Định danh CCCD';
    if (location.pathname.startsWith('/admin/lockers')) return 'Quản lý trạm Smart Locker';
    if (location.pathname.startsWith('/admin/audit')) return 'Nhật ký kiểm toán (Audit Logs)';
    return 'Quản trị hệ thống';
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Unified Obsidian Command Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0b1120] text-slate-300 flex flex-col justify-between transition-transform duration-200 border-r border-white/[0.07] print:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col min-h-0 flex-1">
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.07] shrink-0">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <BrandMark size="sm" tone="emerald" />
              <div className="flex flex-col">
                <span className="font-display font-bold text-white text-[15px] tracking-tight flex items-center gap-1.5">
                  CampusHub
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    Admin
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">Quản trị vận hành</span>
              </div>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg"
              aria-label="Đóng thanh điều hướng"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="px-3 py-5 space-y-6 overflow-y-auto flex-1">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                        item.active
                          ? 'bg-white/[0.09] text-white font-semibold ring-1 ring-white/[0.08]'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={16}
                          className={item.active ? 'text-emerald-400 shrink-0' : 'text-slate-500 shrink-0'}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.isExternal && <ExternalLink size={13} className="text-slate-500 shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-3.5 border-t border-white/[0.07] shrink-0">
          <div className="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-semibold text-xs shrink-0">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.fullName || user?.username || 'Quản trị viên'}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Shield size={11} className="text-emerald-400" />
                  <span>Quản trị viên</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0"
              aria-label="Đăng xuất"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg"
              aria-label="Mở thanh điều hướng"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center text-sm min-w-0">
              <span className="text-slate-400 font-medium hidden sm:inline shrink-0">Quản trị</span>
              <ChevronRight size={14} className="text-slate-400 mx-1.5 hidden sm:inline shrink-0" />
              <span className="text-slate-900 font-semibold truncate">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentTime && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-600 font-mono tabular-nums">
                <Clock size={13} className="text-slate-400" />
                <span>{currentTime}</span>
              </div>
            )}

            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition"
            >
              <Home size={13} />
              <span>Cổng dịch vụ</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
