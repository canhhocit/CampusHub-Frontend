import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: string;
}

export const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps = {}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm font-medium text-gray-500">Đang kiểm tra phiên đăng nhập...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const isAdminRequired = requiredRole === 'ROLE_ADMIN' || requiredRole === 'ADMIN';
    const isUserAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';
    if (isAdminRequired && !isUserAdmin) {
      return <Navigate to="/" replace />;
    } else if (!isAdminRequired && user?.role !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
