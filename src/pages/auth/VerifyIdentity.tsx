import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  identityApi,
  type StartVerificationResponseDto,
  type ChallengeInfo,
  type IdentityAttemptResponseDto,
} from '../../api/identityApi';
import { parseCccdQr, scanQrFromImageSource, type CccdQrData } from '../../utils/cccdQrParser';
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  PlusCircle,
  Loader2,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Camera,
  CameraOff,
  Clock,
  ArrowRight as ArrowRightIcon,
  RotateCcw,
  Eye,
  Check,
} from 'lucide-react';

export const VerifyIdentity = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Workflow steps: 1 = Upload Card, 2 = Active Liveness, 3 = Face Match Selfie
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Attempt orchestration state
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeInfo | null>(null);
  const [totalChallenges, setTotalChallenges] = useState<number>(2);
  const [stepIndex, setStepIndex] = useState<number>(0);

  // Original Card File preserved in memory for cryptographic hash binding
  const [rawCardFile, setRawCardFile] = useState<File | null>(null);
  const [cardPreviewUrl, setCardPreviewUrl] = useState<string | null>(null);

  // Citizen details extracted from QR / OCR
  const [qrScanResult, setQrScanResult] = useState<CccdQrData | null>(null);
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [qrNotice, setQrNotice] = useState<string | null>(null);
  const [showDemoQr, setShowDemoQr] = useState(false);

  // Liveness & Webcam state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const cameraSessionIdRef = useRef(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturingFrames, setIsCapturingFrames] = useState(false);
  const [capturedFramesCount, setCapturedFramesCount] = useState(0);

  // Selfie photo state (for step 3)
  const [selfieBlob, setSelfieBlob] = useState<Blob | null>(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);

  // Latest attempt record from backend
  const [latestAttempt, setLatestAttempt] = useState<IdentityAttemptResponseDto | null>(null);
  const [isLoadingAttempt, setIsLoadingAttempt] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [confirmedCommitment, setConfirmedCommitment] = useState(true);

  // Fetch latest attempt on mount to check in-progress / review status
  const loadLatestAttempt = useCallback(async () => {
    try {
      setIsLoadingAttempt(true);
      const attempt = await identityApi.getMyLatestAttempt();
      setLatestAttempt(attempt);
    } catch {
      // Ignore background fetch error
    } finally {
      setIsLoadingAttempt(false);
    }
  }, []);

  useEffect(() => {
    loadLatestAttempt();
  }, [loadLatestAttempt]);

  // Clean up object URLs on change
  useEffect(() => {
    return () => {
      if (cardPreviewUrl) URL.revokeObjectURL(cardPreviewUrl);
      if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    };
  }, [cardPreviewUrl, selfiePreviewUrl]);

  // Stop camera tracks and release device
  const stopCamera = useCallback(() => {
    cameraSessionIdRef.current += 1;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Start webcam with session token guard to prevent racing or orphaned streams
  const startCamera = useCallback(async () => {
    stopCamera();
    const currentSessionId = ++cameraSessionIdRef.current;
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (currentSessionId === cameraSessionIdRef.current) {
          setCameraError('Trình duyệt của bạn không hỗ trợ truy cập thiết bị ghi hình (Webcam).');
        }
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      // If stopCamera was called while getUserMedia was resolving, discard immediately
      if (currentSessionId !== cameraSessionIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
    } catch (err: any) {
      if (currentSessionId !== cameraSessionIdRef.current) return;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Bạn đã từ chối quyền truy cập camera. Vui lòng cấp quyền trong cài đặt trình duyệt để tiếp tục.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('Không tìm thấy thiết bị camera trên thiết bị của bạn.');
      } else {
        setCameraError('Không thể khởi động camera: ' + (err.message || 'Lỗi không xác định'));
      }
      setCameraActive(false);
    }
  }, [stopCamera]);

  // Switch camera automatically when entering step 2 or 3, and ensure full teardown
  useEffect(() => {
    if ((currentStep === 2 || currentStep === 3) && !selfieBlob) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [currentStep, selfieBlob, startCamera, stopCamera]);

  // Attach video stream to element if ref mounts after startCamera
  useEffect(() => {
    if (cameraActive && mediaStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [cameraActive]);

  // Handle front card file selection
  const handleCardFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Định dạng ảnh không hỗ trợ. Vui lòng chọn tệp ảnh JPG, PNG hoặc WEBP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Dung lượng ảnh vượt quá giới hạn cho phép (10MB).');
      return;
    }

    setRawCardFile(file);
    if (cardPreviewUrl) URL.revokeObjectURL(cardPreviewUrl);
    setCardPreviewUrl(URL.createObjectURL(file));
    setErrorMessage('');
    setQrNotice(null);

    // Optional: Scan QR code locally for preview
    setIsScanningQr(true);
    try {
      const qr = await scanQrFromImageSource(file);
      if (qr) {
        processQrText(qr);
      } else {
        setQrNotice('Chưa đọc được mã QR trực tiếp từ ảnh. Hệ thống sẽ sử dụng AI OCR để trích xuất khi bắt đầu.');
      }
    } catch {
      setQrNotice('Không nhận diện được mã QR. Hệ thống sẽ phân tích qua OCR.');
    } finally {
      setIsScanningQr(false);
    }
  };

  const processQrText = (rawText: string) => {
    const parsed = parseCccdQr(rawText);
    if (parsed) {
      setQrScanResult(parsed);
      setQrNotice(null);
    } else {
      const trimmed = rawText.trim();
      if (/^[0-9]{12}$/.test(trimmed)) {
        setQrScanResult({
          citizenId: trimmed,
          fullName: user?.fullName || '',
          dateOfBirthRaw: '',
          dateOfBirthFormatted: '',
          rawText: trimmed,
        });
      }
    }
  };

  const applySampleQr = (sampleStr: string) => {
    processQrText(sampleStr);
  };

  // STEP 1 -> STEP 2: Start eKYC attempt with CCCD card
  const handleStartAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!rawCardFile) {
      setErrorMessage('Vui lòng chọn ảnh mặt trước Căn cước công dân gắn chip.');
      return;
    }

    if (!confirmedCommitment) {
      setErrorMessage('Vui lòng xác nhận cam kết tính chính xác của giấy tờ tùy thân.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessNotice(null);

    try {
      const res: StartVerificationResponseDto = await identityApi.startAttempt(rawCardFile);
      setAttemptId(res.attemptId);
      setCurrentChallenge(res.currentChallenge);
      setTotalChallenges(res.totalChallenges);
      setStepIndex(res.stepIndex);
      setCurrentStep(2);
      setSuccessNotice('Trích xuất thông tin thẻ CCCD thành công. Chuyển sang bước xác thực cử động sống.');
    } catch (err: any) {
      const apiError = err.response?.data?.message || err.response?.data?.error;
      if (apiError === 'IDENTITY_OCR_FAILED') {
        setErrorMessage('Không thể trích xuất thông tin hợp lệ từ thẻ CCCD. Vui lòng chụp lại ảnh rõ nét, đủ 4 góc và đủ ánh sáng.');
      } else if (apiError === 'INVALID_CITIZEN_ID') {
        setErrorMessage('Số Căn cước công dân trên ảnh không đúng định dạng 12 chữ số.');
      } else if (apiError === 'CITIZEN_ID_ALREADY_EXISTS') {
        setErrorMessage('Số CCCD này đã được sử dụng bởi một tài khoản khác trong hệ thống.');
      } else if (apiError === 'IDENTITY_ATTEMPT_LIMIT_EXCEEDED') {
        setErrorMessage('Bạn đã vượt quá số lần thử xác minh trong ngày. Vui lòng quay lại sau.');
      } else {
        setErrorMessage(apiError || 'Khởi tạo phiên xác thực thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Capture frame from video via canvas
  const captureVideoFrame = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current) return resolve(null);
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return resolve(null);

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      // Draw horizontal flip if needed (or standard)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.85
      );
    });
  };

  // STEP 2: Record frames and submit liveness challenge
  const handlePerformLivenessStep = async () => {
    if (!attemptId || !cameraActive || isCapturingFrames || loading) return;

    setIsCapturingFrames(true);
    setCapturedFramesCount(0);
    setErrorMessage('');
    setSuccessNotice(null);

    const frames: Blob[] = [];
    const totalFramesNeeded = 7;
    const intervalMs = 200;

    try {
      for (let i = 0; i < totalFramesNeeded; i++) {
        const frameBlob = await captureVideoFrame();
        if (frameBlob) {
          frames.push(frameBlob);
          setCapturedFramesCount(frames.length);
        }
        await new Promise((r) => setTimeout(r, intervalMs));
      }

      setIsCapturingFrames(false);

      if (frames.length < 3) {
        setErrorMessage('Không thu thập đủ khung hình hợp lệ từ camera (yêu cầu tối thiểu 3 khung hình). Vui lòng kiểm tra lại thiết bị camera và thử lại.');
        return;
      }

      setLoading(true);

      const result = await identityApi.submitLivenessStep(attemptId, frames);

      if (result.actionCompleted) {
        if (result.livenessPassed || !result.nextChallenge) {
          // Liveness fully passed -> move to step 3
          stopCamera();
          setSuccessNotice('Xác thực cử động sống thành công! Vui lòng chụp ảnh chân dung selfie để đối chiếu.');
          setCurrentStep(3);
        } else {
          // Next challenge action
          setCurrentChallenge(result.nextChallenge);
          setStepIndex(result.stepIndex);
          setSuccessNotice(`Động tác hợp lệ! Tiếp tục: ${result.nextChallenge.instruction}`);
        }
      } else {
        setErrorMessage(
          result.message || 'Chưa ghi nhận cử động hợp lệ. Vui lòng nhìn thẳng vào camera và thực hiện lại đúng hướng dẫn.'
        );
      }
    } catch (err: any) {
      setIsCapturingFrames(false);
      const apiMsg = err.response?.data?.message || err.response?.data?.error;
      if (apiMsg === 'IDENTITY_LIVENESS_FAILED') {
        setErrorMessage('Không vượt qua kiểm tra cử động hoặc phát hiện dấu hiệu giả mạo khuôn mặt. Vui lòng thử lại.');
      } else {
        setErrorMessage(apiMsg || 'Gửi dữ liệu kiểm tra cử động thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Take selfie photo
  const handleTakeSelfie = async () => {
    if (!cameraActive) return;
    const blob = await captureVideoFrame();
    if (!blob) {
      setErrorMessage('Không thể chụp ảnh từ webcam. Vui lòng thử lại.');
      return;
    }
    stopCamera();
    setSelfieBlob(blob);
    if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    setSelfiePreviewUrl(URL.createObjectURL(blob));
    setErrorMessage('');
  };

  const handleRetakeSelfie = () => {
    setSelfieBlob(null);
    if (selfiePreviewUrl) {
      URL.revokeObjectURL(selfiePreviewUrl);
      setSelfiePreviewUrl(null);
    }
  };

  // STEP 3: Complete verification by matching face
  const handleCompleteFaceVerification = async () => {
    if (!attemptId || !rawCardFile || !selfieBlob || loading) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await identityApi.verifyFace(attemptId, rawCardFile, selfieBlob);

      if (res.match && (res.status === 'PENDING_REVIEW' || res.status === 'FACE_VERIFICATION_PASSED')) {
        await refreshUser();
        await loadLatestAttempt();
        setSuccessNotice('Hoàn tất đối chiếu sinh trắc học! Hồ sơ của bạn đã được chuyển tới cán bộ quản trị để phê duyệt.');
      } else {
        setErrorMessage(
          res.message || 'Khuôn mặt chụp không trùng khớp với ảnh trên CCCD. Vui lòng chụp lại ảnh chân dung rõ nét.'
        );
      }
    } catch (err: any) {
      const apiError = err.response?.data?.message || err.response?.data?.error;
      if (apiError === 'IDENTITY_CARD_MISMATCH') {
        setErrorMessage('Ảnh CCCD dùng để đối chiếu không trùng khớp với ảnh đã tải lên ở Bước 1.');
      } else if (apiError === 'IDENTITY_FACE_MISMATCH') {
        setErrorMessage('Độ tương đồng khuôn mặt không đạt ngưỡng quy định. Vui lòng chụp lại ảnh chân dung rõ mặt, đủ ánh sáng.');
      } else {
        setErrorMessage(apiError || 'Đối chiếu khuôn mặt thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isVerified = Boolean(user?.identityVerified);
  const isPendingReview =
    user?.identityReviewStatus === 'PENDING' ||
    latestAttempt?.status === 'PENDING_REVIEW' ||
    (latestAttempt?.status === 'FACE_VERIFICATION_PASSED' && !isVerified);
  const isRejected = user?.identityReviewStatus === 'REJECTED' || latestAttempt?.status === 'REJECTED';

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
            <Lock size={12} className="text-slate-400" /> Hệ thống Định danh eKYC
          </span>
        </div>

        {/* Official Portal Container */}
        <div className="bg-white rounded-xl border border-slate-300/80 shadow-xs p-6 sm:p-8">
          {/* Header */}
          <div className="border-b border-slate-200 pb-5 mb-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Hệ thống Định danh Điện tử • Smart Locker Campus
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Xác Minh Căn Cước Công Dân & Sinh Trắc Học (eKYC)
            </h1>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Quy trình đối chiếu AI khép kín gồm trích xuất thẻ CCCD, kiểm tra cử động sống chống giả mạo (Anti-Spoofing) và đối soát khuôn mặt phục vụ giao nhận an toàn qua Smart Locker.
            </p>
          </div>

          {/* STATE 1: ALREADY FULLY VERIFIED */}
          {isVerified && (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Tài khoản đã được định danh và xác thực
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                  Hồ sơ căn cước công dân đã được cán bộ quản trị phê duyệt hợp lệ. Bạn có toàn quyền đăng bán, giao dịch và mở tủ Smart Locker.
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
                  type="button"
                  onClick={() => navigate('/marketplace/new')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-lg text-xs font-semibold transition"
                >
                  <PlusCircle size={14} /> Đăng tin bán hàng
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/marketplace')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition border border-slate-200"
                >
                  <ShoppingBag size={14} /> Vào Chợ sinh viên
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: PENDING REVIEW (Chờ quản trị viên phê duyệt) */}
          {!isVerified && isPendingReview && (
            <div className="space-y-6">
              <div className="p-5 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3">
                <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
                  <Clock size={18} className="text-amber-600 shrink-0" />
                  <span>Hồ sơ đang chờ cán bộ quản trị phê duyệt</span>
                </div>
                <p className="text-xs text-amber-900/90 leading-relaxed">
                  Hệ thống eKYC đã đối soát thành công dữ liệu thẻ CCCD, kiểm tra cử động sống chống giả mạo và đối chiếu khuôn mặt. Hồ sơ của bạn đã được chuyển tới cán bộ quản trị viên để hậu kiểm và phê duyệt chính thức.
                </p>

                <div className="pt-2 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 p-2.5 rounded border border-amber-200">
                    <span className="text-slate-500 block text-[11px]">Trạng thái hồ sơ:</span>
                    <span className="font-semibold text-amber-800">Đang kiểm duyệt (PENDING_REVIEW)</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded border border-amber-200">
                    <span className="text-slate-500 block text-[11px]">Số CCCD đối soát:</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {latestAttempt?.citizenIdMasked ||
                        (user?.citizenId
                          ? `${user.citizenId.substring(0, 3)}******${user.citizenId.substring(user.citizenId.length - 3)}`
                          : 'Đang lưu trữ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    await refreshUser();
                    await loadLatestAttempt();
                  }}
                  disabled={isLoadingAttempt}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
                >
                  <RefreshCw size={13} className={isLoadingAttempt ? 'animate-spin' : ''} />
                  Tải lại trạng thái phê duyệt
                </button>
                <Link
                  to="/marketplace"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#eb6e34] hover:bg-[#d85e25] text-white text-xs font-semibold rounded-lg transition"
                >
                  <ShoppingBag size={13} /> Quay lại Chợ sinh viên
                </Link>
              </div>
            </div>
          )}

          {/* STATE 3: ACTIVE eKYC PIPELINE (When not verified and not pending) */}
          {!isVerified && !isPendingReview && (
            <div className="space-y-6">
              {/* Previous Rejection Alert if applicable */}
              {isRejected && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Lần xác minh trước chưa thành công hoặc bị từ chối</strong>
                    <span className="text-rose-700 leading-relaxed block mt-0.5">
                      {latestAttempt?.failureReason ||
                        'Vui lòng bảo đảm ảnh chụp CCCD rõ nét, không lóa sáng, và thực hiện theo đúng chỉ dẫn cử động khuôn mặt trong luồng eKYC.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Step Navigation Indicator */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/60">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div
                    className={`py-2 px-1 rounded-md font-semibold transition ${
                      currentStep === 1
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                        : currentStep > 1
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Bước 1</span>
                    <span className="flex items-center justify-center gap-1 text-[11px] sm:text-xs">
                      {currentStep > 1 && <Check size={12} className="text-emerald-600" />} Thẻ CCCD
                    </span>
                  </div>
                  <div
                    className={`py-2 px-1 rounded-md font-semibold transition ${
                      currentStep === 2
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                        : currentStep > 2
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Bước 2</span>
                    <span className="flex items-center justify-center gap-1 text-[11px] sm:text-xs">
                      {currentStep > 2 && <Check size={12} className="text-emerald-600" />} Cử động sống
                    </span>
                  </div>
                  <div
                    className={`py-2 px-1 rounded-md font-semibold transition ${
                      currentStep === 3
                        ? 'bg-white text-slate-900 border border-slate-300 shadow-2xs'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Bước 3</span>
                    <span className="text-[11px] sm:text-xs">Đối chiếu khuôn mặt</span>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              {/* Success Alert */}
              {successNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-600 mt-0.5" />
                  <div className="flex-1">{successNotice}</div>
                </div>
              )}

              {/* -------------------- STEP 1: UPLOAD CCCD FRONT -------------------- */}
              {currentStep === 1 && (
                <form onSubmit={handleStartAttempt} className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-2 border-[#eb6e34] pl-2">
                        1. Tệp hình ảnh Căn cước công dân gắn chip (Mặt trước)
                      </label>
                      <span className="text-[11px] text-slate-500">(Bắt buộc)</span>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 hover:border-[#eb6e34] rounded-xl p-5 text-center transition bg-slate-50/50">
                      {cardPreviewUrl ? (
                        <div className="space-y-3">
                          <img
                            src={cardPreviewUrl}
                            alt="Mặt trước CCCD"
                            className="max-h-56 mx-auto rounded-lg border border-slate-300 shadow-xs object-contain"
                          />
                          <div className="flex justify-center items-center gap-3">
                            <label className="cursor-pointer text-xs font-semibold text-[#eb6e34] hover:text-[#d85e25] transition inline-flex items-center gap-1">
                              <RotateCcw size={12} /> Chọn ảnh khác
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleCardFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block py-6">
                          <CreditCard size={36} className="mx-auto text-slate-400 mb-2" />
                          <span className="block text-xs font-semibold text-slate-800 mb-0.5">
                            Bấm vào đây để tải lên ảnh mặt trước CCCD
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            Chụp rõ nét 4 góc, đủ ánh sáng, không lóa và rõ mã QR góc trên bên phải
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleCardFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {isScanningQr && (
                      <div className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                        <Loader2 size={13} className="animate-spin text-[#eb6e34]" />
                        <span>Đang đọc dữ liệu mã QR trên thẻ CCCD...</span>
                      </div>
                    )}

                    {qrNotice && !isScanningQr && !qrScanResult && (
                      <p className="text-[11px] text-slate-500 leading-relaxed">{qrNotice}</p>
                    )}
                  </div>

                  {/* QR Data Preview if detected */}
                  {qrScanResult && (
                    <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 text-xs space-y-2">
                      <div className="flex items-center justify-between font-semibold text-slate-900 border-b border-slate-200 pb-2">
                        <span className="flex items-center gap-1.5 text-emerald-700">
                          <CheckCircle2 size={13} /> Đã nhận diện mã QR trên CCCD
                        </span>
                        <span className="text-[11px] font-mono text-slate-600">{qrScanResult.citizenId}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                        <div>
                          <span className="text-slate-500">Họ và tên:</span>{' '}
                          <strong className="uppercase">{qrScanResult.fullName}</strong>
                        </div>
                        {qrScanResult.dateOfBirthFormatted && (
                          <div>
                            <span className="text-slate-500">Ngày sinh:</span>{' '}
                            <span>{qrScanResult.dateOfBirthFormatted}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Legal Commitment Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmedCommitment}
                        onChange={(e) => setConfirmedCommitment(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-[#eb6e34] focus:ring-[#eb6e34]"
                      />
                      <span className="leading-relaxed text-[11px] text-slate-600">
                        Tôi cam đoan tệp ảnh giấy tờ tùy thân cung cấp trên đây là chính chủ, chính xác và đồng ý sử dụng dữ liệu sinh trắc học để phục vụ việc xác thực qua Smart Locker.
                      </span>
                    </label>
                  </div>

                  {/* Submit Step 1 Button */}
                  <button
                    type="submit"
                    disabled={loading || !rawCardFile || !confirmedCommitment}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#eb6e34] hover:bg-[#d85e25] text-white font-semibold text-xs sm:text-sm rounded-lg transition shadow-2xs disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Đang trích xuất OCR và khởi tạo eKYC...
                      </>
                    ) : (
                      <>
                        Tiếp tục: Bắt đầu xác thực khuôn mặt
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  {/* Demo Tool for testing */}
                  <div className="pt-2 text-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowDemoQr(!showDemoQr)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 transition inline-flex items-center gap-1"
                    >
                      <QrCode size={12} />
                      {showDemoQr ? 'Ẩn bộ dữ liệu kiểm thử' : 'Chế độ thử nghiệm đồ án (Demo QR)'}
                    </button>
                    {showDemoQr && (
                      <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left space-y-2">
                        <p className="text-[11px] text-slate-600 font-medium">Chọn chuỗi QR mẫu:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              applySampleQr('001201000001||Nguyễn Văn An (K64)|15052003|Nam|Cầu Giấy, Hà Nội|25122021')
                            }
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-[11px] transition"
                          >
                            user01 (Nguyễn Văn An)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              applySampleQr('001205000004||Phạm Đức Huy (K66)|24032005|Nam|Hai Bà Trưng, Hà Nội|15082023')
                            }
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-[11px] transition"
                          >
                            user04 (Phạm Đức Huy)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* -------------------- STEP 2: ACTIVE LIVENESS -------------------- */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-2 border-[#eb6e34] pl-2 flex items-center justify-between">
                    <span>2. Kiểm tra cử động khuôn mặt chống giả mạo</span>
                    <span className="text-[11px] font-mono text-[#eb6e34]">
                      Động tác {stepIndex + 1} / {totalChallenges}
                    </span>
                  </div>

                  {/* Challenge Action Instruction Box */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center gap-3 shadow-xs">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                      {currentChallenge?.action === 'TURN_HEAD_LEFT' && <ArrowLeft size={20} className="text-[#eb6e34]" />}
                      {currentChallenge?.action === 'TURN_HEAD_RIGHT' && <ArrowRightIcon size={20} className="text-[#eb6e34]" />}
                      {currentChallenge?.action === 'NOD_HEAD' && <RotateCcw size={20} className="text-[#eb6e34]" />}
                      {currentChallenge?.action === 'FACE_CENTER' && <Eye size={20} className="text-[#eb6e34]" />}
                      {!['TURN_HEAD_LEFT', 'TURN_HEAD_RIGHT', 'NOD_HEAD', 'FACE_CENTER'].includes(
                        currentChallenge?.action || ''
                      ) && <Camera size={20} className="text-[#eb6e34]" />}
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">
                        Động tác yêu cầu:
                      </div>
                      <div className="text-sm font-bold text-white">
                        {currentChallenge?.instruction || 'Vui lòng nhìn vào camera'}
                      </div>
                    </div>
                  </div>

                  {/* Camera Viewport with Face Oval Overlay */}
                  <div className="relative bg-black rounded-xl overflow-hidden aspect-4/3 flex items-center justify-center border border-slate-300 shadow-inner">
                    {cameraError ? (
                      <div className="p-6 text-center text-rose-300 space-y-2">
                        <CameraOff size={32} className="mx-auto text-rose-400" />
                        <p className="text-xs">{cameraError}</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="mt-2 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-md shadow-xs"
                        >
                          Thử mở lại Camera
                        </button>
                      </div>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover scale-x-[-1]"
                        />

                        {/* Oval Face Guide Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div
                            className={`w-48 sm:w-56 h-64 sm:h-72 rounded-[50%] border-2 transition-all duration-300 ${
                              isCapturingFrames
                                ? 'border-[#eb6e34] border-dashed shadow-[0_0_20px_rgba(235,110,52,0.6)]'
                                : 'border-white/60'
                            }`}
                          />
                        </div>

                        {/* Recording Progress Indicator */}
                        {isCapturingFrames && (
                          <div className="absolute bottom-4 inset-x-4 bg-black/80 backdrop-blur-xs py-2 px-3 rounded-lg text-center text-xs text-white flex items-center justify-center gap-2 border border-white/20">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                            <span>
                              Đang ghi hình cử động: {capturedFramesCount} / 7 khung hình...
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions for Step 2 */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handlePerformLivenessStep}
                      disabled={loading || isCapturingFrames || !cameraActive}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#eb6e34] hover:bg-[#d85e25] text-white font-semibold text-xs sm:text-sm rounded-lg transition shadow-2xs disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Hệ thống AI đang kiểm tra cử động...
                        </>
                      ) : isCapturingFrames ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Đang thu thập khung hình ({capturedFramesCount}/7)...
                        </>
                      ) : (
                        <>
                          <Camera size={15} />
                          Bắt đầu ghi hình cử động (1.5 giây)
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-slate-500">
                      Giữ khuôn mặt trong khung hình oval và thực hiện động tác chậm rãi khi bắt đầu ghi hình.
                    </p>
                  </div>
                </div>
              )}

              {/* -------------------- STEP 3: FACE MATCH VERIFICATION -------------------- */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-900 border-l-2 border-[#eb6e34] pl-2">
                    3. Chụp ảnh chân dung & đối chiếu với thẻ CCCD
                  </div>

                  {selfieBlob && selfiePreviewUrl ? (
                    /* Side-by-side comparison preview */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-center">
                          <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                            Ảnh thẻ CCCD gốc (Bước 1)
                          </span>
                          {cardPreviewUrl && (
                            <img
                              src={cardPreviewUrl}
                              alt="CCCD gốc"
                              className="w-full h-40 object-contain rounded border border-slate-200 bg-white"
                            />
                          )}
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-center">
                          <span className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                            Ảnh chân dung vừa chụp
                          </span>
                          <img
                            src={selfiePreviewUrl}
                            alt="Selfie"
                            className="w-full h-40 object-contain rounded border border-slate-200 bg-white scale-x-[-1]"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleRetakeSelfie}
                          disabled={loading}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition inline-flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw size={13} /> Chụp lại ảnh khác
                        </button>
                        <button
                          type="button"
                          onClick={handleCompleteFaceVerification}
                          disabled={loading}
                          className="flex-2 py-2 px-4 bg-[#eb6e34] hover:bg-[#d85e25] text-white text-xs sm:text-sm font-semibold rounded-lg transition inline-flex items-center justify-center gap-2 shadow-2xs disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              Đang đối soát sinh trắc học...
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={16} />
                              Xác nhận đối chiếu khuôn mặt
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Selfie Camera Viewport */
                    <div className="space-y-4">
                      <div className="relative bg-black rounded-xl overflow-hidden aspect-4/3 flex items-center justify-center border border-slate-300 shadow-inner">
                        {cameraError ? (
                          <div className="p-6 text-center text-rose-300 space-y-2">
                            <CameraOff size={32} className="mx-auto text-rose-400" />
                            <p className="text-xs">{cameraError}</p>
                            <button
                              type="button"
                              onClick={startCamera}
                              className="mt-2 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-md shadow-xs"
                            >
                              Thử mở lại Camera
                            </button>
                          </div>
                        ) : (
                          <>
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover scale-x-[-1]"
                            />
                            {/* Oval Face Guideline */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <div className="w-48 sm:w-56 h-64 sm:h-72 rounded-[50%] border-2 border-white/70" />
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleTakeSelfie}
                        disabled={!cameraActive}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#eb6e34] hover:bg-[#d85e25] text-white font-semibold text-xs sm:text-sm rounded-lg transition shadow-2xs disabled:opacity-50"
                      >
                        <Camera size={15} />
                        Chụp ảnh chân dung
                      </button>

                      <p className="text-[11px] text-center text-slate-500">
                        Căn chỉnh khuôn mặt vào giữa khung oval, nhìn thẳng và bảo đảm ánh sáng rõ ràng.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
