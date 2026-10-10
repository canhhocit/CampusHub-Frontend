import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Order, OrderStatus } from '../../types/order';
import type { PageResponse } from '../../types/marketplace';
import type { Locker } from '../../types/locker';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';

const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  PENDING_SELLER: { label: 'Chờ bạn xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-300 font-medium' },
  AWAITING_DEPOSIT: { label: 'Cần gửi hàng vào tủ', color: 'bg-blue-100 text-blue-800 border-blue-300 font-semibold animate-pulse' },
  READY_FOR_PICKUP: { label: 'Đang chờ người mua lấy', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  COMPLETED: { label: 'Giao dịch thành công', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  CANCELLED: { label: 'Người mua đã hủy', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  REJECTED: { label: 'Bạn đã từ chối', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export const SellingOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0', 10);
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
      queryClient.invalidateQueries({ queryKey: ['selling-orders'] });
      setDepositModalOrder(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Thao tác gửi hàng thất bại');
    },
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Đơn bán của tôi</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Đơn bán của tôi</h1>
          <p className="text-sm text-gray-600 mt-1">Xác nhận đơn và thực hiện gửi hàng vào tủ locker để người mua lấy</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/orders/buying"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            Chuyển sang đơn mua
          </Link>
          <Link
            to="/marketplace/my-listings"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            Quản lý tin đăng
          </Link>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-3 text-gray-500">Đang tải danh sách đơn bán...</p>
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-700 font-medium mb-3">Không thể tải dữ liệu đơn bán.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      ) : pageData?.content.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold">
            🏷️
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Chưa có người mua đặt đơn</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Khi có sinh viên đặt mua sản phẩm bạn đăng bán, đơn hàng sẽ hiển thị tại đây để bạn xác nhận.
          </p>
          <Link
            to="/marketplace/new"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            Đăng thêm sản phẩm mới
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pageData?.content.map((order) => {
            const statusConfig = statusLabels[order.status] || {
              label: order.status,
              color: 'bg-gray-100 text-gray-800 border-gray-200',
            };

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>

                <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Product Details */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    {order.productImageUrl ? (
                      <img
                        src={order.productImageUrl}
                        alt={order.productTitle}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 text-xl shrink-0">
                        📦
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/marketplace/${order.productId}`}
                        className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
                      >
                        {order.productTitle}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Người mua: <span className="text-gray-700 font-medium">{order.buyerFullName}</span> (@{order.buyerUsername})
                      </p>
                      <p className="text-base font-bold text-emerald-600 mt-1">
                        {formatPrice(order.priceSnapshot)}
                      </p>
                    </div>
                  </div>

                  {/* Locker Information */}
                  <div className="md:col-span-3 text-sm">
                    {order.lockerName ? (
                      <div>
                        <div className="font-medium text-gray-800 flex items-center gap-1.5">
                          <span>📍</span> {order.lockerName}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{order.lockerLocation}</div>
                        {order.compartmentCode && (
                          <div className="text-xs font-semibold text-blue-700 mt-1">
                            Ngăn tủ: {order.compartmentCode}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Chưa phân bổ tủ</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-4 flex flex-wrap md:justify-end gap-2 items-center">
                    {order.status === 'PENDING_SELLER' && (
                      <>
                        <button
                          onClick={() => setAcceptModalOrder(order)}
                          className="px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 shadow-sm"
                        >
                          ✓ Chấp nhận đơn
                        </button>
                        <button
                          onClick={() => setRejectModalOrder(order)}
                          className="px-3 py-2 border border-rose-300 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-50"
                        >
                          ✕ Từ chối
                        </button>
                      </>
                    )}

                    {order.status === 'AWAITING_DEPOSIT' && (
                      <button
                        onClick={() => setDepositModalOrder(order)}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center gap-1.5"
                      >
                        <span>📦</span> Gửi hàng vào tủ
                      </button>
                    )}

                    <Link
                      to={`/orders/${order.id}`}
                      className="px-3 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {pageData && pageData.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                disabled={page <= 0}
                onClick={() => setSearchParams({ page: (page - 1).toString() })}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Trang trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {page + 1} / {pageData.totalPages}
              </span>
              <button
                disabled={page >= pageData.totalPages - 1}
                onClick={() => setSearchParams({ page: (page + 1).toString() })}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal: Accept Order */}
      {acceptModalOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Chấp nhận đơn hàng</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn đang chấp nhận đơn cho sản phẩm: <span className="font-semibold text-gray-800">{acceptModalOrder.productTitle}</span>.
              Hệ thống sẽ giữ ngăn tủ sẵn sàng để bạn đến gửi hàng.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chọn tủ đồ gửi hàng (Tùy chọn)
              </label>
              <select
                value={selectedLockerId}
                onChange={(e) => setSelectedLockerId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Tự động phân bổ tủ trống gần nhất --</option>
                {activeLockers?.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.code}) - {l.location}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Nếu để trống, hệ thống sẽ tự động tìm ngăn trống trong các tủ đang hoạt động.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setAcceptModalOrder(null);
                  setSelectedLockerId('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
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
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {acceptMutation.isPending ? 'Đang xử lý...' : 'Xác nhận chấp nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Order */}
      {rejectModalOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Từ chối đơn hàng</h3>
            <p className="text-sm text-gray-600 mb-4">
              Vui lòng cho người mua biết lý do bạn không thể giao dịch món đồ này.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do từ chối
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Đồ đã bị hỏng, tôi bận không thể gửi tủ đồ hôm nay..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModalOrder(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
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
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Đang từ chối...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mock Locker Deposit Simulator */}
      {depositModalOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mô phỏng Gửi hàng Locker IoT</h3>
                <p className="text-xs text-gray-500">Mô phỏng quy trình đặt đồ vật lý vào ngăn tủ</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-2 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tủ đồ:</span>
                <span className="font-semibold text-gray-800">{depositModalOrder.lockerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vị trí:</span>
                <span className="font-medium text-gray-700">{depositModalOrder.lockerLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ngăn tủ phân bổ:</span>
                <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  {depositModalOrder.compartmentCode}
                </span>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-xs text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>⚠️</span> Các bước mô phỏng phần cứng:
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-amber-900">
                <li>Lệnh mở chốt điện tử ngăn {depositModalOrder.compartmentCode}</li>
                <li>Người bán đặt sản phẩm vào bên trong</li>
                <li>Cảm biến xác nhận có hàng và khóa chốt</li>
                <li>Hệ sinh mã 6 số gửi thông báo tới người mua</li>
              </ol>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDepositModalOrder(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                disabled={depositMutation.isPending}
                onClick={() => depositMutation.mutate(depositModalOrder.id)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {depositMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Đang gửi hàng...</span>
                  </>
                ) : (
                  <>
                    <span>🚪</span> Xác nhận đã gửi đồ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
