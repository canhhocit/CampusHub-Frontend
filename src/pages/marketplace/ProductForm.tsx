import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Category, Product } from '../../types/marketplace';
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
} from 'lucide-react';
import { ImageUpload } from '../../components/ImageUpload';
import { useAuth } from '../../contexts/AuthContext';

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
  price: z
    .number()
    .min(0, 'Giá bán phải là số không âm'),
  categoryId: z
    .number()
    .min(1, 'Vui lòng chọn danh mục sản phẩm'),
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
      price: 0,
      categoryId: 0,
      imageUrl: '',
    },
  });

  const titleValue = watch('title') || '';
  const descValue = watch('description') || '';
  const currentImageUrl = watch('imageUrl');
  const currentPrice = watch('price') || 0;

  useEffect(() => {
    if (isEditing && existingProduct) {
      reset({
        title: existingProduct.title,
        description: existingProduct.description || '',
        price: existingProduct.price,
        categoryId: existingProduct.category.id,
        imageUrl: existingProduct.imageUrl || '',
      });
    }
  }, [isEditing, existingProduct, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = {
        ...data,
        imageUrl: data.imageUrl || null,
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
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500">Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  if (isEditing && (productLoadFailed || !existingProduct || existingProduct.owner.username !== user?.username || existingProduct.status === 'SOLD')) {
    return <div role="alert" className="p-8 text-center">Không thể chỉnh sửa tin đăng này. <Link to="/marketplace/my-listings">Quay lại tin đăng</Link></div>;
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
            className="px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition shadow-xs"
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <Link
          to="/marketplace/my-listings"
          className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-bold"
        >
          <ArrowLeft size={14} /> Quay lại danh sách tin đăng
        </Link>

        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl shrink-0">
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
            <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 flex flex-col gap-2 text-xs">
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
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold self-start hover:bg-rose-700 transition"
                >
                  Tải lại dữ liệu mới nhất
                </button>
              )}
            </div>
          )}

          {/* Section 1: Thông tin cơ bản */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={14} className="text-purple-600" />
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
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
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
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white"
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
          </div>

          {/* Section 2: Giá bán & Phương thức giao dịch */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign size={14} className="text-purple-600" />
              2. Giá bán & Phương thức giao nhận
            </h2>

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
                  className="w-full pl-9 pr-16 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₫</span>
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                  VNĐ
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Định dạng hiển thị: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentPrice)}</strong>
              </p>
              {errors.price && (
                <p className="text-rose-600 text-[11px] mt-1 font-medium">{errors.price.message}</p>
              )}
            </div>

            {/* Smart Locker Delivery Notice */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
              <Lock size={16} className="text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block">Bàn giao qua Mạng Lưới Smart Locker</strong>
                <span>
                  Sau khi có người mua, bạn chỉ cần mang đồ đến một trạm tủ thông minh được cấp trong khuôn viên trường và đóng ngăn tủ.
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Hình ảnh & Mô tả chi tiết */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={14} className="text-purple-600" />
              3. Hình ảnh & Mô tả chi tiết
            </h2>

            {/* Image Upload Component */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Hình ảnh sản phẩm
              </label>
              <ImageUpload
                value={currentImageUrl || ''}
                onChange={(url) => setValue('imageUrl', url)}
              />
              {currentImageUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 truncate max-w-sm">
                    {currentImageUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => setValue('imageUrl', '')}
                    className="text-rose-600 text-xs font-bold hover:underline flex items-center gap-0.5"
                  >
                    <X size={12} /> Xóa ảnh
                  </button>
                </div>
              )}
            </div>

            {/* Description Textarea */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Mô tả sản phẩm
                </label>
                <span className="text-[11px] text-slate-400">{descValue.length}/2000</span>
              </div>
              <textarea
                rows={5}
                {...register('description')}
                placeholder="Gợi ý: Mô tả tình trạng món đồ (mới bao nhiêu %, có trầy xước không, còn phụ kiện gì không, lý do thanh lý)..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
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
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending || isSubmitting}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition disabled:opacity-50 flex items-center gap-2"
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
