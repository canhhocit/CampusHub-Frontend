import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePendingSellingOrdersCount } from '../hooks/usePendingSellingOrders';
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
  User,
  ChevronDown,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Keyboard accessibility: ESC key closes menus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Real-time pending selling orders count for seller badge
  const { data: pendingData } = usePendingSellingOrdersCount();
  const pendingSellingCount = pendingData?.pendingCount || 0;

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
    {
      to: '/orders/selling',
      label: 'Đơn bán',
      icon: Send,
      authOnly: true,
      badge: pendingSellingCount,
    },
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
                    className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-emerald-700' : 'text-slate-500'} />
                    <span>{link.label}</span>
                    {Boolean(link.badge && link.badge > 0) && (
                      <span
                        className="absolute -top-1 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none shadow-xs ring-2 ring-white"
                        title={`${link.badge} đơn bán chờ bạn xác nhận`}
                      >
                        {link.badge! > 99 ? '99+' : link.badge}
                      </span>
                    )}
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

          {/* Right Action Icons & Account (Desktop >= 1024px) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
            {/* Admin Portal Jump Badge */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900 transition shrink-0 min-h-[44px]"
              >
                <LayoutDashboard size={14} />
                <span className="hidden xl:inline">Quản trị</span> Admin
              </Link>
            )}

            {/* Post Listing Action (Fresh Green Button) */}
            <Link
              to={isAuthenticated ? "/marketplace/new" : "/login"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs shrink-0 transition min-h-[44px]"
            >
              <Plus size={15} />
              <span>Đăng bán</span>
            </Link>

            {/* Notification Bell */}
            {isAuthenticated && <NotificationBell />}

            {/* User Profile Popover Dropdown */}
            {isAuthenticated ? (
              <div className="relative pl-2 border-l border-slate-200 shrink-0" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[44px]"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menu tài khoản cá nhân"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate text-left">
                    {user?.fullName || user?.username}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180 text-emerald-600' : ''}`}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95"
                    role="menu"
                    aria-orientation="vertical"
                    aria-label="Tùy chọn tài khoản"
                  >
                    <div className="px-3.5 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {user?.fullName || user?.username}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {user?.email}
                      </p>
                      {user?.identityVerified ? (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                          <span>Đã duyệt CCCD</span>
                        </div>
                      ) : (
                        <Link
                          to="/verify-identity"
                          onClick={() => setUserMenuOpen(false)}
                          className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                        >
                          <ShieldAlert size={11} className="text-amber-600 shrink-0" />
                          <span>Chưa duyệt CCCD • Xác minh</span>
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition"
                        role="menuitem"
                      >
                        <User size={15} className="text-slate-400" />
                        <span>Hồ sơ cá nhân & CCCD</span>
                      </Link>
                      <Link
                        to="/wallet"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition"
                        role="menuitem"
                      >
                        <Wallet size={15} className="text-slate-400" />
                        <span>Ví tiền & Lịch sử</span>
                      </Link>
                      <Link
                        to="/orders/buying"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition"
                        role="menuitem"
                      >
                        <Inbox size={15} className="text-slate-400" />
                        <span>Đơn mua của tôi</span>
                      </Link>
                      <Link
                        to="/orders/selling"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition"
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2.5">
                          <Send size={15} className="text-slate-400" />
                          <span>Đơn bán & Giao tủ</span>
                        </div>
                        {Boolean(pendingSellingCount > 0) && (
                          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                            {pendingSellingCount > 99 ? '99+' : pendingSellingCount}
                          </span>
                        )}
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition min-h-[44px] text-left"
                        role="menuitem"
                      >
                        <LogOut size={15} className="shrink-0" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 min-h-[44px] flex items-center transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl min-h-[44px] flex items-center transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Hamburger Cluster (Viewport < 1024px) */}
          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2">
            {isAuthenticated && <NotificationBell />}
            <Link
              to={isAuthenticated ? "/marketplace/new" : "/login"}
              className="px-2.5 py-2 sm:px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs shrink-0 min-h-[44px] transition"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Đăng bán</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center transition focus-visible:ring-2 focus-visible:ring-emerald-500"
              aria-label={mobileMenuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer (Fixed Modal Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end animate-in fade-in duration-200">
          {/* Backdrop with blur & click to dismiss */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <aside
            className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng di động"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                  <Package size={16} />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none block">
                    CampusHub
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Menu điều hướng
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition"
                aria-label="Đóng menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* Mobile Search Input */}
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
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 transition min-h-[44px]"
                  >
                    Tìm
                  </button>
                </div>
              </form>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navLinks.map((link) => {
                  if (link.authOnly && !isAuthenticated) return null;
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(`${link.to}/`));
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition min-h-[44px] ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/70'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={17} className={isActive ? 'text-emerald-700' : 'text-slate-500'} />
                        <span>{link.label}</span>
                      </div>
                      {Boolean(link.badge && link.badge > 0) && (
                        <span
                          className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-xs font-bold leading-none shadow-xs"
                          title={`${link.badge} đơn bán chờ xác nhận`}
                        >
                          {link.badge! > 99 ? '99+' : link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <Link
                  to={isAuthenticated ? "/marketplace/new" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition min-h-[44px] mt-2 shadow-2xs"
                >
                  <Plus size={17} />
                  <span>Đăng tin bán sản phẩm</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition min-h-[44px] mt-2"
                  >
                    <LayoutDashboard size={17} />
                    <span>Cổng Quản trị Admin</span>
                  </Link>
                )}

                {isAuthenticated && !isAdmin && (
                  <div className="pt-2">
                    {user?.identityVerified ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>Tài khoản đã duyệt CCCD</span>
                      </div>
                    ) : (
                      <Link
                        to="/verify-identity"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition min-h-[44px]"
                      >
                        <ShieldAlert size={15} className="text-amber-600 shrink-0" />
                        <span>Xác minh CCCD để mở toàn quyền</span>
                      </Link>
                    )}
                  </div>
                )}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/70 shrink-0">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 hover:opacity-85 transition min-h-[44px]"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {user?.fullName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-xs min-w-0 flex-1">
                      <strong className="block text-slate-900 truncate">{user?.fullName || user?.username}</strong>
                      <span className="text-slate-500 truncate block text-[11px]">{user?.email}</span>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-2.5 px-3 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px] transition"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-100 min-h-[44px] flex items-center justify-center transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl min-h-[44px] flex items-center justify-center transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
};
