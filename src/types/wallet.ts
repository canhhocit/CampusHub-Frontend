export interface WalletResponse {
  userId: number;
  username: string;
  balance: number;
  frozenBalance: number;
  totalBalance: number;
  version: number;
}

export type TransactionType =
  | 'ORDER_PAYOUT'
  | 'DEPOSIT_REFUND'
  | 'WITHDRAWAL'
  | 'WITHDRAWAL_REFUND'
  | 'ORDER_REFUND';

export interface WalletTransactionResponse {
  id: number;
  orderId?: number | null;
  payoutRequestId?: number | null;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface UserBankAccountResponse {
  id: number;
  bankCode: string;
  bankName?: string | null;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface UserBankAccountRequest {
  bankCode: string;
  bankName?: string;
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
}

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface PayoutRequestResponse {
  id: number;
  userId?: number;
  username?: string;
  fullName?: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  status: PayoutStatus;
  referenceCode?: string | null;
  adminNote?: string | null;
  processedByName?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export interface WithdrawalRequestDto {
  amount: number;
  bankAccountId?: number | null;
}

export interface WalletConfigResponse {
  minWithdrawalAmount: number;
}

export interface UpdateWithdrawalConfigRequest {
  minWithdrawalAmount: number;
}
