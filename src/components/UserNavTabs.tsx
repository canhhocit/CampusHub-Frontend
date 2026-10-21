import { Link, useLocation } from 'react-router-dom';
import { Package, Inbox, Send, Plus } from 'lucide-react';

export const UserNavTabs = () => {
  const location = useLocation();

  const tabs = [
    {
      to: '/marketplace/my-listings',
      label: 'Tin đăng của tôi',
      icon: Package,
    },
    {
      to: '/orders/buying',
      label: 'Đơn mua của tôi',
      icon: Inbox,
    },
    {
      to: '/orders/selling',
      label: 'Đơn bán của tôi',
      icon: Send,
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
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? 'bg-[#eb6e34] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Link
        to="/marketplace/new"
        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition shadow-xs"
      >
        <Plus size={16} />
        Đăng tin bán mới
      </Link>
    </div>
  );
};
