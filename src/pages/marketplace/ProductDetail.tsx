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
} from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => axiosInstance.get(`/api/v1/products/${id}`).then((res) => res.data),
    retry: false,
  });

  const isOwner = Boolean(
    user?.username && product?.owner?.username && user.username === product.owner.username
  );

  const createOrderMutation = useMutation({
    mutationFn: () => axiosInstance.post('/api/v1/orders', { productId: Number(id) }).then((res) => res.data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['buying-orders'] });
      queryClient.invalidateQueries({ queryKey: ['selling-orders'] });
      navigate(`/orders/${data.id}`);
    },
    onError: (err: any) => {
      if (err.response?.status === 403) {
        if (
          window.confirm(
            'Yêu cầu xác minh danh tính: Bạn cần hoàn tất xác minh CCCD để đặt mua hàng qua hệ thống Smart Locker. Đi tới trang xác minh ngay?'
          )
        ) {
          navigate('/verify-identity');
          return;
        }
      }
      alert(err.response?.data?.message || 'Không thể tạo đơn hàng');
    },
  });

  const handleOrderClick = () => {
    if (createOrderMutation.isPending) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN' && !user.identityVerified) {
      if (
        window.confirm(
          'Yêu cầu xác minh danh tính: Bạn cần hoàn tất xác minh CCCD trước khi đặt mua hàng qua hệ thống Smart Locker. Đi tới trang xác minh ngay?'
        )
      ) {
        navigate('/verify-identity');
      }
      return;
    }
    if (window.confirm(`Xác nhận đặt mua sản phẩm "${product?.title}"? Hệ thống sẽ tạo phiên giao dịch qua Tủ Locker.`)) {
      createOrderMutation.mutate();
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent" />
        <p className="mt-3 text-sm text-slate-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy sản phẩm</h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
          Sản phẩm này có thể đã được giao dịch thành công, đã bị người bán ẩn hoặc đã bị gỡ khỏi hệ thống.
        </p>
        <div className="mt-6">
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
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between bg-slate-50/50">
              <div className="aspect-square bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
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
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-700 text-white shadow-xs">
                    {product.category?.name}
                  </span>
                </div>

                {product.status === 'SOLD' && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                    <span className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                      SẢN PHẨM ĐÃ BÁN
                    </span>
                  </div>
                )}

                {product.status === 'HIDDEN' && (
                  <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center">
                    <span className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wider bg-amber-500 text-white shadow-md">
                      TIN ĐANG TẠM ẨN
                    </span>
                  </div>
                )}
              </div>

              {/* Trust Box (Inspired by Oreka Guarantee) */}
              <div className="mt-6 p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-purple-900">
                  <Lock size={14} className="text-purple-700" />
                  Quy trình Smart Locker CampusHub:
                </div>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Người bán đem đồ đặt vào tủ locker thông minh trong trường.</li>
                  <li>Hệ thống gửi mã PIN bảo mật 6 số trực tiếp cho người mua.</li>
                  <li>Người mua chủ động đến trạm mở tủ nhận đồ 24/7, không sợ bị trễ hẹn.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Information, Pricing, Seller & CTAs (lg:col-span-6) */}
            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Title & Metadata */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-purple-600 font-bold uppercase tracking-wider">
                    <Tag size={13} />
                    <span>{product.category?.name}</span>
                    <span>•</span>
                    <span className="text-slate-400">Mã tin: #{product.id}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    {product.title}
                  </h1>

                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> Đăng ngày {formatDate(product.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <Lock size={12} /> Hỗ trợ Smart Locker
                    </span>
                  </div>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Giá chuyển nhượng:</span>
                    <span className="text-3xl font-black text-purple-700 tracking-tight">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg">
                    Thanh lý sinh viên
                  </span>
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
                        Bạn là người đăng bán sản phẩm này
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        Chủ sở hữu
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to={`/marketplace/edit/${product.id}`}
                        className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
                      >
                        <Edit3 size={14} /> Chỉnh sửa tin
                      </Link>
                      <Link
                        to="/marketplace/my-listings"
                        className="py-2.5 px-4 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                      >
                        Quản lý tin đăng
                      </Link>
                    </div>
                  </div>
                ) : product.status === 'ACTIVE' ? (
                  <div className="space-y-2">
                    <button
                      onClick={handleOrderClick}
                      disabled={createOrderMutation.isPending}
                      className="w-full py-3.5 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 hover:scale-101"
                    >
                      {createOrderMutation.isPending ? (
                        <span>Đang khởi tạo đơn hàng qua Locker...</span>
                      ) : (
                        <>
                          <ShoppingBag size={18} /> Đặt mua qua Tủ Locker Thông Minh
                        </>
                      )}
                    </button>
                    <p className="text-xs text-slate-500 text-center">
                      Miễn phí giao dịch • Hàng hóa được bảo quản an toàn tại ngăn tủ thông minh
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-center text-xs space-y-2">
                    <p className="font-semibold">
                      {product.status === 'SOLD'
                        ? 'Sản phẩm này đã được bán thành công cho thành viên khác.'
                        : 'Sản phẩm hiện đang tạm ẩn bởi người bán.'}
                    </p>
                    <Link
                      to="/marketplace"
                      className="inline-block text-purple-600 font-bold hover:underline"
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
    </div>
  );
};
