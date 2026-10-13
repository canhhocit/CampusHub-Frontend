import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { PageResponse, Product, Category } from '../../types/marketplace';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  RotateCcw,
  Lock,
  ShieldCheck,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  Laptop,
  Home,
  Shirt,
  Package,
} from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';

export const MarketplaceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0', 10);
  const categoryId = searchParams.get('categoryId') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const direction = searchParams.get('direction') || 'desc';

  const [searchInput, setSearchInput] = useState(search);

  // Sync internal search input with URL search param
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => axiosInstance.get('/api/v1/categories').then((res) => res.data),
  });

  // Fetch public active products
  const { data: productsPage, isLoading, isError, refetch } = useQuery<PageResponse<Product>>({
    queryKey: ['products', page, categoryId, search, sort, direction],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/products', {
          params: {
            page,
            size: 16,
            categoryId: categoryId || undefined,
            search: search || undefined,
            sort,
            direction,
          },
        })
        .then((res) => res.data),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (searchInput.trim()) {
        prev.set('search', searchInput.trim());
      } else {
        prev.delete('search');
      }
      prev.set('page', '0');
      return prev;
    });
  };

  const handleCategorySelect = (selectedId: string) => {
    setSearchParams((prev) => {
      if (selectedId) {
        prev.set('categoryId', selectedId);
      } else {
        prev.delete('categoryId');
      }
      prev.set('page', '0');
      return prev;
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const [newSort, newDirection] = val.split('-');
    setSearchParams((prev) => {
      prev.set('sort', newSort);
      prev.set('direction', newDirection);
      prev.set('page', '0');
      return prev;
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  // Helper category icon picker
  const getCategoryIcon = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('sách') || lower.includes('giáo trình')) return BookOpen;
    if (lower.includes('điện tử') || lower.includes('laptop') || lower.includes('máy tính')) return Laptop;
    if (lower.includes('ktx') || lower.includes('nhà') || lower.includes('gia dụng')) return Home;
    if (lower.includes('thời trang') || lower.includes('quần') || lower.includes('áo') || lower.includes('giày')) return Shirt;
    return Package;
  };

  const hasActiveFilters = Boolean(categoryId || search);

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Hero Showcase Banner (Oreka Pattern adapted for CampusHub) */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
              <Sparkles size={13} /> Sàn chuyển giao chủ mới cho những món đồ hữu ích
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Mua Bán & Thanh Lý Đồ Cũ <br className="hidden sm:inline" />
              Giao Nhận Qua <span className="text-purple-300">Tủ Smart Locker</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
              Tiết kiệm chi phí, đặt mua và nhận hàng 24/7 tại các trạm tủ đồ thông minh trong thời đại số bận rộn !
            </p>

            {/* Quick feature tags */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs text-purple-200 border border-white/10">
                <Lock size={12} className="text-amber-400" /> Nhận đồ bảo mật bằng mã PIN
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs text-purple-200 border border-white/10">
                <ShieldCheck size={12} className="text-emerald-400" /> Xác minh CCCD người bán
              </span>
            </div>
          </div>

          {/* Decorative graphic element */}
          <div className="absolute right-0 bottom-0 opacity-10 sm:opacity-20 translate-x-10 translate-y-10 pointer-events-none">
            <ShoppingBag size={280} />
          </div>
        </div>

        {/* 2. Category Quick Chips / Carousel (Inspired by Oreka Categories) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Khám phá theo danh mục
            </h2>
            {categoryId && (
              <button
                onClick={() => handleCategorySelect('')}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw size={12} /> Xem tất cả danh mục
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => handleCategorySelect('')}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                !categoryId
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag size={14} />
              Tất cả sản phẩm
            </button>

            {categories?.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              const isSelected = categoryId === cat.id.toString();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id.toString())}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Search & Filters Control Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm tên sản phẩm/ chủ sở hữu..."
                className="w-full pl-9 pr-24 py-2 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-50 focus:bg-white transition"
              />
              <Search className="absolute left-3 text-slate-400" size={16} />
              <button
                type="submit"
                className="absolute right-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Select Dropdown */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs">
                <SlidersHorizontal size={13} className="text-slate-500" />
                <select
                  value={categoryId}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="bg-transparent focus:outline-hidden text-slate-700 font-medium py-1"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1 text-xs">
                <ArrowUpDown size={13} className="text-slate-500" />
                <select
                  value={`${sort}-${direction}`}
                  onChange={handleSortChange}
                  className="bg-transparent focus:outline-hidden text-slate-700 font-medium py-1"
                >
                  <option value="createdAt-desc">Mới đăng nhất</option>
                  <option value="createdAt-asc">Cũ nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>

              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition text-xs flex items-center gap-1"
                  title="Xóa bộ lọc"
                >
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">Đặt lại</span>
                </button>
              )}

              {/* Post New Listing Action */}
              <Link
                to="/marketplace/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Plus size={15} />
                Đăng tin bán
              </Link>
            </div>
          </div>

          {/* Active Filter Indicators & Total Elements */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <span>
                Tìm thấy{' '}
                <strong className="text-slate-900 font-bold">
                  {productsPage?.totalElements || 0}
                </strong>{' '}
                sản phẩm
              </span>
              {search && (
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-200">
                  Từ khóa: "{search}"
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-purple-600 hover:underline font-medium"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* 4. Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse"
              >
                <div className="aspect-square bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-full pt-2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3">
            <p className="text-rose-700 font-semibold text-sm">
              Không thể tải danh sách sản phẩm lúc này.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
            >
              Thử lại
            </button>
          </div>
        ) : productsPage?.content.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
              <ShoppingBag size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Không tìm thấy sản phẩm nào
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Hiện chưa có món đồ nào phù hợp với bộ lọc hiện tại. Bạn có thể thử tìm từ khóa khác hoặc là người đầu tiên đăng bán món đồ này!
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Xóa bộ lọc
                </button>
              )}
              <Link
                to="/marketplace/new"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Đăng tin bán ngay
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {productsPage?.content.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* 5. Pagination */}
        {productsPage && productsPage.totalPages > 1 && (
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              disabled={page <= 0}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set('page', (page - 1).toString());
                  return prev;
                })
              }
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Trang trước
            </button>
            <span className="text-xs font-medium text-slate-600">
              Trang <strong className="text-slate-900">{page + 1}</strong> / {productsPage.totalPages}
            </span>
            <button
              disabled={page >= productsPage.totalPages - 1}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set('page', (page + 1).toString());
                  return prev;
                })
              }
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Trang sau
            </button>
          </div>
        )}

        {/* 6. Marketplace Trust Factors (Inspired by Oreka Value Highlights) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-slate-700">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 shrink-0">
              <Lock size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Mạng Lưới Smart Locker</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Người bán gửi đồ vào ngăn tủ, người mua nhận đồ 24/7 bằng mã OTP 6 số bảo mật.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Định Danh Sinh Viên (CCCD)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tất cả người bán đều được yêu cầu xác thực CCCD trước khi đăng bán, loại bỏ tài khoản ảo.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 shrink-0">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Tiết Kiệm & Bền Vững</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Giúp giáo trình, tài liệu và đồ dùng học tập tìm được chủ nhân mới với mức giá tiết kiệm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
