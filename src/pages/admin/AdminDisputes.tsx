import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { DisputeResponse, DisputeStatus, DisputeReason } from '../../types/dispute';
import type { PageResponse } from '../../types/marketplace';
import {
  ShieldAlert,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const AdminDisputes = () => {
  const [page, setPage] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDispute, setSelectedDispute] = useState<DisputeResponse | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Resolution modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveTargetStatus, setResolveTargetStatus] = useState<DisputeStatus>('RESOLVED_REFUND_BUYER');
  const [adminNote, setAdminNote] = useState('');

  const queryClient = useQueryClient();

  const { data: pageData, isLoading, refetch, isFetching } = useQuery<PageResponse<DisputeResponse>>({
    queryKey: ['admin-disputes', page, statusFilter],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/admin/disputes', {
          params: {
            page,
            size: 15,
            status: statusFilter && statusFilter !== 'ALL' ? statusFilter : undefined,
          },
        })
        .then((res) => res.data),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: number; status: DisputeStatus; adminNote: string }) =>
      axiosInstance.post(`/api/v1/admin/disputes/${id}/resolve`, { status, adminNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      setResolveModalOpen(false);
      setSelectedDispute(null);
      setAdminNote('');
    },
  });

  const handleOpenResolve = (dispute: DisputeResponse, targetStatus: DisputeStatus) => {
    setSelectedDispute(dispute);
    setResolveTargetStatus(targetStatus);
    setAdminNote(
      targetStatus === 'RESOLVED_REFUND_BUYER'
        ? 'Xác minh có cơ sở: Ngăn tủ không có hàng hoặc hàng bị lỗi. Hoàn tiền 100% cho người mua.'
        : 'Sau khi kiểm tra camera/lịch sử tủ: Giao dịch hợp lệ, bác khiếu nại và giữ thanh toán cho người bán.'
    );
    setResolveModalOpen(true);
  };

  const disputes = pageData?.content || [];
  const filteredDisputes = disputes.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.orderNumber?.toLowerCase().includes(term) ||
      d.buyerName?.toLowerCase().includes(term) ||
      d.sellerName?.toLowerCase().includes(term) ||
      d.description?.toLowerCase().includes(term)
    );
  });

  const getReasonLabel = (reason: DisputeReason) => {
    switch (reason) {
      case 'EMPTY_COMPARTMENT':
        return { label: 'Tủ trống không có đồ', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'DAMAGED_ITEM':
        return { label: 'Hàng bị hư hỏng / vỡ', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'WRONG_ITEM':
        return { label: 'Giao nhầm sản phẩm', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'COUNTERFEIT':
        return { label: 'Hàng giả / nhái', color: 'bg-red-50 text-red-700 border-red-200' };
      case 'NOT_AS_DESCRIBED':
        return { label: 'Khác xa mô tả', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      default:
        return { label: 'Sự cố khác', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getStatusBadge = (status: DisputeStatus) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Đang thụ lý
          </span>
        );
      case 'RESOLVED_REFUND_BUYER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Hoàn tiền Người mua
          </span>
        );
      case 'RESOLVED_PAYOUT_SELLER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 size={12} /> Trả tiền Người bán
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-600">
            Đã hủy
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
            <ShieldAlert className="text-emerald-600" size={26} />
            Giải quyết Khiếu nại Đơn hàng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Xử lý tranh chấp giao nhận tủ thông minh và chất lượng sản phẩm giữa sinh viên.
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'OPEN', label: 'Chờ giải quyết' },
            { id: 'RESOLVED_REFUND_BUYER', label: 'Đã hoàn tiền mua' },
            { id: 'RESOLVED_PAYOUT_SELLER', label: 'Đã trả tiền bán' },
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
            placeholder="Tìm theo mã đơn, tên..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-2xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Đang tải danh sách khiếu nại...</div>
        ) : filteredDisputes.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldAlert className="mx-auto text-slate-300" size={36} />
            <p className="text-slate-600 font-medium">Không có khiếu nại nào</p>
            <p className="text-xs text-slate-400">Tất cả giao dịch đang hoạt động bình thường và an toàn</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Mã đơn</th>
                  <th className="px-4 py-3">Người mua (Khiếu nại)</th>
                  <th className="px-4 py-3">Người bán</th>
                  <th className="px-4 py-3">Lý do & Mô tả</th>
                  <th className="px-4 py-3">Bằng chứng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Phán quyết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDisputes.map((dispute) => {
                  const reasonInfo = getReasonLabel(dispute.reason);
                  return (
                    <tr key={dispute.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-slate-900">
                          {dispute.orderNumber}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {new Date(dispute.createdAt).toLocaleString('vi-VN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">{dispute.buyerName}</div>
                        <div className="text-xs text-slate-400">ID: #{dispute.buyerId}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{dispute.sellerName}</div>
                        <div className="text-xs text-slate-400">ID: #{dispute.sellerId}</div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${reasonInfo.color} mb-1`}
                        >
                          {reasonInfo.label}
                        </span>
                        <p className="text-xs text-slate-700 line-clamp-2" title={dispute.description}>
                          {dispute.description}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        {dispute.proofImageUrl ? (
                          <button
                            onClick={() => setPreviewImage(dispute.proofImageUrl!)}
                            className="relative group block w-14 h-14 rounded-md overflow-hidden border border-slate-200 hover:border-emerald-500 transition"
                          >
                            <img
                              src={dispute.proofImageUrl}
                              alt="Bằng chứng"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                              <ExternalLink size={14} />
                            </div>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Không có ảnh</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {getStatusBadge(dispute.status)}
                        {dispute.resolvedByName && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Bởi: {dispute.resolvedByName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {dispute.status === 'OPEN' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenResolve(dispute, 'RESOLVED_REFUND_BUYER')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition shadow-2xs"
                              title="Hoàn trả 100% tiền đơn và cọc cho người mua"
                            >
                              <CheckCircle2 size={12} />
                              Hoàn tiền Mua
                            </button>
                            <button
                              onClick={() => handleOpenResolve(dispute, 'RESOLVED_PAYOUT_SELLER')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition"
                              title="Bác khiếu nại, trả tiền cho người bán"
                            >
                              Trả tiền Bán
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 max-w-xs text-right">
                            {dispute.adminNote && (
                              <p className="italic text-[11px] text-slate-600" title={dispute.adminNote}>
                                &ldquo;{dispute.adminNote}&rdquo;
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="bg-white rounded-lg p-2 max-w-2xl max-h-[85vh] overflow-hidden">
            <img src={previewImage} alt="Ảnh bằng chứng" className="max-h-[80vh] w-auto object-contain rounded" />
          </div>
        </div>
      )}

      {/* Resolution Confirmation Modal */}
      {resolveModalOpen && selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <ShieldAlert className="text-emerald-600" size={20} />
                Phán quyết tranh chấp đơn {selectedDispute.orderNumber}
              </h3>
              <button
                onClick={() => setResolveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
              <div>
                <strong>Người mua:</strong> {selectedDispute.buyerName}
              </div>
              <div>
                <strong>Người bán:</strong> {selectedDispute.sellerName}
              </div>
              <div>
                <strong>Lý do:</strong> {getReasonLabel(selectedDispute.reason).label}
              </div>
              <div>
                <strong>Phương án phán quyết:</strong>{' '}
                <span className="font-bold text-emerald-800">
                  {resolveTargetStatus === 'RESOLVED_REFUND_BUYER'
                    ? 'HOÀN TIỀN 100% CHO NGƯỜI MUA (Ví tiền người mua sẽ nhận lại tiền hàng + cọc)'
                    : 'BÁC KHIẾU NẠI & GIẢI NGÂN CHO NGƯỜI BÁN (Ví người bán sẽ nhận tiền)'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <label className="block text-xs font-semibold text-slate-700">
                Ghi chú phán quyết của Quản trị viên <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!adminNote.trim() || resolveMutation.isPending}
                onClick={() =>
                  resolveMutation.mutate({
                    id: selectedDispute.id,
                    status: resolveTargetStatus,
                    adminNote: adminNote.trim(),
                  })
                }
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs"
              >
                {resolveMutation.isPending ? 'Đang cập nhật...' : 'Xác nhận Phán Quyết'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
