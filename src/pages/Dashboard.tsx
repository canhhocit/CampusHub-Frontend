
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Welcome, {user?.username}!</h2>
          <p className="text-blue-800">Your role is: <span className="font-bold">{user?.role}</span></p>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md text-left transition"
          >
            <h3 className="font-semibold text-gray-900">🛍️ Campus Marketplace</h3>
            <p className="text-sm text-gray-500 mt-1">Browse and buy student listings</p>
          </button>

          <button
            onClick={() => navigate('/marketplace/my-listings')}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md text-left transition"
          >
            <h3 className="font-semibold text-gray-900">📦 Quản lý tin đăng của tôi</h3>
            <p className="text-sm text-gray-500 mt-1">Xem, thêm mới hoặc sửa các sản phẩm đang bán</p>
          </button>

          <button
            onClick={() => navigate('/orders/buying')}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-emerald-500 hover:shadow-md text-left transition"
          >
            <h3 className="font-semibold text-emerald-900">📥 Đơn mua & Nhận đồ</h3>
            <p className="text-sm text-gray-500 mt-1">Theo dõi đơn đặt mua, mã nhận đồ tại tủ locker</p>
          </button>

          <button
            onClick={() => navigate('/orders/selling')}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-500 hover:shadow-md text-left transition"
          >
            <h3 className="font-semibold text-indigo-900">📤 Đơn bán & Gửi đồ</h3>
            <p className="text-sm text-gray-500 mt-1">Xác nhận đơn và thực hiện gửi đồ vào locker</p>
          </button>

          {user?.role === 'ROLE_ADMIN' && (
            <div className="sm:col-span-2 mt-4 pt-4 border-t border-gray-200">
              <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded">ADMIN</span>
                Khu vực Quản trị Hệ thống
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="p-4 bg-purple-50/70 border border-purple-200 rounded-lg shadow-xs hover:border-purple-500 hover:shadow-md text-left transition"
                >
                  <h3 className="font-semibold text-purple-900">📊 Tổng quan Dashboard</h3>
                  <p className="text-xs text-purple-700 mt-1">Xem thống kê người dùng, đơn hàng, tủ và bảo mật</p>
                </button>

                <button
                  onClick={() => navigate('/admin/users')}
                  className="p-4 bg-purple-50/70 border border-purple-200 rounded-lg shadow-xs hover:border-purple-500 hover:shadow-md text-left transition"
                >
                  <h3 className="font-semibold text-purple-900">👥 Quản lý Người dùng</h3>
                  <p className="text-xs text-purple-700 mt-1">Tra cứu, xem thông tin và khóa/mở khóa tài khoản</p>
                </button>

                <button
                  onClick={() => navigate('/admin/lockers')}
                  className="p-4 bg-purple-50/70 border border-purple-200 rounded-lg shadow-xs hover:border-purple-500 hover:shadow-md text-left transition"
                >
                  <h3 className="font-semibold text-purple-900">🔐 Quản lý Tủ Locker</h3>
                  <p className="text-xs text-purple-700 mt-1">Quản lý các điểm tủ, tình trạng các ngăn chứa</p>
                </button>

                <button
                  onClick={() => navigate('/admin/audit')}
                  className="p-4 bg-purple-50/70 border border-purple-200 rounded-lg shadow-xs hover:border-purple-500 hover:shadow-md text-left transition"
                >
                  <h3 className="font-semibold text-purple-900">📝 Nhật ký Audit Logs</h3>
                  <p className="text-xs text-purple-700 mt-1">Truy vết lịch sử đăng nhập, đơn hàng và sự kiện</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
