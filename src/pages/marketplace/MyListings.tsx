import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { PageResponse, Product, ProductStatus } from '../../types/marketplace';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Plus,
  Tag,
  ImageOff,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserNavTabs } from '../../components/UserNavTabs';

export const MyListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get('page') || 0);
  const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const [statusTab, setStatusTab] = useState<'ALL' | ProductStatus>('ALL');
  const queryClient = useQueryClient();

  const { data: pageData, isLoading, isError, refetch } = useQuery<PageResponse<Product>>({
    queryKey: ['my-products', page, statusTab],
    queryFn: () => axiosInstance.get('/api/v1/products/me', { params: { page, size: 15, status: statusTab === 'ALL' ? undefined : statusTab } }).then((res) => res.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, version }: { id: number; status: ProductStatus; version: number }) =>
      axiosInstance.patch(`/api/v1/products/${id}/status`, { status, version }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        alert('Sản phẩm đã được chỉnh sửa bởi phiên khác. Đang tự động tải lại dữ liệu mới nhất...');
        queryClient.invalidateQueries({ queryKey: ['my-products'] });
      } else {
        alert(err.response?.data?.message || 'Cập nhật trạng thái không thành công.');
      }
    },
  });

  const handleStatusChange = (p: Product, newStatus: ProductStatus) => {
    const actionLabel = newStatus === 'HIDDEN' ? 'tạm ẩn' : newStatus === 'ACTIVE' ? 'mở bán lại' : 'đánh dấu đã bán';
    if (window.confirm(`Bạn có chắc chắn muốn ${actionLabel} sản phẩm "${p.title}"?`)) {
      statusMutation.mutate({ id: p.id, status: newStatus, version: p.version });
    }
  };

  const filteredProducts = pageData?.content ?? [];
  const changeStatusTab = (status: 'ALL' | ProductStatus) => {
    setStatusTab(status);
    setSearchParams({ page: '0' });
  };

  const renderStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Đang bán
          </span>
        );
      case 'SOLD':
        return (
          <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            <Tag size={12} /> Đã bán
          </span>
        );
      case 'HIDDEN':
        return (
          <span className="px-2.5 py-1 inline-flex items-center gap-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
            <EyeOff size={12} /> Đang ẩn
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-lg bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
              Quản lý tin đăng bán
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Theo dõi tình trạng hiển thị, cập nhật giá bán và điều chỉnh thông tin món đồ của bạn
            </p>
          </div>

          {/* Status Filter Tabs (Oreka Style) */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-bold">
            <button
              onClick={() => changeStatusTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusTab === 'ALL'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({pageData?.totalElements || 0})
            </button>
            <button
              onClick={() => changeStatusTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusTab === 'ACTIVE'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang bán
            </button>
            <button
              onClick={() => changeStatusTab('HIDDEN')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusTab === 'HIDDEN'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang ẩn
            </button>
            <button
              onClick={() => changeStatusTab('SOLD')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusTab === 'SOLD'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã bán
            </button>
          </div>
        </div>

        {/* Table / Card List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent" />
            <p className="mt-3 text-xs text-slate-500">Đang tải danh sách tin đăng...</p>
          </div>
        ) : isError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
            <AlertCircle size={24} className="mx-auto text-rose-600" />
            <p className="text-xs sm:text-sm text-rose-700 font-semibold">
              Không thể tải danh sách tin đăng lúc này.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
            >
              Thử lại
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
              <Tag size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                {statusTab === 'ALL'
                  ? 'Bạn chưa đăng món đồ nào'
                  : `Không có sản phẩm nào ở trạng thái ${statusTab}`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Chia sẻ giáo trình, sách cũ, phụ kiện hoặc đồ dùng không dùng đến để nhận tiền thanh lý và dọn dẹp phòng KTX.
              </p>
            </div>
            <Link
              to="/marketplace/new"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Plus size={15} /> Đăng món đồ đầu tiên
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-xs border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Sản phẩm</th>
                    <th className="px-5 py-3.5 text-left">Giá niêm yết</th>
                    <th className="px-5 py-3.5 text-left">Trạng thái</th>
                    <th className="px-5 py-3.5 text-left">Ngày cập nhật</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-xs">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0"
                              src={p.imageUrl}
                              alt={p.title}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageOff size={16} />
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/marketplace/${p.id}`}
                              className="font-bold text-slate-900 hover:text-purple-600 transition block truncate max-w-xs"
                            >
                              {p.title}
                            </Link>
                            <span className="text-[11px] text-slate-500">
                              {p.category?.name || 'Khác'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-extrabold text-purple-700 text-sm">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {renderStatusBadge(p.status)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                        {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-1.5 font-bold">
                        <Link
                          to={`/marketplace/${p.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={12} /> Xem
                        </Link>

                        {p.status !== 'SOLD' && <Link
                          to={`/marketplace/edit/${p.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit3 size={12} /> Sửa
                        </Link>}

                        {p.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleStatusChange(p, 'HIDDEN')}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                            title="Tạm ẩn tin rao"
                          >
                            <EyeOff size={12} /> Ẩn tin
                          </button>
                        )}

                        {p.status === 'HIDDEN' && (
                          <button
                            onClick={() => handleStatusChange(p, 'ACTIVE')}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                            title="Mở bán lại"
                          >
                            <CheckCircle2 size={12} /> Mở lại
                          </button>
                        )}

                        {(p.status === 'ACTIVE' || p.status === 'HIDDEN') && (
                          <button
                            onClick={() => handleStatusChange(p, 'SOLD')}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            title="Đã bán qua kênh khác"
                          >
                            Đã bán
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
    </div>
  );
};
