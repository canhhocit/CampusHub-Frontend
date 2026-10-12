export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  lockedUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  verifiedUsers?: number;
  unverifiedUsers?: number;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  soldProducts: number;
  hiddenProducts: number;
  newProductsToday: number;
  newProductsThisWeek: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  awaitingDepositOrders: number;
  readyForPickupOrders: number;
  completedOrders: number;
  expiredOrders: number;
  cancelledOrders: number;
  rejectedOrders: number;
  ordersToday: number;
  ordersThisWeek: number;
  completedOrdersToday: number;
}

export interface LockerStats {
  totalLockers: number;
  activeLockers: number;
  totalCompartments: number;
  availableCompartments: number;
  reservedCompartments: number;
  occupiedCompartments: number;
  utilizationRate: number;
}

export interface SecurityStats {
  failedLoginsToday: number;
  failedLoginsThisWeek: number;
  failedPickupAttemptsToday: number;
  expiredTokensCleanedUp: number;
}

export interface DashboardStatsResponse {
  userStats: UserStats;
  productStats: ProductStats;
  orderStats: OrderStats;
  lockerStats: LockerStats;
  securityStats: SecurityStats;
}

export type AdminUserRole = 'ROLE_USER' | 'ROLE_STUDENT' | 'ROLE_ADMIN' | 'STUDENT' | 'ADMIN' | string;
export type AdminUserStatus = 'ACTIVE' | 'PENDING' | 'LOCKED';

export interface UserManagementItem {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  dateOfBirth?: string | null;
  identityVerified?: boolean;
  citizenId?: string | null;
  idCardFrontUrl?: string | null;
  idCardBackUrl?: string | null;
  identityVerifiedAt?: string | null;
  createdAt: string;
  lastLogin?: string | null;
  totalProducts: number;
  totalOrders: number;
}

export interface UpdateUserStatusRequest {
  status: AdminUserStatus;
  reason?: string;
}

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'USER_PROFILE_UPDATE'
  | 'USER_PASSWORD_CHANGE'
  | 'USER_STATUS_CHANGE'
  | 'PRODUCT_CREATE'
  | 'PRODUCT_UPDATE'
  | 'PRODUCT_DELETE'
  | 'PRODUCT_STATUS_CHANGE'
  | 'CATEGORY_CREATE'
  | 'CATEGORY_UPDATE'
  | 'CATEGORY_DELETE'
  | 'CATEGORY_TOGGLE'
  | 'LOCKER_CREATE'
  | 'LOCKER_UPDATE'
  | 'LOCKER_STATUS_CHANGE'
  | 'COMPARTMENT_CREATE'
  | 'COMPARTMENT_STATUS_CHANGE'
  | 'ORDER_CREATE'
  | 'ORDER_ACCEPT'
  | 'ORDER_REJECT'
  | 'ORDER_CANCEL'
  | 'ORDER_DEPOSIT'
  | 'ORDER_PICKUP'
  | 'ORDER_PICKUP_FAILED'
  | 'ORDER_EXPIRED'
  | 'ORDER_CLEARED'
  | 'ADMIN_ACCESS_DASHBOARD'
  | 'ADMIN_VIEW_USERS'
  | 'ADMIN_VIEW_ORDERS'
  | 'ADMIN_CLEAR_EXPIRED_ORDER'
  | 'TOKEN_CLEANUP'
  | 'SYSTEM_ERROR';

export type AuditEntityType =
  | 'USER'
  | 'PRODUCT'
  | 'CATEGORY'
  | 'LOCKER'
  | 'COMPARTMENT'
  | 'ORDER'
  | 'REFRESH_TOKEN'
  | 'VERIFICATION_TOKEN'
  | 'SYSTEM';

export interface AuditLogItem {
  id: number;
  userId?: number | null;
  username?: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: number | null;
  details?: string | null;
  ipAddress?: string | null;
  success: boolean;
  errorMessage?: string | null;
  createdAt: string;
}
