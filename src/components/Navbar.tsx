import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';
import {
  ShoppingBag,
  Package,
  Inbox,
  Send,
  Plus,
  ShieldAlert,
  CheckCircle2,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Search,
  Lock,
  BookOpen,
  Wallet,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/marketplace');
    }
  };

  const navLinks = [
    { to: '/marketplace', label: 'Chợ đồ cũ', icon: ShoppingBag },
    { to: '/orders/buying', label: 'Đơn mua', icon: Inbox, authOnly: true },
    { to: '/orders/selling', label: 'Đơn bán', icon: Send, authOnly: true },
    { to: '/wallet', label: 'Ví tiền', icon: Wallet, authOnly: true },
    { to: '/marketplace/my-listings', label: 'Tin bán', icon: Package, authOnly: true },
    { to: '/about-guide', label: 'Hướng dẫn', icon: BookOpen },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 font-sans shadow-2xs">
      {/* Top Value Proposition Banner (Fresh Oreka Eco Style) */}
      <div className="bg-emerald-50/80 border-b border-emerald-100/70 text-slate-700 text-xs py-1 px-4 text-center font-normal flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
          <Lock size={12} className="text-emerald-700" /> Smart Locker Campus:
        </span>
        <span className="hidden sm:inline">Nền tảng mua bán đồ cũ sinh viên & Giao nhận qua tủ thông minh</span>
        <span className="hidden sm:inline text-emerald-300">•</span>
        <span>Bảo đảm an toàn 100%</span>
        <span className="hidden md:inline text-emerald-300">•</span>
        <span className="hidden md:inline">Không cần gặp mặt</span>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-15 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 xl:gap-5 shrink-0">
            <Link to={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-2 group shrink-0">
              <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs group-hover:bg-emerald-700 transition shrink-0">
                <Package size={18} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight flex items-center gap-1.5 leading-none">
                  CampusHub
                </span>
                <span className="hidden xl:block text-[10px] text-slate-500 font-medium mt-0.5">
                  Mua bán đồ cũ & Smart Locker
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                if (link.authOnly && !isAuthenticated) return null;
                const Icon = link.icon;
                const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(`${link.to}/`));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-emerald-700' : 'text-slate-500'} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Global Search (Oreka Pattern - Clean Input Group) */}
          <form
            onSubmit={handleGlobalSearch}
            className="hidden md:flex flex-1 min-w-40 max-w-md items-center"
          >
            <div className="flex w-full items-center bg-slate-50 hover:bg-white focus-within:bg-white border border-slate-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 rounded-lg overflow-hidden transition shadow-2xs">
              <div className="pl-3 text-slate-400 shrink-0">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Tìm giáo trình, Casio, laptop, đồ KTX..."
                className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-transparent border-none focus:outline-hidden placeholder:text-slate-400 min-w-0"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 transition"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Right Action Icons & Account */}
          <div className="hidden md:flex items-center gap-2 xl:gap-2.5 shrink-0">
            {/* Admin Portal Jump Badge */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 transition shrink-0"
              >
                <LayoutDashboard size={14} />
                <span className="hidden xl:inline">Quản trị</span> Admin
              </Link>
            )}

            {/* Post Listing Action (Fresh Green Button) */}
            <Link
              to={isAuthenticated ? "/marketplace/new" : "/login"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs shrink-0 transition"
            >
              <Plus size={15} />
              <span>Đăng bán</span>
            </Link>

            {/* CCCD Badge */}
            {isAuthenticated && !isAdmin && (
              user?.identityVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span className="hidden xl:inline">Đã duyệt</span> CCCD
                </span>
              ) : (
                <Link
                  to="/verify-identity"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 shrink-0 transition"
                  title="Xác minh CCCD để được đăng bán và đặt mua qua Locker"
                >
                  <ShieldAlert size={13} className="text-amber-600 shrink-0" />
                  <span>Xác minh CCCD</span>
                </Link>
              )
            )}

            {/* Notification Bell */}
            {isAuthenticated && <NotificationBell />}

            {/* User Profile & Logout */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 shrink-0">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 hover:bg-slate-50 p-1 rounded-lg transition"
                  title={user?.fullName || user?.username}
                >
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-17.5 xl:max-w-27.5 truncate">
                    {user?.fullName || user?.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
            {isAuthenticated && <NotificationBell />}
            <Link
              to={isAuthenticated ? "/marketplace/new" : "/login"}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs shrink-0"
            >
              <Plus size={14} />
              <span className="hidden xs:inline">Đăng bán</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg shrink-0"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          {/* Mobile Search */}
          <form onSubmit={handleGlobalSearch} className="flex items-center">
            <div className="flex w-full items-center bg-slate-50 border border-slate-300 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 rounded-lg overflow-hidden transition">
              <div className="pl-3 text-slate-400 shrink-0">
                <Search size={15} />
              </div>
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Tìm sản phẩm, sách giáo trình..."
                className="w-full px-2.5 py-2 text-xs bg-transparent border-none focus:outline-hidden placeholder:text-slate-400 min-w-0"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 transition"
              >
                Tìm
              </button>
            </div>
          </form>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
            <Link
              to={isAuthenticated ? "/marketplace/new" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-900 bg-slate-100"
            >
              <Plus size={16} />
              Đăng tin bán sản phẩm
            </Link>
            {isAuthenticated && !isAdmin && (
              <div className="pt-1">
                {user?.identityVerified ? (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    <span>Tài khoản đã duyệt CCCD</span>
                  </div>
                ) : (
                  <Link
                    to="/verify-identity"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                  >
                    <ShieldAlert size={15} className="text-amber-600 shrink-0" />
                    <span>Xác minh CCCD để mở toàn quyền</span>
                  </Link>
                )}
              </div>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-slate-900"
              >
                <LayoutDashboard size={16} />
                Truy cập Cổng Quản trị Admin
              </Link>
            )}
          </nav>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-xs">
                  <strong className="block text-slate-900">{user?.fullName || user?.username}</strong>
                  <span className="text-slate-500">{user?.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-semibold text-white bg-slate-900 rounded-xl"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
