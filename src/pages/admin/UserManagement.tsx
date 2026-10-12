import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { UserManagementItem, AdminUserStatus } from '../../types/admin';
import type { PageResponse } from '../../types/marketplace';
import { AdminNav } from '../../components/AdminNav';
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
} from 'lucide-react';

export const UserManagement = () => {
  const [page, setPage] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserManagementItem | null>(null);
  const [actionStatus, setActionStatus] = useState<AdminUserStatus>('LOCKED');
  const [reason, setReason] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái người dùng');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Tra cứu thông tin tài khoản, phân quyền và kiểm soát trạng thái hoạt động của thành viên trong toàn thành phố.
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-purple-600' : ''} />
            Làm mới
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <form onSubmit={handleSearchSubmit} className="flex relative w-full sm:w-96">
            <input
              type="text"
              name="search"
              defaultValue={searchTerm}
              placeholder="Tìm theo tên đăng nhập, họ tên, email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
            >
              Tìm kiếm
            </button>
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500 whitespace-nowrap">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
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
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            <Shield size={13} className="text-purple-600" /> Quản trị viên
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            Thành viên
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
      </main>

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
                className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
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
    </div>
  );
};
