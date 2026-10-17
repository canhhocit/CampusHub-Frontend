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
  ShieldCheck,
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
  const [confirmedCommitment, setConfirmedCommitment] = useState(true);

  // Trạng thái quét mã QR trên CCCD
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [qrScanResult, setQrScanResult] = useState<CccdQrData | null>(null);
  const [qrScanNotice, setQrScanNotice] = useState<string | null>(null);
  const [showDemoQr, setShowDemoQr] = useState(false);
  const [demoQrInput, setDemoQrInput] = useState('');

  const isVerified = user?.identityVerified;

  // Xử lý quét mã QR tự động từ File ảnh mặt trước
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
          'Chưa nhận diện được mã QR trên ảnh. Vui lòng kiểm tra lại góc chụp hoặc tự nhập 12 số CCCD.'
        );
      }
    } catch {
      setQrScanNotice('Không thể đọc mã QR từ ảnh. Bạn vui lòng tự nhập 12 số CCCD bên dưới.');
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
          'Chưa nhận diện được mã QR trên ảnh. Vui lòng kiểm tra ảnh hoặc tự nhập 12 số CCCD.'
        );
      }
    } catch {
      setQrScanNotice('Không thể quét mã QR từ ảnh này.');
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
        setQrScanNotice('Đã đọc mã QR nhưng định dạng dữ liệu không khớp chuẩn CCCD.');
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
      setErrorMessage('Số Căn cước công dân không hợp lệ. Vui lòng nhập đúng 12 chữ số.');
      return;
    }

    if (!idCardFrontUrl) {
      setErrorMessage('Vui lòng tải lên ảnh mặt trước thẻ CCCD.');
      return;
    }

    if (!confirmedCommitment) {
      setErrorMessage('Vui lòng xác nhận cam kết tính chính xác của hồ sơ giấy tờ tùy thân.');
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
        err.response?.data?.message || 'Gửi hồ sơ xác minh thất bại. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 py-8 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-2xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <Link
            to="/marketplace"
            className="text-slate-600 hover:text-slate-900 transition flex items-center gap-1 font-medium"
          >
            &larr; Quay lại Chợ sinh viên
          </Link>
          <span className="flex items-center gap-1 text-slate-500">
            <Lock size={12} className="text-slate-400" /> Xác thực định danh điện tử
          </span>
        </div>

        {/* Official Portal Card Container */}
        <div className="bg-white rounded-xl border border-slate-300/80 shadow-xs p-6 sm:p-8">
          {/* Official Document Header */}
          <div className="border-b border-slate-200 pb-5 mb-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Hệ thống Định danh Điện tử • Smart Locker Campus
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Hồ Sơ Xác Minh Căn Cước Công Dân
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Thông tin phục vụ đối chiếu định danh công dân sinh viên, bảo đảm tính xác thực và an toàn pháp lý khi giao nhận hàng hóa qua hệ thống tủ Smart Locker.
            </p>
          </div>

          {/* Pending State */}
          {(isSuccess || user?.identityReviewStatus === 'PENDING') && !isVerified && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-1">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Hồ sơ đã được tiếp nhận thành công</span>
              </div>
              <p className="text-slate-600 pl-6 leading-relaxed">
                Hồ sơ định danh của bạn đang được cán bộ kiểm duyệt đối chiếu. Sau khi được phê duyệt, tài khoản sẽ tự động kích hoạt quyền đăng bán và giao nhận đồ qua Smart Locker.
              </p>
            </div>
          )}

          {/* Rejected State */}
          {user?.identityReviewStatus === 'REJECTED' && !isSuccess && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Hồ sơ chưa được phê duyệt hoặc bị từ chối</strong>
                <span className="text-rose-700 leading-relaxed block mt-0.5">
                  Vui lòng kiểm tra lại chất lượng ảnh chụp giấy tờ (rõ nét 4 góc, đủ ánh sáng, hiển thị rõ mã QR) và cập nhật lại hồ sơ.
                </span>
              </div>
            </div>
          )}

          {/* Verified State */}
          {isVerified ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Tài khoản đã được định danh và xác thực
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                  Hồ sơ căn cước công dân đã được phê duyệt hợp lệ. Bạn có quyền thực hiện mọi giao dịch mua bán và gửi nhận đồ trên toàn hệ thống.
                </p>
              </div>

              {user?.citizenId && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 inline-block text-xs text-slate-700">
                  <span className="text-slate-500">Số định danh cá nhân: </span>
                  <strong className="font-mono text-slate-900 text-sm ml-1">
                    {user.citizenId.substring(0, 4)}****{user.citizenId.substring(8)}
                  </strong>
                </div>
              )}

              <div className="pt-3 flex justify-center gap-3">
                <button
                  onClick={() => navigate('/marketplace/new')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-lg text-xs font-semibold transition"
                >
                  <PlusCircle size={14} /> Đăng tin bán hàng
                </button>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition border border-slate-200"
                >
                  <ShoppingBag size={14} /> Vào Chợ sinh viên
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* PHẦN 1: TẢI ẢNH GIẤY TỜ TÙY THÂN */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-2 border-[#eb6e34] pl-2">
                  1. Tệp hình ảnh Căn cước công dân gắn chip
                </div>

                {/* Mặt trước */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-900">
                      Ảnh mặt trước thẻ CCCD <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      (Chụp rõ nét góc trên bên phải chứa mã QR)
                    </span>
                  </div>

                  <ImageUpload
                    value={idCardFrontUrl}
                    onChange={(url) => setIdCardFrontUrl(url)}
                    onFileSelected={handleFrontFileSelected}
                    hideLabel={true}
                    allowUrl={false}
                  />

                  {/* QR Scanning Indicator */}
                  {isScanningQr && (
                    <div className="mt-2 text-xs text-slate-600 flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                      <Loader2 size={13} className="animate-spin text-[#eb6e34]" />
                      <span>Đang tự động đối soát mã QR trên ảnh thẻ CCCD...</span>
                    </div>
                  )}

                  {/* Rescan Button if URL exists */}
                  {idCardFrontUrl && !qrScanResult && !isScanningQr && (
                    <div className="mt-1.5 flex justify-end">
                      <button
                        type="button"
                        onClick={handleRescanFromUrl}
                        className="text-xs text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium transition"
                      >
                        <RefreshCw size={11} /> Đối soát lại mã QR
                      </button>
                    </div>
                  )}

                  {/* Notice if failed */}
                  {qrScanNotice && !isScanningQr && !qrScanResult && (
                    <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                      {qrScanNotice}
                    </p>
                  )}
                </div>

                {/* Mặt sau */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-900">
                      Ảnh mặt sau thẻ CCCD
                    </label>
                    <span className="text-[11px] text-slate-500">Không bắt buộc</span>
                  </div>
                  <ImageUpload
                    value={idCardBackUrl}
                    onChange={(url) => setIdCardBackUrl(url)}
                    hideLabel={true}
                    allowUrl={false}
                  />
                </div>
              </div>

              {/* PHẦN 2: THÔNG TIN TRÍCH XUẤT TỪ MÃ QR (BẢNG ĐỐI SOÁT CHUẨN DỊCH VỤ CÔNG) */}
              {qrScanResult && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-2 border-[#eb6e34] pl-2">
                    2. Dữ liệu trích xuất từ thẻ Căn cước công dân
                  </div>

                  <div className="border border-slate-300 rounded-lg overflow-hidden bg-white text-xs">
                    <div className="bg-slate-100/90 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        Kết quả đối soát mã QR hợp lệ
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Đã tự động điền form
                      </span>
                    </div>

                    <div className="divide-y divide-slate-200 text-xs">
                      <div className="grid grid-cols-3 px-3.5 py-2.5">
                        <span className="text-slate-500 font-medium">Số CCCD / Định danh:</span>
                        <span className="col-span-2 font-mono font-bold text-slate-900 text-sm">
                          {qrScanResult.citizenId || '—'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 px-3.5 py-2.5">
                        <span className="text-slate-500 font-medium">Họ và tên khai sinh:</span>
                        <span className="col-span-2 font-bold text-slate-900 uppercase">
                          {qrScanResult.fullName || '—'}
                        </span>
                      </div>
                      {qrScanResult.dateOfBirthFormatted && (
                        <div className="grid grid-cols-3 px-3.5 py-2.5">
                          <span className="text-slate-500 font-medium">Ngày, tháng, năm sinh:</span>
                          <span className="col-span-2 text-slate-800 font-medium">
                            {qrScanResult.dateOfBirthFormatted}
                          </span>
                        </div>
                      )}
                      {qrScanResult.gender && (
                        <div className="grid grid-cols-3 px-3.5 py-2.5">
                          <span className="text-slate-500 font-medium">Giới tính:</span>
                          <span className="col-span-2 text-slate-800">
                            {qrScanResult.gender}
                          </span>
                        </div>
                      )}
                      {qrScanResult.address && (
                        <div className="grid grid-cols-3 px-3.5 py-2.5">
                          <span className="text-slate-500 font-medium">Nơi thường trú:</span>
                          <span className="col-span-2 text-slate-800 leading-relaxed">
                            {qrScanResult.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {user?.fullName && qrScanResult.fullName && user.fullName.trim().toLowerCase() !== qrScanResult.fullName.trim().toLowerCase() && (
                    <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                      * <strong>Lưu ý:</strong> Họ tên trên giấy tờ định danh ({qrScanResult.fullName}) khác với họ tên tài khoản đăng ký ({user.fullName}). Cán bộ kiểm duyệt sẽ đối chiếu và yêu cầu xác thực bổ sung nếu phát hiện thông tin không chính chủ.
                    </p>
                  )}
                </div>
              )}

              {/* PHẦN 3: XÁC NHẬN SỐ ĐỊNH DANH */}
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-2 border-[#eb6e34] pl-2">
                  {qrScanResult ? '3. Xác nhận số Căn cước công dân' : '2. Nhập số Căn cước công dân'}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-900 mb-1">
                    Số Căn cước công dân (12 chữ số) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={12}
                      value={citizenId}
                      onChange={(e) => setCitizenId(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="12 chữ số trên thẻ Căn cước công dân"
                      required
                      className="block w-full rounded-lg border border-slate-300 pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#eb6e34] focus:ring-1 focus:ring-[#eb6e34] focus:outline-hidden font-mono"
                    />
                    <CreditCard size={15} className="absolute left-3 top-2.5 text-slate-400" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Số CCCD sẽ được tự động trích xuất khi hệ thống đọc được mã QR trên ảnh mặt trước.
                  </p>
                </div>
              </div>

              {/* Cam kết tính chính xác */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmedCommitment}
                    onChange={(e) => setConfirmedCommitment(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#eb6e34] focus:ring-[#eb6e34]"
                  />
                  <span className="leading-relaxed text-[11px] text-slate-600">
                    Tôi cam đoan toàn bộ thông tin và tệp ảnh giấy tờ tùy thân cung cấp trên đây là chính chủ, chính xác và chịu hoàn toàn trách nhiệm theo quy định của nền tảng.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isScanningQr || !confirmedCommitment}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#eb6e34] hover:bg-[#d85e25] text-white font-semibold text-xs sm:text-sm rounded-lg transition shadow-2xs disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Đang gửi hồ sơ xác minh...
                  </>
                ) : (
                  <>
                    Gửi hồ sơ định danh
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {/* Bảo mật thông tin chân trang */}
              <div className="pt-2 text-center text-[11px] text-slate-400">
                <p>Dữ liệu được lưu trữ bảo mật và tuân thủ chính sách quyền riêng tư của Smart Locker Campus.</p>
              </div>

              {/* Demo Helper Tool (Kín đáo ở đáy trang để giảng viên / nhóm test nhanh) */}
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDemoQr(!showDemoQr)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition inline-flex items-center gap-1"
                >
                  <QrCode size={12} />
                  {showDemoQr ? 'Ẩn bộ dữ liệu kiểm thử' : 'Chế độ thử nghiệm đồ án (Demo Data)'}
                </button>

                {showDemoQr && (
                  <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left space-y-2 animate-in fade-in duration-150">
                    <p className="text-[11px] text-slate-600 font-medium">
                      Chọn dữ liệu mẫu để thử nghiệm trích xuất mã QR:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => applySampleQr('001201000001||Nguyễn Văn An (K64)|15052003|Nam|Cầu Giấy, Hà Nội|25122021')}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-[11px] transition"
                      >
                        user01 (Nguyễn Văn An)
                      </button>
                      <button
                        type="button"
                        onClick={() => applySampleQr('001205000004||Phạm Đức Huy (K66)|24032005|Nam|Hai Bà Trưng, Hà Nội|15082023')}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-[11px] transition"
                      >
                        user04 (Phạm Đức Huy)
                      </button>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        value={demoQrInput}
                        onChange={(e) => setDemoQrInput(e.target.value)}
                        placeholder="Dán chuỗi QR..."
                        className="flex-1 text-xs px-2.5 py-1 border border-slate-300 rounded focus:outline-hidden bg-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => processQrText(demoQrInput)}
                        className="px-2.5 py-1 bg-slate-800 text-white rounded text-xs font-semibold"
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
