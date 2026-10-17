import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { axiosInstance } from '../../api/axios';
import { ImageUpload } from '../../components/ImageUpload';
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

  const isVerified = user?.identityVerified;

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
    <div className="min-h-screen bg-gray-50/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/marketplace"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition"
          >
            &larr; Quay lại Chợ
          </Link>
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Lock size={13} className="text-gray-400" /> Hồ sơ xác minh danh tính
          </span>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-6 sm:p-10">
          {/* Header Title */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Xác Minh Danh Tính (CCCD)
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Xác thực tài khoản thành viên để bắt đầu đăng bán và mua hàng an toàn
              </p>
            </div>
          </div>

          {(isSuccess || user?.identityReviewStatus === 'PENDING') && !isVerified && (
            <p role="status" className="mb-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              Hồ sơ đã được gửi và đang chờ quản trị viên xét duyệt. Bạn chưa được xác minh danh tính.
            </p>
          )}
          {user?.identityReviewStatus === 'REJECTED' && !isSuccess && (
            <p role="alert" className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">
              Hồ sơ chưa được chấp thuận hoặc đã bị thu hồi xác minh. Bạn có thể cập nhật và gửi lại hồ sơ để xét duyệt.
            </p>
          )}
          {/* If Already Verified */}
          {isVerified ? (
            <div className="text-center py-8 animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100">
                <CheckCircle2 size={42} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Danh tính đã được xác minh thành công!
              </h2>
              <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Tài khoản của bạn đã được gắn huy hiệu tin cậy. Bạn có toàn quyền đăng bán đồ cũ và đặt mua qua hệ thống tủ Smart Locker trên toàn thành phố.
              </p>

              {user?.citizenId && (
                <div className="mt-5 p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 max-w-xs mx-auto text-xs text-gray-600 flex items-center justify-center gap-2">
                  <CreditCard size={15} className="text-purple-600" />
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition shadow-xs"
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
            <div>
              {/* Security Policy Alert */}
              <div className="mb-6 p-4 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-start gap-3">
                <FileCheck2 size={20} className="text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-950 space-y-1">
                  <p className="font-semibold">Quy định giao dịch an toàn toàn thành phố</p>
                  <p className="text-purple-900/80 leading-relaxed">
                    Nhằm phòng chống hành vi lừa đảo, gửi đồ cấm hoặc chiếm dụng tủ locker công cộng, mọi thành viên muốn đăng bán hoặc mua đồ cần xác minh CCCD hợp lệ.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Citizen ID Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Số Căn cước công dân (12 chữ số) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={12}
                      value={citizenId}
                      onChange={(e) => setCitizenId(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="VD: 001202012345"
                      required
                      className="block w-full rounded-xl border border-gray-300 pl-10 pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                    <CreditCard size={18} className="absolute left-3 top-3 text-gray-400" />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Nhập chính xác 12 chữ số in trên thẻ Căn cước công dân gắn chip của bạn.
                  </p>
                </div>

                {/* Front ID Card Image */}
                <div>
                  <div className="mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      Ảnh mặt trước CCCD <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] text-gray-400 ml-1.5">(Chụp rõ nét, đủ 4 góc, không lóa sáng)</span>
                  </div>
                  <ImageUpload
                    value={idCardFrontUrl}
                    onChange={(url) => setIdCardFrontUrl(url)}
                  />
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

                {/* Note about Privacy and QR */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 text-[11px] text-gray-500 flex items-start gap-2">
                  <Lock size={14} className="shrink-0 mt-0.5 text-gray-400" />
                  <span>
                    Hệ thống lưu trữ ảnh và số CCCD an toàn qua Cloudinary. Tính năng quét mã QR tự động đối chiếu thông tin ngày sinh sẽ được tích hợp trong bản cập nhật kế tiếp.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Đang gửi hồ sơ xác minh...' : 'Xác nhận và Hoàn tất xác minh'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
