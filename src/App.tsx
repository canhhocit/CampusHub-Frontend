import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Core lightweight public pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { MarketplaceList } from './pages/marketplace/MarketplaceList';
import { AboutGuide } from './pages/AboutGuide';
import { UserLayout } from './components/UserLayout';
import { AdminLayout } from './components/AdminLayout';

// Lazy-loaded routes for optimal initial bundle & fast 4G load
const ProductDetail = lazy(() => import('./pages/marketplace/ProductDetail').then(m => ({ default: m.ProductDetail })));
const ProductForm = lazy(() => import('./pages/marketplace/ProductForm').then(m => ({ default: m.ProductForm })));
const MyListings = lazy(() => import('./pages/marketplace/MyListings').then(m => ({ default: m.MyListings })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const BuyingOrders = lazy(() => import('./pages/orders/BuyingOrders').then(m => ({ default: m.BuyingOrders })));
const SellingOrders = lazy(() => import('./pages/orders/SellingOrders').then(m => ({ default: m.SellingOrders })));
const OrderDetail = lazy(() => import('./pages/orders/OrderDetail').then(m => ({ default: m.OrderDetail })));
const WalletPage = lazy(() => import('./pages/wallet/WalletPage').then(m => ({ default: m.WalletPage })));
const VerifyIdentity = lazy(() => import('./pages/auth/VerifyIdentity').then(m => ({ default: m.VerifyIdentity })));

// Admin lazy pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs').then(m => ({ default: m.AuditLogs })));
const AdminPayouts = lazy(() => import('./pages/admin/AdminPayouts').then(m => ({ default: m.AdminPayouts })));
const AdminDisputes = lazy(() => import('./pages/admin/AdminDisputes').then(m => ({ default: m.AdminDisputes })));
const LockerList = lazy(() => import('./pages/admin/lockers/LockerList').then(m => ({ default: m.LockerList })));
const LockerDetail = lazy(() => import('./pages/admin/lockers/LockerDetail').then(m => ({ default: m.LockerDetail })));
const LockerForm = lazy(() => import('./pages/admin/lockers/LockerForm').then(m => ({ default: m.LockerForm })));

// Standalone Kiosk
const LockerKiosk = lazy(() => import('./pages/kiosk/LockerKiosk').then(m => ({ default: m.LockerKiosk })));

const PageFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-2 p-8">
    <div className="w-8 h-8 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin" />
    <span className="text-xs font-medium text-slate-500">Đang tải trang...</span>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Smart Locker Interactive Kiosk */}
              <Route path="/kiosk" element={<LockerKiosk />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Member & Marketplace Routes with Navbar */}
              <Route element={<UserLayout />}>
                <Route path="/" element={<MarketplaceList />} />
                <Route path="/marketplace" element={<MarketplaceList />} />
                <Route path="/marketplace/:id" element={<ProductDetail />} />
                <Route path="/about-guide" element={<AboutGuide />} />

                {/* Member Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/marketplace/new" element={<ProductForm />} />
                  <Route path="/marketplace/edit/:id" element={<ProductForm />} />
                  <Route path="/marketplace/my-listings" element={<MyListings />} />
                  <Route path="/orders/buying" element={<BuyingOrders />} />
                  <Route path="/orders/selling" element={<SellingOrders />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/verify-identity" element={<VerifyIdentity />} />
                </Route>
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute requiredRole="ROLE_ADMIN" />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/audit" element={<AuditLogs />} />
                  <Route path="/admin/payouts" element={<AdminPayouts />} />
                  <Route path="/admin/disputes" element={<AdminDisputes />} />
                  <Route path="/admin/lockers" element={<LockerList />} />
                  <Route path="/admin/lockers/new" element={<LockerForm />} />
                  <Route path="/admin/lockers/edit/:id" element={<LockerForm />} />
                  <Route path="/admin/lockers/:id" element={<LockerDetail />} />
                </Route>
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
