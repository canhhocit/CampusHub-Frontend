import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { DashboardStatsResponse } from '../../types/admin';
import { AdminNav } from '../../components/AdminNav';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const { data: stats, isLoading, isError, refetch, isFetching } = useQuery<DashboardStatsResponse>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => axiosInstance.get('/api/v1/admin/dashboard').then((res) => res.data),
    refetchInterval: 30000, // Tự động làm mới sau mỗi 30s
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              📊 Tổng quan Quản trị Hệ thống
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Theo dõi tình trạng hoạt động của người dùng, sản phẩm, đơn hàng và hệ thống tủ thông minh.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition"
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin text-purple-600' : ''} />
            Làm mới dữ liệu
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        ) : isError || !stats ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
            <AlertTriangle className="mx-auto mb-2" size={32} />
            <h3 className="font-semibold text-lg">Không thể tải số liệu thống kê</h3>
            <p className="text-sm mt-1">Vui lòng kiểm tra quyền Admin hoặc kết nối mạng.</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 4 Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Users */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Người dùng</span>
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Users size={22} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-gray-900">{stats.userStats.totalUsers}</h3>
                  <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
                    <TrendingUp size={14} className="mr-1" />
                    +{stats.userStats.newUsersToday} hôm nay / +{stats.userStats.newUsersThisWeek} tuần này
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>Hoạt động: <strong className="text-emerald-600">{stats.userStats.activeUsers}</strong></span>
                  <span>Bị khóa: <strong className="text-red-600">{stats.userStats.lockedUsers}</strong></span>
                </div>
              </div>

              {/* Products */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Sản phẩm đăng bán</span>
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                    <ShoppingBag size={22} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-gray-900">{stats.productStats.totalProducts}</h3>
                  <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
                    <TrendingUp size={14} className="mr-1" />
                    +{stats.productStats.newProductsToday} hôm nay / +{stats.productStats.newProductsThisWeek} tuần này
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>Đang mở bán: <strong className="text-blue-600">{stats.productStats.activeProducts}</strong></span>
                  <span>Đã bán: <strong className="text-emerald-600">{stats.productStats.soldProducts}</strong></span>
                </div>
              </div>

              {/* Orders */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Tổng số đơn hàng</span>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Package size={22} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-gray-900">{stats.orderStats.totalOrders}</h3>
                  <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
                    <CheckCircle2 size={14} className="mr-1" />
                    {stats.orderStats.completedOrdersToday} đơn hoàn tất hôm nay
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>Chờ nhận: <strong className="text-purple-600">{stats.orderStats.readyForPickupOrders}</strong></span>
                  <span>Hoàn tất: <strong className="text-emerald-600">{stats.orderStats.completedOrders}</strong></span>
                </div>
              </div>

              {/* Lockers */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Tủ & Ngăn chứa</span>
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                    <Lock size={22} />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {stats.lockerStats.totalCompartments}
                    <span className="text-sm font-normal text-gray-500 ml-1">ngăn</span>
                  </h3>
                  <div className="mt-2 flex items-center text-xs text-purple-600 font-medium">
                    Tỷ lệ lấp đầy: {stats.lockerStats.utilizationRate.toFixed(1)}%
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
                  <span>Sẵn sàng: <strong className="text-emerald-600">{stats.lockerStats.availableCompartments}</strong></span>
                  <span>Đang chứa: <strong className="text-purple-600">{stats.lockerStats.occupiedCompartments}</strong></span>
                </div>
              </div>
            </div>

            {/* Detailed Sections: Orders Breakdown & Locker Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Flow Breakdown */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={20} className="text-purple-600" />
                  Trạng thái chu trình đơn hàng
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase">
                      <Clock size={15} /> Chờ người bán duyệt
                    </div>
                    <div className="mt-2 text-2xl font-bold text-amber-900">
                      {stats.orderStats.pendingOrders}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase">
                      <Package size={15} /> Chờ gửi vào tủ
                    </div>
                    <div className="mt-2 text-2xl font-bold text-blue-900">
                      {stats.orderStats.awaitingDepositOrders}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold uppercase">
                      <KeyRound size={15} /> Sẵn sàng nhận hàng
                    </div>
                    <div className="mt-2 text-2xl font-bold text-purple-900">
                      {stats.orderStats.readyForPickupOrders}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase">
                      <CheckCircle2 size={15} /> Đã hoàn thành
                    </div>
                    <div className="mt-2 text-2xl font-bold text-emerald-900">
                      {stats.orderStats.completedOrders}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-rose-50 border border-rose-100">
                    <div className="flex items-center gap-2 text-rose-700 text-xs font-semibold uppercase">
                      <AlertTriangle size={15} /> Quá hạn nhận (Expired)
                    </div>
                    <div className="mt-2 text-2xl font-bold text-rose-900">
                      {stats.orderStats.expiredOrders}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600 text-xs font-semibold uppercase">
                      <XCircle size={15} /> Đã hủy / Từ chối
                    </div>
                    <div className="mt-2 text-2xl font-bold text-gray-800">
                      {stats.orderStats.cancelledOrders + stats.orderStats.rejectedOrders}
                    </div>
                  </div>
                </div>
              </div>

              {/* Locker Utilization Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-purple-600" />
                    Hiệu suất sử dụng tủ ({stats.lockerStats.activeLockers} tủ hoạt động)
                  </h3>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Tỷ lệ chiếm dụng</span>
                      <span className="font-bold text-purple-700">
                        {stats.lockerStats.utilizationRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(stats.lockerStats.utilizationRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        Ngăn trống (Available)
                      </span>
                      <strong className="text-gray-900">{stats.lockerStats.availableCompartments}</strong>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        Đã đặt chỗ (Reserved)
                      </span>
                      <strong className="text-gray-900">{stats.lockerStats.reservedCompartments}</strong>
                    </div>
                    <div className="flex justify-between items-center text-sm py-1.5">
                      <span className="text-gray-600 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        Đang chứa hàng (Occupied)
                      </span>
                      <strong className="text-gray-900">{stats.lockerStats.occupiedCompartments}</strong>
                    </div>
                  </div>
                </div>

                <Link
                  to="/admin/lockers"
                  className="mt-6 w-full py-2.5 px-4 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition text-center flex items-center justify-center gap-2"
                >
                  Quản lý chi tiết tủ Locker
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Security & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Security Health */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-amber-500" />
                  Cảnh báo bảo mật & Đăng nhập
                </h3>
                <div className="space-y-4">
                  <div className="p-3.5 bg-amber-50/60 rounded-lg border border-amber-200/50 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-semibold text-amber-800">Đăng nhập thất bại (Hôm nay)</div>
                      <div className="text-xs text-amber-600">Sai mật khẩu hoặc tài khoản</div>
                    </div>
                    <span className="text-xl font-bold text-amber-900">
                      {stats.securityStats.failedLoginsToday}
                    </span>
                  </div>

                  <div className="p-3.5 bg-red-50/60 rounded-lg border border-red-200/50 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-semibold text-red-800">Nhập sai mã OTP lấy đồ</div>
                      <div className="text-xs text-red-600">Tại các tủ thông minh hôm nay</div>
                    </div>
                    <span className="text-xl font-bold text-red-900">
                      {stats.securityStats.failedPickupAttemptsToday}
                    </span>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-200/50 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-semibold text-blue-800">Đăng nhập thất bại (Tuần này)</div>
                      <div className="text-xs text-blue-600">Tổng 7 ngày qua</div>
                    </div>
                    <span className="text-xl font-bold text-blue-900">
                      {stats.securityStats.failedLoginsThisWeek}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/admin/users"
                  className="p-6 bg-white rounded-xl border border-gray-200 shadow-xs hover:border-purple-400 hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg w-fit group-hover:bg-blue-600 group-hover:text-white transition">
                      <Users size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mt-4">Quản lý Người dùng</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Tra cứu tài khoản sinh viên, xem số đơn hàng/sản phẩm và thực hiện khóa hoặc kích hoạt tài khoản.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    Đi tới danh sách người dùng <ArrowRight size={16} className="ml-1" />
                  </div>
                </Link>

                <Link
                  to="/admin/audit"
                  className="p-6 bg-white rounded-xl border border-gray-200 shadow-xs hover:border-purple-400 hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg w-fit group-hover:bg-purple-600 group-hover:text-white transition">
                      <ShieldAlert size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mt-4">Nhật ký Hệ thống (Audit Logs)</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Truy vết mọi hành động đăng nhập, sửa đổi đơn hàng, giao nhận tủ, thay đổi phân quyền và bảo mật.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                    Tra cứu lịch sử Audit <ArrowRight size={16} className="ml-1" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
