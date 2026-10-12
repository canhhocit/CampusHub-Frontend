import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import type { OrderDetail as OrderDetailType, OrderStatus } from '../../types/order';
import {
  AlertTriangle,
  Check,
  X,
  Zap,
  Package,
  Clock,
  MapPin,
  Lock,
  Unlock,
  Cpu,
  Copy,
  CheckCircle2,
  ClockAlert,
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

  // Pickup terminal state
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

  const isBuyer = order && user && order.buyerUsername === user.username;
  const isSeller = order && user && order.sellerUsername === user.username;

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
    if (order.status === 'CANCELLED' || order.status === 'REJECTED' || order.status === 'EXPIRED') return 'cancelled';

    const orderSteps: OrderStatus[] = ['PENDING_SELLER', 'AWAITING_DEPOSIT', 'READY_FOR_PICKUP', 'COMPLETED'];
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
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-3 text-gray-500">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (isError || !order) {
    const errorStatus = (error as any)?.response?.status;
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-sm border border-gray-200 text-center">
        <AlertTriangle size={36} className="mx-auto text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {errorStatus === 403 ? 'Không có quyền truy cập' : 'Không tìm thấy đơn hàng'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {errorStatus === 403
            ? 'Bạn không phải là người mua hoặc người bán của đơn hàng này.'
            : 'Đơn hàng không tồn tại hoặc đã bị xóa.'}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-purple-600">Trang chủ</Link>
        <span>/</span>
        <Link to={isSeller ? '/orders/selling' : '/orders/buying'} className="hover:text-purple-600">
          {isSeller ? 'Đơn bán' : 'Đơn mua'}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold font-mono">{order.orderNumber}</span>
      </nav>

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
              <span className="font-mono text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-md font-semibold">
                {order.orderNumber}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Thời gian khởi tạo: {formatDate(order.createdAt)} • Phiên giao dịch #{order.id}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {order.status === 'EXPIRED' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-300">
                <AlertTriangle size={13} /> Quá hạn nhận
              </span>
            )}
            {order.status === 'CANCELLED' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
                <X size={13} /> Đã hủy
              </span>
            )}
            {order.status === 'REJECTED' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                <X size={13} /> Đã từ chối
              </span>
            )}
            {order.status === 'COMPLETED' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Check size={13} /> Hoàn tất nhận đồ
              </span>
            )}
            {order.status === 'READY_FOR_PICKUP' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300 animate-pulse">
                <Zap size={13} /> Đang ở tủ đồ chờ nhận
              </span>
            )}
            {order.status === 'AWAITING_DEPOSIT' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                <Package size={13} /> Chờ người bán gửi tủ
              </span>
            )}
            {order.status === 'PENDING_SELLER' && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <Clock size={13} /> Chờ xác nhận
              </span>
            )}
          </div>
        </div>

        {/* Stepper / Timeline */}
        {order.status !== 'CANCELLED' && order.status !== 'REJECTED' && order.status !== 'EXPIRED' ? (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stepConfig.map((s, idx) => {
                const status = getStepStatus(s.key);
                return (
                  <div key={s.key} className="flex flex-col items-center text-center relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                        status === 'completed'
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                          : status === 'current'
                          ? 'bg-purple-600 text-white ring-4 ring-purple-100 animate-pulse'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {status === 'completed' ? <Check size={18} /> : idx + 1}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        status === 'current'
                          ? 'text-blue-600'
                          : status === 'completed'
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {s.label}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">{s.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : order.status === 'EXPIRED' ? (
          <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-sm">
            <span className="font-semibold">Đơn hàng đã hết hạn nhận hàng: </span>
            Mã PIN đã hết hiệu lực. Hàng hóa vẫn được lưu giữ an toàn bên trong ngăn tủ và chờ quản trị viên xử lý thu hồi/hoàn trả trước khi mở tủ.
          </div>
        ) : (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            <span className="font-semibold">Lý do đóng giao dịch: </span>
            {order.rejectionReason || (order.status === 'CANCELLED' ? 'Người mua đã chủ động hủy đơn.' : 'Người bán từ chối nhận đơn.')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product & Transaction Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Product Snapshot Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Sản phẩm giao dịch</h2>
            <div className="flex gap-4">
              {order.productImageUrl ? (
                <img
                  src={order.productImageUrl}
                  alt={order.productTitle}
                  className="w-24 h-24 object-cover rounded-xl border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                  <Package size={28} />
                </div>
              )}
              <div className="flex-1">
                <Link
                  to={`/marketplace/${order.productId}`}
                  className="text-base font-semibold text-gray-900 hover:text-purple-600 line-clamp-2"
                >
                  {order.productTitle}
                </Link>
                <div className="text-xl font-black text-purple-600 mt-2">
                  {formatPrice(order.priceSnapshot)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Giá niêm yết tại thời điểm tạo đơn (Snapshot bảo lưu)
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-500 block">Người bán</span>
                <span className="font-medium text-gray-800">{order.sellerFullName}</span>
                <span className="text-xs text-gray-400 block">(@{order.sellerUsername})</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Người mua</span>
                <span className="font-medium text-gray-800">{order.buyerFullName}</span>
                <span className="text-xs text-gray-400 block">(@{order.buyerUsername})</span>
              </div>
            </div>
          </div>

          {/* Locker & Compartment Information */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-purple-600" />
              <span>Địa điểm giao dịch tại Tủ Locker</span>
            </h2>

            {order.lockerName ? (
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-sm font-bold text-gray-900">{order.lockerName}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{order.lockerLocation}</div>
                  <div className="text-xs font-mono text-gray-400 mt-1">Mã trạm: {order.lockerCode}</div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div>
                    <span className="text-xs text-purple-600 font-medium block">Ngăn tủ phân bổ</span>
                    <span className="text-lg font-bold text-purple-900">
                      Ngăn {order.compartmentCode || 'Đang cấp'}
                    </span>
                  </div>
                  <Lock size={22} className="text-purple-600" />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-xl text-gray-500 text-sm">
                Ngăn tủ sẽ được tự động phân bổ ngay sau khi người bán xác nhận đơn hàng.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions, Pickup Code, & Mock Locker Simulator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action: Buyer Pickup Flow */}
          {order.status === 'READY_FOR_PICKUP' && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Cpu size={18} className="text-indigo-300" />
                  <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
                    Smart Locker Terminal
                  </span>
                </div>
                <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded font-semibold">
                  SẴN SÀNG
                </span>
              </div>

              {/* Secret Pickup Code for Buyer */}
              {isBuyer && order.pickupCode && (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-6 text-center">
                  <span className="text-xs text-indigo-200 uppercase tracking-wider block mb-1">
                    Mã nhận hàng bí mật của bạn (6 chữ số)
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-3xl font-black text-amber-300 tracking-widest">
                      {order.pickupCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
                      title="Sao chép"
                    >
                      {isCopied ? (
                        <span className="flex items-center gap-1"><Check size={12} /> Đã chép</span>
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  {order.pickupDeadline && (
                    <span className="text-xs text-indigo-200 mt-2 block">
                      Hạn lấy hàng: {formatDate(order.pickupDeadline)}
                    </span>
                  )}
                </div>
              )}

              {/* Interactive Keypad Simulator */}
              <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                <div className="text-center mb-3">
                  <span className="text-xs text-gray-300">
                    Mô phỏng nhập mã tại màn hình cảm ứng của Tủ Locker
                  </span>
                  <div className="mt-2 bg-slate-950 border border-indigo-500/40 rounded-lg p-2.5 font-mono text-center">
                    <span className="text-2xl font-bold tracking-widest text-emerald-400">
                      {pickupCodeInput || '------'}
                    </span>
                  </div>
                  {pickupErrorMessage && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 mt-2 font-medium">
                      <AlertTriangle size={13} /> {pickupErrorMessage}
                    </div>
                  )}
                </div>

                {/* Keypad Buttons */}
                <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto mb-4">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleKeypadPress(digit)}
                      className="py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg font-mono text-base font-bold transition-colors"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    onClick={handleKeypadClear}
                    className="py-2.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-lg text-xs font-semibold"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => handleKeypadPress('0')}
                    className="py-2.5 bg-white/10 hover:bg-white/20 rounded-lg font-mono text-base font-bold"
                  >
                    0
                  </button>
                  <button
                    disabled={pickupCodeInput.length !== 6 || pickupMutation.isPending}
                    onClick={() => pickupMutation.mutate(pickupCodeInput)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold disabled:opacity-30 disabled:pointer-events-none"
                  >
                    {pickupMutation.isPending ? '...' : 'OK'}
                  </button>
                </div>

                <button
                  disabled={pickupCodeInput.length !== 6 || pickupMutation.isPending}
                  onClick={() => pickupMutation.mutate(pickupCodeInput)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {pickupMutation.isPending ? (
                    <span>Đang kích hoạt khóa mở ngăn...</span>
                  ) : (
                    <>
                      <Unlock size={16} /> Xác nhận nhận hàng
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action: Seller Deposit Item */}
          {order.status === 'AWAITING_DEPOSIT' && isSeller && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Gửi hàng vào tủ</h3>
                  <p className="text-xs text-gray-500">Người mua đang đợi bạn đặt hàng vào tủ locker</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm space-y-1.5 mb-6">
                <div>Tủ: <span className="font-semibold text-gray-800">{order.lockerName}</span></div>
                <div>Ngăn: <span className="font-bold text-indigo-700">{order.compartmentCode}</span></div>
              </div>

              <button
                disabled={depositMutation.isPending}
                onClick={() => depositMutation.mutate()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {depositMutation.isPending ? (
                  <span>Đang mở tủ và xác nhận cảm biến...</span>
                ) : (
                  <>
                    <Cpu size={16} /> Mô phỏng gửi hàng vào ngăn {order.compartmentCode}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action: Buyer Cancel if still PENDING_SELLER */}
          {order.status === 'PENDING_SELLER' && isBuyer && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-2">Hủy đơn đặt mua</h3>
              <p className="text-xs text-gray-500 mb-4">
                Đơn hàng đang chờ người bán xác nhận. Bạn có thể hủy đơn nếu đổi ý mà không ảnh hưởng uy tín.
              </p>
              <button
                disabled={cancelMutation.isPending}
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                    cancelMutation.mutate();
                  }
                }}
                className="w-full py-2.5 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? 'Đang hủy...' : 'Hủy đơn hàng'}
              </button>
            </div>
          )}

          {/* Completed State Celebration Card */}
          {order.status === 'COMPLETED' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
              <h3 className="text-base font-bold text-emerald-900">Giao dịch đã hoàn tất!</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Hàng đã được lấy thành công vào lúc {formatDate(order.pickedUpAt)}. Ngăn tủ đã được giải phóng trở lại trạng thái sẵn sàng.
              </p>
            </div>
          )}

          {/* Expired State Warning Card */}
          {order.status === 'EXPIRED' && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
              <ClockAlert size={36} className="mx-auto text-orange-600 mb-2" />
              <h3 className="text-base font-bold text-orange-900">Mã nhận đồ đã quá hạn</h3>
              <p className="text-xs text-orange-700 mt-1">
                Thời hạn nhận đồ tại tủ locker đã kết thúc. Vui lòng liên hệ ban quản trị để được hỗ trợ kiểm tra và thu hồi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
