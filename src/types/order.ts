export type OrderStatus =
  | 'PENDING_SELLER'
  | 'AWAITING_DEPOSIT'
  | 'READY_FOR_PICKUP'
  | 'RENTING'
  | 'AWAITING_RETURN_DEPOSIT'
  | 'READY_FOR_RETURN_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';

export type OrderType = 'PURCHASE' | 'RENTAL';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'MOCK' | 'PAYOS';

export interface Order {
  id: number;
  orderNumber: string;
  productId: number;
  productTitle: string;
  productImageUrl?: string | null;
  priceSnapshot: number;
  status: OrderStatus;
  orderType?: OrderType;
  rentalDurationDays?: number | null;
  dueReturnAt?: string | null;
  depositAmount?: number | null;
  platformFee?: number | null;
  sellerPayout?: number | null;
  totalAmount?: number | null;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  payosOrderCode?: number | null;
  paymentPaidAt?: string | null;
  refundedAt?: string | null;
  checkoutUrl?: string | null;
  qrCode?: string | null;
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
  returnLockerId?: number | null;
  returnLockerName?: string | null;
  returnCompartmentId?: number | null;
  returnCompartmentCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends Order {
  pickupDeadline?: string | null;
  pickupAttempts?: number;
  depositAt?: string | null;
  pickedUpAt?: string | null;
  returnDepositAt?: string | null;
  returnPickedUpAt?: string | null;
  cancelledAt?: string | null;
  clearedAt?: string | null;
  rejectionReason?: string | null;
  version?: number;
  pickupCode?: string | null;
  returnPickupCode?: string | null;
  rentPricePerDaySnapshot?: number | null;
  rentalDepositSnapshot?: number | null;
  sellerEarnings?: number | null;
  rentalStartDate?: string | null;
  rentalEndDate?: string | null;
  returnLockerLocation?: string | null;
}

export interface OrderCreatePayload {
  productId: number;
  preferredLockerId?: number | null;
  orderType?: OrderType;
  rentalDurationDays?: number | null;
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

export interface OrderReturnPayload {
  lockerId: number;
  compartmentId?: number | null;
}

export interface PaymentCreatePayload {
  paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
  success: boolean;
  orderId: number;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  payosOrderCode?: number | null;
  checkoutUrl?: string | null;
  qrCode?: string | null;
  message?: string;
  paidAt?: string | null;
}

