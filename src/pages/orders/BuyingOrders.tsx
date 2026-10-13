import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Order, OrderStatus } from '../../types/order';
import type { PageResponse } from '../../types/marketplace';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Inbox,
  Package,
  MapPin,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ImageOff,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { UserNavTabs } from '../../components/UserNavTabs';

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  PENDING_SELLER: {
    label: 'Chờ người bán xác nhận',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Clock,
  },
  AWAITING_DEPOSIT: {
    label: 'Chờ gửi vào tủ đồ',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: Package,
  },
  READY_FOR_PICKUP: {
    label: 'Sẵn sàng nhận hàng',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-300 font-bold',
    icon: Lock,
  },
  COMPLETED: {
    label: 'Đã hoàn tất',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Đã hủy',
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-200',
    icon: XCircle,
  },
  REJECTED: {
    label: 'Người bán từ chối',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
  },
  EXPIRED: {
    label: 'Quá hạn nhận hàng',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    icon: AlertTriangle,
  },
};

export const BuyingOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0', 10);
  const [filterGroup, setFilterGroup] = useState<'ALL' | 'ACTIVE' | 'READY' | 'DONE'>('ALL');
  const queryClient = useQueryClient();

  const { data: pageData, isLoading, isError, refetch } = useQuery<PageResponse<Order>>({
    queryKey: ['buying-orders', page],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/orders/buying', { params: { page, size: 10 } })
        .then((res) => res.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.post(`/api/v1/orders/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
    },
  });

  const handleCancelOrder = (orderId: number, productTitle: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn hủy đơn đặt mua "${productTitle}"?`)) {
      cancelMutation.mutate(orderId);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!pageData?.content) return [];
    if (filterGroup === 'ALL') return pageData.content;
    if (filterGroup === 'ACTIVE') {
      return pageData.content.filter((o) => o.status === 'PENDING_SELLER' || o.status === 'AWAITING_DEPOSIT');
    }
    if (filterGroup === 'READY') {
      return pageData.content.filter((o) => o.status === 'READY_FOR_PICKUP');
    }
    if (filterGroup === 'DONE') {
      return pageData.content.filter(
        (o) => o.status === 'COMPLETED' || o.status === 'CANCELLED' || o.status === 'REJECTED' || o.status === 'EXPIRED'
      );
    }
    return pageData.content;
  }, [pageData?.content, filterGroup]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Unified Hub Navigation Tabs */}
        <UserNavTabs />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Đơn mua của tôi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Theo dõi tiến độ người bán bàn giao hàng vào tủ và lấy mã PIN mở tủ Smart Locker
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-bold overflow-x-auto">
            <button
              onClick={() => setFilterGroup('ALL')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                filterGroup === 'ALL'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({pageData?.content?.length || 0})
            </button>
            <button
              onClick={() => setFilterGroup('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                filterGroup === 'ACTIVE'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang chờ gửi
            </button>
            <button
              onClick={() => setFilterGroup('READY')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                filterGroup === 'READY'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sẵn sàng lấy
            </button>
            <button
              onClick={() => setFilterGroup('DONE')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                filterGroup === 'DONE'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lịch sử / Đã đóng
            </button>
          </div>
        </div>

        {/* Main Orders Content */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent" />
            <p className="mt-3 text-xs text-slate-500">Đang tải danh sách đơn mua...</p>
          </div>
        ) : isError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
            <AlertTriangle size={24} className="mx-auto text-rose-600" />
            <p className="text-xs sm:text-sm text-rose-700 font-semibold">
              Không thể tải danh sách đơn mua lúc này.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
            >
              Thử lại
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
              <Inbox size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {filterGroup === 'ALL'
                  ? 'Bạn chưa có đơn đặt mua nào'
                  : 'Không có đơn hàng nào ở nhóm này'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Khám phá Chợ đồ cũ sinh viên để tìm kiếm sách giáo trình, phụ kiện và đồ dùng học tập giá hời!
              </p>
            </div>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <ShoppingBag size={15} /> Khám phá Chợ ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const cfg = statusConfig[order.status] || {
                label: order.status,
                bg: 'bg-slate-50',
                text: 'text-slate-700',
                border: 'border-slate-200',
                icon: Clock,
              };
              const StatusIcon = cfg.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      <StatusIcon size={13} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Order Details Body */}
                  <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Product Summary (5 cols) */}
                    <div className="md:col-span-5 flex items-center gap-3.5">
                      {order.productImageUrl ? (
                        <img
                          src={order.productImageUrl}
                          alt={order.productTitle}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <ImageOff size={20} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          to={`/marketplace/${order.productId}`}
                          className="font-bold text-slate-900 hover:text-purple-600 transition text-sm line-clamp-1 block"
                        >
                          {order.productTitle}
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Người bán: <span className="font-semibold text-slate-700">{order.sellerFullName}</span> (@{order.sellerUsername})
                        </p>
                        <p className="text-sm font-extrabold text-purple-700 mt-1">
                          {formatPrice(order.priceSnapshot)}
                        </p>
                      </div>
                    </div>

                    {/* Smart Locker Location & Compartment (4 cols) */}
                    <div className="md:col-span-4 text-xs space-y-1">
                      {order.lockerName ? (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <MapPin size={12} className="text-purple-600" />
                            {order.lockerName}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {order.lockerLocation}
                          </div>
                          {order.compartmentCode && (
                            <div className="mt-1 font-bold text-purple-700 flex items-center gap-1">
                              <Lock size={11} />
                              Ngăn tủ: {order.compartmentCode}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[11px]">
                          Chờ người bán xác nhận để cấp ngăn tủ locker
                        </div>
                      )}
                    </div>

                    {/* Actions (3 cols) */}
                    <div className="md:col-span-3 flex flex-wrap md:justify-end gap-2 items-center">
                      {order.status === 'READY_FOR_PICKUP' && (
                        <Link
                          to={`/orders/${order.id}`}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <Lock size={13} /> Lấy đồ ngay
                        </Link>
                      )}

                      {order.status === 'PENDING_SELLER' && (
                        <button
                          onClick={() => handleCancelOrder(order.id, order.productTitle)}
                          disabled={cancelMutation.isPending}
                          className="px-3 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                        >
                          Hủy đơn
                        </button>
                      )}

                      <Link
                        to={`/orders/${order.id}`}
                        className="px-3 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                      >
                        Chi tiết <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {pageData && pageData.totalPages > 1 && (
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
                <button
                  disabled={page <= 0}
                  onClick={() => setSearchParams({ page: (page - 1).toString() })}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Trang trước
                </button>
                <span className="text-slate-600 font-medium">
                  Trang {page + 1} / {pageData.totalPages}
                </span>
                <button
                  disabled={page >= pageData.totalPages - 1}
                  onClick={() => setSearchParams({ page: (page + 1).toString() })}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
