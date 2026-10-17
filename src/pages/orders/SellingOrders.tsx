import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Order, OrderStatus } from '../../types/order';
import type { PageResponse } from '../../types/marketplace';
import type { Locker } from '../../types/locker';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Send,
  Package,
  MapPin,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ImageOff,
  ArrowRight,
  Plus,
  X,
  Radio,
} from 'lucide-react';
import { UserNavTabs } from '../../components/UserNavTabs';

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  PENDING_SELLER: {
    label: 'Chờ bạn xác nhận',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200 font-bold',
    icon: Clock,
  },
  AWAITING_DEPOSIT: {
    label: 'Cần gửi hàng vào tủ',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200 font-bold',
    icon: Package,
  },
  READY_FOR_PICKUP: {
    label: 'Đang chờ người mua lấy',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: Lock,
  },
  COMPLETED: {
    label: 'Giao dịch thành công',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Người mua đã hủy',
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-200',
    icon: XCircle,
  },
  REJECTED: {
    label: 'Bạn đã từ chối',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle,
  },
  EXPIRED: {
    label: 'Quá hạn nhận (Chờ xử lý)',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    icon: AlertTriangle,
  },
  RENTING: {
    label: 'Khách đang thuê đồ',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200 font-bold',
    icon: Clock,
  },
  AWAITING_RETURN_DEPOSIT: {
    label: 'Khách đang gửi trả đồ',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    icon: Package,
  },
  READY_FOR_RETURN_PICKUP: {
    label: 'Cần ra tủ lấy lại đồ',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-300 font-bold',
    icon: Lock,
  },
};

export const SellingOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0', 10);
  const [filterGroup, setFilterGroup] = useState<'ALL' | 'PENDING' | 'DEPOSIT' | 'DONE'>('ALL');
  const queryClient = useQueryClient();

  // Modals state
  const [acceptModalOrder, setAcceptModalOrder] = useState<Order | null>(null);
  const [selectedLockerId, setSelectedLockerId] = useState<number | ''>('');
  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [depositModalOrder, setDepositModalOrder] = useState<Order | null>(null);

  // Fetch selling orders
  const { data: pageData, isLoading, isError, refetch } = useQuery<PageResponse<Order>>({
    queryKey: ['selling-orders', page],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/orders/selling', { params: { page, size: 10 } })
        .then((res) => res.data),
  });

  // Fetch active lockers for selection
  const { data: activeLockers } = useQuery<Locker[]>({
    queryKey: ['active-lockers-dropdown'],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/lockers', { params: { status: 'ACTIVE', size: 50 } })
        .then((res) => res.data.content || []),
    enabled: !!acceptModalOrder,
  });

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: ({ id, lockerId }: { id: number; lockerId?: number | null }) =>
      axiosInstance.post(`/api/v1/orders/${id}/accept`, { lockerId: lockerId || null }),
    onSuccess: () => {
      for (const key of ['product', 'products', 'my-products', 'lockers', 'locker', 'active-lockers-dropdown', 'order-detail', 'buying-orders', 'selling-orders', 'admin-dashboard-stats']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      queryClient.invalidateQueries({ queryKey: ['selling-orders'] });
      setAcceptModalOrder(null);
      setSelectedLockerId('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Không thể chấp nhận đơn');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      axiosInstance.post(`/api/v1/orders/${id}/reject`, { reason }),
    onSuccess: () => {
      for (const key of ['product', 'products', 'my-products', 'lockers', 'locker', 'active-lockers-dropdown', 'order-detail', 'buying-orders', 'selling-orders', 'admin-dashboard-stats']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      queryClient.invalidateQueries({ queryKey: ['selling-orders'] });
      setRejectModalOrder(null);
      setRejectReason('');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Không thể từ chối đơn');
    },
  });

  const depositMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.post(`/api/v1/orders/${id}/deposit`),
    onSuccess: () => {
      for (const key of ['product', 'products', 'my-products', 'lockers', 'locker', 'active-lockers-dropdown', 'order-detail', 'buying-orders', 'selling-orders', 'admin-dashboard-stats']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      queryClient.invalidateQueries({ queryKey: ['selling-orders'] });
      setDepositModalOrder(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Thao tác gửi hàng thất bại');
    },
  });

  const filteredOrders = useMemo(() => {
    if (!pageData?.content) return [];
    if (filterGroup === 'ALL') return pageData.content;
    if (filterGroup === 'PENDING') {
      return pageData.content.filter((o) => o.status === 'PENDING_SELLER');
    }
    if (filterGroup === 'DEPOSIT') {
      return pageData.content.filter((o) => o.status === 'AWAITING_DEPOSIT');
    }
    if (filterGroup === 'DONE') {
      return pageData.content.filter(
        (o) =>
          o.status === 'READY_FOR_PICKUP' ||
          o.status === 'COMPLETED' ||
          o.status === 'CANCELLED' ||
          o.status === 'REJECTED' ||
          o.status === 'EXPIRED'
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
              Đơn bán của tôi
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Xác nhận đơn đặt mua từ sinh viên khác và gửi sản phẩm vào tủ Smart Locker
            </p>
          </div>

          {/* Filter Tabs */}
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
              onClick={() => setFilterGroup('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                filterGroup === 'PENDING'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cần xác nhận
            </button>
            <button
              onClick={() => setFilterGroup('DEPOSIT')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                filterGroup === 'DEPOSIT'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cần gửi tủ đồ
            </button>
            <button
              onClick={() => setFilterGroup('DONE')}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                filterGroup === 'DONE'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang chờ lấy / Đã xong
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent" />
            <p className="mt-3 text-xs text-slate-500">Đang tải danh sách đơn bán...</p>
          </div>
        ) : isError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
            <AlertTriangle size={24} className="mx-auto text-rose-600" />
            <p className="text-xs sm:text-sm text-rose-700 font-semibold">
              Không thể tải danh sách đơn bán lúc này.
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
              <Send size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Chưa có đơn bán nào trong danh mục này
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Khi có sinh viên đặt mua các sản phẩm bạn đang đăng bán, đơn hàng sẽ hiển thị tại đây để bạn phân bổ ngăn tủ locker.
              </p>
            </div>
            <Link
              to="/marketplace/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus size={15} /> Đăng thêm sản phẩm mới
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

                  <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Product Details (5 cols) */}
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
                          Người mua: <span className="font-semibold text-slate-700">{order.buyerFullName}</span> (@{order.buyerUsername})
                        </p>
                        <p className="text-sm font-extrabold text-purple-700 mt-1">
                          {formatPrice(order.priceSnapshot)}
                        </p>
                      </div>
                    </div>

                    {/* Locker & Compartment (4 cols) */}
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
                              Ngăn tủ chỉ định: {order.compartmentCode}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-400 italic text-[11px]">
                          Chưa phân bổ tủ đồ
                        </div>
                      )}
                    </div>

                    {/* Action buttons (3 cols) */}
                    <div className="md:col-span-3 flex flex-wrap md:justify-end gap-2 items-center">
                      {order.status === 'PENDING_SELLER' && (
                        <>
                          <button
                            onClick={() => setAcceptModalOrder(order)}
                            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                          >
                            Chấp nhận đơn
                          </button>
                          <button
                            onClick={() => setRejectModalOrder(order)}
                            className="px-3 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl transition"
                          >
                            Từ chối
                          </button>
                        </>
                      )}

                      {order.status === 'AWAITING_DEPOSIT' && (
                        <button
                          onClick={() => setDepositModalOrder(order)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                        >
                          <Package size={13} /> Gửi hàng vào tủ
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

        {/* Modal: Accept Order */}
        {acceptModalOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Chấp nhận đơn hàng</h3>
                <button
                  onClick={() => setAcceptModalOrder(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-600 my-4 leading-relaxed">
                Bạn đang xác nhận đơn cho sản phẩm:{' '}
                <strong className="text-slate-900">{acceptModalOrder.productTitle}</strong>.
                Hệ thống sẽ giữ ngăn tủ sẵn sàng để bạn đến gửi hàng.
              </p>

              <div className="mb-6 space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Chọn tủ đồ gửi hàng (Tùy chọn)
                </label>
                <select
                  value={selectedLockerId}
                  onChange={(e) => setSelectedLockerId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">-- Tự động tìm ngăn trống tại tủ gần nhất --</option>
                  {activeLockers?.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.code}) - {l.location}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  Nếu để trống, hệ thống sẽ tự động chỉ định một ngăn tủ trống phù hợp nhất.
                </p>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setAcceptModalOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  disabled={acceptMutation.isPending}
                  onClick={() =>
                    acceptMutation.mutate({
                      id: acceptModalOrder.id,
                      lockerId: selectedLockerId ? Number(selectedLockerId) : null,
                    })
                  }
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition"
                >
                  {acceptMutation.isPending ? 'Đang cấp ngăn...' : 'Xác nhận cấp tủ đồ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reject Order */}
        {rejectModalOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900">Từ chối đơn hàng</h3>
                <button
                  onClick={() => setRejectModalOrder(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-600 my-4 leading-relaxed">
                Vui lòng cung cấp lý do bạn không thể bàn giao món đồ này cho người mua:
              </p>

              <div className="mb-6 space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Lý do từ chối</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Đồ đã bị hỏng, tôi bận việc đột xuất không đến trường hôm nay..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setRejectModalOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  disabled={rejectMutation.isPending}
                  onClick={() =>
                    rejectMutation.mutate({
                      id: rejectModalOrder.id,
                      reason: rejectReason,
                    })
                  }
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition"
                >
                  {rejectMutation.isPending ? 'Đang từ chối...' : 'Xác nhận từ chối'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Smart Locker Deposit Simulator */}
        {depositModalOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                  <Radio size={24} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Bàn giao Smart Locker IoT
                  </h3>
                  <p className="text-xs text-slate-500">Mô phỏng thao tác đặt đồ vào ngăn tủ vật lý</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 mb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tủ đồ:</span>
                  <span className="font-bold text-slate-900">{depositModalOrder.lockerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vị trí:</span>
                  <span className="font-medium text-slate-700">{depositModalOrder.lockerLocation}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Ngăn tủ được mở:</span>
                  <span className="font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg text-sm">
                    {depositModalOrder.compartmentCode}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl mb-6 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <AlertTriangle size={13} /> Quy trình phần cứng:
                </div>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-amber-800">
                  <li>Lệnh mở chốt điện tử ngăn {depositModalOrder.compartmentCode}</li>
                  <li>Người bán đặt sản phẩm vào bên trong ngăn tủ</li>
                  <li>Cảm biến xác nhận hàng và đóng chốt an toàn</li>
                  <li>Hệ thống mã hóa và cấp mã PIN 6 số cho người mua</li>
                </ol>
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  onClick={() => setDepositModalOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  disabled={depositMutation.isPending}
                  onClick={() => depositMutation.mutate(depositModalOrder.id)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {depositMutation.isPending ? (
                    'Đang xử lý...'
                  ) : (
                    <>
                      <Lock size={13} /> Xác nhận đã đặt đồ vào ngăn
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
