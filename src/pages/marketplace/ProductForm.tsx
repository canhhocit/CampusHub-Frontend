import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Category, Product, ProductMediaSettings } from '../../types/marketplace';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  PlusCircle,
  AlertCircle,
  ShieldAlert,
  Lock,
  Tag,
  DollarSign,
  ImageIcon,
  X,
  Video,
  Film,
  UploadCloud,
  Trash2,
  Loader2,
} from 'lucide-react';
import { ImageUpload } from '../../components/ImageUpload';
import { useAuth } from '../../contexts/AuthContext';
import { uploadImageToCloudinary, uploadVideoToCloudinary, getMediaUrl } from '../../api/cloudinary';

const productSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề sản phẩm không được để trống')
    .max(150, 'Tiêu đề tối đa 150 ký tự'),
  description: z
    .string()
    .max(2000, 'Mô tả quá dài (tối đa 2000 ký tự)')
    .optional(),
  listingType: z.enum(['SALE', 'RENT', 'BOTH']),
  price: z
    .number()
    .min(0, 'Giá bán phải là số không âm'),
  rentPricePerDay: z.number().min(0, 'Giá thuê phải >= 0').optional().nullable(),
  depositAmount: z.number().min(0, 'Tiền cọc phải >= 0').optional().nullable(),
  categoryId: z
    .number()
    .min(1, 'Vui lòng chọn danh mục sản phẩm'),
  lockerId: z.number().optional().nullable(),
  imageUrl: z
    .string()
    .url('Đường dẫn ảnh phải là URL hợp lệ')
    .or(z.literal(''))
    .optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => axiosInstance.get('/api/v1/categories').then((res) => res.data),
  });

  const { data: lockersPage } = useQuery<{ content: Array<{ id: number; name: string; location: string }> }>({
    queryKey: ['lockers-form'],
    queryFn: () => axiosInstance.get('/api/v1/lockers?size=50').then((res) => res.data),
  });
  const lockers = lockersPage?.content || [];

  const {
    data: existingProduct,
    isLoading: isLoadingProduct,
    refetch: refetchProduct,
    isError: productLoadFailed,
  } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => axiosInstance.get(`/api/v1/products/${id}`).then((res) => res.data),
    enabled: isEditing,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      listingType: 'SALE',
      price: 0,
      rentPricePerDay: 0,
      depositAmount: 0,
      categoryId: 0,
      lockerId: 0,
      imageUrl: '',
    },
  });

  const titleValue = watch('title') || '';
  const descValue = watch('description') || '';
  const currentImageUrl = watch('imageUrl');
  const currentPrice = watch('price') || 0;
  const currentListingType = watch('listingType') || 'SALE';
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isUploadingDetailImage, setIsUploadingDetailImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const detailImageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { data: mediaSettings } = useQuery<ProductMediaSettings>({
    queryKey: ['marketplace-media-settings'],
    queryFn: () => axiosInstance.get('/api/v1/marketplace/media-settings').then((res) => res.data),
  });

  const maxImages = mediaSettings?.maxProductImages ?? 6;
  const allowVideo = mediaSettings?.allowProductVideo ?? true;
  const maxVideos = mediaSettings?.maxProductVideos ?? 1;
  const maxVideoSizeMb = mediaSettings?.maxVideoSizeMb ?? 50;

  const currentRentPrice = watch('rentPricePerDay') || 0;
  const currentDeposit = watch('depositAmount') || 0;

  useEffect(() => {
    if (isEditing && existingProduct) {
      reset({
        title: existingProduct.title,
        description: existingProduct.description || '',
        listingType: existingProduct.listingType || 'SALE',
        price: existingProduct.price,
        rentPricePerDay: existingProduct.rentPricePerDay || 0,
        depositAmount: existingProduct.depositAmount || 0,
        categoryId: existingProduct.category.id,
        lockerId: existingProduct.locker?.id || 0,
        imageUrl: existingProduct.imageUrl || '',
      });
      setDetailImages(existingProduct.detailImageUrls || []);
      setVideoUrl(existingProduct.videoUrl || '');
    }
  }, [isEditing, existingProduct, reset]);

  const handleDetailImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setMediaError(null);

    const remainingSlots = maxImages - detailImages.length;
    if (remainingSlots <= 0) {
      setMediaError(`Bạn đã tải đủ số lượng ảnh mô tả tối đa (${maxImages} ảnh).`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploadingDetailImage(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToUpload) {
        const url = await uploadImageToCloudinary(file);
        uploadedUrls.push(url);
      }
      setDetailImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setMediaError(err.message || 'Lỗi khi tải ảnh mô tả lên.');
    } finally {
      setIsUploadingDetailImage(false);
      if (detailImageInputRef.current) {
        detailImageInputRef.current.value = '';
      }
    }
  };

  const handleRemoveDetailImage = (indexToRemove: number) => {
    setDetailImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaError(null);

    if (!allowVideo || maxVideos <= 0) {
      setMediaError('Tính năng upload video hiện đang tạm khóa bởi Quản trị viên.');
      return;
    }

    const maxSizeBytes = maxVideoSizeMb * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setMediaError(`Dung lượng video (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn ${maxVideoSizeMb}MB do Quản trị viên quy định.`);
      return;
    }

    setIsUploadingVideo(true);

    try {
      const url = await uploadVideoToCloudinary(file);
      setVideoUrl(url);
    } catch (err: any) {
      setMediaError(err.message || 'Không thể tải video lên.');
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveVideo = () => {
    setVideoUrl('');
  };

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = {
        ...data,
        listingType: data.listingType,
        rentPricePerDay: (data.listingType === 'RENT' || data.listingType === 'BOTH') ? data.rentPricePerDay : null,
        depositAmount: (data.listingType === 'RENT' || data.listingType === 'BOTH') ? data.depositAmount : null,
        lockerId: data.lockerId && data.lockerId > 0 ? data.lockerId : null,
        imageUrl: data.imageUrl || null,
        detailImageUrls: detailImages,
        videoUrl: videoUrl || null,
        version: existingProduct?.version,
      };
      if (isEditing) {
        return axiosInstance.put(`/api/v1/products/${id}`, payload);
      } else {
        return axiosInstance.post('/api/v1/products', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      navigate('/marketplace/my-listings');
    },
  });

  const { user } = useAuth();
  const isUnverified = Boolean(
    user && user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN' && !user.identityVerified
  );

  if (isEditing && isLoadingProduct) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500">Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  if (isEditing && (productLoadFailed || !existingProduct || existingProduct.owner.username !== user?.username || existingProduct.status === 'SOLD')) {
    return <div role="alert" className="p-8 text-center text-slate-600">Không thể chỉnh sửa tin đăng này. <Link to="/marketplace/my-listings" className="text-emerald-700 font-semibold underline">Quay lại tin đăng</Link></div>;
  }

  if (isUnverified) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-amber-50 text-amber-600 border border-amber-200 rounded-3xl w-20 h-20 mx-auto flex items-center justify-center mb-5">
          <ShieldAlert size={38} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Yêu cầu xác minh danh tính (CCCD)</h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Nhằm bảo vệ an toàn cho các giao dịch qua mạng lưới Smart Locker, mọi thành viên cần hoàn tất xác thực Căn cước công dân trước khi đăng bán sản phẩm.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/verify-identity"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-xs"
          >
            Xác minh CCCD ngay &rarr;
          </Link>
          <Link
            to="/marketplace"
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
          >
            Quay lại Chợ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 font-sans">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <Link
          to="/marketplace/my-listings"
          className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold"
        >
          <ArrowLeft size={14} /> Quay lại danh sách tin đăng
        </Link>

        {/* Header */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg shrink-0">
            {isEditing ? <Save size={24} /> : <PlusCircle size={24} />}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isEditing ? 'Chỉnh sửa tin đăng bán' : 'Đăng bán sản phẩm mới'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Cập nhật lại giá, mô tả hoặc thay ảnh món đồ của bạn'
                : 'Thanh lý giáo trình, thiết bị, đồ dùng sinh viên nhanh chóng qua Tủ Locker'}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="space-y-6"
        >
          {/* Conflict Error (409) or General Error */}
          {mutation.isError && (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle size={16} />
                <span>
                  {(mutation.error as any).response?.status === 409
                    ? 'Sản phẩm đã bị sửa đổi bởi phiên làm việc khác trong lúc bạn thao tác.'
                    : (mutation.error as any).response?.data?.message || 'Không thể lưu sản phẩm. Vui lòng thử lại.'}
                </span>
              </div>
              {(mutation.error as any).response?.status === 409 && isEditing && (
                <button
                  type="button"
                  onClick={() => refetchProduct()}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-md font-bold self-start hover:bg-rose-700 transition"
                >
                  Tải lại dữ liệu mới nhất
                </button>
              )}
            </div>
          )}

          {/* Section 1: Thông tin cơ bản */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={14} className="text-emerald-600" />
              1. Thông tin cơ bản
            </h2>

            {/* Title Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Tiêu đề tin đăng <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">{titleValue.length}/150</span>
              </div>
              <input
                type="text"
                {...register('title')}
                placeholder="Ví dụ: Giáo trình Giải tích 1 & 2 NXB Giáo Dục còn mới 95%"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              {errors.title && (
                <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Category Select */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Danh mục sản phẩm <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('categoryId', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value={0}>-- Chọn danh mục phù hợp --</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Smart Locker Select */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tủ Smart Locker gửi hàng (Trạm giao nhận)
              </label>
              <select
                {...register('lockerId', { valueAsNumber: true })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              >
                <option value={0}>-- Chọn tủ gửi đồ thuận tiện nhất --</option>
                {lockers.map((lk) => (
                  <option key={lk.id} value={lk.id}>
                    {lk.name} ({lk.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Hình thức & Giá cả */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-600" />
              2. Hình thức giao dịch & Giá
            </h2>

            {/* Listing Type Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Hình thức giao dịch <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { value: 'SALE', label: 'Bán đứt', desc: 'Chuyển nhượng vĩnh viễn' },
                  { value: 'RENT', label: 'Cho thuê', desc: 'Tính theo ngày & có cọc' },
                  { value: 'BOTH', label: 'Cả bán & thuê', desc: 'Người mua tự chọn' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setValue('listingType', item.value as any)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      currentListingType === item.value
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span className={`block text-xs font-bold ${
                      currentListingType === item.value ? 'text-emerald-800' : 'text-slate-800'
                    }`}>
                      {item.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sale Price Input */}
            {(currentListingType === 'SALE' || currentListingType === 'BOTH') && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Giá bán (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    {...register('price', { valueAsNumber: true })}
                    placeholder="0"
                    step="1000"
                    min="0"
                    className="w-full pl-9 pr-16 py-2.5 border border-slate-300 rounded-md text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-hidden"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₫</span>
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                    VNĐ
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Định dạng: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}</strong>
                </p>
                {errors.price && (
                  <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.price.message}</p>
                )}
              </div>
            )}

            {/* Rental Inputs */}
            {(currentListingType === 'RENT' || currentListingType === 'BOTH') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-emerald-50/40 border border-emerald-100/70">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Giá thuê / ngày (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('rentPricePerDay', { valueAsNumber: true })}
                      placeholder="0"
                      step="1000"
                      min="0"
                      className="w-full pl-9 pr-16 py-2.5 border border-slate-300 rounded-md text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-hidden bg-white"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₫</span>
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">/ngày</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentRentPrice)} / ngày
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tiền đặt cọc bảo đảm (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      {...register('depositAmount', { valueAsNumber: true })}
                      placeholder="0"
                      step="1000"
                      min="0"
                      className="w-full pl-9 pr-16 py-2.5 border border-slate-300 rounded-md text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-hidden bg-white"
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₫</span>
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">VNĐ</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Hoàn trả: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentDeposit)} khi trả đồ
                  </p>
                </div>
              </div>
            )}

            {/* Smart Locker Delivery Notice */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
              <Lock size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Bàn giao qua Mạng Lưới Smart Locker</strong>
                <span>
                  Sau khi có người mua, bạn chỉ cần mang đồ đến một trạm tủ thông minh được cấp trong khuôn viên trường và đóng ngăn tủ.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Hình ảnh & Video mô tả chi tiết */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon size={14} className="text-emerald-600" />
                3. Hình ảnh & Video mô tả sản phẩm
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                Tối đa {maxImages} ảnh mô tả {allowVideo ? `• 1 video (<${maxVideoSizeMb}MB)` : ''}
              </span>
            </div>

            {/* Error Banner for Media */}
            {mediaError && (
              <div className="p-3.5 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{mediaError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMediaError(null)}
                  className="p-1 hover:bg-rose-100 rounded-lg text-rose-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* 3.1: Cover Image (Ảnh biểu trưng) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Ảnh biểu trưng (Cover Image) <span className="text-slate-400 font-normal">- Hiển thị trên danh sách tìm kiếm</span>
                </label>
                {currentImageUrl && (
                  <button
                    type="button"
                    onClick={() => setValue('imageUrl', '')}
                    className="text-rose-600 text-xs font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Trash2 size={12} /> Xóa ảnh bìa
                  </button>
                )}
              </div>
              <ImageUpload
                value={currentImageUrl || ''}
                onChange={(url) => setValue('imageUrl', url)}
              />
            </div>

            {/* 3.2: Gallery Images (Ảnh mô tả chi tiết) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-700 block">
                    Ảnh mô tả chi tiết (Gallery Images)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Thêm các góc chụp khác, phụ kiện đi kèm hoặc chi tiết linh kiện
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                  {detailImages.length} / {maxImages} ảnh
                </span>
              </div>

              {/* Thumbnails grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {detailImages.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
                  >
                    <img
                      src={getMediaUrl(imgUrl)}
                      alt={`Ảnh mô tả ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      #{index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDetailImage(index)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md shadow-xs opacity-90 hover:opacity-100 hover:scale-105 transition"
                      title="Xóa ảnh này"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Upload Button Box */}
                {detailImages.length < maxImages && (
                  <div>
                    <input
                      ref={detailImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      className="hidden"
                      onChange={handleDetailImageUpload}
                    />
                    <button
                      type="button"
                      disabled={isUploadingDetailImage}
                      onClick={() => detailImageInputRef.current?.click()}
                      className="w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50/40 text-slate-400 hover:text-orange-700 flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-50"
                    >
                      {isUploadingDetailImage ? (
                        <>
                          <Loader2 size={20} className="animate-spin text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-700">Đang tải...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={20} />
                          <span className="text-[10px] font-bold">+ Thêm ảnh</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3.3: Product Video */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Video size={14} className="text-emerald-600" />
                    Video thực tế sản phẩm (Tùy chọn)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    {allowVideo
                      ? `Quay video ngắn 10-30s ngoại quan và chức năng (Tối đa ${maxVideoSizeMb}MB, định dạng MP4/WebM/MOV)`
                      : 'Tính năng upload video hiện đang tạm đóng bởi Quản trị viên.'}
                  </p>
                </div>
                {videoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="text-rose-600 text-xs font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Trash2 size={12} /> Xóa video
                  </button>
                )}
              </div>

              {allowVideo && (
                <div>
                  {videoUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-72 flex items-center justify-center">
                      <video
                        src={getMediaUrl(videoUrl)}
                        controls
                        className="max-h-72 w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                      <button
                        type="button"
                        disabled={isUploadingVideo}
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full py-6 px-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 text-slate-500 hover:text-emerald-700 flex flex-col items-center justify-center gap-2 transition disabled:opacity-50"
                      >
                        {isUploadingVideo ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 size={24} className="animate-spin text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700">Đang tải video lên hệ thống...</span>
                            <span className="text-[10px] text-slate-400">Vui lòng chờ trong giây lát</span>
                          </div>
                        ) : (
                          <>
                            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
                              <Film size={22} />
                            </div>
                            <div className="text-center">
                              <span className="text-xs font-bold block text-slate-800">
                                Bấm để tải lên video thực tế
                              </span>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Hỗ trợ MP4, WebM, MOV dung lượng dưới {maxVideoSizeMb}MB
                              </span>
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3.4: Description Textarea */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Mô tả chi tiết sản phẩm <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">{descValue.length}/2000</span>
              </div>
              <textarea
                rows={5}
                {...register('description')}
                placeholder="Gợi ý: Mô tả tình trạng món đồ (mới bao nhiêu %, có trầy xước không, còn phụ kiện gì không, lý do thanh lý)..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              {errors.description && (
                <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/marketplace/my-listings"
              className="px-5 py-2.5 border border-slate-300 rounded-md text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending || isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold shadow-2xs transition disabled:opacity-50 flex items-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  <span>Đang lưu tin đăng...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>{isEditing ? 'Lưu cập nhật' : 'Đăng tin ngay'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
