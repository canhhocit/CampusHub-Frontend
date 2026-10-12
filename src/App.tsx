
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { VerifyIdentity } from './pages/auth/VerifyIdentity';
import { Dashboard } from './pages/Dashboard';
import { MarketplaceList } from './pages/marketplace/MarketplaceList';
import { ProductDetail } from './pages/marketplace/ProductDetail';
import { ProductForm } from './pages/marketplace/ProductForm';
import { MyListings } from './pages/marketplace/MyListings';

import { LockerList } from './pages/admin/lockers/LockerList';
import { LockerDetail } from './pages/admin/lockers/LockerDetail';
import { LockerForm } from './pages/admin/lockers/LockerForm';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AuditLogs } from './pages/admin/AuditLogs';
import { AdminLayout } from './components/AdminLayout';

import { BuyingOrders } from './pages/orders/BuyingOrders';
import { SellingOrders } from './pages/orders/SellingOrders';
import { OrderDetail } from './pages/orders/OrderDetail';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/marketplace" element={<MarketplaceList />} />
          <Route path="/marketplace/:id" element={<ProductDetail />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/marketplace/new" element={<ProductForm />} />
            <Route path="/marketplace/edit/:id" element={<ProductForm />} />
            <Route path="/marketplace/my-listings" element={<MyListings />} />
            <Route path="/orders/buying" element={<BuyingOrders />} />
            <Route path="/orders/selling" element={<SellingOrders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/verify-identity" element={<VerifyIdentity />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/audit" element={<AuditLogs />} />
              <Route path="/admin/lockers" element={<LockerList />} />
              <Route path="/admin/lockers/new" element={<LockerForm />} />
              <Route path="/admin/lockers/edit/:id" element={<LockerForm />} />
              <Route path="/admin/lockers/:id" element={<LockerDetail />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
