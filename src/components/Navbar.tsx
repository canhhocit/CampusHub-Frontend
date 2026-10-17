import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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
    { to: '/marketplace', label: 'Chợ ', icon: ShoppingBag },
    { to: '/orders/buying', label: 'Đơn mua', icon: Inbox, authOnly: true },
    { to: '/orders/selling', label: 'Đơn bán', icon: Send, authOnly: true },
    { to: '/marketplace/my-listings', label: 'Tin của tôi', icon: Package, authOnly: true },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 font-sans shadow-xs">
      {/* Top Value Proposition Banner (Inspired by Oreka) */}
      <div className="bg-indigo-950 text-indigo-100 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 font-bold text-amber-300">
          <Lock size={12} /> Smart Locker Campus:
        </span>
        <span className="hidden sm:inline">Giao nhận đồ an toàn 100% qua tủ đồ thông minh</span>
        <span className="hidden sm:inline">•</span>
        <span>Không cần gặp mặt trực tiếp</span>
        <span className="hidden md:inline">• Bảo vệ quyền lợi người mua & người bán</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                <Package size={22} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
                  CampusHub
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 font-medium">
                  Trao đổi thông minh, thông tin minh bạch
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                if (link.authOnly && !isAuthenticated) return null;
                const Icon = link.icon;
                const isActive = location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={15} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Global Search (Desktop - Oreka Pattern) */}
          <form
            onSubmit={handleGlobalSearch}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Tìm giáo trình, laptop, đồ KTX, tài liệu..."
              className="w-full pl-9 pr-20 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 hover:bg-white transition"
            />
            <Search className="absolute left-3 text-slate-400" size={16} />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm font-bold transition"
            >
              Tìm
            </button>
          </form>

          {/* Right Action Icons & Account */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {/* Admin Portal Jump Badge */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition"
              >
                <LayoutDashboard size={14} />
                Quản trị Admin
              </Link>
            )}

            {/* Post Listing Action (Prominent CTA inspired by Oreka's "Đăng bán") */}
            <Link
              to={isAuthenticated ? "/marketplace/new" : "/login"}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-sm shadow-purple-600/20 transition hover:scale-102"
            >
              <Plus size={16} />
              Đăng tin bán
            </Link>

            {/* CCCD Badge */}
            {isAuthenticated && !isAdmin && (
              user?.identityVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  Đã duyệt CCCD
                </span>
              ) : (
                <Link
                  to="/verify-identity"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                  title="Xác minh CCCD để được đăng bán và đặt mua qua Locker"
                >
                  <ShieldAlert size={13} className="text-amber-600" />
                  Xác minh CCCD
                </Link>
              )
            )}

            {/* User Profile & Logout */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl transition"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user?.fullName || user?.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <LogOut size={16} />
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
          <div className="md:hidden flex items-center gap-2">
            <Link
              to="/marketplace/new"
              className="p-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Plus size={15} /> Đăng bán
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
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
          <form onSubmit={handleGlobalSearch} className="relative flex items-center">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Tìm sản phẩm, sách giáo trình..."
              className="w-full pl-9 pr-16 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 text-slate-400" size={16} />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold"
            >
              Tìm
            </button>
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
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
            {isAuthenticated && (
              <Link
                to="/marketplace/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-purple-700 bg-purple-50"
              >
                <Plus size={16} />
                Đăng tin bán sản phẩm
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-white bg-purple-600"
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
                className="py-2 text-center text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-bold text-white bg-purple-600 rounded-xl"
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
