import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { DisputeReason } from '../../types/dispute';
import { ShieldAlert, X, AlertCircle } from 'lucide-react';

interface DisputeModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const REASONS: { value: DisputeReason; label: string; desc: string }[] = [
  { value: 'EMPTY_COMPARTMENT', label: 'Tủ trống, không có đồ', desc: 'Mở cửa tủ ra nhưng không thấy kiện hàng đâu' },
  { value: 'DAMAGED_ITEM', label: 'Hàng bị hư hỏng / vỡ', desc: 'Sản phẩm bên trong bị nứt vỡ hoặc không hoạt động' },
  { value: 'WRONG_ITEM', label: 'Giao nhầm sản phẩm', desc: 'Sản phẩm nhận được không phải món đồ đã đặt mua/thuê' },
  { value: 'NOT_AS_DESCRIBED', label: 'Khác xa mô tả', desc: 'Tình trạng hoặc đặc tính khác biệt lớn so với bài đăng' },
  { value: 'COUNTERFEIT', label: 'Hàng giả / nhái', desc: 'Nghi vấn sản phẩm không chính hãng' },
  { value: 'OTHER', label: 'Sự cố khác', desc: 'Các vấn đề phát sinh khác cần hỗ trợ' },
];

export const DisputeModal = ({ orderId, isOpen, onClose, onSuccess }: DisputeModalProps) => {
  const [reason, setReason] = useState<DisputeReason>('EMPTY_COMPARTMENT');
  const [description, setDescription] = useState<string>('');
  const [proofImageUrl, setProofImageUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const queryClient = useQueryClient();

  const disputeMutation = useMutation({
    mutationFn: () =>
      axiosInstance.post(`/api/v1/orders/${orderId}/disputes`, {
        reason,
        description: description.trim(),
        proofImageUrl: proofImageUrl.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-dispute', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-detail', String(orderId)] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Không thể gửi khiếu nại. Vui lòng thử lại sau.');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Báo cáo sự cố & Khiếu nại</h3>
              <p className="text-xs text-slate-500">Ban quản trị sẽ tạm đóng băng tiền và xử lý trong 24h</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Reason Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Lý do khiếu nại <span className="text-rose-500">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as DisputeReason)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label} — {r.desc}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Mô tả chi tiết sự cố <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Mô tả cụ thể tình trạng hàng hóa hoặc hiện trường tủ khi bạn mở cửa..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Proof Image URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Link ảnh bằng chứng (tùy chọn)</span>
            <span className="text-[11px] text-slate-400 font-normal">Ảnh chụp mở tủ hoặc tình trạng hàng</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={proofImageUrl}
              onChange={(e) => setProofImageUrl(e.target.value)}
              placeholder="https://... (URL ảnh bằng chứng)"
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
            />
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-1.5">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!description.trim() || disputeMutation.isPending}
            onClick={() => disputeMutation.mutate()}
            className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-50 transition shadow-2xs"
          >
            {disputeMutation.isPending ? 'Đang gửi...' : 'Gửi Khiếu Nại'}
          </button>
        </div>
      </div>
    </div>
  );
};
