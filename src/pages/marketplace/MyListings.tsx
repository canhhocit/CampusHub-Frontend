import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { PageResponse, Product, ProductStatus } from '../../types/marketplace';
import { useSearchParams, Link } from 'react-router-dom';
import { Plus, Tag, ImageOff } from 'lucide-react';

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
        },
        onError: (err: any) => {
            if (err.response?.status === 409) {
                alert('Sản phẩm đã được chỉnh sửa bởi phiên khác. Đang tải lại danh sách mới nhất...');
                queryClient.invalidateQueries({ queryKey: ['my-products'] });
            } else {
                alert(err.response?.data?.message || 'Cập nhật trạng thái không thành công.');
            }
        }
    });

    const renderStatusBadge = (status: ProductStatus) => {
        switch (status) {
            case 'ACTIVE':
                return <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Đang bán</span>;
            case 'SOLD':
                return <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">Đã bán</span>;
            case 'HIDDEN':
                return <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">Đang ẩn</span>;
            default:
                return <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                        <Tag size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tin Đăng Của Tôi</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Quản lý các sản phẩm bạn đang rao bán trên toàn thành phố</p>
                    </div>
                </div>

                <Link
                    to="/marketplace/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition shadow-xs"
                >
                    <Plus size={16} /> Đăng thêm món mới
                </Link>
            </div>

            {isLoading ? (
                <div className="text-center py-16 text-gray-500">Đang tải danh sách tin đăng...</div>
            ) : pageData?.content.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                    <Tag size={40} className="mx-auto text-gray-300 mb-2" />
                    <h3 className="text-base font-semibold text-gray-800">Bạn chưa đăng món đồ nào</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-6">Hãy đăng sách, đồ dùng hoặc thiết bị không dùng đến để các thành viên khác mua lại nhé.</p>
                    <Link
                        to="/marketplace/new"
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition shadow-xs"
                    >
                        Đăng tin ngay
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow-xs border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3.5 text-left">Sản phẩm</th>
                                    <th className="px-6 py-3.5 text-left">Giá bán</th>
                                    <th className="px-6 py-3.5 text-left">Trạng thái</th>
                                    <th className="px-6 py-3.5 text-left">Cập nhật</th>
                                    <th className="px-6 py-3.5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {pageData?.content.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50/70 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {p.imageUrl ? (
                                                    <img className="h-12 w-12 rounded-xl object-cover border border-gray-200 shrink-0" src={p.imageUrl} alt="" />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                                        <ImageOff size={18} />
                                                    </div>
                                                )}
                                                <div className="ml-4">
                                                    <Link to={`/marketplace/${p.id}`} className="font-semibold text-gray-900 hover:text-purple-600">
                                                        {p.title}
                                                    </Link>
                                                    <div className="text-xs text-gray-500">{p.category.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-purple-600">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderStatusBadge(p.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold space-x-2">
                                            <Link to={`/marketplace/${p.id}`} className="text-gray-600 hover:text-gray-900 px-2 py-1 bg-gray-100 rounded-md">
                                                Xem
                                            </Link>
                                            <Link to={`/marketplace/edit/${p.id}`} className="text-purple-600 hover:text-purple-800 px-2 py-1 bg-purple-50 rounded-md">
                                                Sửa
                                            </Link>
                                            
                                            {p.status === 'ACTIVE' && (
                                                <button 
                                                    onClick={() => statusMutation.mutate({ id: p.id, status: 'HIDDEN', version: p.version })}
                                                    className="text-amber-700 hover:text-amber-900 px-2 py-1 bg-amber-50 rounded-md">
                                                    Ẩn tin
                                                </button>
                                            )}
                                            {p.status === 'HIDDEN' && (
                                                <button 
                                                    onClick={() => statusMutation.mutate({ id: p.id, status: 'ACTIVE', version: p.version })}
                                                    className="text-emerald-700 hover:text-emerald-900 px-2 py-1 bg-emerald-50 rounded-md">
                                                    Mở lại
                                                </button>
                                            )}
                                            {(p.status === 'ACTIVE' || p.status === 'HIDDEN') && (
                                                <button 
                                                    onClick={() => statusMutation.mutate({ id: p.id, status: 'SOLD', version: p.version })}
                                                    className="text-gray-600 hover:text-gray-800 px-2 py-1 bg-gray-100 rounded-md">
                                                    Đã bán
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
