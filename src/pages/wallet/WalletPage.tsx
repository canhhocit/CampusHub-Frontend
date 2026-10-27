import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import { UserNavTabs } from '../../components/UserNavTabs';
import type {
  WalletResponse,
  WalletTransactionResponse,
  UserBankAccountResponse,
  PayoutRequestResponse,
  UserBankAccountRequest,
  WithdrawalRequestDto,
} from '../../types/wallet';
import type { PageResponse } from '../../types/marketplace';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Building2,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  X,
  RefreshCw,
} from 'lucide-react';

const COMMON_BANKS = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'MB', name: 'MBBank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'CTG', name: 'VietinBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'VIB', name: 'VIB' },
];

export const WalletPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts'>('transactions');
  const [txPage, setTxPage] = useState(0);
  const [payoutPage, setPayoutPage] = useState(0);

  // Modal states
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);

  const [bankCode, setBankCode] = useState('VCB');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // 1. Fetch Wallet Balance
  const { data: wallet, isLoading: isWalletLoading } = useQuery<WalletResponse>({
    queryKey: ['wallet-me'],
    queryFn: () => axiosInstance.get('/api/v1/wallet/me').then((res) => res.data),
  });

  // 2. Fetch Bank Accounts
  const { data: bankAccounts = [], isLoading: isBanksLoading } = useQuery<UserBankAccountResponse[]>({
    queryKey: ['wallet-bank-accounts'],
    queryFn: () => axiosInstance.get('/api/v1/wallet/bank-accounts').then((res) => res.data),
  });

  // 3. Fetch Transactions
  const { data: txData, isLoading: isTxLoading } = useQuery<PageResponse<WalletTransactionResponse>>({
    queryKey: ['wallet-transactions', txPage],
    queryFn: () =>
      axiosInstance
        .get(`/api/v1/wallet/transactions?page=${txPage}&size=10`)
        .then((res) => res.data),
  });

  // 4. Fetch Payout Requests
  const { data: payoutData, isLoading: isPayoutLoading } = useQuery<PageResponse<PayoutRequestResponse>>({
    queryKey: ['wallet-payout-requests', payoutPage],
    queryFn: () =>
      axiosInstance
        .get(`/api/v1/wallet/payout-requests?page=${payoutPage}&size=10`)
        .then((res) => res.data),
  });

  // Mutations
  const addBankMutation = useMutation({
    mutationFn: (data: UserBankAccountRequest) =>
      axiosInstance.post('/api/v1/wallet/bank-accounts', data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-bank-accounts'] });
      setBankModalOpen(false);
      setAccountNumber('');
      setAccountName('');
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Không thể liên kết tài khoản ngân hàng');
    },
  });

  const deleteBankMutation = useMutation({
    mutationFn: (id: number) => axiosInstance.delete(`/api/v1/wallet/bank-accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-bank-accounts'] });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (dto: WithdrawalRequestDto) =>
      axiosInstance.post('/api/v1/wallet/withdraw', dto).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-me'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-payout-requests'] });
      setWithdrawModalOpen(false);
      setWithdrawAmount('');
      setErrorMessage(null);
      setActiveTab('payouts');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Yêu cầu rút tiền không thành công');
    },
  });

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(withdrawAmount);
    if (!val || val < 50000) {
      setErrorMessage('Số tiền rút tối thiểu là 50.000 VNĐ');
      return;
    }
    if (wallet && val > wallet.balance) {
      setErrorMessage('Số dư khả dụng không đủ để rút số tiền này');
      return;
    }
    withdrawMutation.mutate({
      amount: val,
      bankAccountId: selectedBankId,
    });
  };

  const handleAddBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !accountName.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ số tài khoản và tên chủ tài khoản');
      return;
    }
    const found = COMMON_BANKS.find((b) => b.code === bankCode);
    addBankMutation.mutate({
      bankCode,
      bankName: found ? found.name : bankCode,
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim().toUpperCase(),
      isDefault: bankAccounts.length === 0,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-6 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <UserNavTabs />

        {/* 1. Header & Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Available Balance */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Số dư khả dụng
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Wallet size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
                {isWalletLoading ? '...' : formatVND(wallet?.balance || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tiền bán hàng & cọc đã hoàn tất
              </span>
            </div>
            <button
              onClick={() => {
                setErrorMessage(null);
                setWithdrawModalOpen(true);
              }}
              disabled={!wallet || wallet.balance < 50000 || bankAccounts.length === 0}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <ArrowDownLeft size={14} />
              <span>Rút tiền về ngân hàng</span>
            </button>
          </div>

          {/* Card 2: Frozen Balance */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Đang xử lý rút
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                {isWalletLoading ? '...' : formatVND(wallet?.frozenBalance || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Yêu cầu rút đang chờ Admin duyệt
              </span>
            </div>
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
              <span>Tự động hoàn lại nếu lệnh rút bị hủy</span>
            </div>
          </div>

          {/* Card 3: Bank Accounts Widget */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tài khoản ngân hàng
              </span>
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setBankModalOpen(true);
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Plus size={13} /> Thêm mới
              </button>
            </div>

            {isBanksLoading ? (
              <div className="text-xs text-slate-400">Đang tải...</div>
            ) : bankAccounts.length === 0 ? (
              <div className="text-center py-2 space-y-1">
                <p className="text-xs text-slate-500">Chưa liên kết tài khoản nhận tiền</p>
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setBankModalOpen(true);
                  }}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  + Thêm tài khoản ngân hàng
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
                {bankAccounts.map((b) => (
                  <div
                    key={b.id}
                    className="p-2 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold text-slate-800 truncate">
                        {b.bankCode} • {b.accountNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 uppercase truncate">
                        {b.accountName}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteBankMutation.mutate(b.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                      title="Xóa tài khoản"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <span className="text-[10px] text-slate-400 block">
              Dùng để nhận tiền bán hàng & hoàn cọc
            </span>
          </div>
        </div>

        {/* 2. Main Tabbed History (Oreka Clean Style) */}
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 px-5 pt-3 gap-6 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`pb-3 transition relative flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Biến động số dư</span>
              {txData?.totalElements !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
                  {txData.totalElements}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`pb-3 transition relative flex items-center gap-2 ${
                activeTab === 'payouts'
                  ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Yêu cầu rút tiền</span>
              {payoutData?.totalElements !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-medium">
                  {payoutData.totalElements}
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Transactions Table */}
          {activeTab === 'transactions' && (
            <div className="p-5">
              {isTxLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Đang tải lịch sử...</div>
              ) : !txData || txData.content.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Wallet size={32} className="mx-auto text-slate-300" />
                  <p className="text-xs">Chưa có giao dịch nào được ghi nhận</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Loại giao dịch</th>
                        <th className="pb-3 font-semibold">Mô tả</th>
                        <th className="pb-3 font-semibold text-right">Số tiền</th>
                        <th className="pb-3 font-semibold text-right">Số dư sau</th>
                        <th className="pb-3 font-semibold text-right">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {txData.content.map((tx) => {
                        const isPlus = tx.amount > 0;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3 font-medium">
                              {tx.type === 'ORDER_PAYOUT' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                                  <ArrowDownLeft size={12} className="text-emerald-600" /> Tiền bán hàng
                                </span>
                              )}
                              {tx.type === 'DEPOSIT_REFUND' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200/60">
                                  <ArrowDownLeft size={12} className="text-blue-600" /> Hoàn cọc thuê
                                </span>
                              )}
                              {tx.type === 'ORDER_REFUND' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-800 border border-indigo-200/60">
                                  <ArrowDownLeft size={12} className="text-indigo-600" /> Hoàn đơn hủy
                                </span>
                              )}
                              {tx.type === 'WITHDRAWAL' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                  <ArrowUpRight size={12} className="text-slate-500" /> Rút tiền
                                </span>
                              )}
                              {tx.type === 'WITHDRAWAL_REFUND' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                                  <RefreshCw size={12} className="text-amber-600" /> Hoàn lệnh rút
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-slate-700 max-w-xs truncate font-medium">
                              {tx.description}
                            </td>
                            <td
                              className={`py-3 text-right font-bold text-sm tracking-tight ${
                                isPlus ? 'text-emerald-600' : 'text-slate-900'
                              }`}
                            >
                              {isPlus ? `+${formatVND(tx.amount)}` : formatVND(tx.amount)}
                            </td>
                            <td className="py-3 text-right text-slate-500 font-medium">
                              {formatVND(tx.balanceAfter)}
                            </td>
                            <td className="py-3 text-right text-slate-400 text-[11px]">
                              {formatDate(tx.createdAt)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {txData.totalPages > 1 && (
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                      <button
                        disabled={txPage <= 0}
                        onClick={() => setTxPage((p) => Math.max(0, p - 1))}
                        className="px-2.5 py-1 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                      >
                        Trước
                      </button>
                      <span className="text-xs text-slate-500">
                        Trang {txPage + 1} / {txData.totalPages}
                      </span>
                      <button
                        disabled={txPage >= txData.totalPages - 1}
                        onClick={() => setTxPage((p) => p + 1)}
                        className="px-2.5 py-1 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Payout Requests List */}
          {activeTab === 'payouts' && (
            <div className="p-5">
              {isPayoutLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Đang tải yêu cầu rút...</div>
              ) : !payoutData || payoutData.content.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Clock size={32} className="mx-auto text-slate-300" />
                  <p className="text-xs">Chưa có yêu cầu rút tiền nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payoutData.content.map((payout) => (
                    <div
                      key={payout.id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {formatVND(payout.amount)}
                          </span>
                          {payout.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                              <Clock size={11} /> Chờ duyệt
                            </span>
                          )}
                          {payout.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              <CheckCircle2 size={11} /> Đã chuyển khoản
                            </span>
                          )}
                          {payout.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                              <XCircle size={11} /> Bị từ chối
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600 font-medium">
                          Ngân hàng: <strong>{payout.bankCode}</strong> • STK:{' '}
                          <span className="font-mono">{payout.accountNumber}</span> ({payout.accountName})
                        </div>
                        {payout.referenceCode && (
                          <div className="text-[11px] text-emerald-700 font-mono">
                            Mã đối soát ngân hàng: {payout.referenceCode}
                          </div>
                        )}
                        {payout.adminNote && (
                          <div className="text-[11px] text-rose-600 font-medium">
                            Lý do: {payout.adminNote}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-[11px] text-slate-400 shrink-0">
                        <div>Tạo lúc: {formatDate(payout.createdAt)}</div>
                        {payout.processedAt && (
                          <div>Duyệt lúc: {formatDate(payout.processedAt)}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {payoutData.totalPages > 1 && (
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                      <button
                        disabled={payoutPage <= 0}
                        onClick={() => setPayoutPage((p) => Math.max(0, p - 1))}
                        className="px-2.5 py-1 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                      >
                        Trước
                      </button>
                      <span className="text-xs text-slate-500">
                        Trang {payoutPage + 1} / {payoutData.totalPages}
                      </span>
                      <button
                        disabled={payoutPage >= payoutData.totalPages - 1}
                        onClick={() => setPayoutPage((p) => p + 1)}
                        className="px-2.5 py-1 border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: YÊU CẦU RÚT TIỀN */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ArrowDownLeft size={18} className="text-emerald-600" />
                Rút tiền về tài khoản ngân hàng
              </h3>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              {/* Account Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Chọn tài khoản nhận tiền
                </label>
                <select
                  value={selectedBankId || ''}
                  onChange={(e) => setSelectedBankId(Number(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:border-emerald-500 focus:outline-hidden"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankCode} - {b.accountNumber} ({b.accountName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Số tiền muốn rút (VNĐ)</label>
                  <span className="text-[11px] text-slate-500">
                    Khả dụng: <strong>{formatVND(wallet?.balance || 0)}</strong>
                  </span>
                </div>
                <input
                  type="number"
                  min="50000"
                  step="10000"
                  placeholder="Tối thiểu 50.000 VNĐ"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:border-emerald-500 focus:outline-hidden"
                />

                {/* Quick Preset Buttons */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(amt.toString())}
                      className="py-1 px-2 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
                    >
                      {amt / 1000}k
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(wallet?.balance?.toString() || '0')}
                    className="py-1 px-2 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition"
                  >
                    Tất cả
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={withdrawMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition disabled:opacity-50"
                >
                  {withdrawMutation.isPending ? 'Đang gửi yêu cầu...' : 'Xác nhận rút tiền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM TÀI KHOẢN NGÂN HÀNG */}
      {bankModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-emerald-600" />
                Thêm tài khoản ngân hàng nhận tiền
              </h3>
              <button
                onClick={() => setBankModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddBankSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Ngân hàng thụ hưởng
                </label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:border-emerald-500 focus:outline-hidden"
                >
                  {COMMON_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Số tài khoản
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 1012345678"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Tên chủ tài khoản (Không dấu)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: NGUYEN VAN A"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs uppercase font-medium focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBankModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={addBankMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition disabled:opacity-50"
                >
                  {addBankMutation.isPending ? 'Đang lưu...' : 'Lưu tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
