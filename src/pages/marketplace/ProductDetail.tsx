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
  X,
  Play,
  Film,
} from 'lucide-react';
import { getMediaUrl } from '../../api/cloudinary';

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

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => axiosInstance.get(`/api/v1/products/${id}`).then((res) => res.data),
    retry: false,
  });

  const isOwner = Boolean(
    user?.username && product?.owner?.username && user.username === product.owner.username
  );

  const createOrderMutation = useMutation({
    mutationFn: (variables?: { orderType?: 'PURCHASE' | 'RENTAL'; rentalDurationDays?: number }) =>
      axiosInstance
        .post('/api/v1/orders', {
          productId: Number(id),
          orderType: variables?.orderType || 'PURCHASE',
          rentalDurationDays: variables?.rentalDurationDays,
        })
        .then((res) => res.data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
      queryClient.invalidateQueries({ queryKey: ['selling-orders'] });
      navigate(`/orders/${data.id}`);
    },
    onError: (err: any) => {
      if (err.response?.status === 403) {
        if (
          window.confirm(
            'Yêu cầu xác minh danh tính: Bạn cần hoàn tất xác minh CCCD để thực hiện giao dịch qua hệ thống Smart Locker. Đi tới trang xác minh ngay?'
          )
        ) {
          navigate('/verify-identity');
          return;
        }
      }
      alert(err.response?.data?.message || 'Không thể tạo đơn hàng');
    },
  });

  const checkIdentityAndAuth = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return false;
    }
    if (user && user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN' && !user.identityVerified) {
      if (
        window.confirm(
          'Yêu cầu xác minh danh tính: Bạn cần hoàn tất xác minh CCCD trước khi đặt mua hoặc thuê đồ qua hệ thống Smart Locker. Đi tới trang xác minh ngay?'
        )
      ) {
        navigate('/verify-identity');
      }
      return false;
    }
    return true;
  };

  const handlePurchaseClick = () => {
    if (createOrderMutation.isPending) return;
    if (!checkIdentityAndAuth()) return;

    if (
      window.confirm(
        `Xác nhận đặt mua sản phẩm "${product?.title}"? Hệ thống sẽ tạo phiên giao dịch mua qua Tủ Locker.`
      )
    ) {
      createOrderMutation.mutate({ orderType: 'PURCHASE' });
    }
  };

  const handleOpenRentalModal = () => {
    if (createOrderMutation.isPending) return;
    if (!checkIdentityAndAuth()) return;
    setIsRentalModalOpen(true);
  };

  const effectiveRentalDays = customDays && Number(customDays) > 0 ? Number(customDays) : selectedRentalDays;

  const handleConfirmRental = () => {
    if (effectiveRentalDays < 1 || effectiveRentalDays > 90) {
      alert('Thời hạn thuê phải từ 1 đến 90 ngày.');
      return;
    }
    createOrderMutation.mutate({
      orderType: 'RENTAL',
      rentalDurationDays: effectiveRentalDays,
    });
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-slate-500 mb-6">
          Sản phẩm có thể đã bị gỡ bỏ hoặc không tồn tại trên hệ thống.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
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
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <Link to="/" className="hover:text-purple-600">
            Trang chủ
          </Link>
          <span>/</span>
          <Link to="/marketplace" className="hover:text-purple-600">
            Chợ 
          </Link>
          <span>/</span>
          <Link
            to={`/marketplace?categoryId=${product.category?.id}`}
            className="hover:text-purple-600"
          >
            {product.category?.name || 'Khác'}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">
            {product.title}
          </span>
        </nav>

        {/* Main Product Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Left Column: Product Imagery (lg:col-span-6) */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-slate-50/50 space-y-4">
              <div className="space-y-4">
                {/* Main Media Viewer */}
                <div className="aspect-square bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative flex items-center justify-center shadow-xs">
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

              {/* Video Player Section beneath Left Column if video exists */}
              {product.videoUrl && (
                <div className="pt-4 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Film size={14} className="text-slate-700" />
                      Video giới thiệu sản phẩm
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedMedia({ type: 'VIDEO', url: product.videoUrl! })}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1"
                    >
                      <Play size={11} className="fill-slate-700" /> Xem trên khung lớn
                    </button>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-48">
                    <video
                      src={getMediaUrl(product.videoUrl)}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
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
                    <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                      <Lock size={12} /> Hỗ trợ Smart Locker
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  {/* Purchase Price if applicable */}
                  {isForSale && (
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block">
                          {product.listingType === 'BOTH' ? 'Giá mua đứt:' : 'Giá chuyển nhượng:'}
                        </span>
                        <span className="text-3xl font-bold text-slate-900 tracking-tight">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
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
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
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
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Mô tả chi tiết từ người bán
                  </h3>
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-2xl border border-slate-200/80 min-h-[100px]">
                    {product.description || 'Người bán chưa cung cấp thêm mô tả chi tiết cho sản phẩm này.'}
                  </div>
                </div>
              </div>

              {/* CTAs / Action Block */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                {isOwner ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
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
                        className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold text-center transition flex items-center justify-center gap-1.5"
                      >
                        <Edit3 size={14} /> Chỉnh sửa tin
                      </Link>
                      <Link
                        to="/marketplace/my-listings"
                        className="py-2.5 px-4 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50 transition"
                      >
                        Quản lý tin đăng
                      </Link>
                    </div>
                  </div>
                ) : product.status === 'ACTIVE' ? (
                  <div className="space-y-2">
                    {/* If both selling & renting supported */}
                    {product.listingType === 'BOTH' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={handlePurchaseClick}
                          disabled={createOrderMutation.isPending}
                          className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                          <ShoppingBag size={16} /> Mua đứt ({formatPrice(product.price)})
                        </button>
                        <button
                          onClick={handleOpenRentalModal}
                          disabled={createOrderMutation.isPending}
                          className="py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                        >
                          <Calendar size={16} /> Thuê đồ ({formatPrice(product.rentPricePerDay || 0)}/ngày)
                        </button>
                      </div>
                    ) : product.listingType === 'RENT' ? (
                      <button
                        onClick={handleOpenRentalModal}
                        disabled={createOrderMutation.isPending}
                        className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
                      >
                        <Calendar size={18} /> Thuê sản phẩm qua Tủ Locker ({formatPrice(product.rentPricePerDay || 0)}/ngày)
                      </button>
                    ) : (
                      <button
                        onClick={handlePurchaseClick}
                        disabled={createOrderMutation.isPending}
                        className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
                      >
                        {createOrderMutation.isPending ? (
                          <span>Đang khởi tạo đơn hàng qua Locker...</span>
                        ) : (
                          <>
                            <ShoppingBag size={18} /> Đặt mua qua Tủ Locker Thông Minh
                          </>
                        )}
                      </button>
                    )}
                    <p className="text-xs text-slate-500 text-center">
                      Miễn phí giao dịch • Hàng hóa được bảo quản an toàn tại ngăn tủ thông minh
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-center text-xs space-y-2">
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

      {/* Rental Duration Picker Modal */}
      {isRentalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Chọn thời gian thuê</h3>
                  <p className="text-xs text-slate-500">Tính từ khi bạn nhập PIN lấy đồ tại tủ</p>
                </div>
              </div>
              <button
                onClick={() => setIsRentalModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Duration Presets */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Chọn gói số ngày thuê:
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
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition ${
                      !customDays && selectedRentalDays === days
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    {days} ngày
                  </button>
                ))}
              </div>

              {/* Custom days input */}
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 shrink-0">Hoặc tùy chọn:</span>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    placeholder="Ví dụ: 5"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-24 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-500">ngày</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Đơn giá theo ngày:</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(product.rentPricePerDay || 0)}/ngày
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Số ngày thuê:</span>
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
                <span className="font-bold text-slate-900">Tổng tạm giữ:</span>
                <span className="text-base font-black text-purple-700">
                  {formatPrice(
                    (product.rentPricePerDay || 0) * effectiveRentalDays + (product.depositAmount || 0)
                  )}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                * Tiền cọc sẽ được hoàn lại 100% khi người cho thuê nhận lại đồ tại trạm tủ Smart Locker.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsRentalModalOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={createOrderMutation.isPending}
                onClick={handleConfirmRental}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                {createOrderMutation.isPending ? 'Đang tạo đơn...' : 'Xác nhận thuê qua Locker'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
