import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { userApi, type UserProfile } from '../../api/userApi';
import { PasswordInput } from '../../components/common/PasswordInput';
import {
  User,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Mail,
  BadgeCheck,
  Save,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch full user profile
  const { data: profile, isLoading, error: fetchError } = useQuery<UserProfile>({
    queryKey: ['user-profile'],
    queryFn: userApi.getMyProfile,
  });

  // Edit Full Name Form State
  const [fullName, setFullName] = useState('');
  const [nameSuccessMsg, setNameSuccessMsg] = useState('');
  const [nameErrorMsg, setNameErrorMsg] = useState('');

  useEffect(() => {
    if (profile?.fullName) {
      setFullName(profile.fullName);
    }
  }, [profile?.fullName]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (newName: string) => userApi.updateMyProfile({ fullName: newName }),
    onSuccess: (updated) => {
      setNameSuccessMsg('Cập nhật họ và tên thành công!');
      setNameErrorMsg('');
      queryClient.setQueryData(['user-profile'], updated);
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      setTimeout(() => setNameSuccessMsg(''), 4000);
    },
    onError: (err: any) => {
      setNameErrorMsg(err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
      setNameSuccessMsg('');
    },
  });

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setNameErrorMsg('Họ và tên không được để trống.');
      return;
    }
    setNameErrorMsg('');
    setNameSuccessMsg('');
    updateProfileMutation.mutate(fullName.trim());
  };

  // Change Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passErrorMsg, setPassErrorMsg] = useState('');
  const [passSuccessMsg, setPassSuccessMsg] = useState('');

  const changePasswordMutation = useMutation({
    mutationFn: userApi.changePassword,
    onSuccess: () => {
      setPassSuccessMsg('Đổi mật khẩu thành công! Mật khẩu mới của bạn đã có hiệu lực.');
      setPassErrorMsg('');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassSuccessMsg(''), 5000);
    },
    onError: (err: any) => {
      setPassErrorMsg(err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.');
      setPassSuccessMsg('');
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg('');
    setPassSuccessMsg('');

    if (!passwordForm.currentPassword) {
      setPassErrorMsg('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPassErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPassErrorMsg('Mật khẩu mới không được trùng với mật khẩu hiện tại.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassErrorMsg('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500 font-medium">Đang tải thông tin hồ sơ tài khoản...</p>
      </div>
    );
  }

  if (fetchError || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-rose-600" />
          <h2 className="text-base font-bold">Không thể tải thông tin tài khoản</h2>
          <p className="text-xs text-rose-700">Vui lòng đăng nhập lại hoặc thử tải lại trang.</p>
        </div>
      </div>
    );
  }

  const reviewStatus = profile.identityReviewStatus || (profile.identityVerified ? 'APPROVED' : 'NOT_SUBMITTED');

  const formatDisplayDate = (dStr: string | null) => {
    if (!dStr) return 'Chưa cập nhật';
    return new Date(dStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-7 font-sans">
      {/* Page Title & Breadcrumb */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-800 transition">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Hồ sơ cá nhân &amp; Bảo mật</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cài đặt tài khoản &amp; Bảo mật
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Quản lý thông tin định danh sinh viên, họ tên và bảo mật mật khẩu tài khoản
        </p>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {(profile.fullName || profile.username).charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {profile.fullName || profile.username}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  @{profile.username}
                </span>
                {profile.role === 'ADMIN' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    Quản trị viên
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400 shrink-0" />
                {profile.email}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
            <span className="block text-slate-400">Tham gia từ:</span>
            <strong className="text-slate-700 font-semibold">{formatDisplayDate(profile.createdAt)}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Personal Information & Identity Status */}
        <div className="space-y-6">
          {/* Identity Verification Card (4-State AGENTS.md compliant) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Xác minh danh tính (CCCD)</h3>
                  <p className="text-[11px] text-slate-500">Bảo đảm an toàn giao dịch tủ Smart Locker</p>
                </div>
              </div>

              {reviewStatus === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <BadgeCheck size={14} className="text-emerald-600" />
                  Đã duyệt CCCD
                </span>
              )}
              {reviewStatus === 'PENDING' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock size={14} className="text-amber-600" />
                  Đang chờ duyệt
                </span>
              )}
              {reviewStatus === 'REJECTED' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  <XCircle size={14} className="text-rose-600" />
                  Bị từ chối
                </span>
              )}
              {reviewStatus === 'NOT_SUBMITTED' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <ShieldAlert size={14} className="text-slate-500" />
                  Chưa nộp CCCD
                </span>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2">
              {reviewStatus === 'APPROVED' && (
                <div className="space-y-1.5 text-slate-700">
                  <p className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                    Tài khoản đã xác thực định danh thành công
                  </p>
                  <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
                    <span>Số CCCD:</span>
                    <strong className="text-slate-800 font-mono">
                      {profile.citizenId ? profile.citizenId.substring(0, 4) + '******' + profile.citizenId.substring(profile.citizenId.length - 2) : 'Đã xác minh'}
                    </strong>
                  </div>
                  {profile.identityVerifiedAt && (
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Thời điểm duyệt:</span>
                      <span className="text-slate-700">{formatDisplayDate(profile.identityVerifiedAt)}</span>
                    </div>
                  )}
                </div>
              )}

              {reviewStatus === 'PENDING' && (
                <div className="space-y-2 text-amber-900">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Clock size={15} className="text-amber-600 shrink-0" />
                    Hồ sơ CCCD đang trong hàng đợi phê duyệt
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Ảnh chụp CCCD của bạn đã được tiếp nhận an toàn. Quản trị viên CampusHub sẽ đối soát và phê duyệt trong vòng 24 giờ.
                  </p>
                </div>
              )}

              {reviewStatus === 'REJECTED' && (
                <div className="space-y-2 text-rose-900">
                  <p className="font-semibold flex items-center gap-1.5">
                    <XCircle size={15} className="text-rose-600 shrink-0" />
                    Hồ sơ xác minh CCCD chưa hợp lệ
                  </p>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Ảnh chụp CCCD bị mờ hoặc thông tin không khớp. Vui lòng chụp lại ảnh rõ nét để được phê duyệt nhanh chóng.
                  </p>
                  <Link
                    to="/verify-identity"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 pt-1"
                  >
                    <span>Nộp lại hồ sơ xác minh CCCD</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {reviewStatus === 'NOT_SUBMITTED' && (
                <div className="space-y-2 text-slate-700">
                  <p className="font-medium text-slate-800">
                    Bạn chưa hoàn tất định danh công dân (CCCD).
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Định danh giúp bạn có thể đăng bán đồ, thuê mượn đồ dùng và rút tiền ví an toàn qua tủ Smart Locker.
                  </p>
                  <Link
                    to="/verify-identity"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition shadow-2xs mt-1"
                  >
                    <span>Xác minh danh tính ngay</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Edit Full Name & Basic Info Form */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Thông tin cá nhân</h3>
                <p className="text-[11px] text-slate-500">Cập nhật họ tên hiển thị trên sàn giao dịch</p>
              </div>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-3.5">
              {nameSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>{nameSuccessMsg}</span>
                </div>
              )}
              {nameErrorMsg && (
                <div className="bg-rose-50 text-rose-800 p-3 rounded-xl border border-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                  <span>{nameErrorMsg}</span>
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Họ và tên hiển thị <span className="text-rose-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-hidden focus:ring-2 focus:ring-emerald-100 transition hover:border-slate-400"
                  placeholder="Nhập họ và tên..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                  <span className="text-slate-400 block text-[11px]">Tên đăng nhập:</span>
                  <span className="font-semibold text-slate-800">{profile.username}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                  <span className="text-slate-400 block text-[11px]">Ngày sinh:</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar size={13} className="text-slate-400" />
                    {formatDisplayDate(profile.dateOfBirth)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending || fullName === profile.fullName}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span>Đang lưu thông tin...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Lưu họ và tên</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Security & Change Password Card */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bảo mật &amp; Đổi mật khẩu</h3>
                <p className="text-[11px] text-slate-500">Cập nhật mật khẩu mới định kỳ để bảo vệ tài khoản</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
              {passSuccessMsg && (
                <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{passSuccessMsg}</span>
                </div>
              )}

              {passErrorMsg && (
                <div className="bg-rose-50 text-rose-800 p-3.5 rounded-xl border border-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{passErrorMsg}</span>
                </div>
              )}

              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                label="Mật khẩu hiện tại"
                required
                autoComplete="current-password"
                placeholder="Nhập mật khẩu đang sử dụng..."
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />

              <PasswordInput
                id="newPassword"
                name="newPassword"
                label="Mật khẩu mới"
                required
                autoComplete="new-password"
                placeholder="Tối thiểu 6 ký tự..."
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                hint="Mật khẩu phải từ 6 đến 40 ký tự và khác mật khẩu hiện tại."
              />

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                required
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới..."
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                error={
                  passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                    ? 'Mật khẩu xác nhận không trùng khớp'
                    : undefined
                }
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full py-2.5 sm:py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Đang cập nhật mật khẩu...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      <span>Xác nhận đổi mật khẩu</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 flex items-center gap-1">
                  <Shield size={12} className="text-emerald-600" />
                  Chính sách bảo mật phiên làm việc:
                </p>
                <p className="leading-relaxed">
                  Khi đổi mật khẩu thành công, tất cả các phiên đăng nhập khác sẽ tự động bị thu hồi để bảo vệ tài khoản khỏi truy cập trái phép.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
