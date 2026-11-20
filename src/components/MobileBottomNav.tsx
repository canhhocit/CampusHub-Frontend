import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, Inbox, Plus, Wallet, User } from 'lucide-react';
import { usePendingSellingOrdersCount } from '../hooks/usePendingSellingOrders';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: pendingData } = usePendingSellingOrdersCount();
  const pendingSellingCount = pendingData?.pendingCount || 0;

  const pathname = location.pathname;

  const isMarketplace = pathname === '/' || pathname === '/marketplace';
  const isBuying = pathname.startsWith('/orders/buying');
  const isWallet = pathname.startsWith('/wallet');
  const isAccount = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');

  return (
    <nav
      aria-label="Thanh điều hướng di động"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] select-none"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Tab 1: Chợ đồ cũ */}
        <Link
          to="/marketplace"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ease-spring active:scale-90 ${
            isMarketplace ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative px-3 py-0.5 rounded-full flex items-center justify-center">
            {isMarketplace && (
              <span className="absolute inset-0 bg-emerald-100/70 rounded-full animate-liquid-pill" />
            )}
            <ShoppingBag
              size={20}
              className={`relative z-10 transition-transform duration-300 ease-spring ${
                isMarketplace ? 'stroke-[2.5] scale-110 -translate-y-0.5 animate-liquid-squash text-emerald-700' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Chợ Đồ</span>
          {isMarketplace ? (
            <span className="w-1 h-1 rounded-full bg-emerald-600 animate-liquid-dot mt-0.5" />
          ) : (
            <span className="w-1 h-1 mt-0.5" />
          )}
        </Link>

        {/* Tab 2: Đơn mua */}
        <Link
          to={isAuthenticated ? '/orders/buying' : '/login'}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ease-spring active:scale-90 ${
            isBuying ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative px-3 py-0.5 rounded-full flex items-center justify-center">
            {isBuying && (
              <span className="absolute inset-0 bg-emerald-100/70 rounded-full animate-liquid-pill" />
            )}
            <Inbox
              size={20}
              className={`relative z-10 transition-transform duration-300 ease-spring ${
                isBuying ? 'stroke-[2.5] scale-110 -translate-y-0.5 animate-liquid-squash text-emerald-700' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Đơn Mua</span>
          {isBuying ? (
            <span className="w-1 h-1 rounded-full bg-emerald-600 animate-liquid-dot mt-0.5" />
          ) : (
            <span className="w-1 h-1 mt-0.5" />
          )}
        </Link>

        {/* Tab 3: Center Elevated CTA - Đăng bán (Liquid Jelly Spring) */}
        <Link
          to={isAuthenticated ? '/marketplace/new' : '/login'}
          className="flex flex-col items-center justify-center flex-1 -mt-5 group active:scale-80 transition-transform duration-300 ease-spring"
          aria-label="Đăng bán đồ cũ"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center ring-4 ring-white animate-liquid-pulse group-hover:bg-emerald-700 transition">
            <Plus size={22} className="stroke-[2.5] transition-transform duration-300 group-hover:rotate-90 ease-spring" />
          </div>
          <span className="text-[10px] font-bold text-slate-800 mt-0.5 tracking-tight">Đăng Bán</span>
        </Link>

        {/* Tab 4: Ví tiền */}
        <Link
          to={isAuthenticated ? '/wallet' : '/login'}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ease-spring active:scale-90 ${
            isWallet ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative px-3 py-0.5 rounded-full flex items-center justify-center">
            {isWallet && (
              <span className="absolute inset-0 bg-emerald-100/70 rounded-full animate-liquid-pill" />
            )}
            <Wallet
              size={20}
              className={`relative z-10 transition-transform duration-300 ease-spring ${
                isWallet ? 'stroke-[2.5] scale-110 -translate-y-0.5 animate-liquid-squash text-emerald-700' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Ví Tiền</span>
          {isWallet ? (
            <span className="w-1 h-1 rounded-full bg-emerald-600 animate-liquid-dot mt-0.5" />
          ) : (
            <span className="w-1 h-1 mt-0.5" />
          )}
        </Link>

        {/* Tab 5: Tài khoản / Dashboard */}
        <Link
          to={isAuthenticated ? '/dashboard' : '/login'}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-300 ease-spring active:scale-90 ${
            isAccount ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative px-3 py-0.5 rounded-full flex items-center justify-center">
            {isAccount && (
              <span className="absolute inset-0 bg-emerald-100/70 rounded-full animate-liquid-pill" />
            )}
            <User
              size={20}
              className={`relative z-10 transition-transform duration-300 ease-spring ${
                isAccount ? 'stroke-[2.5] scale-110 -translate-y-0.5 animate-liquid-squash text-emerald-700' : 'stroke-[1.8]'
              }`}
            />
            {pendingSellingCount > 0 && (
              <span className="absolute -top-1 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                {pendingSellingCount > 9 ? '9+' : pendingSellingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Cá Nhân</span>
          {isAccount ? (
            <span className="w-1 h-1 rounded-full bg-emerald-600 animate-liquid-dot mt-0.5" />
          ) : (
            <span className="w-1 h-1 mt-0.5" />
          )}
        </Link>
      </div>
    </nav>
  );
};
