import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type {
  DashboardStatsResponse,
  AuditLogItem,
  AuditAction,
  FeeConfigResponse,
  UpdateFeeConfigRequest,
  ProductMediaSettingsResponse,
  UpdateProductMediaSettingsRequest,
} from '../../types/admin';
import type { PageResponse } from '../../types/marketplace';
import {
  Users,
  ShoppingBag,
  Package,
  Lock,
  ShieldAlert,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  KeyRound,
  ArrowRight,
  Printer,
  FileText,
  CheckCircle,
  ExternalLink,
  X,
  Layers,
  Coins,
  Image as ImageIcon,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

type AuditFilterCategory = 'ALL' | 'IDENTITY' | 'ORDER' | 'SECURITY' | 'PRODUCT';

export const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [auditCategory, setAuditCategory] = useState<AuditFilterCategory>('ALL');

  // Accessible Notice Dialog state
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

  // Formatted date and time initialized once and updated upon manual refresh
  const [formattedToday] = useState(() =>
    new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  );

  const [lastRefreshedTime, setLastRefreshedTime] = useState(() =>
    new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );

  // 1. Fetch Dashboard Stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
    refetch: refetchStats,
    isFetching: isFetchingStats,
  } = useQuery<DashboardStatsResponse>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => axiosInstance.get('/api/v1/admin/dashboard').then((res) => res.data),
    refetchInterval: 30000,
  });

  // 2. Fetch Recent Audit Logs for the Live Stream (Top 12 recent items)
  const {
    data: logsData,
    isLoading: isLoadingLogs,
    isError: isErrorLogs,
    refetch: refetchLogs,
    isFetching: isFetchingLogs,
  } = useQuery<PageResponse<AuditLogItem>>({
    queryKey: ['admin-dashboard-recent-logs'],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/audit', {
          params: {
            page: 0,
            size: 12,
          },
        })
        .then((res) => res.data),
    refetchInterval: 15000,
  });

  // 3. Platform Fee Configuration
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [feeFormData, setFeeFormData] = useState<UpdateFeeConfigRequest>({
    saleCommissionPercent: 5.0,
    rentalFeeMode: 'PERCENT',
    rentalFeeValue: 10.0,
  });

  const {
    data: feeConfig,
    refetch: refetchFees,
  } = useQuery<FeeConfigResponse>({
    queryKey: ['admin-fee-config'],
    queryFn: () => axiosInstance.get('/api/v1/admin/settings/fees').then((res) => res.data),
  });

  const updateFeesMutation = useMutation({
    mutationFn: (data: UpdateFeeConfigRequest) =>
      axiosInstance.put('/api/v1/admin/settings/fees', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fee-config'] });
      setIsFeeModalOpen(false);
      setDialogNotice({
        isOpen: true,
        title: 'Thành công',
        message: 'Cập nhật biểu phí dịch vụ nền tảng thành công.',
        variant: 'primary',
      });
    },
    onError: (err: any) => {
      setDialogNotice({
        isOpen: true,
        title: 'Cập nhật thất bại',
        message: err.response?.data?.message || 'Không thể cập nhật biểu phí nền tảng.',
        variant: 'danger',
      });
    },
  });

  const handleOpenFeeModal = () => {
    if (feeConfig) {
      setFeeFormData({
        saleCommissionPercent: feeConfig.saleCommissionPercent,
        rentalFeeMode: feeConfig.rentalFeeMode,
        rentalFeeValue: feeConfig.rentalFeeValue,
      });
    }
    setIsFeeModalOpen(true);
  };

  // 4. Product Media Limits Configuration
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaFormData, setMediaFormData] = useState<UpdateProductMediaSettingsRequest>({
    maxProductImages: 6,
    maxProductVideos: 1,
    allowProductVideo: true,
    maxVideoSizeMb: 50,
  });

  const {
    data: mediaConfig,
    refetch: refetchMedia,
  } = useQuery<ProductMediaSettingsResponse>({
    queryKey: ['admin-media-config'],
    queryFn: () => axiosInstance.get('/api/v1/admin/settings/media').then((res) => res.data),
  });

  const updateMediaMutation = useMutation({
    mutationFn: (data: UpdateProductMediaSettingsRequest) =>
      axiosInstance.put('/api/v1/admin/settings/media', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media-config'] });
      setIsMediaModalOpen(false);
      setDialogNotice({
        isOpen: true,
        title: 'Thành công',
        message: 'Cập nhật chính sách phương tiện sản phẩm thành công.',
        variant: 'primary',
      });
    },
    onError: (err: any) => {
      setDialogNotice({
        isOpen: true,
        title: 'Cập nhật thất bại',
        message: err.response?.data?.message || 'Không thể cập nhật cấu hình media sản phẩm.',
        variant: 'danger',
      });
    },
  });

  const handleOpenMediaModal = () => {
    if (mediaConfig) {
      setMediaFormData({
        maxProductImages: mediaConfig.maxProductImages,
        maxProductVideos: mediaConfig.maxProductVideos,
        allowProductVideo: mediaConfig.allowProductVideo,
        maxVideoSizeMb: mediaConfig.maxVideoSizeMb,
      });
    }
    setIsMediaModalOpen(true);
  };

  const handleRefreshAll = () => {
    setLastRefreshedTime(
      new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    );
    refetchStats();
    refetchLogs();
    refetchFees();
    refetchMedia();
  };

  const isRefreshing = isFetchingStats || isFetchingLogs;

  const handlePrint = () => {
    window.print();
  };

  // Semantic category mapping for audit events
  const filteredLogs = useMemo(() => {
    if (!logsData?.content) return [];
    if (auditCategory === 'ALL') return logsData.content;
    return logsData.content.filter((item) => {
      if (auditCategory === 'IDENTITY') return item.action.includes('IDENTITY');
      if (auditCategory === 'ORDER') return item.action.startsWith('ORDER_') || item.action.startsWith('LOCKER_') || item.action.startsWith('COMPARTMENT_');
      if (auditCategory === 'SECURITY') return item.action.includes('LOGIN') || item.action.includes('PASSWORD') || item.action.includes('SECURITY') || item.action.includes('TOKEN');
      if (auditCategory === 'PRODUCT') return item.action.startsWith('PRODUCT_') || item.action.startsWith('CATEGORY_');
      return true;
    });
  }, [logsData, auditCategory]);

  const getActionBadge = (action: AuditAction | string) => {
    if (action.includes('IDENTITY')) {
      return {
        label: action.replace('IDENTITY_', ''),
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      };
    }
    if (action.startsWith('ORDER_')) {
      return {
        label: action.replace('ORDER_', ''),
        className: 'bg-amber-50 text-amber-800 border-amber-200/80',
      };
    }
    if (action.startsWith('PRODUCT_')) {
      return {
        label: action.replace('PRODUCT_', ''),
        className: 'bg-orange-50 text-orange-700 border-orange-200/80',
      };
    }
    if (action.startsWith('LOCKER_') || action.startsWith('COMPARTMENT_')) {
      return {
        label: action.replace('LOCKER_', '').replace('COMPARTMENT_', ''),
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      };
    }
    if (action.startsWith('USER_')) {
      return {
        label: action.replace('USER_', ''),
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      };
    }
    return {
      label: action,
      className: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  };

  const getActionHumanLabel = (action: string) => {
    const map: Record<string, string> = {
      USER_LOGIN: 'Đăng nhập hệ thống',
      USER_LOGOUT: 'Đăng xuất',
      USER_REGISTER: 'Đăng ký tài khoản',
      USER_PROFILE_UPDATE: 'Cập nhật hồ sơ',
      USER_PASSWORD_CHANGE: 'Đổi mật khẩu',
      USER_STATUS_CHANGE: 'Đổi trạng thái tài khoản',
      USER_IDENTITY_REVIEW: 'Duyệt hồ sơ định danh',
      IDENTITY_ATTEMPT_START: 'Bắt đầu xác thực eKYC',
      IDENTITY_LIVENESS_STEP: 'Thực hiện cử động sống (Liveness)',
      IDENTITY_FACE_VERIFY: 'Đối chiếu khuôn mặt sinh trắc học',
      IDENTITY_ATTEMPT_COMPLETE: 'Hoàn tất quy trình định danh',
      IDENTITY_ATTEMPT_FAILED: 'Thất bại xác thực định danh',
      PRODUCT_CREATE: 'Đăng tin sản phẩm mới',
      PRODUCT_UPDATE: 'Cập nhật tin sản phẩm',
      PRODUCT_DELETE: 'Gỡ tin sản phẩm',
      PRODUCT_STATUS_CHANGE: 'Đổi trạng thái tin đăng',
      ORDER_CREATE: 'Tạo đơn hàng mới',
      ORDER_ACCEPT: 'Người bán xác nhận đơn',
      ORDER_REJECT: 'Người bán từ chối đơn',
      ORDER_CANCEL: 'Hủy đơn hàng',
      ORDER_DEPOSIT: 'Gửi hàng vào ngăn tủ',
      ORDER_PICKUP: 'Mở ngăn lấy hàng thành công',
      ORDER_PICKUP_FAILED: 'Nhập sai mã OTP lấy đồ',
      ORDER_EXPIRED: 'Đơn quá hạn lưu tủ',
      ORDER_CLEARED: 'Giải phóng ngăn tủ quá hạn',
      LOCKER_STATUS_CHANGE: 'Cập nhật trạng thái trạm tủ',
      COMPARTMENT_STATUS_CHANGE: 'Cập nhật trạng thái ngăn tủ',
      ADMIN_ACCESS_DASHBOARD: 'Truy cập trung tâm điều hành',
      ADMIN_VIEW_USERS: 'Tra cứu danh sách thành viên',
      ADMIN_CLEAR_EXPIRED_ORDER: 'Xử lý giải phóng ngăn quá hạn',
    };
    return map[action] || action;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-slate-800">
      {/* 1. CONTROL CENTER HEADER */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Hệ thống hoạt động bình thường
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Cập nhật lúc {lastRefreshedTime} • {formattedToday}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Trung tâm Điều hành CampusHub
            </h1>
            <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
              Giám sát thời gian thực chu trình giao dịch P2P, tỷ lệ lấp đầy mạng lưới Smart Locker và nhật ký an ninh hệ thống.
            </p>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2.5 shrink-0 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-xs"
              title="Xuất báo cáo định dạng in / PDF"
            >
              <Printer size={15} className="text-slate-500" />
              In báo cáo
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-2xs"
              title="Đồng bộ lại toàn bộ số liệu thời gian thực"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Đang nạp...' : 'Làm mới'}
            </button>
          </div>
        </div>
      </div>

      {isLoadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl border border-slate-200/80" />
          ))}
        </div>
      ) : isErrorStats || !stats ? (
        <div className="bg-rose-50/70 border border-rose-200 text-rose-800 p-8 rounded-xl text-center space-y-3">
          <AlertTriangle className="mx-auto text-rose-500" size={32} />
          <h2 className="font-bold text-base text-rose-900">Không thể kết nối máy chủ quản trị</h2>
          <p className="text-xs text-rose-700 max-w-md mx-auto">
            Hệ thống không thể tải báo cáo thống kê vận hành. Vui lòng xác minh phiên đăng nhập của tài khoản Quản trị viên.
          </p>
          <button
            onClick={handleRefreshAll}
            className="px-4 py-2 bg-rose-600 text-white font-medium rounded-lg text-xs hover:bg-rose-700 transition shadow-xs"
          >
            Thử tải lại
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 2. PRIMARY TELEMETRY CARDS (Clean, disciplined metric ribbon) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Thành viên & Định danh eKYC */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Thành viên & Định danh</span>
                  <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                    <Users size={16} />
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stats.userStats.totalUsers.toLocaleString('vi-VN')}
                  </div>
                  <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium">
                    <TrendingUp size={13} className="mr-1" />
                    +{stats.userStats.newUsersToday} hôm nay • +{stats.userStats.newUsersThisWeek} tuần này
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Đã xác thực CCCD:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  {stats.userStats.verifiedUsers ?? 0}
                  <span className="text-slate-400 font-normal text-[11px]">
                    ({stats.userStats.totalUsers > 0 ? Math.round(((stats.userStats.verifiedUsers ?? 0) / stats.userStats.totalUsers) * 100) : 0}%)
                  </span>
                </span>
              </div>
            </div>

            {/* Card 2: Thị trường & Sản phẩm niêm yết */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Sản phẩm chợ đồ cũ</span>
                  <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                    <ShoppingBag size={16} />
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stats.productStats.totalProducts.toLocaleString('vi-VN')}
                  </div>
                  <div className="mt-1 flex items-center text-xs text-slate-500">
                    <span className="text-emerald-600 font-medium mr-1.5">
                      +{stats.productStats.newProductsToday} tin mới
                    </span>
                    <span>trong ngày</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Đang niêm yết:</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900">
                    {stats.productStats.activeProducts} <span className="font-normal text-slate-400 text-[11px]">mở bán</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-emerald-600">
                    {stats.productStats.soldProducts} <span className="font-normal text-slate-400 text-[11px]">đã bán</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Giao dịch & Đơn hàng */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Đơn hàng & Giao dịch</span>
                  <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                    <Package size={16} />
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stats.orderStats.totalOrders.toLocaleString('vi-VN')}
                  </div>
                  <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium">
                    <CheckCircle2 size={13} className="mr-1" />
                    {stats.orderStats.completedOrdersToday} đơn hoàn tất hôm nay
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Hoàn tất thành công:</span>
                <span className="font-semibold text-emerald-600">
                  {stats.orderStats.completedOrders}
                  <span className="text-slate-400 font-normal text-[11px] ml-1">
                    ({stats.orderStats.totalOrders > 0 ? Math.round((stats.orderStats.completedOrders / stats.orderStats.totalOrders) * 100) : 0}%)
                  </span>
                </span>
              </div>
            </div>

            {/* Card 4: Công suất Smart Locker */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Hạ tầng Smart Locker</span>
                  <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                    <Lock size={16} />
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1">
                    {stats.lockerStats.totalCompartments}
                    <span className="text-xs font-medium text-slate-500">ngăn tủ ({stats.lockerStats.activeLockers} trạm)</span>
                  </div>
                  <div className="mt-1 flex items-center text-xs font-semibold text-emerald-700">
                    Tỷ lệ lấp đầy: {stats.lockerStats.utilizationRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Khả dụng / Đang dùng:</span>
                <span className="font-mono text-xs">
                  <strong className="text-emerald-600 font-semibold">{stats.lockerStats.availableCompartments}</strong>
                  <span className="text-slate-400"> / </span>
                  <strong className="text-slate-800 font-semibold">{stats.lockerStats.occupiedCompartments + stats.lockerStats.reservedCompartments}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 3. CORE OPERATIONS: FULFILLMENT PIPELINE & LOCKER TELEMETRY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Order Fulfillment Pipeline */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Chu trình Giao nhận Đơn hàng qua Locker</h2>
                    <p className="text-xs text-slate-500">Quy trình 4 giai đoạn chuyển giao hàng hóa từ người bán đến người mua</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {stats.orderStats.totalOrders} đơn giao dịch
                </span>
              </div>

              {/* Sequential Funnel Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Stage 1 */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <span>1. Chờ duyệt</span>
                    <Clock size={13} className="text-amber-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.orderStats.pendingOrders}</div>
                  <p className="text-[11px] text-slate-400">Người bán phản hồi</p>
                </div>

                {/* Stage 2 */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <span>2. Chờ nạp tủ</span>
                    <Package size={13} className="text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.orderStats.awaitingDepositOrders}</div>
                  <p className="text-[11px] text-slate-400">Đã gán ngăn Locker</p>
                </div>

                {/* Stage 3 */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <span>3. Sẵn sàng lấy</span>
                    <KeyRound size={13} className="text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.orderStats.readyForPickupOrders}</div>
                  <p className="text-[11px] text-slate-400">Đã cấp OTP lấy đồ</p>
                </div>

                {/* Stage 4 */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <span>4. Hoàn tất</span>
                    <CheckCircle2 size={13} className="text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stats.orderStats.completedOrders}</div>
                  <p className="text-[11px] text-slate-400">Khách nhận đồ an toàn</p>
                </div>
              </div>

              {/* Exception & Warning Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg border border-rose-200/80 bg-rose-50/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-rose-900">Quá hạn lưu tủ: </span>
                      <strong className="text-rose-700">{stats.orderStats.expiredOrders} đơn</strong>
                    </div>
                  </div>
                  {stats.orderStats.expiredOrders > 0 && (
                    <Link
                      to="/admin/lockers"
                      className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline"
                    >
                      Giải phóng ngăn
                    </Link>
                  )}
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <XCircle size={15} className="text-slate-400 shrink-0" />
                    <span>Đã hủy / Từ chối giao dịch:</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {stats.orderStats.cancelledOrders + stats.orderStats.rejectedOrders} đơn
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Locker Capacity & Security Status */}
            <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">Phân bổ Dung lượng Ngăn tủ</h2>
                      <p className="text-xs text-slate-500">Hiện trạng {stats.lockerStats.totalCompartments} ngăn trên {stats.lockerStats.activeLockers} trạm tủ</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/lockers"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    Chi tiết <ChevronRight size={13} />
                  </Link>
                </div>

                {/* Progress bar visual */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-slate-600 font-medium">Tỷ lệ sử dụng ngăn:</span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {stats.lockerStats.utilizationRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/80">
                    <div
                      title={`Đang chứa hàng: ${stats.lockerStats.occupiedCompartments} ngăn`}
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{
                        width: `${stats.lockerStats.totalCompartments > 0 ? (stats.lockerStats.occupiedCompartments / stats.lockerStats.totalCompartments) * 100 : 0}%`,
                      }}
                    />
                    <div
                      title={`Đã giữ chỗ: ${stats.lockerStats.reservedCompartments} ngăn`}
                      className="bg-amber-400 h-full transition-all duration-300"
                      style={{
                        width: `${stats.lockerStats.totalCompartments > 0 ? (stats.lockerStats.reservedCompartments / stats.lockerStats.totalCompartments) * 100 : 0}%`,
                      }}
                    />
                    <div
                      title={`Ngăn trống: ${stats.lockerStats.availableCompartments} ngăn`}
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{
                        width: `${stats.lockerStats.totalCompartments > 0 ? (stats.lockerStats.availableCompartments / stats.lockerStats.totalCompartments) * 100 : 0}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                    <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                      <span className="text-slate-500 text-[11px] block">Trống</span>
                      <strong className="text-emerald-700 font-mono font-bold text-sm">
                        {stats.lockerStats.availableCompartments}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                      <span className="text-slate-500 text-[11px] block">Giữ chỗ</span>
                      <strong className="text-amber-700 font-mono font-bold text-sm">
                        {stats.lockerStats.reservedCompartments}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                      <span className="text-slate-500 text-[11px] block">Đang chứa</span>
                      <strong className="text-blue-700 font-mono font-bold text-sm">
                        {stats.lockerStats.occupiedCompartments}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Security Telemetry Strip */}
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                    <ShieldAlert size={14} className="text-amber-600" />
                    Chỉ số an ninh trong ngày
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Đăng nhập thất bại:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {stats.securityStats.failedLoginsToday} lượt
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Nhập sai OTP tại cửa tủ:</span>
                    <span className="font-mono font-semibold text-rose-600">
                      {stats.securityStats.failedPickupAttemptsToday} lần
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/admin/lockers"
                className="w-full py-2 px-3 text-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
              >
                Vào bảng điều khiển quản lý trạm tủ <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* 4. PLATFORM CONTROLS & SYSTEM SETTINGS (Balanced 2-Column Split) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Platform Fees */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <Coins size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Biểu phí Nền tảng</h2>
                    <p className="text-xs text-slate-500">Hoa hồng đơn bán & phí dịch vụ cho thuê đồ</p>
                  </div>
                </div>

                <button
                  onClick={handleOpenFeeModal}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  <SlidersHorizontal size={13} /> Chỉnh sửa
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                    Bán đứt
                  </span>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {feeConfig ? `${feeConfig.saleCommissionPercent}%` : '5%'}
                  </div>
                  <p className="text-[11px] text-slate-400">Trích trên đơn hàng</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                    Cho thuê
                  </span>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {feeConfig?.rentalFeeMode === 'PER_DAY'
                      ? `${new Intl.NumberFormat('vi-VN').format(feeConfig.rentalFeeValue)}đ/d`
                      : `${feeConfig?.rentalFeeValue ?? 10}%`}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {feeConfig?.rentalFeeMode === 'PER_DAY' ? 'Thu theo ngày thuê' : 'Theo doanh thu thuê'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Media Policy */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">Chính sách Phương tiện (Media)</h2>
                    <p className="text-xs text-slate-500">Giới hạn số lượng ảnh mô tả và video sản phẩm</p>
                  </div>
                </div>

                <button
                  onClick={handleOpenMediaModal}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                >
                  <SlidersHorizontal size={13} /> Chỉnh sửa
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                    Ảnh tối đa
                  </span>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    {mediaConfig?.maxProductImages ?? 6}
                  </div>
                  <p className="text-[11px] text-slate-400">ảnh / tin đăng</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                    Video tải lên
                  </span>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    {mediaConfig?.allowProductVideo ? 'Bật' : 'Tắt'}
                  </div>
                  <p className="text-[11px] text-slate-400">tối đa {mediaConfig?.maxProductVideos ?? 1} video</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-0.5">
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                    Dung lượng
                  </span>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    {mediaConfig?.maxVideoSizeMb ?? 50} MB
                  </div>
                  <p className="text-[11px] text-slate-400">giới hạn file</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. LIVE AUDIT STREAM (High-Density Event Terminal) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-base">Nhật ký Hệ thống Trực tiếp</h2>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Feed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Theo dõi 12 sự kiện giao dịch, định danh và bảo mật gần nhất</p>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 print:hidden">
                {[
                  { key: 'ALL', label: 'Tất cả' },
                  { key: 'IDENTITY', label: 'eKYC' },
                  { key: 'ORDER', label: 'Đơn hàng' },
                  { key: 'SECURITY', label: 'Bảo mật' },
                  { key: 'PRODUCT', label: 'Sản phẩm' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setAuditCategory(tab.key as AuditFilterCategory)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                      auditCategory === tab.key
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}

                <Link
                  to="/admin/audit"
                  className="ml-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  Toàn bộ <ExternalLink size={12} />
                </Link>
              </div>
            </div>

            {/* Event Table */}
            {isLoadingLogs ? (
              <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
                Đang nạp luồng sự kiện...
              </div>
            ) : isErrorLogs || !logsData || filteredLogs.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Chưa có bản ghi sự kiện nào thuộc bộ lọc này.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Thời gian</th>
                      <th className="px-4 py-2.5">Tác nhân</th>
                      <th className="px-4 py-2.5">Hành động</th>
                      <th className="px-4 py-2.5">Đối tượng</th>
                      <th className="px-4 py-2.5">IP</th>
                      <th className="px-4 py-2.5 text-center">Trạng thái</th>
                      <th className="px-4 py-2.5 text-right print:hidden">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredLogs.map((log) => {
                      const badge = getActionBadge(log.action);
                      return (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedLog(log)}
                          className="hover:bg-slate-50/80 transition cursor-pointer"
                        >
                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {new Date(log.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>

                          <td className="px-4 py-2.5 whitespace-nowrap font-medium text-slate-900">
                            {log.username || <span className="text-slate-400 italic">Hệ thống</span>}
                          </td>

                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.className}`}
                              title={getActionHumanLabel(log.action)}
                            >
                              {badge.label}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                            {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                          </td>

                          <td className="px-4 py-2.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                            {log.ipAddress || '—'}
                          </td>

                          <td className="px-4 py-2.5 whitespace-nowrap text-center">
                            {log.success ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle size={11} /> Thành công
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <XCircle size={11} /> Lỗi
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-2.5 whitespace-nowrap text-right print:hidden">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLog(log);
                              }}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                            >
                              Xem
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Log Detail Drawer / Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 print:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-md"
              aria-label="Đóng chi tiết nhật ký"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Chi tiết Sự kiện Nhật ký</h3>
                <p className="text-xs text-slate-500 font-mono">Mã sự kiện: #{selectedLog.id}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block mb-0.5">Thời gian:</span>
                  <span className="font-mono text-slate-800 font-medium">
                    {new Date(selectedLog.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tác nhân:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedLog.username || 'Hệ thống'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block mb-0.5">Hành động:</span>
                  <span className="font-semibold text-slate-900">{getActionHumanLabel(selectedLog.action)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Đối tượng:</span>
                  <span className="font-mono text-slate-700">
                    {selectedLog.entityType} {selectedLog.entityId ? `#${selectedLog.entityId}` : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block mb-0.5">IP Address:</span>
                  <span className="font-mono text-slate-700">{selectedLog.ipAddress || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Kết quả:</span>
                  <span
                    className={`font-semibold ${
                      selectedLog.success ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {selectedLog.success ? 'Thành công (SUCCESS)' : 'Thất bại (FAILURE)'}
                  </span>
                </div>
              </div>

              {selectedLog.details && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 block">Nội dung chi tiết:</span>
                  <p className="font-mono text-[11px] text-slate-800 bg-white p-2.5 rounded border border-slate-200 break-words">
                    {selectedLog.details}
                  </p>
                </div>
              )}

              {selectedLog.errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 space-y-1">
                  <span className="text-rose-600 font-semibold block">Thông báo lỗi:</span>
                  <p className="font-mono text-[11px] break-words">{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Settings Edit Modal */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <Coins size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Điều chỉnh Biểu phí Nền tảng</h3>
                  <p className="text-xs text-slate-500">Cấu hình hoa hồng cho giao dịch mua bán & cho thuê</p>
                </div>
              </div>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateFeesMutation.mutate(feeFormData);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Tỷ lệ hoa hồng đơn bán đứt (%):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    required
                    value={feeFormData.saleCommissionPercent}
                    onChange={(e) =>
                      setFeeFormData((prev) => ({
                        ...prev,
                        saleCommissionPercent: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-400">Khấu trừ tự động từ doanh thu người bán khi hoàn tất đơn.</p>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  Phương thức tính phí cho thuê:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeeFormData((prev) => ({ ...prev, rentalFeeMode: 'PERCENT' }))}
                    className={`p-2.5 rounded-md border text-left text-xs font-semibold transition ${
                      feeFormData.rentalFeeMode === 'PERCENT'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Theo phần trăm (%)
                    <span className="block text-[10px] font-normal text-slate-400 mt-0.5">Trích % tiền thuê</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeeFormData((prev) => ({ ...prev, rentalFeeMode: 'PER_DAY' }))}
                    className={`p-2.5 rounded-md border text-left text-xs font-semibold transition ${
                      feeFormData.rentalFeeMode === 'PER_DAY'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Cố định ngày (VNĐ/ngày)
                    <span className="block text-[10px] font-normal text-slate-400 mt-0.5">Phí theo số ngày</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  {feeFormData.rentalFeeMode === 'PERCENT' ? 'Tỷ lệ phí thuê (%):' : 'Mức phí thuê (VNĐ/ngày):'}
                </label>
                <input
                  type="number"
                  step={feeFormData.rentalFeeMode === 'PERCENT' ? '0.1' : '1000'}
                  min="0"
                  required
                  value={feeFormData.rentalFeeValue}
                  onChange={(e) =>
                    setFeeFormData((prev) => ({
                      ...prev,
                      rentalFeeValue: Number(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateFeesMutation.isPending}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold transition disabled:opacity-50 shadow-2xs"
                >
                  {updateFeesMutation.isPending ? 'Đang lưu...' : 'Lưu biểu phí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Media Settings Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Cài đặt Phương tiện (Media)</h3>
                  <p className="text-xs text-slate-500">Giới hạn số ảnh, video và dung lượng tải lên</p>
                </div>
              </div>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMediaMutation.mutate(mediaFormData);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Số lượng ảnh chi tiết tối đa (1 - 20):
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={mediaFormData.maxProductImages}
                  onChange={(e) =>
                    setMediaFormData((prev) => ({
                      ...prev,
                      maxProductImages: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-md border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Cho phép tải video</span>
                  <span className="text-[11px] text-slate-400">Hiển thị mục upload video ở form đăng bán</span>
                </div>
                <input
                  type="checkbox"
                  checked={mediaFormData.allowProductVideo}
                  onChange={(e) =>
                    setMediaFormData((prev) => ({
                      ...prev,
                      allowProductVideo: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Số video tối đa:</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    required
                    value={mediaFormData.maxProductVideos}
                    onChange={(e) =>
                      setMediaFormData((prev) => ({
                        ...prev,
                        maxProductVideos: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Dung lượng video (MB):</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={mediaFormData.maxVideoSizeMb}
                    onChange={(e) =>
                      setMediaFormData((prev) => ({
                        ...prev,
                        maxVideoSizeMb: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateMediaMutation.isPending}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold transition disabled:opacity-50 shadow-2xs"
                >
                  {updateMediaMutation.isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accessible Notice Dialog */}
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
    </div>
  );
};
