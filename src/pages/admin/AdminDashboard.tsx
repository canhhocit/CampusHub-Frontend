import { useState } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
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
  Calendar,
  ExternalLink,
  X,
  Layers,
  Coins,
  Sliders,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

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

  // 2. Fetch Recent Audit Logs for the Live Report on Dashboard (Top 10 most recent)
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
            size: 10,
          },
        })
        .then((res) => res.data),
    refetchInterval: 15000, // Tự động làm mới log mỗi 15 giây
  });

  // 3. Platform Fee Configuration
  const queryClient = useQueryClient();
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
        message: 'Cập nhật biểu phí nền tảng thành công!',
        variant: 'primary',
      });
    },
    onError: (err: any) => {
      setDialogNotice({
        isOpen: true,
        title: 'Cập nhật thất bại',
        message: err.response?.data?.message || 'Không thể cập nhật biểu phí nền tảng',
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
        message: 'Cập nhật giới hạn ảnh và video sản phẩm thành công!',
        variant: 'primary',
      });
    },
    onError: (err: any) => {
      setDialogNotice({
        isOpen: true,
        title: 'Cập nhật thất bại',
        message: err.response?.data?.message || 'Không thể cập nhật cấu hình media sản phẩm',
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
    refetchStats();
    refetchLogs();
    refetchFees();
    refetchMedia();
  };

  const isRefreshing = isFetchingStats || isFetchingLogs;

  const handlePrint = () => {
    window.print();
  };

  const getActionBadgeClass = (action: AuditAction) => {
    if (action.startsWith('USER_')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.startsWith('ORDER_')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (action.startsWith('PRODUCT_')) return 'bg-[#eb6e34]/10 text-[#eb6e34] border-[#eb6e34]/30';
    if (action.startsWith('LOCKER_') || action.startsWith('COMPARTMENT_'))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.startsWith('ADMIN_')) return 'bg-slate-900 text-white border-slate-900';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getActionLabel = (action: string) => {
    const map: Record<string, string> = {
      USER_LOGIN: 'Đăng nhập hệ thống',
      USER_LOGOUT: 'Đăng xuất',
      USER_REGISTER: 'Đăng ký tài khoản',
      USER_PROFILE_UPDATE: 'Cập nhật hồ sơ',
      USER_PASSWORD_CHANGE: 'Đổi mật khẩu',
      USER_STATUS_CHANGE: 'Đổi trạng thái tài khoản',
      PRODUCT_CREATE: 'Tạo tin rao bán',
      PRODUCT_UPDATE: 'Cập nhật tin rao',
      PRODUCT_DELETE: 'Xóa tin rao',
      ORDER_CREATE: 'Tạo đơn đặt mua',
      ORDER_ACCEPT: 'Người bán chấp nhận',
      ORDER_REJECT: 'Người bán từ chối',
      ORDER_CANCEL: 'Hủy đơn hàng',
      ORDER_DEPOSIT: 'Gửi hàng vào ngăn tủ',
      ORDER_PICKUP: 'Nhận hàng mở tủ thành công',
      ORDER_PICKUP_FAILED: 'Nhập sai OTP lấy đồ',
      ORDER_EXPIRED: 'Đơn quá hạn lưu tủ',
      ADMIN_ACCESS_DASHBOARD: 'Truy cập Báo cáo Admin',
      ADMIN_VIEW_USERS: 'Tra cứu Người dùng',
      ADMIN_CLEAR_EXPIRED_ORDER: 'Xử lý đơn quá hạn',
    };
    return map[action] || action;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* 1. EXECUTIVE REPORT HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#eb6e34]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider rounded-md bg-[#eb6e34]/10 text-[#eb6e34] border border-[#eb6e34]/20">
                BÁO CÁO ĐIỀU HÀNH THỜI GIAN THỰC
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Vận hành ổn định
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Phiên bản: <strong className="text-slate-700 font-mono">CampusHub v2.4</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Báo cáo Vận hành Toàn diện & Giám sát Hệ thống
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              Tổng hợp thời gian thực các chỉ số tăng trưởng người dùng, định danh CCCD, chu trình giao dịch đơn hàng qua tủ Locker thông minh và luồng sự kiện an ninh hệ thống.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                Dữ liệu cập nhật: <strong>{new Date().toLocaleDateString('vi-VN')}</strong>
              </span>
              <span>•</span>
              <span>
                Người lập báo cáo: <strong className="text-[#eb6e34]">{user?.fullName || user?.username || 'Quản trị viên'}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons: Print Report & Instant Refresh */}
          <div className="flex items-center gap-3 shrink-0 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-xs transition hover:border-slate-400"
              title="In hoặc lưu file PDF bản báo cáo"
            >
              <Printer size={16} className="text-slate-600" />
              In / Xuất Báo cáo
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#eb6e34] hover:bg-[#d85d26] disabled:opacity-50 text-white text-sm font-semibold shadow-xs transition"
              title="Làm mới toàn bộ số liệu thống kê và audit log"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Đang cập nhật...' : 'Làm mới số liệu'}
            </button>
          </div>
        </div>
      </div>

      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : isErrorStats || !stats ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-8 rounded-2xl text-center">
          <AlertTriangle className="mx-auto mb-3" size={36} />
          <h3 className="font-bold text-lg">Không thể tải dữ liệu báo cáo thống kê</h3>
          <p className="text-sm mt-1 text-rose-600">Vui lòng kiểm tra quyền hạn Quản trị viên hoặc kết nối máy chủ.</p>
          <button
            onClick={handleRefreshAll}
            className="mt-4 px-5 py-2.5 bg-rose-600 text-white font-semibold rounded-xl text-sm hover:bg-rose-700 shadow-sm transition"
          >
            Thử tải lại dữ liệu
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* 2. EXECUTIVE KPI CARDS (5 Highlights) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Người dùng & Định danh CCCD */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Người dùng & CCCD
                  </span>
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                    <Users size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-slate-900">{stats.userStats.totalUsers}</div>
                  <div className="mt-1 flex items-center text-xs font-semibold text-emerald-600">
                    <TrendingUp size={14} className="mr-1" />
                    +{stats.userStats.newUsersToday} hôm nay / +{stats.userStats.newUsersThisWeek} tuần này
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Đã xác minh CCCD:</span>
                  <span className="font-bold text-[#eb6e34] bg-[#eb6e34]/10 px-2 py-0.5 rounded-md border border-[#eb6e34]/20">
                    {stats.userStats.verifiedUsers ?? 0} ({stats.userStats.totalUsers > 0 ? Math.round(((stats.userStats.verifiedUsers ?? 0) / stats.userStats.totalUsers) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Hoạt động: <strong className="text-emerald-600">{stats.userStats.activeUsers}</strong></span>
                  <span>Khóa: <strong className="text-rose-600">{stats.userStats.lockedUsers}</strong></span>
                </div>
              </div>
            </div>

            {/* 2. Sản phẩm Chợ đồ cũ */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Sản phẩm Niêm yết
                  </span>
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition">
                    <ShoppingBag size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-slate-900">{stats.productStats.totalProducts}</div>
                  <div className="mt-1 flex items-center text-xs font-semibold text-emerald-600">
                    <TrendingUp size={14} className="mr-1" />
                    +{stats.productStats.newProductsToday} mới hôm nay
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Đang mở bán:</span>
                  <strong className="text-blue-600">{stats.productStats.activeProducts}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Đã bán thành công:</span>
                  <strong className="text-emerald-600">{stats.productStats.soldProducts}</strong>
                </div>
              </div>
            </div>

            {/* 3. Tổng số Đơn hàng */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Giao dịch & Đơn hàng
                  </span>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Package size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-slate-900">{stats.orderStats.totalOrders}</div>
                  <div className="mt-1 flex items-center text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={14} className="mr-1" />
                    {stats.orderStats.completedOrdersToday} đơn hoàn tất hôm nay
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Chờ nhận tại tủ:</span>
                  <strong className="text-amber-600">{stats.orderStats.readyForPickupOrders}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hoàn tất thành công:</span>
                  <strong className="text-emerald-600">{stats.orderStats.completedOrders}</strong>
                </div>
              </div>
            </div>

            {/* 4. Tủ Locker Thông minh */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-[#eb6e34]/40 transition group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tủ Locker Thông minh
                  </span>
                  <div className="p-2.5 bg-[#eb6e34]/10 text-[#eb6e34] rounded-xl group-hover:bg-[#eb6e34] group-hover:text-white transition">
                    <Lock size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-slate-900">
                    {stats.lockerStats.totalCompartments}
                    <span className="text-sm font-normal text-slate-500 ml-1">ngăn</span>
                  </div>
                  <div className="mt-1 flex items-center text-xs font-semibold text-[#eb6e34]">
                    Tỷ lệ lấp đầy: {stats.lockerStats.utilizationRate.toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Ngăn trống khả dụng:</span>
                  <strong className="text-emerald-600">{stats.lockerStats.availableCompartments}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Đang chứa đồ:</span>
                  <strong className="text-blue-600">{stats.lockerStats.occupiedCompartments}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3. ORDER PIPELINE & LOCKER CAPACITY BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Flow Pipeline (2 Columns) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#eb6e34]/10 text-[#eb6e34] rounded-lg">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Báo cáo Chu trình Giao dịch Đơn hàng (Pipeline)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Theo dõi tuần tự 6 bước từ phê duyệt đến bàn giao qua ngăn tủ thông minh
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  Tổng: {stats.orderStats.totalOrders} đơn
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {/* 1. Pending Seller */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                    <Clock size={14} /> Chờ người bán duyệt
                  </div>
                  <div className="mt-3 text-2xl font-extrabold text-amber-950">
                    {stats.orderStats.pendingOrders}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">Giao dịch mới khởi tạo</div>
                </div>

                {/* 2. Awaiting Deposit */}
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-blue-800 text-[11px] font-bold uppercase tracking-wider">
                    <Package size={14} /> Chờ gửi vào tủ
                  </div>
                  <div className="mt-3 text-2xl font-extrabold text-blue-950">
                    {stats.orderStats.awaitingDepositOrders}
                  </div>
                  <div className="text-[11px] text-blue-700 mt-1">Đã phân ngăn tủ, chờ người bán gửi hàng</div>
                </div>

                {/* 3. Ready For Pickup */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-bold uppercase tracking-wider">
                    <KeyRound size={14} /> Sẵn sàng lấy đồ
                  </div>
                  <div className="mt-3 text-2xl font-extrabold text-amber-950">
                    {stats.orderStats.readyForPickupOrders}
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">Đang chờ người mua đến tủ</div>
                </div>

                {/* 4. Completed */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
                    <CheckCircle2 size={14} /> Đã hoàn thành
                  </div>
                  <div className="mt-3 text-2xl font-extrabold text-emerald-950">
                    {stats.orderStats.completedOrders}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-1">Đã nhận hàng thành công</div>
                </div>

                {/* 5. Expired */}
                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/60 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-rose-800 text-[11px] font-bold uppercase tracking-wider">
                    <AlertTriangle size={14} /> Quá hạn lấy đồ
                  </div>
                  <div className="mt-3 text-2xl font-extrabold text-rose-950">
                    {stats.orderStats.expiredOrders}
                  </div>
                  <div className="text-[11px] text-rose-700 mt-1">Cần Admin giải phóng ngăn</div>
                </div>

                {/* 6. Cancelled/Rejected */}
                <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                    <XCircle size={14} /> Đã hủy / Từ chối
                  </div>
                  <div className="mt-3 text-2xl font-extrabold text-slate-900">
                    {stats.orderStats.cancelledOrders + stats.orderStats.rejectedOrders}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Không phát sinh lưu tủ</div>
                </div>
              </div>
            </div>

            {/* Locker Utilization & Security Health (1 Column) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-2 bg-[#eb6e34]/10 text-[#eb6e34] rounded-lg">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      Công suất & Tỷ lệ Lấp đầy Tủ
                    </h3>
                    <p className="text-xs text-slate-500">
                      {stats.lockerStats.activeLockers} tủ đang vận hành trên toàn thành phố
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700">Tỷ lệ chiếm dụng ngăn:</span>
                    <span className="font-extrabold text-[#eb6e34]">
                      {stats.lockerStats.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div
                      className="bg-[#eb6e34] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(stats.lockerStats.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Ngăn trống khả dụng (Available)
                    </span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {stats.lockerStats.availableCompartments}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                    <span className="text-slate-600 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Đã đặt chỗ trước (Reserved)
                    </span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {stats.lockerStats.reservedCompartments}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-600 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Đang chứa hàng (Occupied)
                    </span>
                    <strong className="text-slate-900 font-mono text-sm">
                      {stats.lockerStats.occupiedCompartments}
                    </strong>
                  </div>
                </div>

                {/* Security Mini Alert Block */}
                <div className="mt-5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                    <ShieldAlert size={15} className="text-amber-600" />
                    Cảnh báo bảo mật hôm nay:
                  </div>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>Đăng nhập thất bại:</span>
                    <strong className="text-amber-800">{stats.securityStats.failedLoginsToday} lượt</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>Nhập sai OTP tủ:</span>
                    <strong className="text-rose-700">{stats.securityStats.failedPickupAttemptsToday} lần</strong>
                  </div>
                </div>
              </div>

              <Link
                to="/admin/lockers"
                className="mt-6 w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition text-center flex items-center justify-center gap-2 border border-slate-200 print:hidden"
              >
                Quản lý chi tiết mạng lưới tủ Locker
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* PLATFORM FEE CONFIGURATION CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                  <Coins size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Cấu hình Biểu phí Dịch vụ Nền tảng (Platform Fees)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý tỷ lệ hoa hồng trích từ đơn bán và phí dịch vụ đối với lượt cho thuê đồ qua Smart Locker
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenFeeModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#eb6e34] hover:bg-[#d85d26] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Sliders size={14} /> Điều chỉnh biểu phí
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {/* Sale Commission */}
              <div className="p-4 rounded-xl bg-[#eb6e34]/5 border border-[#eb6e34]/20 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#eb6e34] uppercase tracking-wider block">
                    Hoa hồng Đơn Bán Đứt
                  </span>
                  <div className="text-2xl font-black text-slate-900">
                    {feeConfig ? `${feeConfig.saleCommissionPercent}%` : '5%'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Khấu trừ tự động từ doanh thu người bán khi người mua hoàn tất nhận hàng tại Locker
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#eb6e34]/10 text-[#eb6e34] flex items-center justify-center shrink-0 font-bold text-lg">
                  %
                </div>
              </div>

              {/* Rental Commission */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                    Phí Dịch vụ Đơn Cho Thuê
                  </span>
                  <div className="text-2xl font-black text-blue-950">
                    {feeConfig?.rentalFeeMode === 'PER_DAY'
                      ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(feeConfig.rentalFeeValue)}/ngày`
                      : `${feeConfig?.rentalFeeValue ?? 10}%`}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Cách tính:{' '}
                    <strong className="text-blue-900 font-semibold">
                      {feeConfig?.rentalFeeMode === 'PER_DAY'
                        ? 'Cố định theo số ngày thuê thực tế'
                        : 'Phần trăm (%) tổng doanh thu thuê'}
                    </strong>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-200/60 text-blue-800 flex items-center justify-center shrink-0">
                  <Clock size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCT MEDIA LIMITS CONFIGURATION CARD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <ImageIcon size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Cấu hình Giới hạn Đăng Ảnh & Video Sản phẩm (Media Limits)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý số lượng ảnh mô tả tối đa, quyền đăng tải video và dung lượng video tải lên hệ thống
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenMediaModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Sliders size={14} /> Điều chỉnh giới hạn Media
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
              {/* Max Images */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Ảnh mô tả tối đa
                  </span>
                  <div className="text-2xl font-black text-slate-900">
                    {mediaConfig?.maxProductImages ?? 6} ảnh
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Kèm 1 ảnh biểu trưng
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <ImageIcon size={20} />
                </div>
              </div>

              {/* Allow Video */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Tính năng Video
                  </span>
                  <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    {mediaConfig?.allowProductVideo ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-lg">
                        <CheckCircle2 size={20} /> Cho phép
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1 text-lg">
                        <XCircle size={20} /> Tạm tắt
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {mediaConfig?.allowProductVideo ? 'Người bán được đăng video' : 'Chặn tải video'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#eb6e34] flex items-center justify-center shrink-0">
                  <Video size={20} />
                </div>
              </div>

              {/* Max Videos */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Số video tối đa
                  </span>
                  <div className="text-2xl font-black text-slate-900">
                    {mediaConfig?.maxProductVideos ?? 1} video
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Cho mỗi tin đăng
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Video size={20} />
                </div>
              </div>

              {/* Max Video Size */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Dung lượng video
                  </span>
                  <div className="text-2xl font-black text-slate-900">
                    {mediaConfig?.maxVideoSizeMb ?? 50} MB
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tối đa cho 1 file tải lên
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Sliders size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* 4. LIVE AUDIT LOGS REPORT (Nhật ký Hệ thống thời gian thực) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      Nhật ký Sự kiện Hệ thống Trực tiếp (Live Audit Stream)
                    </h3>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Thời gian thực
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ghi nhận 10 sự kiện gần nhất về bảo mật, đơn hàng, người dùng và truy cập hệ thống.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <Link
                  to="/admin/audit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#eb6e34] bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition"
                >
                  Xem toàn bộ lịch sử Audit
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>

            {/* Audit Log Table */}
            {isLoadingLogs ? (
              <div className="py-12 text-center text-slate-400 text-sm animate-pulse">
                Đang tải dữ liệu nhật ký sự kiện thời gian thực...
              </div>
            ) : isErrorLogs || !logsData || logsData.content.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Chưa có sự kiện nào được ghi nhận gần đây.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="px-4 py-3">Thời gian</th>
                      <th scope="col" className="px-4 py-3">Tác nhân</th>
                      <th scope="col" className="px-4 py-3">Hành động</th>
                      <th scope="col" className="px-4 py-3">Đối tượng</th>
                      <th scope="col" className="px-4 py-3">Địa chỉ IP</th>
                      <th scope="col" className="px-4 py-3 text-center">Trạng thái</th>
                      <th scope="col" className="px-4 py-3 text-right print:hidden">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {logsData.content.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-slate-50/80 transition cursor-pointer"
                      >
                        {/* Time */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </td>

                        {/* Actor */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-semibold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {log.username || 'Hệ thống'}
                          </span>
                        </td>

                        {/* Action Badge */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getActionBadgeClass(
                              log.action
                            )}`}
                          >
                            {getActionLabel(log.action)}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                          <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                            {log.entityType} {log.entityId ? `#${log.entityId}` : ''}
                          </span>
                        </td>

                        {/* IP Address */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                          {log.ipAddress || '—'}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {log.success ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle size={12} /> Thành công
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                              <XCircle size={12} /> Thất bại
                            </span>
                          )}
                        </td>

                        {/* Action Details Link */}
                        <td className="px-4 py-3 whitespace-nowrap text-right print:hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            className="text-xs font-semibold text-[#eb6e34] hover:text-[#d35a22] hover:underline"
                          >
                            Xem log
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bottom jump link */}
            <div className="pt-2 flex justify-between items-center text-xs text-slate-500 print:hidden">
              <span>Đang hiển thị 10 sự kiện mới nhất. Để tìm kiếm theo người dùng, khoảng ngày hoặc loại hành động:</span>
              <Link
                to="/admin/audit"
                className="font-bold text-[#eb6e34] hover:text-[#d35a22] inline-flex items-center gap-1"
              >
                Mở trang Quản lý Audit Logs đầy đủ <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* 5. PRINT REPORT FOOTER (Visible only during printing or bottom of report) */}
          <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
            <p>Báo cáo vận hành tự động trích xuất từ Hệ thống Quản trị CampusHub.</p>
            <p className="mt-1 font-mono text-[11px]">
              Dữ liệu được bảo mật và lưu trữ theo tiêu chuẩn An toàn Thông tin ISO/IEC 27001.
            </p>
          </div>
        </div>
      )}

      {/* Audit Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in duration-150">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-md"
              aria-label="Đóng chi tiết nhật ký"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-orange-50 text-[#eb6e34] rounded-xl">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Chi tiết Sự kiện Audit</h3>
                <p className="text-xs text-slate-500 font-mono">Mã sự kiện: #{selectedLog.id}</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Thời gian tạo:</span>
                  <strong className="text-slate-900 font-mono">
                    {new Date(selectedLog.createdAt).toLocaleString('vi-VN')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Tác nhân (Actor):</span>
                  <strong className="text-[#eb6e34] font-bold">
                    {selectedLog.username || 'Hệ thống'}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Hành động:</span>
                  <span className="font-bold text-slate-900">{getActionLabel(selectedLog.action)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Đối tượng tác động:</span>
                  <span className="font-mono text-slate-800">
                    {selectedLog.entityType} {selectedLog.entityId ? `#${selectedLog.entityId}` : ''}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Địa chỉ IP:</span>
                  <span className="font-mono text-slate-900">{selectedLog.ipAddress || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Kết quả:</span>
                  <span
                    className={`font-bold ${
                      selectedLog.success ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {selectedLog.success ? 'Thành công (SUCCESS)' : 'Thất bại (FAILURE)'}
                  </span>
                </div>
              </div>

              {selectedLog.details && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1 font-medium">Chi tiết nội dung:</span>
                  <p className="font-mono text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 break-words text-[11px]">
                    {selectedLog.details}
                  </p>
                </div>
              )}

              {selectedLog.errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
                  <span className="text-rose-600 font-bold block mb-1">Thông báo lỗi:</span>
                  <p className="font-mono text-[11px] break-words">{selectedLog.errorMessage}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Settings Edit Modal */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Cấu hình Biểu phí Nền tảng</h3>
                  <p className="text-xs text-slate-500">Thiết lập hoa hồng bán đứt và phí cho thuê đồ</p>
                </div>
              </div>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateFeesMutation.mutate(feeFormData);
              }}
              className="space-y-4"
            >
              {/* Sale Commission Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
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
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#eb6e34]/20 focus:border-[#eb6e34]"
                    placeholder="5.0"
                  />
                  <span className="absolute right-3.5 top-2.5 text-sm text-slate-400 font-bold">%</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ví dụ: 5% - Nếu sản phẩm 100.000đ, phí nền tảng là 5.000đ, người bán nhận 95.000đ.
                </p>
              </div>

              {/* Rental Fee Mode Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Phương thức tính phí cho thuê:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeeFormData((prev) => ({ ...prev, rentalFeeMode: 'PERCENT' }))}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition ${
                      feeFormData.rentalFeeMode === 'PERCENT'
                        ? 'border-[#eb6e34] bg-orange-50/60 text-[#eb6e34] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Theo phần trăm (%)
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Trích % theo tổng tiền thuê
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeeFormData((prev) => ({ ...prev, rentalFeeMode: 'PER_DAY' }))}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition ${
                      feeFormData.rentalFeeMode === 'PER_DAY'
                        ? 'border-[#eb6e34] bg-orange-50/60 text-[#eb6e34] shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Cố định theo ngày (VNĐ/ngày)
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Thu phí cố định mỗi ngày thuê
                    </span>
                  </button>
                </div>
              </div>

              {/* Rental Fee Value Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  {feeFormData.rentalFeeMode === 'PERCENT'
                    ? 'Tỷ lệ phí thuê (%):'
                    : 'Mức phí thuê mỗi ngày (VNĐ/ngày):'}
                </label>
                <div className="relative">
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
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#eb6e34]/20 focus:border-[#eb6e34]"
                    placeholder={feeFormData.rentalFeeMode === 'PERCENT' ? '10.0' : '5000'}
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">
                    {feeFormData.rentalFeeMode === 'PERCENT' ? '%' : 'VNĐ/ngày'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {feeFormData.rentalFeeMode === 'PERCENT'
                    ? 'Ví dụ: 10% - Tổng tiền thuê 100.000đ thì phí là 10.000đ.'
                    : 'Ví dụ: 5.000đ/ngày - Thuê 3 ngày thì phí là 15.000đ.'}
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={updateFeesMutation.isPending}
                  className="flex-1 py-2.5 px-4 bg-[#eb6e34] hover:bg-[#d35a22] text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <ImageIcon size={18} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Cài đặt Giới hạn Media Sản phẩm
                </h3>
              </div>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
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
              {/* Max Images */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Số lượng ảnh mô tả tối đa (1 - 20):
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
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-400">
                  Người bán được upload tối đa bấy nhiêu ảnh chi tiết kèm 1 ảnh biểu trưng đại diện.
                </p>
              </div>

              {/* Allow Video Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">
                    Cho phép người bán đăng tải video:
                  </span>
                  <input
                    type="checkbox"
                    checked={mediaFormData.allowProductVideo}
                    onChange={(e) =>
                      setMediaFormData((prev) => ({
                        ...prev,
                        allowProductVideo: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Nếu tắt, form đăng sản phẩm sẽ khóa mục upload video của thành viên.
                </p>
              </div>

              {/* Max Videos */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Số video tối đa mỗi tin đăng (0 - 5):
                </label>
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
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Max Video Size MB */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Dung lượng video tối đa (MB, 1 - 100):
                </label>
                <div className="relative">
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
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">
                    MB
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Hệ thống từ chối các file video có dung lượng vượt quá giá trị này.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={updateMediaMutation.isPending}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
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
