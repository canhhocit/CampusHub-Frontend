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
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 pt-1.5 select-none"
      style={{ paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-end justify-around max-w-md mx-auto">
        <Link
          to="/marketplace"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isMarketplace ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag size={20} strokeWidth={isMarketplace ? 2.25 : 1.75} />
          <span className="text-[10px] mt-1">Khám phá</span>
        </Link>

        <Link
          to={isAuthenticated ? '/orders/buying' : '/login'}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isBuying ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Inbox size={20} strokeWidth={isBuying ? 2.25 : 1.75} />
          <span className="text-[10px] mt-1">Đơn mua</span>
        </Link>

        <Link
          to={isAuthenticated ? '/marketplace/new' : '/login'}
          className="flex flex-col items-center justify-center flex-1 -mt-4 group"
          aria-label="Đăng bán đồ cũ"
        >
          <div className="w-11 h-11 rounded-full bg-slate-900 group-hover:bg-emerald-600 text-white shadow-md shadow-slate-900/20 flex items-center justify-center ring-4 ring-white transition-colors active:scale-95">
            <Plus size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-semibold text-slate-800 mt-1">Đăng bán</span>
        </Link>

        <Link
          to={isAuthenticated ? '/wallet' : '/login'}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isWallet ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wallet size={20} strokeWidth={isWallet ? 2.25 : 1.75} />
          <span className="text-[10px] mt-1">Ví tiền</span>
        </Link>

        <Link
          to={isAuthenticated ? '/dashboard' : '/login'}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isAccount ? 'text-emerald-700 font-semibold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <User size={20} strokeWidth={isAccount ? 2.25 : 1.75} />
            {pendingSellingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white tabular-nums">
                {pendingSellingCount > 9 ? '9+' : pendingSellingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1">Tài khoản</span>
        </Link>
      </div>
    </nav>
  );
};
