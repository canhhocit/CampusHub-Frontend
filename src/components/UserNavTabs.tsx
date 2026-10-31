import { Link, useLocation } from 'react-router-dom';
import { Package, Inbox, Send, Plus, Wallet } from 'lucide-react';
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
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span
                  className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none shadow-xs ${
                    isActive
                      ? 'bg-white text-emerald-800'
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
        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 transition shadow-2xs"
      >
        <Plus size={15} />
        Đăng tin bán mới
      </Link>
    </div>
  );
};
