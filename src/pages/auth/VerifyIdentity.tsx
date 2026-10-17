import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { axiosInstance } from '../../api/axios';
import { ImageUpload } from '../../components/ImageUpload';
import { parseCccdQr, scanQrFromImageSource, type CccdQrData } from '../../utils/cccdQrParser';
import {
  ShieldCheck,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
  PlusCircle,
  FileCheck2,
  QrCode,
  Loader2,
  Sparkles,
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
          'Không tìm thấy mã QR trên ảnh vừa tải lên. Bạn có thể tự nhập 12 số CCCD bên dưới hoặc chụp rõ nét góc trên bên phải của thẻ.'
        );
      }
    } catch {
      setQrScanNotice('Không thể quét mã QR từ ảnh. Bạn vui lòng tự nhập 12 số CCCD bên dưới.');
    } finally {
      setIsScanningQr(false);
    }
  };

  // Quét lại từ URL ảnh mặt trước (nếu người dùng dán URL hoặc muốn quét lại)
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
          'Không tìm thấy mã QR trên ảnh này. Vui lòng kiểm tra lại ảnh chụp hoặc tự nhập 12 số CCCD.'
        );
      }
    } catch {
      setQrScanNotice('Không thể đọc mã QR từ ảnh. Vui lòng kiểm tra lại đường dẫn ảnh.');
    } finally {
      setIsScanningQr(false);
    }
  };

  // Xử lý bóc tách thông tin từ chuỗi QR thẻ CCCD
  const processQrText = (rawText: string) => {
    const parsed = parseCccdQr(rawText);
    if (parsed) {
      setQrScanResult(parsed);
      if (parsed.citizenId && /^[0-9]{12}$/.test(parsed.citizenId)) {
        setCitizenId(parsed.citizenId);
      }
      setQrScanNotice(null);
    } else {
      // Trường hợp mã QR chỉ chứa dãy số
      const trimmed = rawText.trim();
      if (/^[0-9]{12}$/.test(trimmed)) {
        setCitizenId(trimmed);
        setQrScanResult({
          citizenId: trimmed,
          fullName: user?.fullName || 'Chưa rõ',
          dateOfBirthRaw: '',
          dateOfBirthFormatted: '',
          rawText: trimmed,
        });
      } else {
        setQrScanNotice(`Đã quét mã QR (${rawText.substring(0, 30)}...) nhưng định dạng không phải thẻ CCCD chuẩn.`);
      }
    }
  };

  // Thử nghiệm với chuỗi QR mẫu (dành cho demo / bảo vệ đồ án)
  const applySampleQr = (sampleStr: string) => {
    setDemoQrInput(sampleStr);
    processQrText(sampleStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMessage('');

    const cleanCitizenId = citizenId.trim();

    // Validate 12 digits
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
    <div className="min-h-screen bg-gray-50/70 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/marketplace"
            className="text-xs font-semibold text-[#eb6e34] hover:text-[#d85e25] transition"
          >
            &larr; Quay lại Chợ sinh viên
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Lock size={13} className="text-gray-400" /> Hồ sơ xác minh danh tính
          </span>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-10">
          {/* Header Title */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 bg-orange-100 text-[#eb6e34] rounded-2xl shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Xác Minh Danh Tính (CCCD)
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Tự động nhận diện thông tin qua mã QR trên thẻ CCCD gắn chip
              </p>
            </div>
          </div>

          {(isSuccess || user?.identityReviewStatus === 'PENDING') && !isVerified && (
            <div role="status" className="mb-6 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-sm text-amber-900 flex items-start gap-3">
              <CheckCircle2 size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Hồ sơ đã được gửi thành công!</strong>
                <p className="text-xs text-amber-800 mt-0.5">
                  Hồ sơ đang chờ Quản trị viên xét duyệt. Sau khi được duyệt, tài khoản sẽ tự động nhận huy hiệu xanh và quyền đăng bán hàng.
                </p>
              </div>
            </div>
          )}

          {user?.identityReviewStatus === 'REJECTED' && !isSuccess && (
            <p role="alert" className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-200 text-sm text-red-800 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600 shrink-0" />
              <span>Hồ sơ chưa được chấp thuận hoặc đã bị thu hồi. Bạn có thể cập nhật lại ảnh và gửi lại xét duyệt.</span>
            </p>
          )}

          {/* If Already Verified */}
          {isVerified ? (
            <div className="text-center py-8 animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100 shadow-xs">
                <CheckCircle2 size={42} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Danh tính đã được xác minh thành công!
              </h2>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Tài khoản của bạn đã được gắn huy hiệu tin cậy. Bạn có toàn quyền đăng bán đồ cũ và nhận tiền bảo đảm qua hệ thống tủ Smart Locker Campus.
              </p>

              {user?.citizenId && (
                <div className="mt-5 p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 max-w-xs mx-auto text-xs text-gray-600 flex items-center justify-center gap-2">
                  <CreditCard size={15} className="text-[#eb6e34]" />
                  <span>
                    Số CCCD:{' '}
                    <strong>
                      {user.citizenId.substring(0, 4)}****{user.citizenId.substring(8)}
                    </strong>
                  </span>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => navigate('/marketplace/new')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-xl text-sm font-semibold transition shadow-xs"
                >
                  <PlusCircle size={16} /> Đăng bán sản phẩm
                </button>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-sm font-semibold transition"
                >
                  <ShoppingBag size={16} /> Xem chợ đồ cũ
                </button>
              </div>
            </div>
          ) : (
            /* Verification Form */
            <div className="space-y-6">
              {/* Security Policy Alert */}
              <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl flex items-start gap-3">
                <FileCheck2 size={20} className="text-[#eb6e34] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-semibold text-slate-900">Quy định xác minh danh tính an toàn</p>
                  <p className="leading-relaxed text-slate-600">
                    Hệ thống tích hợp <strong>tự động quét mã QR trên thẻ CCCD</strong> để điền thông tin nhanh chóng và đối chiếu danh tính, chống gian lận và mạo danh sinh viên.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* QR Scanning Loading Indicator */}
              {isScanningQr && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-xs text-blue-800 animate-pulse">
                  <Loader2 size={18} className="animate-spin text-blue-600 shrink-0" />
                  <div>
                    <strong className="block font-semibold">Đang nhận diện mã QR trên ảnh CCCD...</strong>
                    <span className="text-blue-700">Hệ thống đang tự động đọc thông tin số thẻ và họ tên</span>
                  </div>
                </div>
              )}

              {/* QR Scan Success Box */}
              {qrScanResult && !isScanningQr && (
                <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <Sparkles size={18} className="text-emerald-600" />
                      Đã quét thành công mã QR Căn cước công dân!
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      Tự động trích xuất
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Họ và tên trên CCCD</span>
                      <strong className="text-slate-900 text-sm font-semibold">{qrScanResult.fullName || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Số CCCD trích xuất</span>
                      <strong className="text-emerald-700 font-mono text-sm">{qrScanResult.citizenId || '—'}</strong>
                    </div>
                    {qrScanResult.dateOfBirthFormatted && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Ngày sinh</span>
                        <span className="font-medium text-slate-800">{qrScanResult.dateOfBirthFormatted}</span>
                      </div>
                    )}
                    {qrScanResult.gender && (
                      <div>
                        <span className="text-slate-400 block text-[11px]">Giới tính</span>
                        <span className="font-medium text-slate-800">{qrScanResult.gender}</span>
                      </div>
                    )}
                    {qrScanResult.address && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[11px]">Nơi thường trú</span>
                        <span className="font-medium text-slate-800">{qrScanResult.address}</span>
                      </div>
                    )}
                  </div>

                  {user?.fullName && qrScanResult.fullName && (
                    <div className="text-[11px] pt-1">
                      {user.fullName.trim().toLowerCase() === qrScanResult.fullName.trim().toLowerCase() ? (
                        <p className="text-emerald-700 font-medium flex items-center gap-1.5">
                          <CheckCircle2 size={13} /> Họ tên trên thẻ trùng khớp với tài khoản sinh viên ({user.fullName})
                        </p>
                      ) : (
                        <p className="text-amber-800 font-medium flex items-center gap-1.5">
                          <AlertCircle size={13} /> Họ tên tài khoản ({user.fullName}) khác tên trên CCCD ({qrScanResult.fullName}). Vui lòng đảm bảo bạn tải CCCD chính chủ.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* QR Scan Notice (if cannot detect) */}
              {qrScanNotice && !isScanningQr && !qrScanResult && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Chưa quét được mã QR trên ảnh</p>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        {qrScanNotice}
                      </p>
                    </div>
                  </div>
                  {idCardFrontUrl && (
                    <button
                      type="button"
                      onClick={handleRescanFromUrl}
                      disabled={isScanningQr}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-semibold shrink-0 transition"
                    >
                      <RefreshCw size={12} /> Quét lại
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Front ID Card Image (Primary step with auto QR scan) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <QrCode size={14} className="text-[#eb6e34]" />
                      Ảnh mặt trước CCCD <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] text-gray-500">
                      (Chụp rõ nét mã QR ở góc trên bên phải)
                    </span>
                  </div>
                  <ImageUpload
                    value={idCardFrontUrl}
                    onChange={(url) => setIdCardFrontUrl(url)}
                    onFileSelected={handleFrontFileSelected}
                  />

                  {idCardFrontUrl && !qrScanResult && (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleRescanFromUrl}
                        disabled={isScanningQr}
                        className="text-xs text-[#eb6e34] hover:text-[#d85e25] font-semibold inline-flex items-center gap-1 transition"
                      >
                        <RefreshCw size={13} className={isScanningQr ? 'animate-spin' : ''} />
                        Quét lại mã QR từ ảnh này
                      </button>
                    </div>
                  )}
                </div>

                {/* Citizen ID Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700">
                      Số Căn cước công dân (12 chữ số) <span className="text-red-500">*</span>
                    </label>
                    {qrScanResult?.citizenId && (
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Đã tự động điền từ mã QR
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={12}
                      value={citizenId}
                      onChange={(e) => setCitizenId(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="VD: 001202012345"
                      required
                      className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#eb6e34] focus:ring-1 focus:ring-[#eb6e34] focus:outline-hidden font-mono"
                    />
                    <CreditCard size={18} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Số CCCD sẽ tự động được điền khi quét thành công mã QR, hoặc bạn có thể tự nhập/sửa lại nếu cần.
                  </p>
                </div>

                {/* Back ID Card Image (Optional) */}
                <div>
                  <div className="mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      Ảnh mặt sau CCCD
                    </span>
                    <span className="text-[11px] text-gray-400 ml-1.5">(Không bắt buộc, khuyến khích tải lên)</span>
                  </div>
                  <ImageUpload
                    value={idCardBackUrl}
                    onChange={(url) => setIdCardBackUrl(url)}
                  />
                </div>

                {/* Demo / Test QR Code Panel (Tiện lợi để kiểm thử hoặc chấm đồ án) */}
                <div className="border border-dashed border-slate-300 rounded-2xl p-3.5 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setShowDemoQr(!showDemoQr)}
                    className="w-full flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    <span className="flex items-center gap-1.5">
                      <QrCode size={14} className="text-slate-500" />
                      Công cụ kiểm thử bóc tách mã QR CCCD (Demo Test)
                    </span>
                    <span className="text-[11px] text-[#eb6e34] underline">
                      {showDemoQr ? 'Thu gọn' : 'Mở xem thử'}
                    </span>
                  </button>

                  {showDemoQr && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-200 animate-in fade-in">
                      <p className="text-[11px] text-slate-500">
                        Bạn có thể chọn dán nhanh chuỗi QR thẻ CCCD mẫu chuẩn của Bộ Công An để kiểm tra tính năng trích xuất:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => applySampleQr('001201000001||Nguyễn Văn An (K64)|15052003|Nam|Cầu Giấy, Hà Nội|25122021')}
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 rounded-lg text-[11px] transition"
                        >
                          Mẫu: Nguyễn Văn An (user01)
                        </button>
                        <button
                          type="button"
                          onClick={() => applySampleQr('001201000002||Trần Thị Mai (K65)|20082004|Nữ|Đà Nẵng|10012022')}
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 rounded-lg text-[11px] transition"
                        >
                          Mẫu: Trần Thị Mai (user02)
                        </button>
                        <button
                          type="button"
                          onClick={() => applySampleQr('001205000004||Phạm Đức Huy (K66)|24032005|Nam|Hai Bà Trưng, Hà Nội|15082023')}
                          className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 rounded-lg text-[11px] transition"
                        >
                          Mẫu: Phạm Đức Huy (user04)
                        </button>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={demoQrInput}
                          onChange={(e) => setDemoQrInput(e.target.value)}
                          placeholder="Dán chuỗi QR dạng SốCCCD||HọTên|NgàySinh|GiớiTính|ĐịaChỉ|NgàyCấp"
                          className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => processQrText(demoQrInput)}
                          className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0"
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || isScanningQr}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#eb6e34] hover:bg-[#d85e25] text-white font-semibold text-sm rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang gửi hồ sơ xác minh...
                    </>
                  ) : (
                    <>
                      Xác nhận và Gửi hồ sơ xác minh
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
