import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { KioskLockerInfo, KioskCompartmentInfo, KioskActionResponse } from '../../types/kiosk';
import {
  Lock,
  Unlock,
  KeyRound,
  PackageCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  Building2,
  Delete,
} from 'lucide-react';

export const LockerKiosk = () => {
  const [selectedLockerId, setSelectedLockerId] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<'IDLE' | 'PICKUP' | 'DEPOSIT' | 'SUCCESS'>('IDLE');
  const [pinCode, setPinCode] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [actionResult, setActionResult] = useState<KioskActionResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(30);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
          ' • ' +
          now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all lockers
  const { data: lockers = [] } = useQuery<KioskLockerInfo[]>({
    queryKey: ['kiosk-lockers'],
    queryFn: () => axiosInstance.get('/api/v1/kiosk/lockers').then((res) => res.data),
  });

  // Set default locker
  useEffect(() => {
    if (lockers.length > 0 && selectedLockerId === null) {
      setSelectedLockerId(lockers[0].id);
    }
  }, [lockers, selectedLockerId]);

  // Fetch compartments for selected locker
  const { data: compartments = [], refetch: refetchCompartments } = useQuery<KioskCompartmentInfo[]>({
    queryKey: ['kiosk-compartments', selectedLockerId],
    queryFn: () =>
      axiosInstance.get(`/api/v1/kiosk/lockers/${selectedLockerId}/compartments`).then((res) => res.data),
    enabled: !!selectedLockerId,
  });

  // Auto return to IDLE countdown
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (activeMode === 'SUCCESS' && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (activeMode === 'SUCCESS' && countdown === 0) {
      handleReset();
    }
    return () => clearTimeout(timer);
  }, [activeMode, countdown]);

  // Pickup Mutation
  const pickupMutation = useMutation({
    mutationFn: (code: string) =>
      axiosInstance.post(`/api/v1/kiosk/lockers/${selectedLockerId}/pickup`, { pickupCode: code }),
    onSuccess: (res) => {
      setActionResult(res.data);
      setActiveMode('SUCCESS');
      setCountdown(30);
      refetchCompartments();
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Mã nhận hàng không đúng hoặc đơn hàng chưa sẵn sàng.');
    },
  });

  // Deposit Mutation
  const depositMutation = useMutation({
    mutationFn: (num: string) =>
      axiosInstance.post(`/api/v1/kiosk/lockers/${selectedLockerId}/deposit`, { orderNumber: num }),
    onSuccess: (res) => {
      setActionResult(res.data);
      setActiveMode('SUCCESS');
      setCountdown(30);
      refetchCompartments();
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Không tìm thấy đơn hàng chờ gửi hoặc đơn không thuộc tủ này.');
    },
  });

  const handleReset = () => {
    setActiveMode('IDLE');
    setPinCode('');
    setOrderNumber('');
    setActionResult(null);
    setErrorMessage('');
    setCountdown(30);
  };

  const handleKeypadPress = (key: string) => {
    setErrorMessage('');
    if (key === 'BACK') {
      setPinCode((prev) => prev.slice(0, -1));
    } else if (key === 'CLEAR') {
      setPinCode('');
    } else {
      if (pinCode.length < 6) {
        setPinCode((prev) => prev + key);
      }
    }
  };

  const handlePickupSubmit = () => {
    if (pinCode.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã nhận hàng.');
      return;
    }
    pickupMutation.mutate(pinCode);
  };

  const handleDepositSubmit = () => {
    if (!orderNumber.trim()) {
      setErrorMessage('Vui lòng nhập mã đơn hàng (Ví dụ: ORD-2026...)');
      return;
    }
    depositMutation.mutate(orderNumber.trim());
  };

  const currentLocker = lockers.find((l) => l.id === selectedLockerId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Kiosk Top Bar */}
      <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Lock size={22} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
              CampusHub <span className="text-emerald-400 font-semibold text-sm">SMART LOCKER KIOSK</span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Building2 size={12} className="text-emerald-500" />
              {currentLocker ? `${currentLocker.name} (${currentLocker.location})` : 'Đang nạp trạm tủ...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Locker Station Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 font-medium">Trạm tủ:</span>
            <select
              value={selectedLockerId || ''}
              onChange={(e) => {
                setSelectedLockerId(Number(e.target.value));
                handleReset();
              }}
              className="bg-transparent text-sm font-semibold text-emerald-400 focus:outline-none cursor-pointer"
            >
              {lockers.map((l) => (
                <option key={l.id} value={l.id} className="bg-slate-900 text-slate-200">
                  {l.name} - {l.location}
                </option>
              ))}
            </select>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-emerald-400 font-semibold">{currentTime}</div>
            <div className="text-[10px] text-slate-400">Trạng thái: Hoạt động bình thường</div>
          </div>
        </div>
      </header>

      {/* Main Kiosk Touch Screen Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full">
        {/* MODE 1: IDLE WELCOME SCREEN */}
        {activeMode === 'IDLE' && (
          <div className="w-full max-w-3xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider">
                Chạm vào màn hình để bắt đầu
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Giao Nhận Đồ Tự Động 24/7
              </h2>
              <p className="text-sm text-slate-400 max-w-lg mx-auto">
                Tủ thông minh CampusHub giúp bạn gửi và lấy đồ an toàn mà không cần tiếp xúc hay chờ đợi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {/* Pickup Option */}
              <button
                onClick={() => {
                  setActiveMode('PICKUP');
                  setErrorMessage('');
                }}
                className="group relative p-8 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700/80 hover:border-emerald-500 transition-all shadow-xl hover:shadow-emerald-500/10 text-left flex flex-col justify-between h-64 active:scale-98"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition duration-200">
                  <KeyRound size={28} />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Dành cho Người mua / Thuê
                  </span>
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition">
                    LẤY ĐỒ TỪ TỦ
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Nhập mã PIN 6 chữ số được gửi qua email hoặc app để mở ngăn tủ của bạn.
                  </p>
                </div>
              </button>

              {/* Deposit Option */}
              <button
                onClick={() => {
                  setActiveMode('DEPOSIT');
                  setErrorMessage('');
                }}
                className="group relative p-8 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700/80 hover:border-blue-500 transition-all shadow-xl hover:shadow-blue-500/10 text-left flex flex-col justify-between h-64 active:scale-98"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition duration-200">
                  <PackageCheck size={28} />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                    Dành cho Người bán / Trả đồ
                  </span>
                  <h3 className="text-2xl font-bold text-white group-hover:text-blue-300 transition">
                    GỬI ĐỒ VÀO TỦ
                  </h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Nhập mã đơn hàng của bạn để mở ngăn tủ đã được hệ thống phân bổ sẵn.
                  </p>
                </div>
              </button>
            </div>

            {/* Quick status preview */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Tổng ngăn: {compartments.length}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Ngăn trống: {compartments.filter((c) => c.status === 'AVAILABLE').length}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Đang chứa đồ: {compartments.filter((c) => c.status === 'OCCUPIED' || c.status === 'RESERVED').length}
              </span>
            </div>
          </div>
        )}

        {/* MODE 2: PICKUP TOUCH KEYPAD */}
        {activeMode === 'PICKUP' && (
          <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition"
              >
                <ArrowLeft size={14} /> Quay lại
              </button>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Xác thực Người nhận
              </span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-white">Nhập Mã PIN Nhận Hàng</h2>
              <p className="text-xs text-slate-400">Mã PIN gồm 6 chữ số trong thông báo đơn hàng</p>
            </div>

            {/* PIN Dots Display */}
            <div className="flex justify-center gap-3 py-3">
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center font-mono text-2xl font-extrabold transition-all ${
                    pinCode[idx]
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/10'
                      : 'border-slate-700 bg-slate-900 text-slate-600'
                  }`}
                >
                  {pinCode[idx] || '•'}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Touch Keypad */}
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((key) => {
                const isClear = key === 'CLEAR';
                const isBack = key === 'BACK';
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress(key)}
                    className={`h-16 rounded-xl font-bold text-xl flex items-center justify-center transition active:scale-95 shadow-md ${
                      isClear
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm'
                        : isBack
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                        : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    {isBack ? <Delete size={20} /> : isClear ? 'XÓA' : key}
                  </button>
                );
              })}
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePickupSubmit}
              disabled={pinCode.length < 6 || pickupMutation.isPending}
              className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/30 active:scale-98"
            >
              {pickupMutation.isPending ? (
                <span>Đang kiểm tra mã và mở tủ...</span>
              ) : (
                <>
                  <Unlock size={20} />
                  XÁC NHẬN MỞ TỦ
                </>
              )}
            </button>
          </div>
        )}

        {/* MODE 3: DEPOSIT ORDER INPUT */}
        {activeMode === 'DEPOSIT' && (
          <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 transition"
              >
                <ArrowLeft size={14} /> Quay lại
              </button>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Gửi Hàng Vào Tủ
              </span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-white">Nhập Mã Đơn Hàng</h2>
              <p className="text-xs text-slate-400">Nhập mã đơn hàng từ tài khoản người bán của bạn</p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => {
                  setOrderNumber(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Ví dụ: ORD-2026..."
                className="w-full px-4 py-3.5 bg-slate-900 border-2 border-slate-700 rounded-xl text-white font-mono text-center text-lg placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition"
              />

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleDepositSubmit}
              disabled={!orderNumber.trim() || depositMutation.isPending}
              className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 active:scale-98"
            >
              {depositMutation.isPending ? (
                <span>Đang xử lý phân bổ ngăn tủ...</span>
              ) : (
                <>
                  <Unlock size={20} />
                  MỞ NGĂN GỬI ĐỒ
                </>
              )}
            </button>
          </div>
        )}

        {/* MODE 4: SUCCESS DOOR OPENED & SIMULATION VIEW */}
        {activeMode === 'SUCCESS' && actionResult && (
          <div className="w-full max-w-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
              <Unlock size={32} />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase">
                MỞ KHÓA THÀNH CÔNG
              </span>
              <h2 className="text-3xl font-extrabold text-white">
                Cửa Ngăn Tủ <span className="text-emerald-400 underline">{actionResult.compartmentCode}</span> Đã Mở!
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                {actionResult.message || 'Vui lòng nhận/gửi hàng vào ngăn tủ và đóng chặt cửa lại.'}
              </p>
            </div>

            {/* Visual Compartment Grid Simulation */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span>Mô phỏng mặt tủ: {actionResult.lockerName}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Ngăn {actionResult.compartmentCode} đang mở
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {compartments.map((comp) => {
                  const isTarget = comp.code === actionResult.compartmentCode;
                  return (
                    <div
                      key={comp.id}
                      className={`h-20 rounded-xl flex flex-col items-center justify-center p-2 font-mono transition-all duration-300 ${
                        isTarget
                          ? 'border-2 border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-lg shadow-emerald-500/30 scale-105 animate-pulse'
                          : comp.status === 'AVAILABLE'
                          ? 'border border-slate-800 bg-slate-950/60 text-slate-500'
                          : 'border border-slate-800/60 bg-slate-950/90 text-slate-600'
                      }`}
                    >
                      <div className="text-sm font-bold">{comp.code}</div>
                      <div className="text-[10px] uppercase font-sans mt-1">
                        {isTarget ? 'ĐANG MỞ' : comp.status === 'AVAILABLE' ? 'Trống' : 'Khóa'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Countdown & Done button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 active:scale-98"
              >
                <CheckCircle2 size={18} />
                TÔI ĐÃ ĐÓNG CỬA TỦ
              </button>

              <div className="text-xs text-slate-400 flex items-center gap-1.5 py-1">
                <Clock size={14} className="text-slate-500" />
                Tự động kết thúc sau <strong className="text-emerald-400">{countdown}s</strong>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Kiosk Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-3 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>CampusHub Smart Locker v2.0 • Bản quyền FPT University</span>
        <span className="flex items-center gap-1 text-slate-400">
          <HelpCircle size={14} className="text-emerald-500" /> Cần trợ giúp khẩn cấp? Gọi Hotline Ban Quản Lý:{' '}
          <strong className="text-white">1900 6868</strong>
        </span>
      </footer>
    </div>
  );
};
