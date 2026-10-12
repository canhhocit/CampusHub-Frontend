import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  Inbox,
  Send,
  LayoutDashboard,
  Users,
  Lock,
  FileText,
  LogOut,
  Shield,
  User as UserIcon,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bảng điều khiển</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>

        <div className="bg-purple-50/70 p-5 rounded-xl border border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-200/60 text-purple-800 rounded-full">
              {isAdmin ? <Shield size={22} /> : <UserIcon size={22} />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-purple-950">Xin chào, {user?.username}!</h2>
              <p className="text-sm text-purple-800">
                Vai trò của bạn:{' '}
                <span className="font-semibold">
                  {isAdmin ? 'Quản trị viên (Admin)' : 'Thành viên (Member)'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wider text-xs mb-3">
            Dịch vụ Chợ & Tủ đồ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/marketplace')}
              className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs hover:border-purple-500 hover:shadow-md text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Chợ Trao Đổi Đồ Cũ</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Khám phá và mua sắm đồ dùng trên toàn thành phố</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/marketplace/my-listings')}
              className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs hover:border-purple-500 hover:shadow-md text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Quản lý tin đăng của tôi</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Xem, thêm mới hoặc sửa các sản phẩm đang bán</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/orders/buying')}
              className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs hover:border-emerald-500 hover:shadow-md text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Inbox size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Đơn mua & Nhận đồ</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Theo dõi đơn hàng, mã nhận đồ tại tủ locker</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/orders/selling')}
              className="p-5 bg-white border border-gray-200 rounded-xl shadow-xs hover:border-indigo-500 hover:shadow-md text-left transition group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Đơn bán & Gửi đồ</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Xác nhận đơn và thực hiện gửi đồ vào locker</p>
                </div>
              </div>
            </button>
          </div>

          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-base font-bold text-purple-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded font-semibold">
                  ADMIN
                </span>
                Khu vực Quản trị Hệ thống
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="p-5 bg-purple-50/50 border border-purple-200 rounded-xl shadow-xs hover:border-purple-500 hover:shadow-md text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg group-hover:bg-purple-700 group-hover:text-white transition">
                      <LayoutDashboard size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900">Tổng quan Quản trị</h3>
                      <p className="text-xs text-purple-700 mt-0.5">
                        Thống kê người dùng, đơn hàng, tủ và bảo mật
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/users')}
                  className="p-5 bg-purple-50/50 border border-purple-200 rounded-xl shadow-xs hover:border-purple-500 hover:shadow-md text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg group-hover:bg-purple-700 group-hover:text-white transition">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900">Quản lý Người dùng</h3>
                      <p className="text-xs text-purple-700 mt-0.5">
                        Tra cứu, xem thông tin và khóa/mở khóa tài khoản
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/lockers')}
                  className="p-5 bg-purple-50/50 border border-purple-200 rounded-xl shadow-xs hover:border-purple-500 hover:shadow-md text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg group-hover:bg-purple-700 group-hover:text-white transition">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900">Quản lý Tủ đồ Locker</h3>
                      <p className="text-xs text-purple-700 mt-0.5">
                        Quản lý các điểm tủ, tình trạng các ngăn chứa
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/audit')}
                  className="p-5 bg-purple-50/50 border border-purple-200 rounded-xl shadow-xs hover:border-purple-500 hover:shadow-md text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg group-hover:bg-purple-700 group-hover:text-white transition">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900">Nhật ký Hệ thống (Audit)</h3>
                      <p className="text-xs text-purple-700 mt-0.5">
                        Truy vết lịch sử đăng nhập, đơn hàng và bảo mật
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
