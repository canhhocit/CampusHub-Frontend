import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axios';
import type { NotificationResponse } from '../types/notification';
import type { PageResponse } from '../types/marketplace';
import {
  Bell,
  CheckCheck,
  Package,
  Wallet,
  ShieldAlert,
  Info,
  Clock,
} from 'lucide-react';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch unread count (poll every 20 seconds)
  const { data: countData } = useQuery<{ unreadCount: number }>({
    queryKey: ['notifications-unread-count'],
    queryFn: () => axiosInstance.get('/api/v1/notifications/unread-count').then((res) => res.data),
    refetchInterval: 20000,
  });

  const unreadCount = countData?.unreadCount || 0;

  // Fetch latest notifications when opened
  const { data: notifData, isLoading } = useQuery<PageResponse<NotificationResponse>>({
    queryKey: ['notifications-list'],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/notifications', { params: { page: 0, size: 8 } })
        .then((res) => res.data),
    enabled: isOpen,
  });

  // Mark single read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.patch(`/api/v1/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    },
  });

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => axiosInstance.patch('/api/v1/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] });
    },
  });

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (item: NotificationResponse) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }
    setIsOpen(false);

    // Navigate to target
    if (item.targetType === 'ORDER' && item.targetId) {
      navigate(`/orders/${item.targetId}`);
    } else if (item.targetType === 'WALLET') {
      navigate('/wallet');
    } else if (item.targetType === 'IDENTITY') {
      navigate('/verify-identity');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_CREATED':
      case 'ORDER_DEPOSITED':
      case 'ORDER_PICKED_UP':
      case 'ORDER_COMPLETED':
        return <Package size={15} className="text-emerald-600" />;
      case 'PAYOUT_APPROVED':
      case 'PAYOUT_REJECTED':
      case 'WALLET_CREDITED':
        return <Wallet size={15} className="text-blue-600" />;
      case 'DISPUTE_OPENED':
      case 'DISPUTE_RESOLVED':
        return <ShieldAlert size={15} className="text-rose-600" />;
      default:
        return <Info size={15} className="text-slate-600" />;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      return past.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  const notifications = notifData?.content || [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
        title="Thông báo"
        aria-label="Thông báo"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <span>Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 transition"
              >
                <CheckCheck size={14} />
                Đã đọc tất cả
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center space-y-1">
                <Bell size={24} className="mx-auto text-slate-300" />
                <p className="text-xs text-slate-500 font-medium">Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex gap-3 cursor-pointer transition ${
                    item.isRead ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        className={`text-xs ${
                          item.isRead ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'
                        } line-clamp-1`}
                      >
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{item.message}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <Clock size={11} />
                      <span>{formatRelativeTime(item.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
