import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import type { OrderDetail as OrderDetailType, OrderStatus } from '../../types/order';
import {
  Lock,
  KeyRound,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Package,
  MapPin,
  ImageOff,
  X,
  Radio,
  RotateCcw,
  CreditCard,
  QrCode,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Star,
  ShieldAlert,
} from 'lucide-react';

const purchaseStepConfig: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'PENDING_SELLER', label: '1. Đặt mua', desc: 'Chờ người bán duyệt' },
  { key: 'AWAITING_DEPOSIT', label: '2. Cấp tủ đồ', desc: 'Chờ gửi vào tủ' },
  { key: 'READY_FOR_PICKUP', label: '3. Nhận đồ', desc: 'Nhập PIN tại tủ' },
  { key: 'COMPLETED', label: '4. Hoàn tất', desc: 'Giao dịch thành công' },
];

const rentalStepConfig: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'PENDING_SELLER', label: '1. Đặt thuê', desc: 'Chờ duyệt' },
  { key: 'READY_FOR_PICKUP', label: '2. Nhận đồ', desc: 'Nhập PIN tại tủ' },
  { key: 'RENTING', label: '3. Đang thuê', desc: 'Tính từ lúc lấy đồ' },
  { key: 'AWAITING_RETURN_DEPOSIT', label: '4. Trả đồ', desc: 'Gửi lại vào tủ' },
  { key: 'COMPLETED', label: '5. Hoàn tất', desc: 'Hoàn cọc & tất toán' },
];

import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ReviewModal } from '../../components/review/ReviewModal';
import { DisputeModal } from '../../components/dispute/DisputeModal';
import type { ReviewResponse } from '../../types/review';
import type { DisputeResponse } from '../../types/dispute';


export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Pickup terminal keypad state
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [pickupErrorMessage, setPickupErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Payment states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'PAYOS' | 'MOCK'>('PAYOS');
  // Review & Dispute Modal States
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  // Review query
  const { data: orderReview, refetch: refetchReview } = useQuery<ReviewResponse | null>({
    queryKey: ['order-review', id],
    queryFn: () => axiosInstance.get(`/api/v1/orders/${id}/reviews`).then((res) => res.data).catch(() => null),
    enabled: !!id,
  });

  // Dispute query
  const { data: orderDispute, refetch: refetchDispute } = useQuery<DisputeResponse | null>({
    queryKey: ['order-dispute', id],
    queryFn: () => axiosInstance.get(`/api/v1/orders/${id}/disputes`).then((res) => res.data).catch(() => null),
    enabled: !!id,
  });

  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // Accessible Modal & Confirm Dialog states
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [dialogNotice, setDialogNotice] = useState<{
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

  // Fetch Order Details with dynamic polling when waiting for PayOS Webhook
  const { data: order, isLoading, isError, error } = useQuery<OrderDetailType>({
    queryKey: ['order-detail', id],
    queryFn: () => axiosInstance.get(`/api/v1/orders/${id}`).then((res) => res.data),
    enabled: !!id,
    refetchInterval: (query) => {
      const currentOrder = query.state.data as OrderDetailType | undefined;
      // Tự động polling mỗi 3 giây nếu đơn chưa thanh toán và đã tạo mã PayOS để webhook cập nhật ngay lập tức
      if (currentOrder && currentOrder.paymentStatus !== 'PAID' && currentOrder.paymentMethod === 'PAYOS') {
        return 3000;
      }
      return false;
    },
  });

  // Pickup Mutation
  const pickupMutation = useMutation({
    mutationFn: (code: string) =>
      axiosInstance.post(`/api/v1/orders/${id}/pickup`, { pickupCode: code }),
    onSuccess: () => {
      for (const key of ['product', 'products', 'my-products', 'lockers', 'locker', 'active-lockers-dropdown', 'order-detail', 'buying-orders', 'selling-orders', 'admin-dashboard-stats']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      setPickupErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      setPickupErrorMessage(err.response?.data?.message || 'Mã nhận hàng không chính xác');
    },
  });

  // Deposit Mutation
  const depositMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/api/v1/orders/${id}/deposit`),
    onSuccess: () => {
      for (const key of ['product', 'products', 'my-products', 'lockers', 'locker', 'active-lockers-dropdown', 'order-detail', 'buying-orders', 'selling-orders', 'admin-dashboard-stats']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['selling-orders'] });
    },
    onError: (err: any) => {
      setDialogNotice({
        isOpen: true,
        title: 'Lỗi gửi hàng',
        message: err.response?.data?.message || 'Không thể thực hiện gửi hàng',
        variant: 'danger',
      });
    },
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/api/v1/orders/${id}/cancel`),
    onSuccess: () => {
      for (const key of ['product', 'products', 'my-products', 'lockers', 'locker', 'active-lockers-dropdown', 'order-detail', 'buying-orders', 'selling-orders', 'admin-dashboard-stats']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
      setConfirmCancelOpen(false);
    },
    onError: (err: any) => {
      setConfirmCancelOpen(false);
      setDialogNotice({
        isOpen: true,
        title: 'Lỗi hủy đơn',
        message: err.response?.data?.message || 'Không thể hủy đơn',
        variant: 'danger',
      });
    },
  });

  // Rental Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedReturnLockerId, setSelectedReturnLockerId] = useState('');

  // Fetch active lockers for return dropdown
  const { data: activeLockers } = useQuery<{ id: number; name: string; location: string }[]>({
    queryKey: ['active-lockers-dropdown'],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/lockers', { params: { status: 'ACTIVE', size: 50 } })
        .then((res) => res.data.content || []),
    enabled: isReturnModalOpen,
  });

  // Initiate Return Mutation (Buyer reserves return locker)
  const initiateReturnMutation = useMutation({
    mutationFn: (lockerId: number) =>
      axiosInstance.post(`/api/v1/orders/${id}/initiate-return`, { lockerId }),
    onSuccess: () => {
      for (const key of ['product', 'products', 'my-products', 'lockers', 'locker', 'active-lockers-dropdown', 'order-detail', 'buying-orders', 'selling-orders', 'admin-dashboard-stats']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      setIsReturnModalOpen(false);
      setSelectedReturnLockerId('');
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
    },
    onError: (err: any) => {
      setDialogNotice({
        isOpen: true,
        title: 'Lỗi chọn tủ trả đồ',
        message: err.response?.data?.message || 'Không thể chọn tủ để trả đồ',
        variant: 'danger',
      });
    },
  });

  // Deposit Return Mutation (Buyer deposits item back into locker)
  const depositReturnMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/api/v1/orders/${id}/deposit-return`),
    onSuccess: () => {
      for (const key of ['product', 'products', 'my-products', 'lockers', 'locker', 'active-lockers-dropdown', 'order-detail', 'buying-orders', 'selling-orders', 'admin-dashboard-stats']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
    },
    onError: (err: any) => {
      setDialogNotice({
        isOpen: true,
        title: 'Lỗi xác nhận gửi trả',
        message: err.response?.data?.message || 'Không thể xác nhận gửi trả đồ',
        variant: 'danger',
      });
    },
  });

  // Pickup Return Mutation (Seller retrieves item and completes order)
  const pickupReturnMutation = useMutation({
    mutationFn: (code: string) =>
      axiosInstance.post(`/api/v1/orders/${id}/pickup-return`, { pickupCode: code }),
    onSuccess: () => {
      for (const key of ['product', 'products', 'my-products', 'lockers', 'locker', 'active-lockers-dropdown', 'order-detail', 'buying-orders', 'selling-orders', 'admin-dashboard-stats']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      setPickupErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['selling-orders'] });
    },
    onError: (err: any) => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      setPickupErrorMessage(err.response?.data?.message || 'Mã nhận lại đồ không chính xác');
    },
  });

  // Pay Order Mutation (Supports MOCK and PAYOS)
  const payMutation = useMutation({
    mutationFn: (paymentMethod: 'MOCK' | 'PAYOS') =>
      axiosInstance.post(`/api/v1/orders/${id}/pay`, { paymentMethod }).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
      if (data.message) {
        setPaymentNotice(data.message);
      }
    },
    onError: (err: any) => {
      setDialogNotice({
        isOpen: true,
        title: 'Lỗi thanh toán',
        message: err.response?.data?.message || 'Không thể khởi tạo thanh toán',
        variant: 'danger',
      });
    },
  });

  // Simulate PayOS Webhook Success (Local testing demo)
  const simulatePayOSSuccessMutation = useMutation({
    mutationFn: () =>
      axiosInstance.post(`/api/v1/orders/${id}/pay/simulate-success`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
      setPaymentNotice('Đã giả lập quét mã PayOS thành công! Đơn hàng đã chuyển sang trạng thái ĐÃ KÝ QUỸ.');
    },
    onError: (err: any) => {
      setDialogNotice({
        isOpen: true,
        title: 'Lỗi giả lập',
        message: err.response?.data?.message || 'Lỗi khi kích hoạt giả lập PayOS',
        variant: 'danger',
      });
    },
  });

  // Manual payment status check button
  const handleManualCheckPayment = async () => {
    setIsCheckingPayment(true);
    try {
      const res = await axiosInstance.get(`/api/v1/orders/${id}/payment-status`);
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      if (res.data.paymentStatus === 'PAID') {
        setPaymentNotice('Thanh toán thành công! Tiền cọc/tiền hàng đã được giữ an toàn trong ví Escrow.');
      } else {
        setDialogNotice({
          isOpen: true,
          title: 'Trạng thái thanh toán',
          message: 'Giao dịch chưa hoàn tất hoặc tiền chưa vào tài khoản. Vui lòng thử lại sau vài giây.',
          variant: 'warning',
        });
      }
    } catch {
      setDialogNotice({
        isOpen: true,
        title: 'Lỗi kiểm tra',
        message: 'Không thể kiểm tra trạng thái thanh toán lúc này. Vui lòng thử lại sau.',
        variant: 'danger',
      });
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const isBuyer = Boolean(order && user && order.buyerUsername === user.username);
  const isSeller = Boolean(order && user && order.sellerUsername === user.username);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStepStatus = (stepKey: OrderStatus) => {
    if (!order) return 'upcoming';
    if (order.status === 'CANCELLED' || order.status === 'REJECTED' || order.status === 'EXPIRED') {
      return 'cancelled';
    }

    if (order.status === 'COMPLETED') return 'completed';

    const orderSteps: OrderStatus[] = order.orderType === 'RENTAL'
      ? ['PENDING_SELLER', 'READY_FOR_PICKUP', 'RENTING', 'AWAITING_RETURN_DEPOSIT', 'COMPLETED']
      : ['PENDING_SELLER', 'AWAITING_DEPOSIT', 'READY_FOR_PICKUP', 'COMPLETED'];

    const currentIndex = orderSteps.indexOf(order.status);
    const stepIndex = orderSteps.indexOf(stepKey);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'upcoming';
  };

  const handleKeypadPress = (val: string) => {
    if (pickupCodeInput.length < 6) {
      setPickupCodeInput((prev) => prev + val);
    }
  };

  const handleKeypadClear = () => {
    setPickupCodeInput('');
    setPickupErrorMessage('');
  };

  const handleCopyCode = () => {
    if (order?.pickupCode) {
      navigator.clipboard.writeText(order.pickupCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500 font-medium">Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (isError || !order) {
    const errorStatus = (error as any)?.response?.status;
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-lg border border-slate-200 text-center shadow-2xs space-y-4">
        <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {errorStatus === 403 ? 'Không có quyền truy cập' : 'Không tìm thấy đơn hàng'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {errorStatus === 403
              ? 'Bạn không phải là người mua hoặc người bán của đơn hàng này.'
              : 'Đơn hàng không tồn tại hoặc đã bị xóa khỏi hệ thống.'}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-800 transition shadow-2xs"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 sm:py-8 font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <p role="status" className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-2xs">
          Chế độ mô phỏng Smart Locker: thao tác gửi và nhận hàng chưa điều khiển thiết bị vật lý.
        </p>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition">
            Trang chủ
          </Link>
          <span>/</span>
          <Link
            to={isSeller ? '/orders/selling' : '/orders/buying'}
            className="hover:text-slate-900 transition"
          >
            {isSeller ? 'Đơn bán' : 'Đơn mua'}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-mono font-medium">{order.orderNumber}</span>
        </nav>

        {/* Header Info Banner */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Chi tiết đơn hàng
                </h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold border border-slate-200">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Khởi tạo lúc: {formatDate(order.createdAt)} • Phiên giao dịch #{order.id}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 bg-slate-50 text-slate-700">
                {order.orderType === 'RENTAL' ? `Đơn thuê (${order.rentalDurationDays} ngày)` : 'Đơn mua đứt'}
              </span>

              {/* Escrow Payment Badge */}
              {order.paymentStatus === 'PAID' ? (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  Đã ký quỹ ({order.paymentMethod === 'PAYOS' ? 'VietQR PayOS' : 'Giả lập'})
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-500" />
                  Chờ ký quỹ cọc/tiền hàng
                </span>
              )}

              {order.status === 'EXPIRED' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <AlertTriangle size={13} /> Quá hạn nhận đồ
                </span>
              )}
              {order.status === 'CANCELLED' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <XCircle size={13} /> Đã hủy đơn
                </span>
              )}
              {order.status === 'REJECTED' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <XCircle size={13} /> Người bán từ chối
                </span>
              )}
              {order.status === 'COMPLETED' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Hoàn tất giao dịch
                </span>
              )}
              {order.status === 'READY_FOR_PICKUP' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-white flex items-center gap-1">
                  <Lock size={13} /> Đang ở tủ chờ nhận
                </span>
              )}
              {order.status === 'AWAITING_DEPOSIT' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                  <Package size={13} /> Chờ người bán gửi tủ
                </span>
              )}
              {order.status === 'PENDING_SELLER' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Clock size={13} /> Chờ xác nhận
                </span>
              )}
              {order.status === 'RENTING' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                  <Clock size={13} /> Đang trong hạn thuê
                </span>
              )}
              {order.status === 'AWAITING_RETURN_DEPOSIT' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                  <Package size={13} /> Chờ gửi trả vào tủ
                </span>
              )}
              {order.status === 'READY_FOR_RETURN_PICKUP' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-white flex items-center gap-1">
                  <Lock size={13} /> Đồ đã trả về tủ
                </span>
              )}
            </div>
          </div>

          {/* Stepper / Timeline */}
          {order.status !== 'CANCELLED' && order.status !== 'REJECTED' && order.status !== 'EXPIRED' ? (
            <div className="pt-6 border-t border-slate-100">
              <div
                className={
                  order.orderType === 'RENTAL'
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4'
                    : 'grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'
                }
              >
                {(order.orderType === 'RENTAL' ? rentalStepConfig : purchaseStepConfig).map((s, idx) => {
                  const status = getStepStatus(s.key);
                  return (
                    <div key={s.key} className="flex flex-col items-center text-center relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs mb-2 transition-all ${
                          status === 'completed'
                            ? 'bg-slate-900 text-white'
                            : status === 'current'
                            ? 'border-2 border-slate-900 text-slate-900 bg-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {status === 'completed' ? <Check size={14} /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs ${
                          status === 'current'
                            ? 'font-bold text-slate-900'
                            : status === 'completed'
                            ? 'font-medium text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {s.label}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5">{s.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : order.status === 'EXPIRED' ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Đơn hàng đã hết hạn nhận hàng:</strong>
                <span>
                  Mã PIN 6 số đã hết hiệu lực bảo mật. Kiện hàng hiện vẫn được lưu giữ an toàn bên trong ngăn tủ và chờ ban quản trị kiểm tra xử lý thu hồi trước khi giải phóng tủ.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs flex items-start gap-2.5">
              <XCircle size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Giao dịch đã kết thúc:</strong>
                <span>
                  {order.rejectionReason ||
                    (order.status === 'CANCELLED'
                      ? 'Người mua đã chủ động hủy đơn hàng.'
                      : 'Người bán từ chối tiếp nhận giao dịch này.')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product & Transaction Snapshot (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Product Card */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sản phẩm giao dịch
              </h2>

              <div className="flex gap-4 items-center">
                {order.productImageUrl ? (
                  <img
                    src={order.productImageUrl}
                    alt={order.productTitle}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageOff size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/marketplace/${order.productId}`}
                    className="text-base font-semibold text-slate-900 hover:text-slate-600 transition block truncate"
                  >
                    {order.productTitle}
                  </Link>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {formatPrice(order.priceSnapshot)}
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Giá niêm yết tại thời điểm tạo đơn (Snapshot bảo lưu)
                  </span>
                </div>
              </div>

              {/* Rental Breakdown Card */}
              {order.orderType === 'RENTAL' && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-500" /> Gói thuê qua Smart Locker
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {order.rentalDurationDays} ngày thuê
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 block">Đơn giá thuê theo ngày</span>
                      <strong className="text-slate-900 font-bold block text-sm">
                        {order.rentalDurationDays && order.rentalDurationDays > 0
                          ? formatPrice(Math.round((order.priceSnapshot || 0) / order.rentalDurationDays))
                          : formatPrice(order.priceSnapshot || 0)}
                        /ngày
                      </strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 block">Tiền cọc bảo đảm (hoàn lại)</span>
                      <strong className="text-slate-900 font-bold block text-sm">
                        {formatPrice(order.depositAmount || 0)}
                      </strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 block">Phí dịch vụ nền tảng</span>
                      <strong className="text-slate-700 font-medium block">
                        {formatPrice(order.platformFee || 0)}
                      </strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-slate-500 block">Thực nhận người cho thuê</span>
                      <strong className="text-slate-900 font-medium block">
                        {formatPrice(order.sellerPayout || 0)}
                      </strong>
                    </div>
                  </div>

                  {(order.pickedUpAt || order.dueReturnAt) && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                      {order.pickedUpAt && (
                        <div>
                          Thời điểm nhận đồ & kích hoạt:{' '}
                          <strong className="font-semibold text-slate-900">{formatDate(order.pickedUpAt)}</strong>
                        </div>
                      )}
                      {order.dueReturnAt && (
                        <div>
                          Hạn chót hoàn trả vào tủ:{' '}
                          <strong className="font-semibold text-slate-900">{formatDate(order.dueReturnAt)}</strong>
                        </div>
                      )}
                    </div>
                  )}

                  {order.returnLockerName && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider block text-slate-500">
                          Tủ Locker hoàn trả
                        </span>
                        <strong className="block text-sm text-slate-900">{order.returnLockerName}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">Ngăn tủ</span>
                        <span className="text-base font-bold font-mono text-slate-900">
                          {order.returnCompartmentCode || 'Đang cấp'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Counterparties */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Người bán</span>
                  <strong className="text-slate-900 font-semibold block">{order.sellerFullName}</strong>
                  <span className="text-slate-500 font-mono text-[11px]">@{order.sellerUsername}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 block">Người mua</span>
                  <strong className="text-slate-900 font-semibold block">{order.buyerFullName}</strong>
                  <span className="text-slate-500 font-mono text-[11px]">@{order.buyerUsername}</span>
                </div>
              </div>
            </div>

            {/* Smart Locker Location & Station Details */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-600" />
                Địa điểm Smart Locker
              </h2>

              {order.lockerName ? (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-sm font-semibold text-slate-900">{order.lockerName}</div>
                    <div className="text-xs text-slate-600">{order.lockerLocation}</div>
                    <div className="text-[11px] font-mono text-slate-400 pt-0.5">
                      Mã trạm tủ: {order.lockerCode}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Ngăn tủ chỉ định
                      </span>
                      <span className="text-xl font-bold text-slate-900 font-mono">
                        {order.compartmentCode || 'Đang cấp'}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                      <Lock size={18} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                  Ngăn tủ sẽ được tự động phân bổ ngay sau khi người bán xác nhận đơn hàng.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Keypad Terminal, Actions & Secret PIN (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* ESCROW & PAYMENT CARD */}
            {order.paymentStatus === 'PAID' ? (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Ký quỹ bảo chứng (Escrow)
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Tiền cọc & tiền hàng đã được giữ an toàn
                    </h3>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tổng tiền ký quỹ:</span>
                    <strong className="text-base font-bold text-slate-900">
                      {formatPrice(order.totalAmount || (order.priceSnapshot + (order.depositAmount || 0)))}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Phương thức:</span>
                    <span className="font-semibold text-slate-800">
                      {order.paymentMethod === 'PAYOS' ? 'VietQR (Cổng PayOS)' : 'Thanh toán giả lập (Demo)'}
                    </span>
                  </div>
                  {order.paymentPaidAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Thời điểm thanh toán:</span>
                      <span className="text-slate-700">{formatDate(order.paymentPaidAt)}</span>
                    </div>
                  )}
                  {order.payosOrderCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Mã đơn PayOS:</span>
                      <span className="font-mono text-slate-700">{order.payosOrderCode}</span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/70 flex items-start gap-2.5">
                  <CheckCircle size={15} className="text-slate-500 shrink-0 mt-0.5" />
                  <span>
                    Khoản tiền đang được giữ trong quỹ bảo chứng của CampusHub và chỉ giải ngân cho người bán sau khi đơn hàng hoàn tất đúng quy trình.
                  </span>
                </div>
              </div>
            ) : isBuyer ? (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                        Ký quỹ thanh toán (Escrow)
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        Thanh toán cọc / tiền hàng
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Cần thanh toán</span>
                    <span className="text-base sm:text-lg font-bold text-slate-900">
                      {formatPrice(order.totalAmount || (order.priceSnapshot + (order.depositAmount || 0)))}
                    </span>
                  </div>
                </div>

                {paymentNotice && (
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center justify-between">
                    <span>{paymentNotice}</span>
                    <button onClick={() => setPaymentNotice(null)} className="text-slate-400 hover:text-slate-700">
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* 2-Stream Selector Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('PAYOS')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      selectedPaymentMethod === 'PAYOS'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <QrCode size={14} /> Quét VietQR (PayOS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('MOCK')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      selectedPaymentMethod === 'MOCK'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles size={14} /> Giả lập tức thì
                  </button>
                </div>

                {/* Stream 1: VietQR PayOS */}
                {selectedPaymentMethod === 'PAYOS' && (
                  <div className="space-y-4 pt-1">
                    {order.qrCode || order.checkoutUrl ? (
                      <div className="text-center space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {order.qrCode && (
                          <div className="relative inline-block">
                            <img
                              src={order.qrCode}
                              alt="VietQR PayOS"
                              className="w-44 h-44 mx-auto rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs"
                            />
                            <div className="text-[11px] font-medium text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
                              Quét bằng ứng dụng ngân hàng bất kỳ
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-slate-600 space-y-1.5 text-left bg-white p-3.5 rounded-xl border border-slate-200">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Số tiền:</span>
                            <strong className="text-slate-900 font-bold">
                              {formatPrice(order.totalAmount || (order.priceSnapshot + (order.depositAmount || 0)))}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Mã đơn PayOS:</span>
                            <span className="font-mono text-slate-800 font-medium">{order.payosOrderCode}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                            Trạng thái sẽ tự động cập nhật khi tiền được chuyển vào tài khoản bảo chứng.
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          {order.checkoutUrl && (
                            <a
                              href={order.checkoutUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              <ExternalLink size={14} /> Mở cổng thanh toán PayOS
                            </a>
                          )}
                          <button
                            type="button"
                            disabled={isCheckingPayment}
                            onClick={handleManualCheckPayment}
                            className="py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium border border-slate-200 rounded-xl text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <RefreshCw size={13} className={isCheckingPayment ? 'animate-spin' : ''} />
                            Kiểm tra kết quả
                          </button>
                        </div>

                        {/* Demo helper button when running locally */}
                        <div className="pt-2 border-t border-slate-200/80">
                          <button
                            type="button"
                            disabled={simulatePayOSSuccessMutation.isPending}
                            onClick={() => simulatePayOSSuccessMutation.mutate()}
                            className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={13} className="text-slate-500" />
                            {simulatePayOSSuccessMutation.isPending ? 'Đang kích hoạt...' : 'Mô phỏng thanh toán thành công (Test Webhook)'}
                          </button>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Dành cho kiểm thử cục bộ khi chưa cấu hình Webhook public domain
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Tạo mã VietQR động được bảo chứng bởi cổng thanh toán PayOS. Bạn có thể mở ứng dụng ngân hàng quét mã để ký quỹ ngay tức thì.
                        </p>
                        <button
                          type="button"
                          disabled={payMutation.isPending}
                          onClick={() => payMutation.mutate('PAYOS')}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
                        >
                          {payMutation.isPending ? (
                            <span>Đang kết nối PayOS...</span>
                          ) : (
                            <>
                              <QrCode size={16} /> Tạo mã thanh toán VietQR (PayOS)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Stream 2: Mock Simulated Payment */}
                {selectedPaymentMethod === 'MOCK' && (
                  <div className="space-y-4 pt-1">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                      <strong className="block font-semibold text-slate-900">Chế độ giả lập (Demo Testing):</strong>
                      <span>
                        Hệ thống sẽ ngay lập tức ghi nhận đơn hàng đã thanh toán và chuyển trạng thái tiền cọc vào quỹ ký quỹ mà không cần chuyển khoản thực tế.
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={payMutation.isPending}
                      onClick={() => payMutation.mutate('MOCK')}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
                    >
                      {payMutation.isPending ? (
                        <span>Đang xử lý giả lập...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={16} /> Xác nhận thanh toán ngay (Giả lập)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : isSeller ? (
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                  <Clock size={16} className="text-slate-500" />
                  Chờ người mua ký quỹ thanh toán
                </div>
                <p className="leading-relaxed">
                  Người mua đang thực hiện thanh toán tiền cọc/tiền hàng vào quỹ bảo chứng CampusHub. Bạn sẽ nhận được thông báo để gửi đồ vào tủ ngay khi tiền được bảo đảm an toàn.
                </p>
              </div>
            ) : null}

            {/* Buyer Pickup Terminal Flow */}
            {order.status === 'READY_FOR_PICKUP' && (
              <div className="bg-slate-900 text-white rounded-lg p-6 shadow-sm border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-slate-400" />
                    <span className="text-xs uppercase font-semibold tracking-wider text-slate-300">
                      Smart Locker Terminal
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                      MÔ PHỎNG
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/15 rounded-full">
                    SẴN SÀNG LẤY ĐỒ
                  </span>
                </div>

                {/* Secret Pickup PIN for Buyer */}
                {isBuyer && order.pickupCode && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center space-y-2">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Mã PIN lấy đồ (6 chữ số)
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-mono text-3xl font-bold text-white tracking-widest">
                        {order.pickupCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition flex items-center gap-1"
                        title="Sao chép mã"
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    {order.pickupDeadline && (
                      <span className="text-[11px] text-slate-400 block">
                        Hạn lấy đồ: {formatDate(order.pickupDeadline)}
                      </span>
                    )}
                  </div>
                )}

                {/* Keypad Touch Screen Simulator */}
                <div className="bg-black/30 rounded-xl p-4 border border-white/10 space-y-4">
                  <div className="text-center space-y-1.5">
                    <span className="text-[11px] text-slate-400">
                      Màn hình cảm ứng trạm tủ Locker
                    </span>
                    <div className="bg-slate-950 border border-slate-700/60 rounded-xl p-3 font-mono text-center">
                      <span className="text-2xl font-bold tracking-widest text-white">
                        {pickupCodeInput || '------'}
                      </span>
                    </div>
                    {pickupErrorMessage && (
                      <div className="text-xs text-rose-400 font-medium flex items-center justify-center gap-1 pt-1">
                        <AlertTriangle size={13} /> {pickupErrorMessage}
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => handleKeypadPress(digit)}
                        className="py-2.5 bg-white/10 hover:bg-white/15 active:bg-white/25 rounded-xl font-mono text-base font-semibold transition text-white"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      onClick={handleKeypadClear}
                      className="py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => handleKeypadPress('0')}
                      className="py-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-mono text-base font-semibold text-white transition"
                    >
                      0
                    </button>
                    <button
                      disabled={pickupCodeInput.length !== 6 || pickupMutation.isPending}
                      onClick={() => pickupMutation.mutate(pickupCodeInput)}
                      className="py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold disabled:opacity-30 transition"
                    >
                      {pickupMutation.isPending ? '...' : 'OK'}
                    </button>
                  </div>

                  <button
                    disabled={pickupCodeInput.length !== 6 || pickupMutation.isPending}
                    onClick={() => pickupMutation.mutate(pickupCodeInput)}
                    className="w-full py-3 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-xl transition text-xs sm:text-sm disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    {pickupMutation.isPending ? (
                      <span>Đang mở chốt khóa ngăn tủ...</span>
                    ) : (
                      <>
                        <KeyRound size={16} /> Xác nhận mở ngăn tủ lấy hàng
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Rental Active: Renting Period State */}
            {order.status === 'RENTING' && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Đang trong thời gian thuê</h3>
                    <p className="text-xs text-slate-500">
                      Gói thuê {order.rentalDurationDays} ngày • Hạn trả:{' '}
                      <strong className="text-slate-900 font-semibold">{formatDate(order.dueReturnAt)}</strong>
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Bắt đầu tính thời hạn:</span>
                    <strong className="text-slate-800 font-medium">{formatDate(order.pickedUpAt)}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Hạn chót hoàn trả:</span>
                    <strong className="text-slate-900 font-bold">{formatDate(order.dueReturnAt)}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tiền cọc bảo đảm:</span>
                    <strong className="text-slate-900 font-bold">{formatPrice(order.depositAmount || 0)}</strong>
                  </div>
                </div>

                {isBuyer ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">
                      Bạn có thể hoàn trả sản phẩm bất kỳ lúc nào trước hạn chót bằng cách gửi vào một trạm tủ Smart Locker.
                    </p>
                    <button
                      onClick={() => setIsReturnModalOpen(true)}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <RotateCcw size={16} /> Chọn tủ Locker để hoàn trả đồ
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 text-center">
                    Người thuê đang sử dụng sản phẩm. Hệ thống sẽ thông báo ngay khi người thuê gửi trả vào tủ Smart Locker.
                  </div>
                )}
              </div>
            )}

            {/* Buyer Deposit Return Item Into Locker */}
            {order.status === 'AWAITING_RETURN_DEPOSIT' && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Gửi trả đồ vào Smart Locker</h3>
                    <p className="text-xs text-slate-500">
                      Vui lòng mang đồ tới trạm tủ đã chỉ định để trả
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Trạm tủ trả đồ:</span>
                    <strong className="text-slate-900 font-semibold">{order.returnLockerName}</strong>
                  </div>
                  {order.returnLockerLocation && (
                    <div className="text-slate-500 text-[11px]">{order.returnLockerLocation}</div>
                  )}
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200">
                    <span className="text-slate-600 font-medium">Ngăn tủ chỉ định:</span>
                    <strong className="text-slate-900 font-mono text-base font-bold">
                      {order.returnCompartmentCode}
                    </strong>
                  </div>
                </div>

                {isBuyer ? (
                  <button
                    disabled={depositReturnMutation.isPending}
                    onClick={() => depositReturnMutation.mutate()}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs sm:text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xs"
                  >
                    {depositReturnMutation.isPending ? (
                      <span>Đang mở tủ và xác nhận trả đồ...</span>
                    ) : (
                      <>
                        <Lock size={15} /> Xác nhận đã đặt đồ vào ngăn {order.returnCompartmentCode}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 text-center">
                    Người thuê đã chỉ định trạm tủ và đang thực hiện gửi đồ trả lại ngăn tủ.
                  </div>
                )}
              </div>
            )}

            {/* Seller Return Pickup Terminal Flow */}
            {order.status === 'READY_FOR_RETURN_PICKUP' && (
              <div className="bg-slate-900 text-white rounded-lg p-6 shadow-sm border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-slate-400" />
                    <span className="text-xs uppercase font-semibold tracking-wider text-slate-300">
                      Locker Return Terminal
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md">
                      MÔ PHỎNG
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/15 rounded-full">
                    SẴN SÀNG NHẬN LẠI ĐỒ
                  </span>
                </div>

                {/* Secret Return Pickup PIN for Seller */}
                {isSeller && (order.pickupCode || order.returnPickupCode) && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center space-y-2">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Mã PIN lấy lại đồ (6 chữ số)
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-mono text-3xl font-bold text-white tracking-widest">
                        {order.pickupCode || order.returnPickupCode}
                      </span>
                      <button
                        onClick={() => {
                          const code = order.pickupCode || order.returnPickupCode;
                          if (code) {
                            navigator.clipboard.writeText(code);
                            setIsCopied(true);
                            setTimeout(() => setIsCopied(false), 2000);
                          }
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white transition flex items-center gap-1"
                        title="Sao chép mã"
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      Tủ: {order.returnLockerName} • Ngăn: {order.returnCompartmentCode}
                    </span>
                  </div>
                )}

                {/* Buyer waiting notice */}
                {isBuyer && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center space-y-2 text-xs">
                    <p className="text-slate-200 font-semibold">
                      Bạn đã hoàn trả đồ vào ngăn {order.returnCompartmentCode} tại tủ {order.returnLockerName}!
                    </p>
                    <p className="text-slate-400">
                      Đang đợi chủ sở hữu tới trạm tủ mở ngăn lấy lại đồ để hoàn tất tất toán và hoàn tiền cọc cho bạn.
                    </p>
                  </div>
                )}

                {/* Keypad Touch Screen Simulator for Seller */}
                {isSeller && (
                  <div className="bg-black/30 rounded-xl p-4 border border-white/10 space-y-4">
                    <div className="text-center space-y-1.5">
                      <span className="text-[11px] text-slate-400">
                        Màn hình cảm ứng tại trạm {order.returnLockerName}
                      </span>
                      <div className="bg-slate-950 border border-slate-700/60 rounded-xl p-3 font-mono text-center">
                        <span className="text-2xl font-bold tracking-widest text-white">
                          {pickupCodeInput || '------'}
                        </span>
                      </div>
                      {pickupErrorMessage && (
                        <div className="text-xs text-rose-400 font-medium flex items-center justify-center gap-1 pt-1">
                          <AlertTriangle size={13} /> {pickupErrorMessage}
                        </div>
                      )}
                    </div>

                    {/* Keypad Buttons */}
                    <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                          key={digit}
                          onClick={() => handleKeypadPress(digit)}
                          className="py-2.5 bg-white/10 hover:bg-white/15 active:bg-white/25 rounded-xl font-mono text-base font-semibold transition text-white"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        onClick={handleKeypadClear}
                        className="py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition"
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => handleKeypadPress('0')}
                        className="py-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-mono text-base font-semibold text-white transition"
                      >
                        0
                      </button>
                      <button
                        disabled={pickupCodeInput.length !== 6 || pickupReturnMutation.isPending}
                        onClick={() => pickupReturnMutation.mutate(pickupCodeInput)}
                        className="py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-semibold disabled:opacity-30 transition"
                      >
                        {pickupReturnMutation.isPending ? '...' : 'OK'}
                      </button>
                    </div>

                    <button
                      disabled={pickupCodeInput.length !== 6 || pickupReturnMutation.isPending}
                      onClick={() => pickupReturnMutation.mutate(pickupCodeInput)}
                      className="w-full py-3 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-xl transition text-xs sm:text-sm disabled:opacity-30 flex items-center justify-center gap-2"
                    >
                      {pickupReturnMutation.isPending ? (
                        <span>Đang kích hoạt chốt khóa mở ngăn...</span>
                      ) : (
                        <>
                          <KeyRound size={16} /> Mở ngăn nhận lại đồ & hoàn tất đơn
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Seller Deposit Item Action */}
            {order.status === 'AWAITING_DEPOSIT' && isSeller && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Gửi hàng vào tủ</h3>
                    <p className="text-xs text-slate-500">
                      Người mua đang đợi bạn đặt hàng vào tủ locker
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div>
                    Tủ đồ: <strong className="text-slate-900">{order.lockerName}</strong>
                  </div>
                  <div>
                    Ngăn phân bổ:{' '}
                    <strong className="text-slate-900 font-bold">{order.compartmentCode}</strong>
                  </div>
                </div>

                <button
                  disabled={depositMutation.isPending}
                  onClick={() => depositMutation.mutate()}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs sm:text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xs"
                >
                  {depositMutation.isPending ? (
                    <span>Đang mở tủ và xác nhận cảm biến...</span>
                  ) : (
                    <>
                      <Lock size={15} /> Xác nhận đã đặt đồ vào ngăn {order.compartmentCode}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Buyer Cancel if still PENDING_SELLER */}
            {order.status === 'PENDING_SELLER' && isBuyer && (
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hủy đơn đặt mua</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đơn hàng đang chờ người bán xác nhận. Bạn có thể chủ động hủy nếu đổi ý.
                  </p>
                </div>
                <button
                  disabled={cancelMutation.isPending}
                  onClick={() => setConfirmCancelOpen(true)}
                  className="w-full py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-medium transition disabled:opacity-50"
                >
                  {cancelMutation.isPending ? 'Đang hủy...' : 'Hủy đơn hàng'}
                </button>
              </div>
            )}

            {/* Dispute Status Banner if exists */}
            {orderDispute && (
              <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    Khiếu nại đơn hàng
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-rose-700 border border-rose-200">
                    {orderDispute.status === 'OPEN'
                      ? 'Đang chờ xử lý'
                      : orderDispute.status === 'RESOLVED_REFUND_BUYER'
                      ? 'Đã hoàn tiền Người mua'
                      : 'Đã giải ngân Người bán'}
                  </span>
                </div>
                <p className="text-xs text-rose-900 font-medium">{orderDispute.description}</p>
                {orderDispute.adminNote && (
                  <div className="text-[11px] text-slate-600 bg-white/80 p-2 rounded border border-rose-100">
                    <strong>Phán quyết Admin:</strong> {orderDispute.adminNote}
                  </div>
                )}
              </div>
            )}

            {/* Completed State Celebration Card */}
            {order.status === 'COMPLETED' && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center space-y-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 mx-auto flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Giao dịch thành công</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hàng hóa đã được lấy thành công vào lúc {formatDate(order.pickedUpAt)}. Ngăn tủ đã được giải phóng trở lại trạng thái sẵn sàng.
                  </p>
                </div>

                {/* Buyer Review Section */}
                {orderReview ? (
                  <div className="p-3 bg-white rounded-md border border-slate-200 text-left space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Đánh giá của bạn:</span>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= orderReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                          />
                        ))}
                      </div>
                    </div>
                    {orderReview.comment && (
                      <p className="text-xs text-slate-600 italic">"{orderReview.comment}"</p>
                    )}
                  </div>
                ) : isBuyer ? (
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow-2xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Star size={14} className="fill-white" />
                    Đánh giá người bán
                  </button>
                ) : null}
              </div>
            )}

            {/* Dispute Report Button for Buyer */}
            {isBuyer && !orderDispute && (order.status === 'READY_FOR_PICKUP' || order.status === 'COMPLETED' || order.status === 'EXPIRED') && (
              <button
                onClick={() => setIsDisputeModalOpen(true)}
                className="w-full py-2 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                <ShieldAlert size={14} />
                Báo cáo sự cố / Khiếu nại đơn này
              </button>
            )}

            {/* Expired State Warning Card */}
            {order.status === 'EXPIRED' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 mx-auto flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Mã nhận đồ đã quá hạn</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thời hạn nhận đồ tại trạm tủ đã kết thúc. Vui lòng liên hệ ban quản trị để được hỗ trợ kiểm tra và nhận lại kiện hàng.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return Locker Selection Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <RotateCcw size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Chọn tủ Smart Locker để trả đồ</h3>
                  <p className="text-xs text-slate-500">Hệ thống sẽ cấp một ngăn trống tại trạm bạn chọn</p>
                </div>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Chọn trạm Smart Locker tiện lợi cho bạn:
              </label>

              {activeLockers && activeLockers.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {activeLockers.map((locker) => (
                    <label
                      key={locker.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                        selectedReturnLockerId === String(locker.id)
                          ? 'border-slate-900 bg-slate-50 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="returnLocker"
                        value={locker.id}
                        checked={selectedReturnLockerId === String(locker.id)}
                        onChange={(e) => setSelectedReturnLockerId(e.target.value)}
                        className="mt-1 accent-slate-900"
                      />
                      <div className="flex-1 text-xs">
                        <strong className="text-slate-900 font-semibold block">{locker.name}</strong>
                        <span className="text-slate-500 mt-0.5 block">{locker.location}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Đang tìm các trạm tủ Smart Locker khả dụng...
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={!selectedReturnLockerId || initiateReturnMutation.isPending}
                onClick={() => initiateReturnMutation.mutate(Number(selectedReturnLockerId))}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {initiateReturnMutation.isPending ? 'Đang cấp ngăn tủ...' : 'Xác nhận giữ ngăn trả'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessible Cancellation Dialog */}
      <ConfirmDialog
        isOpen={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={() => {
          setConfirmCancelOpen(false);
          cancelMutation.mutate();
        }}
        title="Xác nhận hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn đặt mua này? Hành động này sẽ cập nhật trạng thái đơn sang ĐÃ HỦY."
        confirmText="Xác nhận hủy"
        cancelText="Đóng"
        variant="danger"
        isLoading={cancelMutation.isPending}
      />

      {/* Accessible Notice Dialog for errors & warnings */}
      <ConfirmDialog
        isOpen={dialogNotice.isOpen}
        onClose={() => setDialogNotice((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => setDialogNotice((prev) => ({ ...prev, isOpen: false }))}
        title={dialogNotice.title}
        message={dialogNotice.message}
        confirmText="Đã hiểu"
        cancelText="Đóng"
        variant={dialogNotice.variant}
      />

      {/* Review Modal */}
      {id && (
        <ReviewModal
          orderId={Number(id)}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => refetchReview()}
        />
      )}

      {/* Dispute Modal */}
      {id && (
        <DisputeModal
          orderId={Number(id)}
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          onSuccess={() => refetchDispute()}
        />
      )}
    </div>
  );
};
