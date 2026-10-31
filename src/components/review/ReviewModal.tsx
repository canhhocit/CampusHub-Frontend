import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import { Star, X, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 sao - Rất không hài lòng',
  2: '2 sao - Không hài lòng',
  3: '3 sao - Bình thường',
  4: '4 sao - Hài lòng',
  5: '5 sao - Rất hài lòng & Tuyệt vời',
};

export const ReviewModal = ({ orderId, isOpen, onClose, onSuccess }: ReviewModalProps) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const queryClient = useQueryClient();

  const reviewMutation = useMutation({
    mutationFn: () =>
      axiosInstance.post(`/api/v1/orders/${orderId}/reviews`, {
        rating,
        comment: comment.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-review', orderId] });
      queryClient.invalidateQueries({ queryKey: ['order-detail', String(orderId)] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
    },
  });

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center">
              <Star size={18} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Đánh giá người bán & sản phẩm</h3>
              <p className="text-xs text-slate-500">Giúp cộng đồng sinh viên mua sắm an tâm hơn</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Interactive Star Rating */}
        <div className="text-center py-2 space-y-2">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((starVal) => {
              const isFilled = starVal <= currentDisplayRating;
              return (
                <button
                  key={starVal}
                  type="button"
                  onMouseEnter={() => setHoverRating(starVal)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(starVal)}
                  className="p-1 focus:outline-none transition-transform hover:scale-115 active:scale-95"
                  aria-label={`${starVal} sao`}
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      isFilled
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 hover:text-amber-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="text-xs font-semibold text-amber-700 min-h-4">
            {RATING_LABELS[currentDisplayRating]}
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Nhận xét chi tiết (tùy chọn)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Chất lượng sản phẩm đúng mô tả? Người bán hỗ trợ nhiệt tình?..."
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400"
          />
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
            disabled={reviewMutation.isPending}
            onClick={() => reviewMutation.mutate()}
            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs"
          >
            {reviewMutation.isPending ? 'Đang gửi...' : 'Gửi Đánh Giá'}
          </button>
        </div>
      </div>
    </div>
  );
};
