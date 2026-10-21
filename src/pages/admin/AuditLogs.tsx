import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { AuditLogItem, AuditAction, AuditEntityType } from '../../types/admin';
import type { PageResponse } from '../../types/marketplace';
import {
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  Globe,
  Filter,
} from 'lucide-react';

const COMMON_ACTIONS: { label: string; value: AuditAction }[] = [
  { label: 'Đăng nhập (USER_LOGIN)', value: 'USER_LOGIN' },
  { label: 'Đăng xuất (USER_LOGOUT)', value: 'USER_LOGOUT' },
  { label: 'Đăng ký (USER_REGISTER)', value: 'USER_REGISTER' },
  { label: 'Đổi trạng thái tài khoản (USER_STATUS_CHANGE)', value: 'USER_STATUS_CHANGE' },
  { label: 'Tạo sản phẩm (PRODUCT_CREATE)', value: 'PRODUCT_CREATE' },
  { label: 'Cập nhật sản phẩm (PRODUCT_UPDATE)', value: 'PRODUCT_UPDATE' },
  { label: 'Tạo đơn hàng (ORDER_CREATE)', value: 'ORDER_CREATE' },
  { label: 'Duyệt đơn hàng (ORDER_ACCEPT)', value: 'ORDER_ACCEPT' },
  { label: 'Gửi đồ vào tủ (ORDER_DEPOSIT)', value: 'ORDER_DEPOSIT' },
  { label: 'Nhận đồ thành công (ORDER_PICKUP)', value: 'ORDER_PICKUP' },
  { label: 'Nhận đồ thất bại (ORDER_PICKUP_FAILED)', value: 'ORDER_PICKUP_FAILED' },
  { label: 'Đơn quá hạn (ORDER_EXPIRED)', value: 'ORDER_EXPIRED' },
  { label: 'Truy cập Dashboard (ADMIN_ACCESS_DASHBOARD)', value: 'ADMIN_ACCESS_DASHBOARD' },
];

const ENTITY_TYPES: AuditEntityType[] = [
  'USER',
  'PRODUCT',
  'CATEGORY',
  'LOCKER',
  'COMPARTMENT',
  'ORDER',
  'SYSTEM',
];

export const AuditLogs = () => {
  const [page, setPage] = useState<number>(0);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('');
  const [successFilter, setSuccessFilter] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const { data: pageData, isLoading, isError, refetch, isFetching } = useQuery<PageResponse<AuditLogItem>>({
    queryKey: ['admin-audit-logs', page, actionFilter, entityTypeFilter, successFilter],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/audit', {
          params: {
            page,
            size: 20,
            action: actionFilter || undefined,
            entityType: entityTypeFilter || undefined,
            success: successFilter === '' ? undefined : successFilter === 'true',
          },
        })
        .then((res) => res.data),
  });

  const getActionBadgeClass = (action: AuditAction) => {
    if (action.startsWith('USER_')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.startsWith('ORDER_')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (action.startsWith('PRODUCT_')) return 'bg-[#eb6e34]/10 text-[#eb6e34] border-[#eb6e34]/30';
    if (action.startsWith('LOCKER_') || action.startsWith('COMPARTMENT_'))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.startsWith('ADMIN_')) return 'bg-slate-900 text-white border-slate-900';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#eb6e34]/10 text-[#eb6e34] rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nhật ký Hệ thống (Audit Logs)</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Ghi nhận và truy vết mọi hoạt động đăng nhập, giao dịch, thao tác dữ liệu và sự kiện bảo mật.
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-[#eb6e34]' : ''} />
            Làm mới
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Filter size={16} /> Lọc:
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(0);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#eb6e34]"
          >
            <option value="">Tất cả hành động (Action)</option>
            {COMMON_ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>

          {/* Entity Type Filter */}
          <select
            value={entityTypeFilter}
            onChange={(e) => {
              setEntityTypeFilter(e.target.value);
              setPage(0);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#eb6e34]"
          >
            <option value="">Tất cả đối tượng (Entity)</option>
            {ENTITY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Success / Failure Filter */}
          <select
            value={successFilter}
            onChange={(e) => {
              setSuccessFilter(e.target.value);
              setPage(0);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#eb6e34]"
          >
            <option value="">Tất cả kết quả</option>
            <option value="true">Thành công (Success)</option>
            <option value="false">Thất bại / Lỗi (Failure)</option>
          </select>

          {(actionFilter || entityTypeFilter || successFilter) && (
            <button
              onClick={() => {
                setActionFilter('');
                setEntityTypeFilter('');
                setSuccessFilter('');
                setPage(0);
              }}
              className="text-xs text-[#eb6e34] hover:text-[#d85d26] font-semibold underline ml-auto"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu nhật ký...</div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500">Không thể tải danh sách nhật ký Audit.</div>
          ) : !pageData || pageData.content.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
              <p>Chưa có bản ghi nhật ký nào phù hợp với bộ lọc.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Người thực hiện</th>
                    <th className="px-6 py-4">Hành động</th>
                    <th className="px-6 py-4">Đối tượng</th>
                    <th className="px-6 py-4">Chi tiết thao tác</th>
                    <th className="px-6 py-4">Địa chỉ IP</th>
                    <th className="px-6 py-4 text-center">Kết quả</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pageData.content.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                      className="hover:bg-gray-50/70 transition cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                          <Calendar size={13} className="text-gray-400" />
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">
                          {log.username || <span className="text-gray-400 italic">Hệ thống</span>}
                        </span>
                        {log.userId && (
                          <div className="text-xs text-gray-400">ID: #{log.userId}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getActionBadgeClass(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                          {log.entityType}
                          {log.entityId ? ` #${log.entityId}` : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-xs text-gray-700" title={log.details || ''}>
                        {log.details || <span className="text-gray-400 italic">Không có chi tiết</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div className="flex items-center gap-1 font-mono">
                          <Globe size={12} className="text-gray-400" />
                          {log.ipAddress || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {log.success ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"
                            title="Thao tác thành công"
                          >
                            <CheckCircle size={14} /> Thành công
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full"
                            title={log.errorMessage || 'Thất bại'}
                          >
                            <XCircle size={14} /> Thất bại
                          </span>
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
                Trang {pageData.number + 1} / {pageData.totalPages} (Tổng số {pageData.totalElements} bản ghi)
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

        {/* Selected Log Detail Card */}
        {selectedLog && (
          <div className="mt-6 bg-white p-6 rounded-xl border border-gray-200 shadow-xs animate-in fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-[#eb6e34]" />
                Chi tiết bản ghi nhật ký #{selectedLog.id}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 block mb-1">Chi tiết thao tác:</span>
                <p className="font-mono text-gray-800 whitespace-pre-wrap">{selectedLog.details || 'Không có'}</p>
              </div>

              {selectedLog.errorMessage && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-100">
                  <span className="text-red-500 font-semibold block mb-1">Thông báo lỗi:</span>
                  <p className="font-mono">{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
};
