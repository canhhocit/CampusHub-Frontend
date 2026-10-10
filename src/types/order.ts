export type OrderStatus =
  | 'PENDING_SELLER'
  | 'AWAITING_DEPOSIT'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface Order {
  id: number;
  orderNumber: string;
  productId: number;
  productTitle: string;
  productImageUrl?: string | null;
  priceSnapshot: number;
  status: OrderStatus;
  buyerId: number;
  buyerUsername: string;
  buyerFullName: string;
  sellerId: number;
  sellerUsername: string;
  sellerFullName: string;
  lockerId?: number | null;
  lockerCode?: string | null;
  lockerName?: string | null;
  lockerLocation?: string | null;
  compartmentId?: number | null;
  compartmentCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends Order {
  pickupDeadline?: string | null;
  pickupAttempts?: number;
  depositAt?: string | null;
  pickedUpAt?: string | null;
  cancelledAt?: string | null;
  rejectionReason?: string | null;
  version?: number;
  pickupCode?: string | null;
}

export interface OrderCreatePayload {
  productId: number;
  preferredLockerId?: number | null;
}

export interface OrderAcceptPayload {
  lockerId?: number | null;
}

export interface OrderRejectPayload {
  reason?: string;
}

export interface OrderPickupPayload {
  pickupCode: string;
}
