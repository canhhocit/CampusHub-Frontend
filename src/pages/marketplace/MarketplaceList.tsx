import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { PageResponse, Product, Category } from '../../types/marketplace';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Plus, ShoppingBag, ImageOff } from 'lucide-react';

export const MarketplaceList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get('page') || '0', 10);
    const categoryId = searchParams.get('categoryId') || '';
    const search = searchParams.get('search') || '';

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: () => axiosInstance.get('/api/v1/categories').then(res => res.data)
    });

    const { data: productsPage, isLoading } = useQuery<PageResponse<Product>>({
        queryKey: ['products', page, categoryId, search],
        queryFn: () => axiosInstance.get('/api/v1/products', {
            params: { page, categoryId, search }
        }).then(res => res.data)
    });

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const q = formData.get('search') as string;
        setSearchParams(prev => {
            if (q) prev.set('search', q);
            else prev.delete('search');
            prev.set('page', '0');
            return prev;
        });
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchParams(prev => {
            if (e.target.value) prev.set('categoryId', e.target.value);
            else prev.delete('categoryId');
            prev.set('page', '0');
            return prev;
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Chợ Trao Đổi Đồ Toàn Thành Phố</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Tìm kiếm sản phẩm, đồ dùng và giao nhận tiện lợi qua Mạng lưới Tủ Locker Thông Minh
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="flex relative">
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 text-sm w-full"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </form>

                    <select 
                        value={categoryId} 
                        onChange={handleCategoryChange}
                        className="py-2 px-3 border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-white text-sm"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories?.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <Link
                        to="/marketplace/new"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 whitespace-nowrap text-sm font-semibold transition shadow-xs"
                    >
                        <Plus size={16} /> Đăng tin bán đồ
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-gray-500">Đang tải danh sách sản phẩm...</div>
            ) : productsPage?.content.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-white rounded-2xl border border-gray-200">
                    <ShoppingBag size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-600 font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {productsPage?.content.map(product => (
                        <Link to={`/marketplace/${product.id}`} key={product.id} className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col">
                            <div className="h-48 bg-gray-100 w-full relative flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-1 text-xs">
                                        <ImageOff size={24} />
                                        <span>Chưa có ảnh</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">{product.category.name}</span>
                                    <h3 className="font-semibold text-gray-900 truncate mt-1 text-sm">{product.title}</h3>
                                    <p className="text-purple-600 font-bold mt-1 text-base">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                    </p>
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                                    <span>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
                                    <span className="text-purple-600 font-medium hover:underline">Chi tiết &rarr;</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {productsPage && productsPage.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-3">
                    <button 
                        disabled={page === 0}
                        onClick={() => setSearchParams(prev => { prev.set('page', (page - 1).toString()); return prev; })}
                        className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition"
                    >
                        Trang trước
                    </button>
                    <span className="text-sm text-gray-600">Trang {page + 1} / {productsPage.totalPages}</span>
                    <button 
                        disabled={page >= productsPage.totalPages - 1}
                        onClick={() => setSearchParams(prev => { prev.set('page', (page + 1).toString()); return prev; })}
                        className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-sm font-medium transition"
                    >
                        Trang sau
                    </button>
                </div>
            )}
        </div>
    );
};
