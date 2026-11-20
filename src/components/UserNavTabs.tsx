import { Link, useLocation } from 'react-router-dom';
import { Package, Inbox, Send, Plus, Wallet, User } from 'lucide-react';
import { usePendingSellingOrdersCount } from '../hooks/usePendingSellingOrders';

export const UserNavTabs = () => {
  const location = useLocation();
  const { data: pendingData } = usePendingSellingOrdersCount();
  const pendingSellingCount = pendingData?.pendingCount || 0;

  const tabs = [
    {
      to: '/wallet',
      label: 'Ví của tôi',
      icon: Wallet,
    },
    {
      to: '/orders/buying',
      label: 'Đơn mua',
      icon: Inbox,
    },
    {
      to: '/orders/selling',
      label: 'Đơn bán',
      icon: Send,
      badge: pendingSellingCount,
    },
    {
      to: '/marketplace/my-listings',
      label: 'Tin đăng bán',
      icon: Package,
    },
    {
      to: '/profile',
      label: 'Hồ sơ & Bảo mật',
      icon: User,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/90">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span
                  className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-black leading-none shadow-xs ${
                    isActive
                      ? 'bg-emerald-500 text-slate-900'
                      : 'bg-rose-500 text-white'
                  }`}
                  title={`${tab.badge} đơn bán chờ xác nhận`}
                >
                  {tab.badge! > 99 ? '99+' : tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <Link
        to="/marketplace/new"
        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs active:scale-95"
      >
        <Plus size={15} />
        Đăng tin bán mới
      </Link>
    </div>
  );
};
