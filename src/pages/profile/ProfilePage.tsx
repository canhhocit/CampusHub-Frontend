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
  Mail,
  BadgeCheck,
  Save,
  Bell,
  Smartphone,
  Info,
} from 'lucide-react';

type ProfileTab = 'PROFILE' | 'SECURITY' | 'NOTIFICATIONS';

export const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProfileTab>('PROFILE');

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
      setPassSuccessMsg('Đổi mật khẩu thành công! Mật khẩu mới của bạn đã có hiệu lực trên toàn hệ thống.');
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
          <span className="text-slate-800 font-medium">Hồ sơ & Mật khẩu</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cài đặt tài khoản & Bảo mật
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Quản lý thông tin cá nhân, định danh sinh viên CCCD và các lớp bảo mật đăng nhập
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

      {/* UP-08: Profile Tabbed Navigation (3 Tabs) */}
      <div className="border-b border-slate-200 flex items-center gap-2 sm:gap-4 overflow-x-auto pb-px" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'PROFILE'}
          onClick={() => setActiveTab('PROFILE')}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition shrink-0 ${
            activeTab === 'PROFILE'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <User size={16} />
          <span>Hồ sơ cá nhân</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'SECURITY'}
          onClick={() => setActiveTab('SECURITY')}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition shrink-0 ${
            activeTab === 'SECURITY'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <KeyRound size={16} />
          <span>Bảo mật & Mật khẩu</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'NOTIFICATIONS'}
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition shrink-0 ${
            activeTab === 'NOTIFICATIONS'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Bell size={16} />
          <span>Thông báo Smart Locker</span>
        </button>
      </div>

      {/* Tab 1: Profile & Identity */}
      {activeTab === 'PROFILE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
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
                    Tài khoản đã hoàn tất định danh sinh viên chính chủ.
                  </p>
                  <p className="text-slate-600">
                    Số CCCD: <strong className="font-mono text-slate-900">{profile.citizenId || 'Đã mã hóa'}</strong>
                  </p>
                  <p className="text-slate-600">
                    Ngày sinh: <strong className="text-slate-900">{formatDisplayDate(profile.dateOfBirth)}</strong>
                  </p>
                </div>
              )}

              {reviewStatus === 'PENDING' && (
                <div className="space-y-1.5 text-amber-900">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Clock size={15} className="text-amber-600 shrink-0" />
                    Hồ sơ định danh của bạn đang được Ban Quản trị xét duyệt.
                  </p>
                  <p className="text-amber-800 text-[11px]">
                    Quá trình kiểm tra thông tin CCCD thường diễn ra trong vòng 24 giờ làm việc. Bạn vẫn có thể mua sắm bình thường.
                  </p>
                </div>
              )}

              {reviewStatus === 'REJECTED' && (
                <div className="space-y-1.5 text-rose-900">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle size={15} className="text-rose-600 shrink-0" />
                    Hồ sơ CCCD bị từ chối xét duyệt.
                  </p>
                  <p className="text-rose-800 text-[11px]">
                    Ảnh chụp có thể bị mờ hoặc thông tin không trùng khớp. Vui lòng chụp lại rõ nét cả 2 mặt để gửi lại.
                  </p>
                </div>
              )}

              {reviewStatus === 'NOT_SUBMITTED' && (
                <div className="space-y-1.5 text-slate-600">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Info size={15} className="text-slate-500 shrink-0" />
                    Bạn chưa hoàn tất định danh sinh viên (CCCD).
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Xác minh CCCD giúp bạn mở quyền ký gửi hàng hóa vào tủ Smart Locker và kích hoạt nhận tiền bán hàng.
                  </p>
                </div>
              )}
            </div>

            {reviewStatus !== 'APPROVED' && (
              <Link
                to="/verify-identity"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <span>{reviewStatus === 'REJECTED' ? 'Nộp lại hồ sơ CCCD' : 'Tiến hành xác minh CCCD ngay'}</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {/* Edit Full Name Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Thông tin cá nhân</h3>
                <p className="text-[11px] text-slate-500">Cập nhật họ và tên hiển thị trong giao dịch</p>
              </div>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-4 pt-1">
              {nameSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{nameSuccessMsg}</span>
                </div>
              )}
              {nameErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{nameErrorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700">
                  Họ và tên đầy đủ <span className="text-rose-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="block text-slate-400 text-[11px]">Tên đăng nhập (Cố định):</span>
                  <span className="font-semibold text-slate-700">@{profile.username}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                  <span className="block text-slate-400 text-[11px]">Email liên kết:</span>
                  <span className="font-semibold text-slate-700 truncate block">{profile.email}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending || fullName === profile.fullName}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-white" />
                    <span>Đang lưu họ và tên...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Lưu thay đổi họ tên</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'SECURITY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Change Password Form */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Đổi mật khẩu tài khoản</h3>
                <p className="text-[11px] text-slate-500">Bảo vệ quyền truy cập tài khoản và số dư ví</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
              {passSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{passSuccessMsg}</span>
                </div>
              )}
              {passErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  <span>{passErrorMsg}</span>
                </div>
              )}

              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                label="Mật khẩu hiện tại"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Nhập mật khẩu bạn đang sử dụng"
                required
              />

              <PasswordInput
                id="newPassword"
                name="newPassword"
                label="Mật khẩu mới (tối thiểu 6 ký tự)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Nhập mật khẩu mới an toàn"
                required
              />

              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Nhập lại chính xác mật khẩu mới"
                required
              />

              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                {changePasswordMutation.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-white" />
                    <span>Đang cập nhật mật khẩu...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={15} />
                    <span>Cập nhật mật khẩu mới</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Security Information Box */}
          <div className="space-y-4">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Shield size={16} className="text-emerald-600" />
                Chính sách an toàn &amp; Thu hồi phiên
              </h4>
              <ul className="space-y-2 text-slate-600 list-disc list-inside">
                <li>Mật khẩu mới phải có tối thiểu 6 ký tự và khác mật khẩu hiện tại.</li>
                <li>
                  <strong className="text-slate-800">Tự động đăng xuất từ xa:</strong> Khi đổi mật khẩu thành công, toàn bộ Refresh Token của các thiết bị khác sẽ bị thu hồi ngay lập tức để bảo vệ tài khoản của bạn.
                </li>
                <li>Không bao giờ chia sẻ mật khẩu hoặc mã PIN lấy đồ tại tủ Smart Locker cho người khác.</li>
              </ul>
            </div>

            <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200 text-xs space-y-2 text-blue-900">
              <h4 className="font-bold flex items-center gap-2">
                <Smartphone size={16} className="text-blue-600" />
                Phiên đăng nhập hiện tại
              </h4>
              <p className="text-blue-800">
                Phiên làm việc trên thiết bị này đang được bảo vệ bởi công nghệ JWT Access Token lưu trữ trong bộ nhớ và HttpOnly Refresh Cookie bảo mật.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Smart Locker Notifications */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Thông báo Smart Locker &amp; Đơn hàng</h3>
              <p className="text-[11px] text-slate-500">Quản lý nhận thông báo tự động về trạng thái ngăn tủ</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="space-y-1 pr-4">
                <h4 className="text-xs font-bold text-slate-900">Thông báo mở ngăn tủ &amp; Nạp đồ</h4>
                <p className="text-[11px] text-slate-500">
                  Gửi thông báo qua hệ thống khi Người bán đã hoàn thành bỏ hàng vào ngăn tủ và phát sinh mã PIN lấy đồ.
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                Mặc định Bật
              </span>
            </div>

            <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="space-y-1 pr-4">
                <h4 className="text-xs font-bold text-slate-900">Cảnh báo sắp hết hạn lấy hàng (Deadline Alert)</h4>
                <p className="text-[11px] text-slate-500">
                  Hệ thống tự động nhắc nhở trước 6 giờ và 2 giờ trước khi thời hạn lấy đồ tại tủ locker kết thúc.
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                Mặc định Bật
              </span>
            </div>

            <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <div className="space-y-1 pr-4">
                <h4 className="text-xs font-bold text-slate-900">Nhắc nhở trả đồ đối với đơn hàng thuê</h4>
                <p className="text-[11px] text-slate-500">
                  Gửi hướng dẫn và mã PIN trả đồ về trạm tủ locker ban đầu trước khi hết thời gian thuê sản phẩm.
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                Mặc định Bật
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
