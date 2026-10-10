import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Category, Product } from '../../types/marketplace';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';

const productSchema = z.object({
    title: z.string().min(1, 'Title is required').max(150),
    description: z.string().optional(),
    price: z.number().min(0, 'Price must be non-negative'),
    categoryId: z.number().min(1, 'Category is required'),
    imageUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
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

    if (isEditing && isLoadingProduct) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">{isEditing ? 'Edit Listing' : 'Create New Listing'}</h1>
            
            <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                
                {mutation.isError && (
                    <div className="p-4 bg-red-50 text-red-700 rounded">
                        Failed to save product. Please try again.
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        type="text"
                        {...register('title')}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        {...register('categoryId', { valueAsNumber: true })}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        <option value={0}>Select a category</option>
                        {categories?.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        {...register('price', { valueAsNumber: true })}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        rows={4}
                        {...register('description')}
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                        type="text"
                        {...register('imageUrl')}
                        placeholder="https://..."
                        className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};
