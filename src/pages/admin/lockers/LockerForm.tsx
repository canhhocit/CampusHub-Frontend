import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axios';
import type { LockerDetail } from '../../../types/locker';
import { ArrowLeft, Save, Lock } from 'lucide-react';
import { AdminNav } from '../../../components/AdminNav';

const lockerSchema = z.object({
    code: z.string().min(1, 'Mã tủ không được để trống').max(50, 'Tối đa 50 ký tự'),
    name: z.string().min(1, 'Tên tủ không được để trống').max(100, 'Tối đa 100 ký tự'),
    location: z.string().min(1, 'Vị trí không được để trống').max(255, 'Tối đa 255 ký tự'),
});

type LockerFormData = z.infer<typeof lockerSchema>;

export const LockerForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditing = Boolean(id);

    const { data: existingLocker, isLoading: isLoadingLocker } = useQuery<LockerDetail>({
        queryKey: ['locker', id],
        queryFn: () => axiosInstance.get(`/api/v1/lockers/${id}`).then(res => res.data),
        enabled: isEditing
    });

    const { register, handleSubmit, formState: { errors }, reset } = useForm<LockerFormData>({
        resolver: zodResolver(lockerSchema),
        defaultValues: {
            code: '',
            name: '',
            location: '',
        }
    });

    useEffect(() => {
        if (isEditing && existingLocker) {
            reset({
                code: existingLocker.code,
                name: existingLocker.name,
                location: existingLocker.location,
            });
        }
    }, [isEditing, existingLocker, reset]);

    const mutation = useMutation({
        mutationFn: async (data: LockerFormData) => {
            if (isEditing) {
                const res = await axiosInstance.put(`/api/v1/lockers/${id}`, {
                    name: data.name,
                    location: data.location
                });
                return res.data;
            } else {
                const res = await axiosInstance.post('/api/v1/lockers', data);
                return res.data;
            }
        },
        onSuccess: (savedLocker) => {
            queryClient.invalidateQueries({ queryKey: ['lockers'] });
            if (isEditing) {
                queryClient.invalidateQueries({ queryKey: ['locker', id] });
                navigate(`/admin/lockers/${id}`);
            } else {
                navigate(`/admin/lockers/${savedLocker.id}`);
            }
        }
    });

    if (isEditing && isLoadingLocker) {
        return (
            <div className="min-h-screen bg-gray-50">
                <AdminNav />
                <div className="text-center py-20 text-gray-500">Đang tải thông tin tủ...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Link to="/admin/lockers" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline mb-6 font-medium">
                    <ArrowLeft size={16} /> Quay lại danh sách tủ
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {isEditing ? `Chỉnh sửa tủ ${existingLocker?.code}` : 'Thêm mới tủ thông minh'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isEditing ? 'Cập nhật vị trí và tên gợi nhớ cho tủ đồ.' : 'Đăng ký tủ locker mới vào hệ thống điểm giao nhận.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6 bg-white p-6 rounded-xl shadow-xs border border-gray-200">
                    {mutation.isError && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                            {(mutation.error as any).response?.data?.message || 'Không thể lưu tủ đồ. Vui lòng kiểm tra xem mã tủ đã tồn tại hay chưa.'}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Mã định danh tủ (Code)</label>
                        <input
                            type="text"
                            {...register('code')}
                            disabled={isEditing}
                            placeholder="VD: LK-A1"
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-xs py-2 px-3 focus:ring-2 focus:ring-purple-500 uppercase disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                        />
                        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
                        {isEditing && <p className="mt-1 text-xs text-gray-400">Mã định danh của tủ không thể thay đổi sau khi tạo.</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Tên tủ / Tên gợi nhớ</label>
                        <input
                            type="text"
                            {...register('name')}
                            placeholder="VD: Tủ Khu A - Tầng 1"
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-xs py-2 px-3 focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Vị trí lắp đặt</label>
                        <input
                            type="text"
                            {...register('location')}
                            placeholder="VD: Sảnh chính Tòa nhà A, Tầng 1 (cạnh thang máy)"
                            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-xs py-2 px-3 focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition"
                        >
                            <Save size={16} />
                            {mutation.isPending ? 'Đang lưu...' : 'Lưu tủ đồ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
