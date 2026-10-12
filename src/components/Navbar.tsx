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
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/marketplace', label: 'Chợ Đồ Cũ', icon: ShoppingBag },
    { to: '/orders/buying', label: 'Đơn mua', icon: Inbox, authOnly: true },
    { to: '/orders/selling', label: 'Đơn bán', icon: Send, authOnly: true },
    { to: '/marketplace/my-listings', label: 'Tin của tôi', icon: Package, authOnly: true },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to={isAdmin ? '/admin/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
                <Package size={22} />
              </div>
              <div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
                  CampusHub
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 font-medium">
                  Chợ Trao Đổi & Tủ Thông Minh
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                if (link.authOnly && !isAuthenticated) return null;
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
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

          {/* Right Action Icons & Account */}
          <div className="hidden md:flex items-center gap-3">
            {/* Admin Portal Jump Badge */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/30 transition"
              >
                <LayoutDashboard size={14} />
                CỔNG QUẢN TRỊ ADMIN
              </Link>
            )}

            {/* Post Listing Action */}
            {isAuthenticated && (
              <Link
                to="/marketplace/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
              >
                <Plus size={15} />
                Đăng tin bán
              </Link>
            )}

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
                >
                  <ShieldAlert size={13} className="text-amber-600" />
                  Xác minh CCCD
                </Link>
              )
            )}

            {/* User Profile & Logout */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                  {user?.fullName || user?.username}
                </span>
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
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-purple-600 text-white"
              >
                ADMIN
              </Link>
            )}
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
