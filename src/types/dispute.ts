export type DisputeReason =
  | 'EMPTY_COMPARTMENT'
  | 'DAMAGED_ITEM'
  | 'WRONG_ITEM'
  | 'COUNTERFEIT'
  | 'NOT_AS_DESCRIBED'
  | 'OTHER';

export type DisputeStatus =
  | 'OPEN'
  | 'RESOLVED_REFUND_BUYER'
  | 'RESOLVED_PAYOUT_SELLER'
  | 'CANCELLED';

export interface DisputeResponse {
  id: number;
  orderId: number;
  orderNumber: string;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  reason: DisputeReason;
  description: string;
  proofImageUrl?: string | null;
  status: DisputeStatus;
  adminNote?: string | null;
  resolvedByName?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface DisputeCreateRequest {
  reason: DisputeReason;
  description: string;
  proofImageUrl?: string;
}

export interface DisputeResolveRequest {
  status: DisputeStatus;
  adminNote?: string;
}

