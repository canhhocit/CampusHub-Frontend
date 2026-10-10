import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { PageResponse, Product, Category } from '../../types/marketplace';
import { useSearchParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';

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
                <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="flex relative">
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    </form>

                    <select 
                        value={categoryId} 
                        onChange={handleCategoryChange}
                        className="py-2 px-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">All Categories</option>
                        {categories?.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    <Link to="/marketplace/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 whitespace-nowrap text-center">
                        Post an Item
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20">Loading products...</div>
            ) : productsPage?.content.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No products found.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {productsPage?.content.map(product => (
                        <Link to={`/marketplace/${product.id}`} key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                            <div className="h-48 bg-gray-200 w-full relative">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                                <p className="text-blue-600 font-bold mt-1">${product.price.toFixed(2)}</p>
                                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                    <span>{product.category.name}</span>
                                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {productsPage && productsPage.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    <button 
                        disabled={page === 0}
                        onClick={() => setSearchParams(prev => { prev.set('page', (page - 1).toString()); return prev; })}
                        className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">Page {page + 1} of {productsPage.totalPages}</span>
                    <button 
                        disabled={page >= productsPage.totalPages - 1}
                        onClick={() => setSearchParams(prev => { prev.set('page', (page + 1).toString()); return prev; })}
                        className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
