import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axios';
import type { LockerDetail } from '../../../types/locker';
import { ArrowLeft, Save, Lock } from 'lucide-react';

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
            <div className="p-8 text-center py-20 text-gray-500">Đang tải thông tin tủ...</div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 font-sans">
            <Link to="/admin/lockers" className="inline-flex items-center gap-1 text-xs sm:text-sm text-emerald-700 hover:text-emerald-800 hover:underline mb-6 font-bold">
                <ArrowLeft size={16} /> Quay lại danh sách tủ
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200/60 shadow-2xs">
                    <Lock size={24} />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {isEditing ? `Chỉnh sửa tủ ${existingLocker?.code}` : 'Thêm mới tủ thông minh'}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        {isEditing ? 'Cập nhật vị trí và tên gợi nhớ cho tủ đồ.' : 'Đăng ký tủ locker mới vào hệ thống điểm giao nhận.'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6 bg-white p-6 sm:p-7 rounded-lg shadow-2xs border border-slate-200">
                {mutation.isError && (
                    <div className="p-3.5 bg-red-50 text-red-700 rounded-md border border-red-200 text-xs sm:text-sm">
                        {(mutation.error as any).response?.data?.message || 'Không thể lưu tủ đồ. Vui lòng kiểm tra xem mã tủ đã tồn tại hay chưa.'}
                    </div>
                )}

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mã định danh tủ (Code)</label>
                    <input
                        type="text"
                        {...register('code')}
                        disabled={isEditing}
                        placeholder="VD: LK-A1"
                        className="block w-full border border-slate-300 rounded-md shadow-2xs py-2 px-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 uppercase disabled:bg-slate-100 disabled:text-slate-500 text-sm transition"
                    />
                    {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>}
                    {isEditing && <p className="mt-1 text-[11px] text-slate-400">Mã định danh của tủ không thể thay đổi sau khi tạo.</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tên tủ / Tên gợi nhớ</label>
                    <input
                        type="text"
                        {...register('name')}
                        placeholder="VD: Tủ Khu A - Tầng 1"
                        className="block w-full border border-slate-300 rounded-md shadow-2xs py-2 px-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm transition"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Vị trí lắp đặt</label>
                    <input
                        type="text"
                        {...register('location')}
                        placeholder="VD: Sảnh chính Tòa nhà A, Tầng 1 (cạnh thang máy)"
                        className="block w-full border border-slate-300 rounded-md shadow-2xs py-2 px-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm transition"
                    />
                    {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-slate-300 rounded-md text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs disabled:opacity-50 transition"
                    >
                        <Save size={15} />
                        {mutation.isPending ? 'Đang lưu...' : 'Lưu tủ đồ'}
                    </button>
                </div>
            </form>
        </div>
    );
};
