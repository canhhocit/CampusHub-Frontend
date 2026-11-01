import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Product } from '../../types/marketplace';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  ShoppingBag,
  Edit3,
  ImageOff,
  Lock,
  ShieldCheck,
  Clock,
  Tag,
  AlertCircle,
  Calendar,
  Play,
  MapPin,
  Star,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { getMediaUrl } from '../../api/cloudinary';

import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import type { UserRatingSummaryResponse, ReviewResponse } from '../../types/review';
import type { Locker } from '../../types/locker';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Rental Modal State
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [selectedRentalDays, setSelectedRentalDays] = useState<number>(3);
  const [customDays, setCustomDays] = useState<string>('');

  // Media Gallery State
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'IMAGE' | 'VIDEO'; url: string } | null>(null);

  // Dialog & Notification States
  const [isConfirmPurchaseOpen, setIsConfirmPurchaseOpen] = useState(false);
  const [isVerifyPromptOpen, setIsVerifyPromptOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Action Mode State for Segmented Control (UP-04)
  const [actionMode, setActionMode] = useState<'PURCHASE' | 'RENTAL'>('PURCHASE');

  // Preferred Locker Selection State (UP-05)
  const [preferredLockerId, setPreferredLockerId] = useState<number | null>(null);

  // Active Lockers Query for Checkout (UP-05)
  const { data: activeLockers } = useQuery<Locker[]>({
    queryKey: ['active-lockers-dropdown'],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/lockers', { params: { status: 'ACTIVE', size: 50 } })
        .then((res) => res.data.content || []),
    enabled: isConfirmPurchaseOpen || isRentalModalOpen,
  });

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => axiosInstance.get(`/api/v1/products/${id}`).then((res) => res.data),
    retry: false,
  });

  // Seller rating summary
  const { data: sellerRating } = useQuery<UserRatingSummaryResponse | null>({
    queryKey: ['user-rating-summary', product?.owner?.id],
    queryFn: () =>
      axiosInstance.get(`/api/v1/users/${product?.owner?.id}/rating-summary`).then((res) => res.data).catch(() => null),
    enabled: !!product?.owner?.id,
  });

  // Product reviews
  const { data: rawReviews } = useQuery<any>({
    queryKey: ['product-reviews', id],
    queryFn: () =>
      axiosInstance.get(`/api/v1/products/${id}/reviews`).then((res) => res.data).catch(() => []),
    enabled: !!id,
  });

  const productReviews: ReviewResponse[] = Array.isArray(rawReviews)
    ? rawReviews
    : (rawReviews && Array.isArray((rawReviews as any)?.content))
    ? (rawReviews as any).content
    : [];

  const isOwner = Boolean(
    user?.username && product?.owner?.username && user.username === product.owner.username
  );

  const createOrderMutation = useMutation({
    mutationFn: (variables?: {
      orderType?: 'PURCHASE' | 'RENTAL';
      rentalDurationDays?: number;
      preferredLockerId?: number | null;
    }) =>
      axiosInstance
        .post('/api/v1/orders', {
          productId: Number(id),
          orderType: variables?.orderType || 'PURCHASE',
          rentalDurationDays: variables?.rentalDurationDays,
          preferredLockerId: variables?.preferredLockerId ?? null,
        })
        .then((res) => res.data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
      queryClient.invalidateQueries({ queryKey: ['selling-orders'] });
      queryClient.invalidateQueries({ queryKey: ['selling-pending-count'] });
      setIsConfirmPurchaseOpen(false);
      setIsRentalModalOpen(false);
      navigate(`/orders/${data.id}`);
    },
    onError: (err: any) => {
      setIsConfirmPurchaseOpen(false);
      setIsRentalModalOpen(false);
      if (err.response?.status === 403) {
        setIsVerifyPromptOpen(true);
        return;
      }
      setActionError(err.response?.data?.message || 'Không thể tạo đơn hàng');
    },
  });

  const checkIdentityAndAuth = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    if (user && user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN' && !user.identityVerified) {
      setIsVerifyPromptOpen(true);
      return false;
    }
    return true;
  };

  const handlePurchaseClick = () => {
    if (createOrderMutation.isPending) return;
    if (!checkIdentityAndAuth()) return;
    if (product?.locker?.id && preferredLockerId === null) {
      setPreferredLockerId(product.locker.id);
    }
    setIsConfirmPurchaseOpen(true);
  };

  const handleConfirmPurchase = () => {
    createOrderMutation.mutate({
      orderType: 'PURCHASE',
      preferredLockerId: preferredLockerId ?? null,
    });
  };

  const handleOpenRentalModal = () => {
    if (createOrderMutation.isPending) return;
    if (!checkIdentityAndAuth()) return;
    if (product?.locker?.id && preferredLockerId === null) {
      setPreferredLockerId(product.locker.id);
    }
    setIsRentalModalOpen(true);
  };

  const effectiveRentalDays = customDays && Number(customDays) > 0 ? Number(customDays) : selectedRentalDays;

  const handleConfirmRental = () => {
    if (effectiveRentalDays < 1 || effectiveRentalDays > 90) {
      setActionError('Thời hạn thuê phải từ 1 đến 90 ngày.');
      return;
    }
    createOrderMutation.mutate({
      orderType: 'RENTAL',
      rentalDurationDays: effectiveRentalDays,
      preferredLockerId: preferredLockerId ?? null,
    });
  };

  const effectiveMode: 'PURCHASE' | 'RENTAL' =
    product?.listingType === 'RENT'
      ? 'RENTAL'
      : product?.listingType === 'BOTH'
      ? actionMode
      : 'PURCHASE';

  const handlePrimaryAction = () => {
    if (effectiveMode === 'PURCHASE') {
      handlePurchaseClick();
    } else {
      handleOpenRentalModal();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-lg border border-slate-200 text-center shadow-xs">
        <div className="w-16 h-16 rounded-lg bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-slate-500 mb-6">
          Sản phẩm có thể đã bị gỡ bỏ hoặc không tồn tại trên hệ thống.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
          >
            <ArrowLeft size={14} /> Khám phá các món đồ khác
          </Link>
        </div>
      </div>
    );
  }

  const isForSale = product.listingType === 'SALE' || product.listingType === 'BOTH' || !product.listingType;
  const isForRent = product.listingType === 'RENT' || product.listingType === 'BOTH';

  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(product.detailImageUrls || []),
  ];

  const currentMedia = selectedMedia || (allImages.length > 0 ? { type: 'IMAGE' as const, url: allImages[0] } : (product.videoUrl ? { type: 'VIDEO' as const, url: product.videoUrl } : null));

  const hasMultipleMedia = allImages.length > 1 || Boolean(product.videoUrl && allImages.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-24 sm:py-8 font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <Link to="/" className="hover:text-emerald-700">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-emerald-700">
            Chợ 
          </Link>
          <span>/</span>
          <Link
            to={`/marketplace?categoryId=${product.category?.id}`}
            className="hover:text-emerald-700"
          >
            {product.category?.name || 'Khác'}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-50 sm:max-w-md">
            {product.title}
          </span>
        </nav>

        {/* Main Product Details Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Left Column: Product Imagery (lg:col-span-6) */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-slate-50/50 space-y-4">
              <div className="space-y-4">
                {/* Main Media Viewer */}
                <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200 overflow-hidden relative flex items-center justify-center shadow-xs">
                  {currentMedia?.type === 'VIDEO' ? (
                    <video
                      src={getMediaUrl(currentMedia.url)}
                      controls
                      autoPlay
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : currentMedia?.url ? (
                    <img
                      src={getMediaUrl(currentMedia.url)}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
                      <ImageOff size={48} className="text-slate-300" />
                      <span className="text-xs font-medium">Người bán chưa đính kèm ảnh</span>
                    </div>
                  )}

                  {/* Status Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-slate-900/80 backdrop-blur-xs text-white shadow-xs">
                      {product.category?.name}
                    </span>
                    {product.listingType === 'RENT' && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-white shadow-xs">
                        Cho thuê
                      </span>
                    )}
                    {product.listingType === 'BOTH' && (
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-white shadow-xs">
                        Bán & Cho thuê
                      </span>
                    )}
                  </div>

                  {product.status === 'SOLD' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                        SẢN PHẨM ĐÃ BÁN
                      </span>
                    </div>
                  )}

                  {product.status === 'RENTED' && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-slate-900 text-white shadow-md">
                        SẢN PHẨM ĐANG ĐƯỢC THUÊ
                      </span>
                    </div>
                  )}

                  {product.status === 'HIDDEN' && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-slate-700 text-white shadow-md">
                        TIN ĐÃ ẨN
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails Gallery Selector */}
                {hasMultipleMedia && (
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                    {/* Images thumbnails */}
                    {allImages.map((imgUrl, idx) => {
                      const isActive = currentMedia?.type === 'IMAGE' && currentMedia.url === imgUrl;
                      return (
                        <button
                          key={`img-${idx}`}
                          type="button"
                          onClick={() => setSelectedMedia({ type: 'IMAGE', url: imgUrl })}
                          className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                            isActive
                              ? 'border-slate-900 ring-2 ring-slate-900/10 scale-102'
                              : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={getMediaUrl(imgUrl)}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5">
                              Bìa
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Video thumbnail if available */}
                    {product.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setSelectedMedia({ type: 'VIDEO', url: product.videoUrl! })}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 bg-slate-900 flex flex-col items-center justify-center text-white transition ${
                          currentMedia?.type === 'VIDEO'
                            ? 'border-slate-900 ring-2 ring-slate-900/10 scale-102'
                            : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <Play size={20} className="text-white fill-white" />
                        <span className="text-[9px] font-bold text-slate-300 mt-1">Video</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Information, Pricing, Seller & CTAs (lg:col-span-6) */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Title & Metadata */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold uppercase tracking-wider">
                    <Tag size={13} />
                    <span>{product.category?.name}</span>
                    <span>•</span>
                    <span className="text-slate-400">Mã tin: #{product.id}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                    {product.title}
                  </h1>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> Đăng ngày {formatDate(product.createdAt)}
                    </span>
                    <span>•</span>
                    {product.locker ? (
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                        <MapPin size={12} /> {product.locker.name} ({product.locker.location})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                        <Lock size={12} /> Hỗ trợ Smart Locker
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100/70 space-y-3">
                  {/* Purchase Price if applicable */}
                  {isForSale && (
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block">
                          {product.listingType === 'BOTH' ? 'Giá mua đứt:' : 'Giá chuyển nhượng:'}
                        </span>
                        <span className="text-3xl font-extrabold text-emerald-700 tracking-tight">
                          {formatPrice(product.price || 0)}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-white text-emerald-800 rounded-md border border-emerald-200/80">
                        Thanh lý sinh viên
                      </span>
                    </div>
                  )}

                  {/* Rental Price if applicable */}
                  {isForRent && (
                    <div className={`flex items-baseline justify-between ${isForSale ? 'pt-3 border-t border-slate-200' : ''}`}>
                      <div>
                        <span className="text-xs text-slate-500 block">Đơn giá cho thuê:</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-blue-700 tracking-tight">
                            {formatPrice(product.rentPricePerDay || 0)}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/ ngày</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Tiền cọc bảo đảm: {formatPrice(product.depositAmount || 0)} (hoàn lại 100% khi trả)
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg">
                        Dịch vụ cho thuê
                      </span>
                    </div>
                  )}
                </div>

                {/* Seller Profile Card (Oreka Seller Card Pattern) */}
                <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-xs space-y-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Thông tin người bán
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {product.owner?.fullName?.charAt(0) || product.owner?.username?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-sm">
                            {product.owner?.fullName || product.owner?.username}
                          </span>
                          {product.owner?.identityVerified && (
                            <span
                              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800"
                              title="Tài khoản đã xác minh CCCD"
                            >
                              <ShieldCheck size={12} className="text-emerald-700" />
                              Đã xác thực CCCD
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          @{product.owner?.username || 'member'} • Sinh viên trong trường
                        </span>
                        {sellerRating && sellerRating.totalReviews > 0 ? (
                          <div className="flex items-center gap-1.5 mt-1 text-xs">
                            <span className="flex items-center text-amber-500 font-bold">
                              <Star size={13} className="fill-amber-400 mr-0.5" />
                              {Number(sellerRating.averageRating ?? 0).toFixed(1)} / 5.0
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">{sellerRating.totalReviews} đánh giá</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 mt-1">Người bán mới • Chưa có đánh giá</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Mô tả chi tiết từ người bán
                  </h3>
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-lg border border-slate-200/80 min-h-25">
                    {product.description || 'Người bán chưa cung cấp thêm mô tả chi tiết cho sản phẩm này.'}
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare size={16} className="text-emerald-600" />
                      Đánh giá từ người mua ({productReviews.length})
                    </h3>
                  </div>

                  {productReviews.length === 0 ? (
                    <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200 text-center text-xs text-slate-400">
                      Chưa có đánh giá nào cho sản phẩm này.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {productReviews.map((rev) => (
                        <div key={rev.id} className="p-3.5 bg-white rounded-lg border border-slate-200/90 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center">
                                {rev.reviewerName?.charAt(0) || 'U'}
                              </div>
                              <span className="text-xs font-bold text-slate-900">{rev.reviewerName}</span>
                            </div>
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={12}
                                  className={s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                                />
                              ))}
                            </div>
                          </div>
                          {rev.comment && <p className="text-xs text-slate-600 pl-8">{rev.comment}</p>}
                          <div className="text-[10px] text-slate-400 pl-8">
                            {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CTAs / Action Block */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                {isOwner ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800">
                        Bạn là người đăng sản phẩm này
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        Chủ sở hữu
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/marketplace/edit/${product.id}`}
                        className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
                      >
                        <Edit3 size={14} /> Chỉnh sửa tin
                      </Link>
                      <Link
                        to="/marketplace/my-listings"
                        className="py-2.5 px-4 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition"
                      >
                        Quản lý tin đăng
                      </Link>
                    </div>
                  </div>
                ) : product.status === 'ACTIVE' ? (
                  <div className="space-y-3">
                    {/* Segmented Control when listingType === 'BOTH' */}
                    {product.listingType === 'BOTH' && (
                      <div className="p-1 bg-slate-100 rounded-xl grid grid-cols-2 gap-1 border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => setActionMode('PURCHASE')}
                          className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[44px] ${
                            actionMode === 'PURCHASE'
                              ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/50'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <ShoppingBag size={15} />
                          <span>Mua đứt ({formatPrice(product.price)})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActionMode('RENTAL')}
                          className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[44px] ${
                            actionMode === 'RENTAL'
                              ? 'bg-white text-blue-800 shadow-xs border border-slate-200/50'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Calendar size={15} />
                          <span>Thuê ({formatPrice(product.rentPricePerDay || 0)}/ngày)</span>
                        </button>
                      </div>
                    )}

                    {/* Single Primary CTA Button */}
                    {effectiveMode === 'PURCHASE' ? (
                      <button
                        type="button"
                        onClick={handlePurchaseClick}
                        disabled={createOrderMutation.isPending}
                        className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] disabled:opacity-50"
                      >
                        {createOrderMutation.isPending ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Đang khởi tạo đơn hàng qua Locker...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={18} />
                            <span>Đặt mua qua Tủ Locker Thông Minh</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleOpenRentalModal}
                        disabled={createOrderMutation.isPending}
                        className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px] disabled:opacity-50"
                      >
                        <Calendar size={18} />
                        <span>Chọn thời hạn & Thuê qua Locker</span>
                      </button>
                    )}

                    <p className="text-xs text-slate-500 text-center">
                      Miễn phí giao dịch • Bảo vệ Escrow 100% • Hàng hóa được bảo quản an toàn tại Smart Locker
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-100 text-slate-600 text-center text-xs space-y-2">
                    <p className="font-semibold">
                      {product.status === 'SOLD'
                        ? 'Sản phẩm này đã được bán thành công cho thành viên khác.'
                        : product.status === 'RENTED'
                        ? 'Sản phẩm hiện đang được người khác thuê và sẽ có sẵn trở lại sau khi hoàn trả vào tủ.'
                        : 'Sản phẩm hiện đang tạm ẩn bởi người bán.'}
                    </p>
                    <Link
                      to="/marketplace"
                      className="inline-block text-slate-900 font-medium hover:underline"
                    >
                      Tìm sản phẩm tương tự trên Chợ &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standardized Rental Modal (UP-04 & UP-05) */}
      <Modal
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
        title="Chọn thời hạn thuê qua Smart Locker"
        description="Tính từ thời điểm bạn nhập mã PIN mở tủ lấy hàng"
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Duration Presets */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Gói số ngày thuê:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 7, 14].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    setSelectedRentalDays(days);
                    setCustomDays('');
                  }}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition min-h-[44px] ${
                    !customDays && selectedRentalDays === days
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                      : 'border-slate-200 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {days} ngày
                </button>
              ))}
            </div>

            {/* Custom Days Input */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500 shrink-0">Hoặc tùy chọn:</span>
              <input
                type="number"
                min="1"
                max="90"
                placeholder="Ví dụ: 5"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="w-24 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-500">ngày</span>
            </div>
          </div>

          {/* Preferred Locker Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 block">
                Trạm tủ nhận hàng ưu tiên
              </label>
              <span className="text-[11px] text-slate-500">
                {activeLockers?.length || 0} trạm khả dụng
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <div
                onClick={() => setPreferredLockerId(null)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                  preferredLockerId === null
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">Tự động phân bổ ngăn trống</div>
                  <div className="text-[10px] text-slate-500">Hệ thống chọn ngăn trống phù hợp nhất</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                  Khuyến nghị
                </span>
              </div>

              {activeLockers?.map((l) => {
                const available = l.availableCompartments ?? 0;
                const total = l.totalCompartments ?? 0;
                const isFull = available === 0;
                const isSelected = preferredLockerId === l.id;

                return (
                  <div
                    key={l.id}
                    onClick={() => {
                      if (!isFull) setPreferredLockerId(l.id);
                    }}
                    className={`p-2.5 rounded-xl border text-xs transition flex items-center justify-between gap-2 ${
                      isFull
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                        : isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 cursor-pointer'
                        : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 truncate">{l.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">({l.code})</span>
                        {product.locker?.id === l.id && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                            Gợi ý
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                        <MapPin size={10} className="text-blue-600 shrink-0" />
                        <span className="truncate">{l.location}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {isFull ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Hết ngăn
                        </span>
                      ) : (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          available <= 2
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {available}/{total} trống
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Đơn giá theo ngày:</span>
              <span className="font-semibold text-slate-900">
                {formatPrice(product.rentPricePerDay || 0)}/ngày
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Thời gian thuê:</span>
              <span className="font-semibold text-slate-900">{effectiveRentalDays} ngày</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tiền thuê dự tính:</span>
              <span className="font-bold text-blue-700">
                {formatPrice((product.rentPricePerDay || 0) * effectiveRentalDays)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tiền cọc bảo đảm:</span>
              <span className="font-bold text-emerald-700">
                {formatPrice(product.depositAmount || 0)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Tổng tạm giữ Escrow:</span>
              <span className="text-base font-black text-emerald-700">
                {formatPrice(
                  (product.rentPricePerDay || 0) * effectiveRentalDays + (product.depositAmount || 0)
                )}
              </span>
            </div>
          </div>

          {/* Escrow Guarantee */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-2.5 flex items-start gap-2">
            <ShieldCheck size={16} className="text-blue-700 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 leading-relaxed">
              Tiền cọc bảo đảm sẽ được hoàn lại 100% sau khi bạn gửi trả sản phẩm vào tủ Smart Locker thành công.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsRentalModalOpen(false)}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition min-h-[44px]"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={createOrderMutation.isPending}
              onClick={handleConfirmRental}
              className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/20 min-h-[44px]"
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang tạo đơn...</span>
                </>
              ) : (
                <span>Xác nhận thuê qua Locker</span>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Purchase Checkout Modal (UP-05) */}
      <Modal
        isOpen={isConfirmPurchaseOpen}
        onClose={() => setIsConfirmPurchaseOpen(false)}
        title="Xác nhận đặt mua qua Smart Locker"
        description="Giao dịch bảo đảm an toàn qua tài khoản ký quỹ Escrow CampusHub"
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Product Summary Item */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
              {product.imageUrl ? (
                <img
                  src={getMediaUrl(product.imageUrl)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageOff size={18} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-slate-900 text-sm truncate">{product.title}</h4>
              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                <span>Người bán: {product.owner?.fullName || product.owner?.username}</span>
                {product.owner?.identityVerified && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <ShieldCheck size={10} className="text-emerald-700" /> Đã xác thực
                  </span>
                )}
              </div>
              <span className="text-xs font-extrabold text-emerald-700 mt-0.5 block">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Preferred Locker Station Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 block">
                Chọn trạm tủ nhận hàng ưu tiên
              </label>
              <span className="text-[11px] text-slate-500">
                {activeLockers?.length || 0} trạm khả dụng
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {/* Default Auto Option */}
              <div
                onClick={() => setPreferredLockerId(null)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                  preferredLockerId === null
                    ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">Tự động phân bổ ngăn trống</div>
                  <div className="text-[10px] text-slate-500">
                    Hệ thống ưu tiên chỉ định ngăn tủ thuận tiện nhất
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  Khuyến nghị
                </span>
              </div>

              {/* Locker station cards */}
              {activeLockers?.map((l) => {
                const available = l.availableCompartments ?? 0;
                const total = l.totalCompartments ?? 0;
                const isFull = available === 0;
                const isSelected = preferredLockerId === l.id;

                return (
                  <div
                    key={l.id}
                    onClick={() => {
                      if (!isFull) setPreferredLockerId(l.id);
                    }}
                    className={`p-2.5 rounded-xl border text-xs transition flex items-center justify-between gap-2 ${
                      isFull
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                        : isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600 cursor-pointer'
                        : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 truncate">{l.name}</span>
                        <span className="font-mono text-[10px] text-slate-500">({l.code})</span>
                        {product.locker?.id === l.id && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                            Gợi ý
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                        <MapPin size={10} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{l.location}</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {isFull ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Hết ngăn
                        </span>
                      ) : (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            available <= 2
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {available}/{total} trống
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Escrow Financial Transparency Breakdown */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Giá sản phẩm niêm yết:</span>
              <span className="font-semibold text-slate-900">{formatPrice(product.price)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí ký quỹ bảo vệ giao dịch:</span>
              <span className="font-semibold text-emerald-700">0 ₫ (Miễn phí sinh viên)</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Phí lưu trữ & giao nhận tủ:</span>
              <span className="font-semibold text-emerald-700">0 ₫ (Miễn phí)</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Tổng thanh toán ký quỹ:</span>
              <span className="text-base font-black text-emerald-700">
                {formatPrice(product.price)}
              </span>
            </div>
          </div>

          {/* Escrow 100% Protection Reassurance Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-900 leading-relaxed">
              <strong className="font-bold block text-emerald-950 mb-0.5">
                Cam kết hoàn tiền 100% qua ký quỹ Escrow
              </strong>
              Khoản thanh toán được tạm giữ an toàn trong tài khoản trung gian của CampusHub. Người bán chỉ nhận được tiền sau khi bạn nhập mã PIN mở tủ lấy hàng thành công hoặc hết thời hạn khiếu nại.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsConfirmPurchaseOpen(false)}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition min-h-[44px]"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={createOrderMutation.isPending}
              onClick={handleConfirmPurchase}
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 min-h-[44px]"
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang tạo đơn...</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={15} />
                  <span>Xác nhận tạo đơn mua</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Identity Verification Prompt Dialog */}
      <ConfirmDialog
        isOpen={isVerifyPromptOpen}
        onClose={() => setIsVerifyPromptOpen(false)}
        onConfirm={() => {
          setIsVerifyPromptOpen(false);
          navigate('/verify-identity');
        }}
        title="Yêu cầu xác minh danh tính"
        message="Để bảo đảm tính minh bạch và an toàn khi giao nhận hàng hóa qua mạng lưới Smart Locker, bạn cần hoàn tất xác minh căn cước công dân (CCCD). Bạn có muốn tới trang xác minh ngay?"
        confirmText="Xác minh CCCD ngay"
        cancelText="Để sau"
        variant="warning"
      />

      {/* Error Action Modal/Dialog if any */}
      {actionError && (
        <ConfirmDialog
          isOpen={!!actionError}
          onClose={() => setActionError(null)}
          onConfirm={() => setActionError(null)}
          title="Thông báo hệ thống"
          message={actionError}
          confirmText="Đã hiểu"
          cancelText="Đóng"
          variant="danger"
        />
      )}

      {/* Sticky Bottom Action Bar for Mobile (lg:hidden) */}
      {product?.status === 'ACTIVE' && !isOwner && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-30 flex items-center justify-between gap-3 shadow-lg">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-500 block leading-tight font-medium">
              {effectiveMode === 'PURCHASE' ? 'Giá mua đứt' : 'Giá thuê theo ngày'}
            </span>
            <span
              className={`text-base font-extrabold truncate block ${
                effectiveMode === 'PURCHASE' ? 'text-emerald-700' : 'text-blue-700'
              }`}
            >
              {effectiveMode === 'PURCHASE'
                ? formatPrice(product.price)
                : `${formatPrice(product.rentPricePerDay || 0)}/ngày`}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {product.listingType === 'BOTH' && (
              <button
                type="button"
                onClick={() => setActionMode((prev) => (prev === 'PURCHASE' ? 'RENTAL' : 'PURCHASE'))}
                className="px-2.5 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 min-h-[44px] transition"
              >
                {actionMode === 'PURCHASE' ? 'Đổi: Thuê' : 'Đổi: Mua'}
              </button>
            )}

            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={createOrderMutation.isPending}
              className={`px-4 py-2.5 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 min-h-[44px] ${
                effectiveMode === 'PURCHASE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {effectiveMode === 'PURCHASE' ? (
                <>
                  <ShoppingBag size={15} />
                  <span>Đặt mua ngay</span>
                </>
              ) : (
                <>
                  <Calendar size={15} />
                  <span>Thuê ngay</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
