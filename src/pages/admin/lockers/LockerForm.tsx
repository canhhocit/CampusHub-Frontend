import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../../api/axios';
import type { LockerDetail } from '../../../types/locker';
import { ArrowLeft } from 'lucide-react';
import { AdminNav } from '../../../components/AdminNav';

const lockerSchema = z.object({
    code: z.string().min(1, 'Locker code is required').max(50, 'Max 50 characters'),
    name: z.string().min(1, 'Locker name is required').max(100, 'Max 100 characters'),
    location: z.string().min(1, 'Location is required').max(255, 'Max 255 characters'),
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
                <div className="text-center py-20 text-gray-500">Loading locker...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <div className="max-w-2xl mx-auto px-4 py-8">
                <Link to="/admin/lockers" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline mb-6 font-medium">
                <ArrowLeft size={16} /> Back to Locker List
            </Link>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {isEditing ? `Edit Locker ${existingLocker?.code}` : 'Register New Locker'}
            </h1>

            <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {mutation.isError && (
                    <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
                        {(mutation.error as any).response?.data?.message || 'Failed to save locker. Check if locker code is already taken.'}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Locker Code</label>
                    <input
                        type="text"
                        {...register('code')}
                        disabled={isEditing}
                        placeholder="e.g. LK-A1"
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 uppercase disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
                    {isEditing && <p className="mt-1 text-xs text-gray-400">Locker unique code cannot be modified after registration.</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Display Name / Label</label>
                    <input
                        type="text"
                        {...register('name')}
                        placeholder="e.g. Tủ Khu A - Tầng 1"
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                        type="text"
                        {...register('location')}
                        placeholder="e.g. Sảnh chính Tòa nhà A, Tầng 1"
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Saving...' : 'Save Locker'}
                    </button>
                </div>
            </form>
        </div>
        </div>
    );
};
