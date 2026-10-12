import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Category, Product } from '../../types/marketplace';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, Save, PlusCircle, AlertCircle } from 'lucide-react';

const productSchema = z.object({
    title: z.string().min(1, 'Tiêu đề sản phẩm không được để trống').max(150, 'Tối đa 150 ký tự'),
    description: z.string().max(2000, 'Mô tả quá dài (tối đa 2000 ký tự)').optional(),
    price: z.number().min(0, 'Giá bán phải là số không âm'),
    categoryId: z.number().min(1, 'Vui lòng chọn danh mục sản phẩm'),
    imageUrl: z.string().url('Đường dẫn ảnh phải là URL hợp lệ').or(z.literal('')).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const ProductForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditing = Boolean(id);

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: () => axiosInstance.get('/api/v1/categories').then(res => res.data)
    });

    const { data: existingProduct, isLoading: isLoadingProduct } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: () => axiosInstance.get(`/api/v1/products/${id}`).then(res => res.data),
        enabled: isEditing
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            categoryId: 0,
            imageUrl: '',
        }
    });

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
                version: existingProduct?.version
            };
            if (isEditing) {
                return axiosInstance.put(`/api/v1/products/${id}`, payload);
            } else {
                return axiosInstance.post('/api/v1/products', payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            navigate('/marketplace/my-listings');
        }
    });

    if (isEditing && isLoadingProduct) return <div className="text-center py-20 text-gray-500">Đang tải thông tin sản phẩm...</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link to="/marketplace/my-listings" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline mb-6 font-medium">
                <ArrowLeft size={16} /> Quay lại danh sách tin đăng
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                    <PlusCircle size={24} />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {isEditing ? 'Chỉnh sửa tin đăng' : 'Đăng bán sản phẩm mới'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {isEditing ? 'Cập nhật lại giá, mô tả hoặc hình ảnh món đồ.' : 'Chia sẻ đồ dùng, sách, thiết bị đến các thành viên trong cộng đồng.'}
                    </p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6 bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
                
                {mutation.isError && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 font-medium">
                            <AlertCircle size={18} />
                            <span>
                                {(mutation.error as any).response?.status === 409 
                                    ? 'Sản phẩm đã bị sửa đổi bởi phiên làm việc khác. Vui lòng tải lại dữ liệu mới nhất trước khi tiếp tục.' 
                                    : 'Không thể lưu sản phẩm. Vui lòng thử lại.'}
                            </span>
                        </div>
                        {(mutation.error as any).response?.status === 409 && isEditing && (
                            <button
                                type="button"
                                onClick={() => queryClient.invalidateQueries({ queryKey: ['product', id] })}
                                className="self-start text-xs font-semibold underline text-red-800 hover:text-red-900 cursor-pointer"
                            >
                                Nhấn vào đây để tải lại dữ liệu mới nhất
                            </button>
                        )}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold text-gray-700">Tiêu đề sản phẩm</label>
                    <input
                        type="text"
                        {...register('title')}
                        placeholder="VD: Tai nghe bluetooth, sách tham khảo, máy tính cầm tay..."
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700">Danh mục sản phẩm</label>
                    <select
                        {...register('categoryId', { valueAsNumber: true })}
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 focus:ring-2 focus:ring-purple-500 bg-white text-sm"
                    >
                        <option value={0}>-- Chọn một danh mục --</option>
                        {categories?.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700">Giá bán mong muốn (VNĐ)</label>
                    <input
                        type="number"
                        step="1000"
                        {...register('price', { valueAsNumber: true })}
                        placeholder="VD: 50000"
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700">Mô tả chi tiết</label>
                    <textarea
                        rows={4}
                        {...register('description')}
                        placeholder="Mô tả tình trạng sách/đồ, xuất xứ, phụ kiện đi kèm..."
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700">Đường dẫn ảnh sản phẩm (URL)</label>
                    <input
                        type="text"
                        {...register('imageUrl')}
                        placeholder="https://images.unsplash.com/..."
                        className="mt-1 block w-full border border-gray-300 rounded-xl shadow-xs py-2 px-3 focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition shadow-xs"
                    >
                        <Save size={16} />
                        {mutation.isPending ? 'Đang lưu...' : 'Lưu sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
};
