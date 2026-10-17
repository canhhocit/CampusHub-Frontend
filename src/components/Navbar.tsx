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
      {/* Top Value Proposition Banner (Inspired by Oreka Value Banner) */}
      <div className="bg-orange-50/70 border-b border-orange-100 text-slate-700 text-xs py-1.5 px-4 text-center font-normal flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 font-semibold text-orange-700">
          <Lock size={12} className="text-orange-600" /> Smart Locker Campus:
        </span>
        <span className="hidden sm:inline">Nền tảng mua bán đồ cũ sinh viên & Giao nhận qua tủ thông minh</span>
        <span className="hidden sm:inline text-orange-300">•</span>
        <span>Cam kết giữ tiền bảo đảm 100%</span>
        <span className="hidden md:inline text-orange-300">•</span>
        <span className="hidden md:inline">Không cần gặp mặt trực tiếp</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#eb6e34] flex items-center justify-center text-white shadow-xs group-hover:bg-[#d85e25] transition">
                <Package size={20} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
                  CampusHub
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 font-medium">
                  Mua bán đồ cũ & Smart Locker
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
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-orange-50 text-orange-700 font-semibold border border-orange-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={15} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center Global Search (Oreka Pattern) */}
          <form
            onSubmit={handleGlobalSearch}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Tìm giáo trình, laptop, đồ KTX, tài liệu..."
              className="w-full pl-9 pr-20 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-[#eb6e34] focus:ring-1 focus:ring-[#eb6e34] bg-white transition"
            />
            <Search className="absolute left-3 text-slate-400" size={16} />
            <button
              type="submit"
              className="absolute right-1 px-3.5 py-1.5 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-md text-xs font-semibold transition"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Right Action Icons & Account */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {/* Admin Portal Jump Badge */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 transition"
              >
                <LayoutDashboard size={14} />
                Quản trị Admin
              </Link>
            )}

            {/* Post Listing Action (Oreka's signature orange Đăng bán button) */}
            <Link
              to={isAuthenticated ? "/marketplace/new" : "/login"}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-[#eb6e34] hover:bg-[#d85e25] text-white shadow-xs transition"
            >
              <Plus size={16} />
              Đăng bán
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
              className="p-1.5 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
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
              className="w-full pl-9 pr-20 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-[#eb6e34] focus:border-[#eb6e34] bg-white"
            />
            <Search className="absolute left-3 text-slate-400" size={16} />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-[#eb6e34] text-white rounded-md text-xs font-semibold"
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
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
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
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-900 bg-slate-100"
              >
                <Plus size={16} />
                Đăng tin bán sản phẩm
              </Link>
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
