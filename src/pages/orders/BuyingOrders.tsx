import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Order, OrderStatus } from '../../types/order';
import type { PageResponse } from '../../types/marketplace';
import { Link, useSearchParams } from 'react-router-dom';
import { useState } from 'react';

const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  PENDING_SELLER: { label: 'Chờ người bán xác nhận', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  AWAITING_DEPOSIT: { label: 'Chờ gửi vào tủ đồ', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  READY_FOR_PICKUP: { label: 'Sẵn sàng nhận hàng', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold animate-pulse' },
  COMPLETED: { label: 'Đã hoàn tất', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
  REJECTED: { label: 'Người bán từ chối', color: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export const BuyingOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0', 10);
  const queryClient = useQueryClient();
  const [cancelModalOrderId, setCancelModalOrderId] = useState<number | null>(null);

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
      setCancelModalOrderId(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
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
            <span className="text-gray-900 font-medium">Đơn mua của tôi</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Đơn mua của tôi</h1>
          <p className="text-sm text-gray-600 mt-1">Theo dõi tiến trình và mã nhận đồ tại tủ thông minh</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/orders/selling"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            Chuyển sang đơn bán
          </Link>
          <Link
            to="/marketplace"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            Khám phá chợ đồ
          </Link>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="p-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-3 text-gray-500">Đang tải danh sách đơn mua...</p>
        </div>
      ) : isError ? (
        <div className="p-8 text-center bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-700 font-medium mb-3">Không thể tải dữ liệu đơn mua.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      ) : pageData?.content.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
            🛍️
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Chưa có đơn hàng nào</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Bạn chưa đặt mua món đồ nào từ sinh viên khác trên CampusHub.
          </p>
          <Link
            to="/marketplace"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            Xem danh sách sản phẩm
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
                  <div className="md:col-span-6 flex items-center gap-4">
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
                        Người bán: <span className="text-gray-700 font-medium">{order.sellerFullName}</span> (@{order.sellerUsername})
                      </p>
                      <p className="text-base font-bold text-blue-600 mt-1">
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
                      <span className="text-xs text-gray-400 italic">Chờ người bán chọn tủ gửi</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="md:col-span-3 flex flex-wrap md:justify-end gap-2 items-center">
                    {order.status === 'READY_FOR_PICKUP' && (
                      <Link
                        to={`/orders/${order.id}`}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 shadow-sm"
                      >
                        ⚡ Nhận hàng ngay
                      </Link>
                    )}

                    {order.status === 'PENDING_SELLER' && (
                      <button
                        onClick={() => setCancelModalOrderId(order.id)}
                        className="px-3 py-2 border border-rose-300 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-50"
                      >
                        Hủy đơn
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

      {/* Confirmation Modal for Cancel */}
      {cancelModalOrderId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận hủy đơn hàng</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn hủy đơn hàng này không? Listing sẽ được mở lại cho người mua khác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelModalOrderId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Đóng
              </button>
              <button
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(cancelModalOrderId)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Đang hủy...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
