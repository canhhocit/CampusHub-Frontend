import { Link, useLocation } from 'react-router-dom';
import { Package, Inbox, Send, Plus, Wallet, User } from 'lucide-react';
import { usePendingSellingOrdersCount } from '../hooks/usePendingSellingOrders';

export const UserNavTabs = () => {
  const location = useLocation();
  const { data: pendingData } = usePendingSellingOrdersCount();
  const pendingSellingCount = pendingData?.pendingCount || 0;

  const tabs = [
    { to: '/wallet', label: 'Ví của tôi', icon: Wallet },
    { to: '/orders/buying', label: 'Đơn mua', icon: Inbox },
    { to: '/orders/selling', label: 'Đơn bán', icon: Send, badge: pendingSellingCount },
    { to: '/marketplace/my-listings', label: 'Tin đăng', icon: Package },
    { to: '/profile', label: 'Hồ sơ & Bảo mật', icon: User },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200/90 pb-3">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span
                  className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none tabular-nums ${
                    isActive ? 'bg-emerald-500 text-slate-950' : 'bg-rose-600 text-white'
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
        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
      >
        <Plus size={15} />
        <span>Đăng tin mới</span>
      </Link>
    </div>
  );
};
