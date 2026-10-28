import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { UserManagementItem, AdminUserStatus } from '../../types/admin';
import type { PageResponse } from '../../types/marketplace';
import {
  Search,
  RefreshCw,
  UserCheck,
  UserX,
  Users,
  Shield,
  ShoppingBag,
  Package,
  Calendar,
  AlertCircle,
  X,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import { parseCccdQr, scanQrFromImageSource, type CccdQrData } from '../../utils/cccdQrParser';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const UserManagement = () => {
  const [page, setPage] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserManagementItem | null>(null);
  const [selectedCccdUser, setSelectedCccdUser] = useState<UserManagementItem | null>(null);
  const [actionStatus, setActionStatus] = useState<AdminUserStatus>('LOCKED');
  const [reason, setReason] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCccdModalOpen, setIsCccdModalOpen] = useState<boolean>(false);
  const [adminScanningQr, setAdminScanningQr] = useState<boolean>(false);
  const [adminQrResult, setAdminQrResult] = useState<CccdQrData | null>(null);
  const [adminQrError, setAdminQrError] = useState<string | null>(null);

  // Accessible confirmation dialog states
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'primary' | 'warning' | 'danger';
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'primary',
  });

  const queryClient = useQueryClient();

  const { data: pageData, isLoading, isError, refetch, isFetching } = useQuery<PageResponse<UserManagementItem>>({
    queryKey: ['admin-users', page, statusFilter, searchTerm],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/admin/users', {
          params: {
            page,
            size: 15,
            status: statusFilter || undefined,
            search: searchTerm || undefined,
          },
        })
        .then((res) => res.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status, reason }: { userId: number; status: AdminUserStatus; reason: string }) =>
      axiosInstance.patch(`/api/v1/admin/users/${userId}/status`, { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      setIsModalOpen(false);
      setSelectedUser(null);
      setReason('');
    },
    onError: (err: any) => {
      setActionNotice({
        isOpen: true,
        title: 'Cập nhật trạng thái thất bại',
        message: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái người dùng',
        variant: 'danger',
      });
    },
  });

  const reviewIdentityMutation = useMutation({
    mutationFn: ({ id, approved }: { id: number; approved: boolean }) =>
      axiosInstance.patch<UserManagementItem>(`/api/v1/admin/users/${id}/identity`, { approved }),
    onSuccess: ({ data }) => {
      setSelectedCccdUser(data);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (err: any) => {
      setActionNotice({
        isOpen: true,
        title: 'Thao tác hồ sơ thất bại',
        message: err.response?.data?.message || 'Không thể cập nhật trạng thái hồ sơ danh tính',
        variant: 'danger',
      });
    },
  });

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearchTerm((formData.get('search') as string) || '');
    setPage(0);
  };

  const openStatusModal = (user: UserManagementItem, newStatus: AdminUserStatus) => {
    setSelectedUser(user);
    setActionStatus(newStatus);
    setReason('');
    setIsModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!selectedUser) return;
    updateStatusMutation.mutate({
      userId: selectedUser.id,
      status: actionStatus,
      reason: reason.trim(),
    });
  };

  const handleAdminScanQr = async () => {
    if (!selectedCccdUser?.idCardFrontUrl || adminScanningQr) return;
    setAdminScanningQr(true);
    setAdminQrError(null);
    setAdminQrResult(null);

    try {
      const raw = await scanQrFromImageSource(selectedCccdUser.idCardFrontUrl);
      if (raw) {
        const parsed = parseCccdQr(raw);
        if (parsed) {
          setAdminQrResult(parsed);
        } else {
          setAdminQrError(`Mã QR không đúng định dạng CCCD chuẩn: ${raw}`);
        }
      } else {
        setAdminQrError('Không quét được mã QR từ ảnh mặt trước này.');
      }
    } catch {
      setAdminQrError('Lỗi trong quá trình quét ảnh.');
    } finally {
      setAdminScanningQr(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60 shadow-2xs">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Quản lý Người dùng</h1>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                Tra cứu thông tin tài khoản, phân quyền và kiểm soát trạng thái hoạt động của thành viên trong toàn thành phố.
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-md text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs transition"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin text-emerald-600' : ''} />
            Làm mới
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="flex relative w-full sm:w-96">
            <input
              type="text"
              name="search"
              defaultValue={searchTerm}
              placeholder="Tìm theo tên đăng nhập, họ tên, email..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-bold hover:bg-emerald-700 transition shadow-2xs"
            >
              Tìm kiếm
            </button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="PENDING">Chờ kích hoạt email</option>
              <option value="LOCKED">Đang bị khóa</option>
            </select>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải danh sách người dùng...</div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">Không thể tải danh sách người dùng.</div>
          ) : !pageData || pageData.content.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
              <p>Không tìm thấy người dùng nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Tài khoản & Email</th>
                    <th className="px-6 py-4">Họ và tên</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Xác minh CCCD</th>
                    <th className="px-6 py-4">Hoạt động</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Ngày tham gia</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pageData.content.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{u.username}</div>
                        <div className="text-xs text-gray-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">
                          {u.fullName || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                        </div>
                        {u.dateOfBirth && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Sinh ngày: {new Date(u.dateOfBirth).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.role === 'ADMIN' || u.role === 'ROLE_ADMIN' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white border border-slate-900">
                            <Shield size={13} className="text-amber-400" /> Quản trị viên
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            Thành viên
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.identityVerified || u.citizenId ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCccdUser(u);
                              setIsCccdModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                            title="Nhấn để xem chi tiết ảnh và số CCCD"
                          >
                            <CheckCircle2 size={13} className="text-emerald-600" />
                            {u.identityVerified ? 'Đã xác minh' : u.identityReviewStatus === 'REJECTED' ? 'Chưa chấp thuận' : 'Chờ xét duyệt'}
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            Chưa xác minh
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1.5" title="Sản phẩm đăng bán">
                            <ShoppingBag size={14} className="text-amber-500" />
                            <strong>{u.totalProducts}</strong> tin
                          </span>
                          <span className="flex items-center gap-1.5" title="Đơn hàng tham gia">
                            <Package size={14} className="text-blue-500" />
                            <strong>{u.totalOrders}</strong> đơn
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.status === 'ACTIVE' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Hoạt động
                          </span>
                        )}
                        {u.status === 'PENDING' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Chờ xác thực
                          </span>
                        )}
                        {u.status === 'LOCKED' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={13} className="text-gray-400" />
                          {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.status === 'LOCKED' ? (
                          <button
                            onClick={() => openStatusModal(u, 'ACTIVE')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200"
                          >
                            <UserCheck size={14} /> Mở khóa
                          </button>
                        ) : (
                          <button
                            onClick={() => openStatusModal(u, 'LOCKED')}
                            disabled={u.role === 'ADMIN' || u.role === 'ROLE_ADMIN'}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition border ${
                              u.role === 'ADMIN' || u.role === 'ROLE_ADMIN'
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200'
                            }`}
                            title={u.role === 'ADMIN' || u.role === 'ROLE_ADMIN' ? 'Không thể khóa tài khoản Quản trị viên' : 'Khóa tài khoản'}
                          >
                            <UserX size={14} /> Khóa tài khoản
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pageData && pageData.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm">
              <span className="text-gray-500">
                Trang {pageData.number + 1} / {pageData.totalPages} (Tổng số {pageData.totalElements} người dùng)
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={pageData.number === 0}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, pageData.totalPages - 1))}
                  disabled={pageData.number >= pageData.totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Confirmation Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              {actionStatus === 'LOCKED' ? (
                <UserX className="text-red-600" size={22} />
              ) : (
                <UserCheck className="text-emerald-600" size={22} />
              )}
              <h3 className="text-lg font-bold text-gray-900">
                {actionStatus === 'LOCKED' ? 'Xác nhận khóa tài khoản' : 'Xác nhận mở khóa tài khoản'}
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc chắn muốn chuyển trạng thái của người dùng{' '}
              <strong>{selectedUser.username}</strong> ({selectedUser.email}) thành{' '}
              <span className={`font-semibold ${actionStatus === 'LOCKED' ? 'text-red-600' : 'text-emerald-600'}`}>
                {actionStatus === 'LOCKED' ? 'Đã khóa' : 'Đang hoạt động'}
              </span>
              ?
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Lý do thay đổi (được lưu vào Audit Log):
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Vi phạm quy định đăng tin rác, lừa đảo hoặc mở khóa theo yêu cầu hỗ trợ..."
                className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-hidden"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={updateStatusMutation.isPending}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition ${
                  actionStatus === 'LOCKED'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CCCD Identity Details Modal */}
      {isCccdModalOpen && selectedCccdUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCccdModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <CreditCard size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chi tiết Hồ sơ CCCD</h3>
                <p className="text-xs text-gray-500">
                  {selectedCccdUser.fullName || selectedCccdUser.username} ({selectedCccdUser.email})
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              {selectedCccdUser.citizenId && selectedCccdUser.idCardFrontUrl && (
                <div className="flex gap-3">
                  <button
                    disabled={reviewIdentityMutation.isPending || !!selectedCccdUser.identityVerified}
                    onClick={() => setConfirmApproveOpen(true)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition"
                  >
                    Phê duyệt danh tính
                  </button>
                  <button
                    disabled={reviewIdentityMutation.isPending}
                    onClick={() => setConfirmRejectOpen(true)}
                    className="rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition"
                  >
                    Từ chối / Thu hồi
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <span className="text-xs text-gray-500 block">Số CCCD</span>
                  <strong className="text-gray-900 font-mono text-base">
                    {selectedCccdUser.citizenId || 'Chưa cập nhật'}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Thời gian xác minh</span>
                  <span className="text-gray-700 font-medium text-xs">
                    {selectedCccdUser.identityVerifiedAt
                      ? new Date(selectedCccdUser.identityVerifiedAt).toLocaleString('vi-VN')
                      : 'Chưa được phê duyệt'}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-700">
                    Ảnh mặt trước CCCD
                  </span>
                  {selectedCccdUser.idCardFrontUrl && (
                    <button
                      type="button"
                      onClick={handleAdminScanQr}
                      disabled={adminScanningQr}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-md text-xs font-bold transition disabled:opacity-50"
                    >
                      <QrCode size={13} />
                      {adminScanningQr ? 'Đang quét...' : 'Quét mã QR từ ảnh'}
                    </button>
                  )}
                </div>

                {/* Admin QR Scan Result Box */}
                {adminQrResult && (
                  <div className="mb-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5 text-xs animate-in fade-in">
                    <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      Kết quả bóc tách mã QR trên CCCD:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-100">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Họ tên trên QR</span>
                        <strong className="text-slate-900">{adminQrResult.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Số CCCD trên QR</span>
                        <strong className="text-emerald-700 font-mono">{adminQrResult.citizenId}</strong>
                      </div>
                      {adminQrResult.dateOfBirthFormatted && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Ngày sinh</span>
                          <span>{adminQrResult.dateOfBirthFormatted}</span>
                        </div>
                      )}
                      {adminQrResult.address && (
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px]">Địa chỉ thường trú</span>
                          <span>{adminQrResult.address}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] pt-1">
                      {adminQrResult.citizenId === selectedCccdUser.citizenId ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 size={12} /> Số CCCD trùng khớp 100% với dữ liệu người dùng gửi
                        </span>
                      ) : (
                        <span className="text-red-700 font-semibold flex items-center gap-1">
                          <AlertCircle size={12} /> Cảnh báo: Số CCCD từ QR ({adminQrResult.citizenId}) KHÁC với số khai báo ({selectedCccdUser.citizenId})!
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {adminQrError && (
                  <div className="mb-2.5 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle size={14} className="text-amber-600 shrink-0" />
                    <span>{adminQrError}</span>
                  </div>
                )}

                {selectedCccdUser.idCardFrontUrl ? (
                  <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-100 group">
                    <img
                      src={selectedCccdUser.idCardFrontUrl}
                      alt="Mặt trước CCCD"
                      className="w-full h-48 object-cover"
                    />
                    <a
                      href={selectedCccdUser.idCardFrontUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/70 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-black transition"
                    >
                      <ExternalLink size={12} /> Xem ảnh gốc
                    </a>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 text-gray-400 rounded-xl text-center text-xs">
                    Chưa có ảnh mặt trước
                  </div>
                )}
              </div>

              {selectedCccdUser.idCardBackUrl && (
                <div>
                  <span className="text-xs font-semibold text-gray-700 block mb-1.5">
                    Ảnh mặt sau CCCD
                  </span>
                  <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-100 group">
                    <img
                      src={selectedCccdUser.idCardBackUrl}
                      alt="Mặt sau CCCD"
                      className="w-full h-48 object-cover"
                    />
                    <a
                      href={selectedCccdUser.idCardBackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/70 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-black transition"
                    >
                      <ExternalLink size={12} /> Xem ảnh gốc
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsCccdModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Approve Identity Dialog */}
      <ConfirmDialog
        isOpen={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={() => {
          setConfirmApproveOpen(false);
          if (selectedCccdUser) {
            reviewIdentityMutation.mutate({ id: selectedCccdUser.id, approved: true });
          }
        }}
        title="Xác nhận phê duyệt danh tính"
        message="Bạn đã kiểm tra thông tin số CCCD và ảnh mặt trước/sau trùng khớp với tài khoản sinh viên này?"
        confirmText="Xác nhận duyệt"
        cancelText="Đóng"
        variant="primary"
        isLoading={reviewIdentityMutation.isPending}
      />

      {/* Confirm Reject/Revoke Identity Dialog */}
      <ConfirmDialog
        isOpen={confirmRejectOpen}
        onClose={() => setConfirmRejectOpen(false)}
        onConfirm={() => {
          setConfirmRejectOpen(false);
          if (selectedCccdUser) {
            reviewIdentityMutation.mutate({ id: selectedCccdUser.id, approved: false });
          }
        }}
        title="Từ chối / Thu hồi xác minh"
        message="Hành động này sẽ hủy trạng thái xác minh CCCD của người dùng và yêu cầu họ tải lại giấy tờ hợp lệ."
        confirmText="Xác nhận từ chối"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={reviewIdentityMutation.isPending}
      />

      {/* Notice Modal */}
      <ConfirmDialog
        isOpen={actionNotice.isOpen}
        onClose={() => setActionNotice((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => setActionNotice((prev) => ({ ...prev, isOpen: false }))}
        title={actionNotice.title}
        message={actionNotice.message}
        confirmText="Đã hiểu"
        cancelText="Đóng"
        variant={actionNotice.variant}
      />
    </div>
  );
};
