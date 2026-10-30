import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { PayoutRequestResponse, PayoutStatus } from '../../types/wallet';
import type { PageResponse } from '../../types/marketplace';
import {
  CreditCard,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  DollarSign,
} from 'lucide-react';

export const AdminPayouts = () => {
  const [page, setPage] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequestResponse | null>(null);

  // Approve modal state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [approveNote, setApproveNote] = useState('');

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const queryClient = useQueryClient();

  // Fetch payouts list
  const { data: pageData, isLoading, refetch, isFetching } = useQuery<PageResponse<PayoutRequestResponse>>({
    queryKey: ['admin-payouts', page, statusFilter],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/admin/payouts', {
          params: {
            page,
            size: 15,
            status: statusFilter && statusFilter !== 'ALL' ? statusFilter : undefined,
          },
        })
        .then((res) => res.data),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, referenceCode, note }: { id: number; referenceCode: string; note: string }) =>
      axiosInstance.post(`/api/v1/admin/payouts/${id}/approve`, { referenceCode, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      setApproveModalOpen(false);
      setSelectedPayout(null);
      setReferenceCode('');
      setApproveNote('');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      axiosInstance.post(`/api/v1/admin/payouts/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      setRejectModalOpen(false);
      setSelectedPayout(null);
      setRejectReason('');
    },
  });

  const handleOpenApprove = (payout: PayoutRequestResponse) => {
    setSelectedPayout(payout);
    setReferenceCode(`TRANS-${Date.now().toString().slice(-6)}`);
    setApproveNote('');
    setApproveModalOpen(true);
  };

  const handleOpenReject = (payout: PayoutRequestResponse) => {
    setSelectedPayout(payout);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const payouts = pageData?.content || [];
  const filteredPayouts = payouts.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.accountNumber?.toLowerCase().includes(term) ||
      p.accountName?.toLowerCase().includes(term) ||
      p.bankCode?.toLowerCase().includes(term) ||
      p.username?.toLowerCase().includes(term) ||
      p.fullName?.toLowerCase().includes(term) ||
      p.id.toString().includes(term)
    );
  });

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Chờ duyệt
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Đã chuyển
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Đã từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="text-emerald-600" size={26} />
            Quản trị Yêu cầu Rút tiền
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm tra thông tin tài khoản ngân hàng và phê duyệt giải ngân cho sinh viên.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition shadow-2xs"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin text-emerald-600' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'PENDING', label: 'Chờ duyệt' },
            { id: 'COMPLETED', label: 'Đã hoàn tất' },
            { id: 'REJECTED', label: 'Đã từ chối' },
            { id: 'ALL', label: 'Tất cả' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(0);
              }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo STK, tên, username..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Đang tải dữ liệu yêu cầu rút tiền...</div>
        ) : filteredPayouts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <DollarSign className="mx-auto text-slate-300" size={36} />
            <p className="text-slate-600 font-medium">Không tìm thấy yêu cầu rút tiền nào</p>
            <p className="text-xs text-slate-400">Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Thành viên</th>
                  <th className="px-4 py-3">Tài khoản Ngân hàng</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      #{payout.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-900">{payout.fullName || payout.username || 'Sinh viên'}</div>
                      <div className="text-xs text-slate-400">@{payout.username || `user_${payout.userId}`}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Building2 size={14} className="text-emerald-600 shrink-0" />
                        <span>{payout.bankCode}</span>
                        <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-xs border border-emerald-100">
                          {payout.accountNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 uppercase mt-0.5">{payout.accountName}</div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {payout.amount?.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      <div>{new Date(payout.createdAt).toLocaleDateString('vi-VN')}</div>
                      <div>{new Date(payout.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      {payout.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleOpenApprove(payout)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition shadow-2xs"
                          >
                            <CheckCircle2 size={13} />
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleOpenReject(payout)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition"
                          >
                            <XCircle size={13} />
                            Từ chối
                          </button>
                        </>
                      ) : (
                        <div className="text-xs text-slate-400">
                          {payout.referenceCode && (
                            <span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              Ref: {payout.referenceCode}
                            </span>
                          )}
                          {payout.adminNote && (
                            <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate" title={payout.adminNote}>
                              {payout.adminNote}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pageData && pageData.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Trang {pageData.number + 1} / {pageData.totalPages} (Tổng số {pageData.totalElements} yêu cầu)
            </span>
            <div className="flex gap-1">
              <button
                disabled={pageData.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-2.5 py-1 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
              >
                Trước
              </button>
              <button
                disabled={pageData.last}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Duyệt Chuyển Tiền */}
      {approveModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={20} />
                Phê duyệt chuyển tiền rút ví
              </h3>
              <button
                onClick={() => setApproveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-md space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between font-medium">
                <span>Số tiền giải ngân:</span>
                <span className="text-emerald-800 font-bold text-sm">
                  {selectedPayout.amount?.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ngân hàng thụ hưởng:</span>
                <span className="font-semibold text-slate-900">{selectedPayout.bankCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Số tài khoản:</span>
                <span className="font-mono font-semibold text-slate-900">{selectedPayout.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Chủ tài khoản:</span>
                <span className="uppercase text-slate-900 font-medium">{selectedPayout.accountName}</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã giao dịch ngân hàng / Ủy nhiệm chi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  placeholder="Ví dụ: FT2630048123 hoặc Mã UNC..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú cho sinh viên (tùy chọn)
                </label>
                <textarea
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                  placeholder="Ví dụ: Đã chuyển khoản qua Napas 24/7..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!referenceCode.trim() || approveMutation.isPending}
                onClick={() =>
                  approveMutation.mutate({
                    id: selectedPayout.id,
                    referenceCode: referenceCode.trim(),
                    note: approveNote.trim(),
                  })
                }
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs"
              >
                {approveMutation.isPending ? 'Đang duyệt...' : 'Xác nhận Đã Chuyển Tiền'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Từ Chối */}
      {rejectModalOpen && selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <XCircle className="text-rose-600" size={20} />
                Từ chối yêu cầu rút tiền
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Khi từ chối, số tiền <strong className="text-slate-900">{selectedPayout.amount?.toLocaleString('vi-VN')} đ</strong> sẽ được tự động hoàn lại vào số dư khả dụng của sinh viên.
            </p>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do từ chối <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ví dụ: Sai tên chủ tài khoản, thông tin ngân hàng không hợp lệ..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                onClick={() =>
                  rejectMutation.mutate({
                    id: selectedPayout.id,
                    reason: rejectReason.trim(),
                  })
                }
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-50 transition shadow-2xs"
              >
                {rejectMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Từ Chối & Hoàn Tiền'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
