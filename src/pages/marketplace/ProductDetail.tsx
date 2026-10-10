import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Product } from '../../types/marketplace';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    console.log(user); // Just so user is used, maybe hide it later

    const { data: product, isLoading, error } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: () => axiosInstance.get(`/api/v1/products/${id}`).then(res => res.data),
        retry: false
    });

    if (isLoading) return <div className="text-center py-20">Loading...</div>;
    
    if (error || !product) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">Product not found</h2>
                <p className="mt-2 text-gray-500">The product may have been sold or removed.</p>
                <Link to="/marketplace" className="text-blue-600 hover:underline mt-4 inline-block">Back to Marketplace</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/marketplace" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Marketplace</Link>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 bg-gray-100">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.title} className="w-full h-96 object-cover" />
                        ) : (
                            <div className="w-full h-96 flex items-center justify-center text-gray-400">No Image Available</div>
                        )}
                    </div>
                    <div className="p-8 md:w-1/2">
                        <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">{product.category.name}</div>
                        <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.title}</h1>
                        <p className="mt-2 text-3xl text-gray-900">${product.price.toFixed(2)}</p>
                        
                        <div className="mt-6 border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900">Description</h3>
                            <p className="mt-2 text-gray-600 whitespace-pre-wrap">{product.description || 'No description provided.'}</p>
                        </div>
                        
                        <div className="mt-6 border-t pt-6">
                            <p className="text-sm text-gray-500">Posted by <span className="font-medium text-gray-900">{product.owner.fullName}</span></p>
                            <p className="text-sm text-gray-500">Listed on {new Date(product.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
