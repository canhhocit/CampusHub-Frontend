import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Product } from '../../types/marketplace';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const { data: product, isLoading, error } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: () => axiosInstance.get(`/api/v1/products/${id}`).then(res => res.data),
        retry: false
    });

    const isOwner = Boolean(user?.username && product?.owner?.username && user.username === product.owner.username);

    const createOrderMutation = useMutation({
        mutationFn: () => axiosInstance.post('/api/v1/orders', { productId: Number(id) }).then(res => res.data),
        onSuccess: (data: any) => {
            navigate(`/orders/${data.id}`);
        },
        onError: (err: any) => {
            alert(err.response?.data?.message || 'Không thể tạo đơn hàng');
        }
    });

    const handleOrderClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (window.confirm(`Xác nhận đặt mua sản phẩm "${product?.title}"?`)) {
            createOrderMutation.mutate();
        }
    };

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
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.title}</h1>
                            {isOwner && product.status === 'HIDDEN' && (
                                <span className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full uppercase tracking-wide">Hidden</span>
                            )}
                            {isOwner && product.status === 'SOLD' && (
                                <span className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full uppercase tracking-wide">Sold</span>
                            )}
                            {isOwner && (
                                <Link to={`/marketplace/edit/${product.id}`} className="mt-2 inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full hover:bg-blue-100 transition">
                                    Edit Listing
                                </Link>
                            )}
                        </div>
                        <p className="mt-2 text-3xl text-gray-900">${product.price.toFixed(2)}</p>
                        
                        <div className="mt-6 border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900">Description</h3>
                            <p className="mt-2 text-gray-600 whitespace-pre-wrap">{product.description || 'No description provided.'}</p>
                        </div>
                        
                        <div className="mt-6 border-t pt-6">
                            <p className="text-sm text-gray-500">Posted by <span className="font-medium text-gray-900">{product.owner.fullName}</span></p>
                            <p className="text-sm text-gray-500">Listed on {new Date(product.createdAt).toLocaleDateString()}</p>
                        </div>

                        {!isOwner && product.status === 'ACTIVE' && (
                            <div className="mt-8">
                                <button
                                    onClick={handleOrderClick}
                                    disabled={createOrderMutation.isPending}
                                    className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
                                >
                                    {createOrderMutation.isPending ? (
                                        <span>Đang khởi tạo đơn hàng...</span>
                                    ) : (
                                        <>
                                            <span>🛒</span> Đặt mua qua Tủ Locker Thông Minh
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Giao dịch an toàn: Người bán sẽ gửi đồ vào tủ locker trường học để bạn đến lấy
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
