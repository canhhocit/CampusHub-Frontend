import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { Product } from '../../types/marketplace';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, ShoppingBag, Edit3, ImageOff } from 'lucide-react';

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
            if (err.response?.status === 403) {
                if (window.confirm('Bạn cần xác minh danh tính (CCCD) để thực hiện giao dịch này. Bạn có muốn đi tới trang xác minh CCCD ngay bây giờ không?')) {
                    navigate('/verify-identity');
                    return;
                }
            }
            alert(err.response?.data?.message || 'Không thể tạo đơn hàng');
        }
    });

    const handleOrderClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (user && user.role !== 'ROLE_ADMIN' && user.role !== 'ADMIN' && !user.identityVerified) {
            if (window.confirm('Yêu cầu xác minh danh tính: Bạn cần xác minh CCCD trước khi đặt mua hàng qua hệ thống Smart Locker. Chuyển đến trang xác minh ngay?')) {
                navigate('/verify-identity');
            }
            return;
        }
        if (window.confirm(`Xác nhận đặt mua sản phẩm "${product?.title}"?`)) {
            createOrderMutation.mutate();
        }
    };

    if (isLoading) return <div className="text-center py-20 text-gray-500">Đang tải thông tin sản phẩm...</div>;
    
    if (error || !product) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-700">Không tìm thấy sản phẩm</h2>
                <p className="mt-2 text-gray-500">Sản phẩm này có thể đã được bán hoặc đã bị gỡ bỏ.</p>
                <Link to="/marketplace" className="text-purple-600 hover:underline mt-4 inline-flex items-center gap-1">
                    <ArrowLeft size={16} /> Quay lại Chợ đồ cũ
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/marketplace" className="text-purple-600 hover:underline mb-6 inline-flex items-center gap-1 font-medium text-sm">
                <ArrowLeft size={16} /> Quay lại Chợ trao đổi
            </Link>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 bg-gray-100 flex items-center justify-center">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.title} className="w-full h-96 object-cover" />
                        ) : (
                            <div className="w-full h-96 flex flex-col items-center justify-center text-gray-400 gap-2">
                                <ImageOff size={40} />
                                <span className="text-sm">Chưa có hình ảnh sản phẩm</span>
                            </div>
                        )}
                    </div>
                    <div className="p-8 md:w-1/2 flex flex-col justify-between">
                        <div>
                            <div className="uppercase tracking-wide text-xs text-purple-600 font-bold">{product.category.name}</div>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.title}</h1>
                                {isOwner && product.status === 'HIDDEN' && (
                                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">Đang ẩn</span>
                                )}
                                {isOwner && product.status === 'SOLD' && (
                                    <span className="px-2.5 py-0.5 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full">Đã bán</span>
                                )}
                                {isOwner && (
                                    <Link to={`/marketplace/edit/${product.id}`} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full hover:bg-purple-100 transition">
                                        <Edit3 size={13} /> Chỉnh sửa
                                    </Link>
                                )}
                            </div>
                            <p className="mt-3 text-3xl font-extrabold text-purple-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                            </p>
                            
                            <div className="mt-6 border-t border-gray-100 pt-5">
                                <h3 className="text-sm font-semibold text-gray-900">Mô tả sản phẩm</h3>
                                <p className="mt-2 text-gray-600 text-sm whitespace-pre-wrap">{product.description || 'Người bán chưa cung cấp thêm mô tả chi tiết.'}</p>
                            </div>
                            
                            <div className="mt-6 border-t border-gray-100 pt-5 text-xs text-gray-500 space-y-1">
                                <p>Đăng bởi: <span className="font-semibold text-gray-800">{product.owner.fullName || product.owner.username}</span></p>
                                <p>Ngày đăng: {new Date(product.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                        </div>

                        {!isOwner && product.status === 'ACTIVE' && (
                            <div className="mt-8 pt-4">
                                <button
                                    onClick={handleOrderClick}
                                    disabled={createOrderMutation.isPending}
                                    className="w-full py-3.5 px-6 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
                                >
                                    {createOrderMutation.isPending ? (
                                        <span>Đang khởi tạo đơn hàng...</span>
                                    ) : (
                                        <>
                                            <ShoppingBag size={18} /> Đặt mua qua Tủ Locker Thông Minh
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-gray-500 text-center mt-2.5">
                                    Giao dịch an toàn: Người bán sẽ gửi đồ vào tủ locker thông minh để bạn đến nhận thuận tiện và bảo mật
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
