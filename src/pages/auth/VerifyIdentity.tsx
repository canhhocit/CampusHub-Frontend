import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { axiosInstance } from '../../api/axios';
import { ImageUpload } from '../../components/ImageUpload';
import { parseCccdQr, scanQrFromImageSource, type CccdQrData } from '../../utils/cccdQrParser';
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
  PlusCircle,
  Loader2,
  QrCode,
  RefreshCw,
} from 'lucide-react';

export const VerifyIdentity = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [citizenId, setCitizenId] = useState('');
  const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
  const [idCardBackUrl, setIdCardBackUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Trạng thái quét mã QR trên CCCD
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [qrScanResult, setQrScanResult] = useState<CccdQrData | null>(null);
  const [qrScanNotice, setQrScanNotice] = useState<string | null>(null);
  const [showDemoQr, setShowDemoQr] = useState(false);
  const [demoQrInput, setDemoQrInput] = useState('');

  const isVerified = user?.identityVerified;

  // Xử lý quét mã QR tự động từ File ảnh vừa chọn
  const handleFrontFileSelected = async (file: File) => {
    setIsScanningQr(true);
    setQrScanNotice(null);
    setErrorMessage('');

    try {
      const rawText = await scanQrFromImageSource(file);
      if (rawText) {
        processQrText(rawText);
      } else {
        setQrScanNotice(
          'Không tìm thấy mã QR trên ảnh. Bạn có thể tự nhập 12 số CCCD bên dưới hoặc chụp rõ nét góc trên bên phải của thẻ.'
        );
      }
    } catch {
      setQrScanNotice('Không thể quét mã QR từ ảnh. Bạn vui lòng tự nhập 12 số CCCD bên dưới.');
    } finally {
      setIsScanningQr(false);
    }
  };

  // Quét lại từ URL ảnh mặt trước
  const handleRescanFromUrl = async () => {
    if (!idCardFrontUrl || isScanningQr) return;
    setIsScanningQr(true);
    setQrScanNotice(null);

    try {
      const rawText = await scanQrFromImageSource(idCardFrontUrl);
      if (rawText) {
        processQrText(rawText);
      } else {
        setQrScanNotice(
          'Không tìm thấy mã QR trên ảnh này. Vui lòng kiểm tra lại ảnh hoặc tự nhập 12 số CCCD.'
        );
      }
    } catch {
      setQrScanNotice('Không thể đọc mã QR từ ảnh.');
    } finally {
      setIsScanningQr(false);
    }
  };

  // Bóc tách thông tin từ chuỗi QR CCCD
  const processQrText = (rawText: string) => {
    const parsed = parseCccdQr(rawText);
    if (parsed) {
      setQrScanResult(parsed);
      if (parsed.citizenId && /^[0-9]{12}$/.test(parsed.citizenId)) {
        setCitizenId(parsed.citizenId);
      }
      setQrScanNotice(null);
    } else {
      const trimmed = rawText.trim();
      if (/^[0-9]{12}$/.test(trimmed)) {
        setCitizenId(trimmed);
        setQrScanResult({
          citizenId: trimmed,
          fullName: user?.fullName || '',
          dateOfBirthRaw: '',
          dateOfBirthFormatted: '',
          rawText: trimmed,
        });
      } else {
        setQrScanNotice('Đã quét mã QR nhưng định dạng không phải thẻ CCCD chuẩn.');
      }
    }
  };

  const applySampleQr = (sampleStr: string) => {
    setDemoQrInput(sampleStr);
    processQrText(sampleStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage('');

    const cleanCitizenId = citizenId.trim();

    if (!/^[0-9]{12}$/.test(cleanCitizenId)) {
      setErrorMessage('Số CCCD không hợp lệ. Vui lòng nhập đúng 12 chữ số căn cước công dân.');
      return;
    }

    if (!idCardFrontUrl) {
      setErrorMessage('Vui lòng tải lên ảnh mặt trước CCCD của bạn.');
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('/api/v1/users/verify-identity', {
        citizenId: cleanCitizenId,
        idCardFrontUrl,
        idCardBackUrl: idCardBackUrl || null,
      });

      await refreshUser();
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Xác minh danh tính thất bại. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <Link
            to="/marketplace"
            className="text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
          >
            &larr; Quay lại Chợ
          </Link>
          <span className="flex items-center gap-1">
            <Lock size={12} className="text-slate-400" /> Xác thực tài khoản
          </span>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8">
          {/* Header Title */}
          <div className="mb-6 pb-5 border-b border-slate-100">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Xác minh Căn cước công dân
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Hệ thống tự động đọc mã QR trên ảnh thẻ để điền nhanh thông tin.
            </p>
          </div>

          {/* Pending State */}
          {(isSuccess || user?.identityReviewStatus === 'PENDING') && !isVerified && (
            <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-[#eb6e34] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-semibold block">Hồ sơ đã được gửi thành công</strong>
                <span className="text-slate-600 mt-0.5 block">
                  Quản trị viên đang xem xét hồ sơ của bạn. Bạn sẽ nhận được thông báo khi được phê duyệt.
                </span>
              </div>
            </div>
          )}

          {/* Rejected State */}
          {user?.identityReviewStatus === 'REJECTED' && !isSuccess && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>Hồ sơ chưa được phê duyệt. Vui lòng tải lại ảnh CCCD rõ nét hơn để gửi lại.</span>
            </div>
          )}

          {/* Verified State */}
          {isVerified ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 size={30} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Đã xác minh danh tính thành công
              </h2>
              <p className="text-xs text-slate-600 mt-1.5 max-w-sm mx-auto">
                Tài khoản của bạn đã được gắn huy hiệu xác thực. Bạn có thể đăng bán và giao nhận qua Smart Locker.
              </p>

              {user?.citizenId && (
                <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 inline-flex items-center gap-2 text-xs text-slate-600">
                  <CreditCard size={14} className="text-slate-400" />
                  <span>
                    Số CCCD: <strong className="font-mono text-slate-900">{user.citizenId.substring(0, 4)}****{user.citizenId.substring(8)}</strong>
                  </span>
                </div>
              )}

              <div className="mt-6 flex justify-center gap-2.5">
                <button
                  onClick={() => navigate('/marketplace/new')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-lg text-xs font-semibold transition"
                >
                  <PlusCircle size={14} /> Đăng bán sản phẩm
                </button>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                >
                  <ShoppingBag size={14} /> Vào Chợ đồ cũ
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Front Image */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-800">
                    Ảnh mặt trước CCCD <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Chụp rõ mã QR góc trên bên phải
                  </span>
                </div>

                <ImageUpload
                  value={idCardFrontUrl}
                  onChange={(url) => setIdCardFrontUrl(url)}
                  onFileSelected={handleFrontFileSelected}
                  hideLabel={true}
                />

                {/* QR Scanning Indicator */}
                {isScanningQr && (
                  <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin text-[#eb6e34]" />
                    <span>Đang quét mã QR trên ảnh thẻ...</span>
                  </div>
                )}

                {/* Rescan Button if URL exists */}
                {idCardFrontUrl && !qrScanResult && !isScanningQr && (
                  <div className="mt-1.5 flex justify-end">
                    <button
                      type="button"
                      onClick={handleRescanFromUrl}
                      className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 transition"
                    >
                      <RefreshCw size={11} /> Quét lại mã QR
                    </button>
                  </div>
                )}

                {/* Notice if failed */}
                {qrScanNotice && !isScanningQr && !qrScanResult && (
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    {qrScanNotice}
                  </p>
                )}
              </div>

              {/* Extracted QR Information Card (Subtle, Clean) */}
              {qrScanResult && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Thông tin nhận diện từ thẻ CCCD
                    </span>
                    <span className="text-[11px] text-slate-400">Đã tự động điền form</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Họ và tên</span>
                      <strong className="text-slate-800 text-xs font-semibold">{qrScanResult.fullName || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Số CCCD</span>
                      <strong className="text-slate-800 text-xs font-mono">{qrScanResult.citizenId || '—'}</strong>
                    </div>
                    {qrScanResult.dateOfBirthFormatted && (
                      <div>
                        <span className="text-slate-400 block">Ngày sinh</span>
                        <span className="text-slate-700">{qrScanResult.dateOfBirthFormatted}</span>
                      </div>
                    )}
                    {qrScanResult.gender && (
                      <div>
                        <span className="text-slate-400 block">Giới tính</span>
                        <span className="text-slate-700">{qrScanResult.gender}</span>
                      </div>
                    )}
                    {qrScanResult.address && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block">Nơi thường trú</span>
                        <span className="text-slate-700 truncate block">{qrScanResult.address}</span>
                      </div>
                    )}
                  </div>

                  {user?.fullName && qrScanResult.fullName && user.fullName.trim().toLowerCase() !== qrScanResult.fullName.trim().toLowerCase() && (
                    <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      * Tên tài khoản ({user.fullName}) khác với tên trên thẻ ({qrScanResult.fullName}). Vui lòng đảm bảo bạn sử dụng thẻ CCCD chính chủ.
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Citizen ID Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Số Căn cước công dân (12 chữ số) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={12}
                    value={citizenId}
                    onChange={(e) => setCitizenId(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Nhập hoặc quét tự động từ ảnh"
                    required
                    className="block w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-[#eb6e34] focus:ring-1 focus:ring-[#eb6e34] focus:outline-hidden font-mono"
                  />
                  <CreditCard size={15} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </div>

              {/* Step 3: Back Image (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-800">
                    Ảnh mặt sau CCCD
                  </label>
                  <span className="text-[11px] text-slate-400">Không bắt buộc</span>
                </div>
                <ImageUpload
                  value={idCardBackUrl}
                  onChange={(url) => setIdCardBackUrl(url)}
                  hideLabel={true}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isScanningQr}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#eb6e34] hover:bg-[#d85e25] text-white font-semibold text-xs sm:text-sm rounded-xl transition shadow-2xs disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Đang gửi hồ sơ...
                  </>
                ) : (
                  <>
                    Gửi hồ sơ xác minh
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {/* Demo Helper Tool (Discreet text link at bottom) */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowDemoQr(!showDemoQr)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition inline-flex items-center gap-1"
                >
                  <QrCode size={12} />
                  {showDemoQr ? 'Đóng dữ liệu mẫu test' : 'Thử nghiệm nhanh bằng dữ liệu mẫu'}
                </button>

                {showDemoQr && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 animate-in fade-in duration-150">
                    <p className="text-[11px] text-slate-500">
                      Chọn dữ liệu mẫu để thử nghiệm tính năng tự động điền form:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => applySampleQr('001201000001||Nguyễn Văn An (K64)|15052003|Nam|Cầu Giấy, Hà Nội|25122021')}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] transition"
                      >
                        user01 (An)
                      </button>
                      <button
                        type="button"
                        onClick={() => applySampleQr('001205000004||Phạm Đức Huy (K66)|24032005|Nam|Hai Bà Trưng, Hà Nội|15082023')}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] transition"
                      >
                        user04 (Huy)
                      </button>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        value={demoQrInput}
                        onChange={(e) => setDemoQrInput(e.target.value)}
                        placeholder="Hoặc dán chuỗi QR..."
                        className="flex-1 text-xs px-2.5 py-1 border border-slate-300 rounded-lg focus:outline-hidden bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => processQrText(demoQrInput)}
                        className="px-2.5 py-1 bg-slate-800 text-white rounded-lg text-xs font-semibold"
                      >
                        Thử
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
