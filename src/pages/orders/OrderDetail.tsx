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
  Radio,
} from 'lucide-react';

const stepConfig: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'PENDING_SELLER', label: '1. Đặt hàng', desc: 'Chờ người bán xác nhận' },
  { key: 'AWAITING_DEPOSIT', label: '2. Cấp tủ đồ', desc: 'Chờ gửi hàng vào locker' },
  { key: 'READY_FOR_PICKUP', label: '3. Sẵn sàng lấy', desc: 'Nhập mã nhận đồ tại tủ' },
  { key: 'COMPLETED', label: '4. Hoàn tất', desc: 'Giao dịch thành công' },
];

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Pickup terminal keypad state
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [pickupErrorMessage, setPickupErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  // Fetch Order Details
  const { data: order, isLoading, isError, error } = useQuery<OrderDetailType>({
    queryKey: ['order-detail', id],
    queryFn: () => axiosInstance.get(`/api/v1/orders/${id}`).then((res) => res.data),
    enabled: !!id,
  });

  // Pickup Mutation
  const pickupMutation = useMutation({
    mutationFn: (code: string) =>
      axiosInstance.post(`/api/v1/orders/${id}/pickup`, { pickupCode: code }),
    onSuccess: () => {
      setPickupErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
    },
    onError: (err: any) => {
      setPickupErrorMessage(err.response?.data?.message || 'Mã nhận hàng không chính xác');
    },
  });

  // Deposit Mutation
  const depositMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/api/v1/orders/${id}/deposit`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['selling-orders'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Không thể thực hiện gửi hàng');
    },
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: () => axiosInstance.post(`/api/v1/orders/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Không thể hủy đơn');
    },
  });

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

    const orderSteps: OrderStatus[] = [
      'PENDING_SELLER',
      'AWAITING_DEPOSIT',
      'READY_FOR_PICKUP',
      'COMPLETED',
    ];
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
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500">Đang tải chi tiết phiên giao dịch...</p>
      </div>
    );
  }

  if (isError || !order) {
    const errorStatus = (error as any)?.response?.status;
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
          <AlertTriangle size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {errorStatus === 403 ? 'Không có quyền truy cập' : 'Không tìm thấy đơn hàng'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {errorStatus === 403
              ? 'Bạn không phải là người mua hoặc người bán của đơn hàng này.'
              : 'Đơn hàng không tồn tại hoặc đã bị xóa khỏi hệ thống.'}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-purple-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link
            to={isSeller ? '/orders/selling' : '/orders/buying'}
            className="hover:text-purple-600"
          >
            {isSeller ? 'Đơn bán' : 'Đơn mua'}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-mono font-bold">{order.orderNumber}</span>
        </nav>

        {/* Header Info Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Chi tiết đơn hàng
                </h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-bold">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Khởi tạo lúc: {formatDate(order.createdAt)} • Phiên giao dịch #{order.id}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {order.status === 'EXPIRED' && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200 flex items-center gap-1">
                  <AlertTriangle size={13} /> Quá hạn nhận đồ
                </span>
              )}
              {order.status === 'CANCELLED' && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                  <XCircle size={13} /> Đã hủy đơn
                </span>
              )}
              {order.status === 'REJECTED' && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                  <XCircle size={13} /> Người bán từ chối
                </span>
              )}
              {order.status === 'COMPLETED' && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Hoàn tất nhận đồ
                </span>
              )}
              {order.status === 'READY_FOR_PICKUP' && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-300 animate-pulse flex items-center gap-1">
                  <Lock size={13} /> Đang ở tủ chờ nhận
                </span>
              )}
              {order.status === 'AWAITING_DEPOSIT' && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <Package size={13} /> Chờ người bán gửi tủ
                </span>
              )}
              {order.status === 'PENDING_SELLER' && (
                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Clock size={13} /> Chờ xác nhận
                </span>
              )}
            </div>
          </div>

          {/* Stepper / Timeline */}
          {order.status !== 'CANCELLED' && order.status !== 'REJECTED' && order.status !== 'EXPIRED' ? (
            <div className="pt-6 border-t border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stepConfig.map((s, idx) => {
                  const status = getStepStatus(s.key);
                  return (
                    <div key={s.key} className="flex flex-col items-center text-center relative">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                          status === 'completed'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : status === 'current'
                            ? 'bg-purple-600 text-white ring-4 ring-purple-100 shadow-xs'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {status === 'completed' ? <Check size={16} /> : idx + 1}
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          status === 'current'
                            ? 'text-purple-600'
                            : status === 'completed'
                            ? 'text-slate-900'
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
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 text-xs flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-orange-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Đơn hàng đã hết hạn nhận hàng:</strong>
                <span>
                  Mã PIN 6 số đã hết hiệu lực bảo mật. Kiện hàng hiện vẫn được lưu giữ an toàn bên trong ngăn tủ và chờ ban quản trị kiểm tra xử lý thu hồi trước khi giải phóng tủ.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <XCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Giao dịch đã kết thúc:</strong>
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
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Sản phẩm giao dịch
              </h2>

              <div className="flex gap-4 items-center">
                {order.productImageUrl ? (
                  <img
                    src={order.productImageUrl}
                    alt={order.productTitle}
                    className="w-20 h-20 object-cover rounded-2xl border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageOff size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/marketplace/${order.productId}`}
                    className="text-base font-bold text-slate-900 hover:text-purple-600 transition block truncate"
                  >
                    {order.productTitle}
                  </Link>
                  <div className="text-xl font-black text-purple-700 mt-1">
                    {formatPrice(order.priceSnapshot)}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Giá niêm yết tại thời điểm tạo đơn (Snapshot bảo lưu)
                  </span>
                </div>
              </div>

              {/* Counterparties */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Người bán</span>
                  <strong className="text-slate-800 font-bold block">{order.sellerFullName}</strong>
                  <span className="text-slate-500 font-mono text-[11px]">@{order.sellerUsername}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Người mua</span>
                  <strong className="text-slate-800 font-bold block">{order.buyerFullName}</strong>
                  <span className="text-slate-500 font-mono text-[11px]">@{order.buyerUsername}</span>
                </div>
              </div>
            </div>

            {/* Smart Locker Location & Station Details */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-purple-600" />
                Địa điểm Smart Locker
              </h2>

              {order.lockerName ? (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <div className="text-sm font-bold text-slate-900">{order.lockerName}</div>
                    <div className="text-xs text-slate-600">{order.lockerLocation}</div>
                    <div className="text-[11px] font-mono text-slate-400 pt-0.5">
                      Mã trạm tủ: {order.lockerCode}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-2xl">
                    <div>
                      <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                        Ngăn tủ chỉ định
                      </span>
                      <span className="text-xl font-black text-purple-900 font-mono">
                        {order.compartmentCode || 'Đang cấp'}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-200/50 flex items-center justify-center text-purple-800">
                      <Lock size={20} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 text-xs">
                  Ngăn tủ sẽ được tự động phân bổ ngay sau khi người bán xác nhận đơn hàng.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Keypad Terminal, Actions & Secret PIN (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Buyer Pickup Terminal Flow */}
            {order.status === 'READY_FOR_PICKUP' && (
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-purple-400" />
                    <span className="text-xs uppercase font-extrabold tracking-wider text-purple-300">
                      Smart Locker Terminal
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                    SẴN SÀNG LẤY ĐỒ
                  </span>
                </div>

                {/* Secret Pickup PIN for Buyer */}
                {isBuyer && order.pickupCode && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center space-y-2">
                    <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider block">
                      Mã PIN bí mật của bạn (6 chữ số)
                    </span>
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-mono text-3xl font-black text-amber-300 tracking-widest">
                        {order.pickupCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-xs transition flex items-center gap-1"
                        title="Sao chép mã"
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    {order.pickupDeadline && (
                      <span className="text-[11px] text-purple-200/80 block">
                        Hạn lấy đồ: {formatDate(order.pickupDeadline)}
                      </span>
                    )}
                  </div>
                )}

                {/* Keypad Touch Screen Simulator */}
                <div className="bg-black/50 rounded-2xl p-4 border border-white/10 space-y-4">
                  <div className="text-center space-y-1.5">
                    <span className="text-[11px] text-slate-400">
                      Màn hình cảm ứng nhập mã tại trạm Locker
                    </span>
                    <div className="bg-slate-950 border border-purple-500/40 rounded-xl p-3 font-mono text-center">
                      <span className="text-2xl font-black tracking-widest text-emerald-400">
                        {pickupCodeInput || '------'}
                      </span>
                    </div>
                    {pickupErrorMessage && (
                      <div className="text-xs text-rose-400 font-bold flex items-center justify-center gap-1 pt-1">
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
                        className="py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-xl font-mono text-base font-bold transition text-white"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      onClick={handleKeypadClear}
                      className="py-2.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl text-xs font-bold"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => handleKeypadPress('0')}
                      className="py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-mono text-base font-bold text-white"
                    >
                      0
                    </button>
                    <button
                      disabled={pickupCodeInput.length !== 6 || pickupMutation.isPending}
                      onClick={() => pickupMutation.mutate(pickupCodeInput)}
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-30"
                    >
                      {pickupMutation.isPending ? '...' : 'OK'}
                    </button>
                  </div>

                  <button
                    disabled={pickupCodeInput.length !== 6 || pickupMutation.isPending}
                    onClick={() => pickupMutation.mutate(pickupCodeInput)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition text-xs sm:text-sm disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {pickupMutation.isPending ? (
                      <span>Đang kích hoạt chốt khóa mở ngăn...</span>
                    ) : (
                      <>
                        <KeyRound size={16} /> Xác nhận mở ngăn tủ lấy hàng
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Seller Deposit Item Action */}
            {order.status === 'AWAITING_DEPOSIT' && isSeller && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Gửi hàng vào tủ</h3>
                    <p className="text-xs text-slate-500">
                      Người mua đang đợi bạn đặt hàng vào tủ locker
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div>
                    Tủ đồ: <strong className="text-slate-900">{order.lockerName}</strong>
                  </div>
                  <div>
                    Ngăn phân bổ:{' '}
                    <strong className="text-purple-700 font-bold">{order.compartmentCode}</strong>
                  </div>
                </div>

                <button
                  disabled={depositMutation.isPending}
                  onClick={() => depositMutation.mutate()}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs sm:text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
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
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Hủy đơn đặt mua</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đơn hàng đang chờ người bán xác nhận. Bạn có thể chủ động hủy nếu đổi ý.
                  </p>
                </div>
                <button
                  disabled={cancelMutation.isPending}
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                      cancelMutation.mutate();
                    }
                  }}
                  className="w-full py-2.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {cancelMutation.isPending ? 'Đang hủy...' : 'Hủy đơn hàng'}
                </button>
              </div>
            )}

            {/* Completed State Celebration Card */}
            {order.status === 'COMPLETED' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-base font-bold text-emerald-900">Giao dịch thành công!</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Hàng hóa đã được lấy thành công vào lúc {formatDate(order.pickedUpAt)}. Ngăn tủ đã được giải phóng trở lại trạng thái sẵn sàng.
                </p>
              </div>
            )}

            {/* Expired State Warning Card */}
            {order.status === 'EXPIRED' && (
              <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 mx-auto flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-base font-bold text-orange-950">Mã nhận đồ đã quá hạn</h3>
                <p className="text-xs text-orange-800 leading-relaxed">
                  Thời hạn nhận đồ tại trạm tủ đã kết thúc. Vui lòng liên hệ ban quản trị để được hỗ trợ kiểm tra và nhận lại kiện hàng.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
