import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { PageResponse, Product, ProductStatus } from '../../types/marketplace';
import { useSearchParams, Link } from 'react-router-dom';

export const MyListings = () => {
    const [searchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '0', 10);
    const queryClient = useQueryClient();

    const { data: pageData, isLoading } = useQuery<PageResponse<Product>>({
        queryKey: ['my-products', page],
        queryFn: () => axiosInstance.get('/api/v1/products/me', { params: { page } }).then(res => res.data)
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status, version }: { id: number, status: ProductStatus, version: number }) => 
            axiosInstance.patch(`/api/v1/products/${id}/status`, { status, version }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-products'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
                <Link to="/marketplace/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Post New Item
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-10">Loading...</div>
            ) : pageData?.content.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
                    You haven't posted any items yet.
                </div>
            ) : (
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pageData?.content.map(p => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {p.imageUrl ? (
                                                <img className="h-10 w-10 rounded object-cover" src={p.imageUrl} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded bg-gray-200"></div>
                                            )}
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{p.title}</div>
                                                <div className="text-sm text-gray-500">{p.category.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${p.price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                                              p.status === 'SOLD' ? 'bg-gray-100 text-gray-800' : 
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(p.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <Link to={`/marketplace/edit/${p.id}`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                                        
                                        {p.status === 'ACTIVE' && (
                                            <button 
                                                onClick={() => statusMutation.mutate({ id: p.id, status: 'HIDDEN', version: p.version })}
                                                className="text-yellow-600 hover:text-yellow-900">
                                                Hide
                                            </button>
                                        )}
                                        {p.status === 'HIDDEN' && (
                                            <button 
                                                onClick={() => statusMutation.mutate({ id: p.id, status: 'ACTIVE', version: p.version })}
                                                className="text-green-600 hover:text-green-900">
                                                Activate
                                            </button>
                                        )}
                                        {(p.status === 'ACTIVE' || p.status === 'HIDDEN') && (
                                            <button 
                                                onClick={() => statusMutation.mutate({ id: p.id, status: 'SOLD', version: p.version })}
                                                className="text-gray-600 hover:text-gray-900">
                                                Mark Sold
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
