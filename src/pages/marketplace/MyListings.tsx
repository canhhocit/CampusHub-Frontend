import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { PageResponse, Product, ProductStatus } from '../../types/marketplace';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Tag,
  ImageOff,
  Edit3,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserNavTabs } from '../../components/UserNavTabs';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';

export const MyListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get('page') || 0);
  const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const [statusTab, setStatusTab] = useState<'ALL' | ProductStatus>('ALL');
  const queryClient = useQueryClient();

  // Status Change Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    product: Product | null;
    targetStatus: ProductStatus | null;
    title: string;
    message: string;
    variant: 'primary' | 'warning' | 'danger';
  }>({
    isOpen: false,
    product: null,
    targetStatus: null,
    title: '',
    message: '',
    variant: 'primary',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: pageData, isLoading, isError, refetch } = useQuery<PageResponse<Product>>({
    queryKey: ['my-products', page, statusTab],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/products/me', {
          params: { page, size: 15, status: statusTab === 'ALL' ? undefined : statusTab },
        })
        .then((res) => res.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, version }: { id: number; status: ProductStatus; version: number }) =>
      axiosInstance.patch(`/api/v1/products/${id}/status`, { status, version }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      if (err.response?.status === 409) {
        setErrorMessage('Sản phẩm đã được chỉnh sửa bởi phiên khác. Đang tải lại dữ liệu mới nhất...');
        queryClient.invalidateQueries({ queryKey: ['my-products'] });
      } else {
        setErrorMessage(err.response?.data?.message || 'Cập nhật trạng thái không thành công.');
      }
    },
  });

  const handleOpenStatusConfirm = (p: Product, newStatus: ProductStatus) => {
    let title = '';
    let message = '';
    let variant: 'primary' | 'warning' | 'danger' = 'primary';

    if (newStatus === 'HIDDEN') {
      title = 'Tạm ẩn tin đăng';
      message = `Bạn có chắc chắn muốn tạm ẩn sản phẩm "${p.title}"? Sản phẩm sẽ không còn xuất hiện trên sàn công khai.`;
      variant = 'warning';
    } else if (newStatus === 'ACTIVE') {
      title = 'Mở bán lại sản phẩm';
      message = `Sản phẩm "${p.title}" sẽ được kích hoạt và xuất hiện lại trên sàn giao dịch.`;
      variant = 'primary';
    } else if (newStatus === 'SOLD') {
      title = 'Đánh dấu đã bán';
      message = `Đánh dấu sản phẩm "${p.title}" đã được bán. Thao tác này sẽ lưu trạng thái hoàn tất cho tin đăng.`;
      variant = 'primary';
    }

    setConfirmDialog({
      isOpen: true,
      product: p,
      targetStatus: newStatus,
      title,
      message,
      variant,
    });
  };

  const handleExecuteStatusChange = () => {
    if (!confirmDialog.product || !confirmDialog.targetStatus) return;
    statusMutation.mutate({
      id: confirmDialog.product.id,
      status: confirmDialog.targetStatus,
      version: confirmDialog.product.version,
    });
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

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
            <button
              onClick={() => changeStatusTab('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusTab === 'ALL'
                  ? 'bg-[#eb6e34] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({pageData?.totalElements || 0})
            </button>
            <button
              onClick={() => changeStatusTab('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusTab === 'ACTIVE'
                  ? 'bg-[#eb6e34] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang bán
            </button>
            <button
              onClick={() => changeStatusTab('HIDDEN')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusTab === 'HIDDEN'
                  ? 'bg-[#eb6e34] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đang ẩn
            </button>
            <button
              onClick={() => changeStatusTab('SOLD')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusTab === 'SOLD'
                  ? 'bg-[#eb6e34] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã bán
            </button>
          </div>
        </div>

        {/* Inline Error Notice */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 font-bold"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Table / Card List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#eb6e34] border-t-transparent" />
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
          <EmptyState
            title={
              statusTab === 'ALL'
                ? 'Bạn chưa đăng món đồ nào'
                : `Không có sản phẩm nào ở trạng thái ${statusTab}`
            }
            description="Chia sẻ giáo trình, sách cũ, phụ kiện hoặc đồ dùng không dùng đến để nhận tiền thanh lý và dọn dẹp phòng KTX."
            action={{
              label: 'Đăng món đồ đầu tiên',
              onClick: () => (window.location.href = '/marketplace/new'),
            }}
          />
        ) : (
          <div className="bg-white shadow-2xs border border-slate-200 rounded-2xl overflow-hidden">
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
                              className="font-bold text-slate-900 hover:text-[#eb6e34] transition block truncate max-w-xs"
                            >
                              {p.title}
                            </Link>
                            <span className="text-[11px] text-slate-500">
                              {p.category?.name || 'Khác'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap font-bold text-[#eb6e34] text-sm">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {renderStatusBadge(p.status)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                        {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-right space-x-1.5 font-semibold">
                        <Link
                          to={`/marketplace/${p.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={12} /> Xem
                        </Link>

                        {p.status !== 'SOLD' && (
                          <Link
                            to={`/marketplace/edit/${p.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-orange-700 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 rounded-lg transition"
                            title="Chỉnh sửa"
                          >
                            <Edit3 size={12} /> Sửa
                          </Link>
                        )}

                        {p.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleOpenStatusConfirm(p, 'HIDDEN')}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                            title="Tạm ẩn tin rao"
                          >
                            <EyeOff size={12} /> Ẩn tin
                          </button>
                        )}

                        {p.status === 'HIDDEN' && (
                          <button
                            onClick={() => handleOpenStatusConfirm(p, 'ACTIVE')}
                            disabled={statusMutation.isPending}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                            title="Mở bán lại"
                          >
                            <CheckCircle2 size={12} /> Mở lại
                          </button>
                        )}

                        {(p.status === 'ACTIVE' || p.status === 'HIDDEN') && (
                          <button
                            onClick={() => handleOpenStatusConfirm(p, 'SOLD')}
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
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-xs">
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

        {/* Accessible Confirmation Modal */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={handleExecuteStatusChange}
          title={confirmDialog.title}
          message={confirmDialog.message}
          variant={confirmDialog.variant}
          isLoading={statusMutation.isPending}
          confirmText="Đồng ý thực hiện"
        />
      </div>
    </div>
  );
};
