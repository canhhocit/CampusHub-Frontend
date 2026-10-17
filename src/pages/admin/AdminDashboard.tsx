import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { DashboardStatsResponse, AuditLogItem, AuditAction } from '../../types/admin';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

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

  const handleRefreshAll = () => {
    refetchStats();
    refetchLogs();
  };

  const isRefreshing = isFetchingStats || isFetchingLogs;

  const handlePrint = () => {
    window.print();
  };

  const getActionBadgeClass = (action: AuditAction) => {
    if (action.startsWith('USER_')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.startsWith('ORDER_')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (action.startsWith('PRODUCT_')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (action.startsWith('LOCKER_') || action.startsWith('COMPARTMENT_'))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.startsWith('ADMIN_')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
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
        {/* Subtle decorative gradient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider rounded-md bg-purple-100 text-purple-700 border border-purple-200">
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
                Người lập báo cáo: <strong className="text-purple-700">{user?.fullName || user?.username || 'Quản trị viên'}</strong>
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold shadow-sm shadow-purple-600/30 transition"
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
                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
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
                  <strong className="text-purple-600">{stats.orderStats.readyForPickupOrders}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Hoàn tất thành công:</span>
                  <strong className="text-emerald-600">{stats.orderStats.completedOrders}</strong>
                </div>
              </div>
            </div>

            {/* 4. Tủ Locker Thông minh */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 transition group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tủ Locker Thông minh
                  </span>
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition">
                    <Lock size={20} />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-slate-900">
                    {stats.lockerStats.totalCompartments}
                    <span className="text-sm font-normal text-slate-500 ml-1">ngăn</span>
                  </div>
                  <div className="mt-1 flex items-center text-xs font-semibold text-purple-600">
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
                  <strong className="text-purple-600">{stats.lockerStats.occupiedCompartments}</strong>
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
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
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
                <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/60 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-purple-800 text-[11px] font-bold uppercase tracking-wider">
                    <KeyRound size={14} /> Sẵn sàng lấy đồ
                  </div>
                  <div className="mt-3 text-2xl font-extrabold text-purple-950">
                    {stats.orderStats.readyForPickupOrders}
                  </div>
                  <div className="text-[11px] text-purple-700 mt-1">Đang chờ người mua đến tủ</div>
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
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
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
                    <span className="font-extrabold text-purple-700">
                      {stats.lockerStats.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div
                      className="bg-purple-600 h-3 rounded-full transition-all duration-500"
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
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
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
                className="mt-6 w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition text-center flex items-center justify-center gap-2 border border-purple-200 print:hidden"
              >
                Quản lý chi tiết mạng lưới tủ Locker
                <ArrowRight size={14} />
              </Link>
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition"
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
                            className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline"
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
                className="font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
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
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
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
                  <strong className="text-purple-700 font-bold">
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
    </div>
  );
};
