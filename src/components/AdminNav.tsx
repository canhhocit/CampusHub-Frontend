import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Lock, FileText, ArrowLeft, CreditCard, ShieldAlert } from 'lucide-react';

export const AdminNav = () => {
  const location = useLocation();

  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      active: location.pathname === '/admin/dashboard',
    },
    {
      to: '/admin/payouts',
      label: 'Rút tiền',
      icon: CreditCard,
      active: location.pathname.startsWith('/admin/payouts'),
    },
    {
      to: '/admin/disputes',
      label: 'Khiếu nại',
      icon: ShieldAlert,
      active: location.pathname.startsWith('/admin/disputes'),
    },
    {
      to: '/admin/users',
      label: 'Người dùng',
      icon: Users,
      active: location.pathname.startsWith('/admin/users'),
    },
    {
      to: '/admin/lockers',
      label: 'Tủ Locker',
      icon: Lock,
      active: location.pathname.startsWith('/admin/lockers'),
    },
    {
      to: '/admin/audit',
      label: 'Nhật ký Audit',
      icon: FileText,
      active: location.pathname.startsWith('/admin/audit'),
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition"
            >
              <ArrowLeft size={16} className="mr-1.5" />
              Về trang chủ
            </Link>
            <div className="h-5 w-px bg-gray-300" />
            <span className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-md">
                ADMIN
              </span>
              CampusHub Portal
            </span>
          </div>

          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                    item.active
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon size={16} className="mr-1.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};
