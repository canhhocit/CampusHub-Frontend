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
  const rawPage = Number(searchParams.get('page') || 0);
  const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
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
    <div className="min-h-screen bg-[#f8f9fa] py-5 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. Oreka-inspired Hero Showcase Banner */}
        <div className="bg-gradient-to-r from-orange-50/90 via-amber-50/40 to-white rounded-2xl border border-orange-100 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100/80 text-orange-800 border border-orange-200">
                <Sparkles size={13} className="text-orange-600" /> Nền tảng mua bán đồ cũ sinh viên & Tủ Smart Locker
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                "Cũ người, mới ta" <br className="hidden sm:inline" />
                Giao nhận an toàn qua <span className="text-[#eb6e34]">Smart Locker</span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Tiết kiệm chi phí, trao gửi giáo trình & đồ dùng KTX không còn nhu cầu sử dụng. Hoàn toàn tự động, không lo bom hàng, nhận đồ 24/7 với mã PIN bảo mật.
              </p>
              <div className="pt-1 flex flex-wrap gap-3">
                <Link
                  to="/marketplace/new"
                  className="px-5 py-2.5 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-lg text-sm font-semibold shadow-xs transition flex items-center gap-2"
                >
                  <Plus size={16} />
                  Đăng bán ngay (Miễn phí)
                </Link>
                <a
                  href="#how-it-works"
                  className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition"
                >
                  Quy trình Smart Locker
                </a>
              </div>
            </div>

            {/* Right: 3-Step Process Graphic (Oreka-style visual trust card) */}
            <div id="how-it-works" className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block border-b border-slate-100 pb-2">
                3 Bước giao nhận an tâm
              </span>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Đăng bán & Đặt đồ vào tủ</strong>
                    <span className="text-slate-500">Người bán tạo đơn, mang đồ gửi vào tủ Locker tại sảnh trường/KTX.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Thanh toán bảo đảm qua Escrow</strong>
                    <span className="text-slate-500">Hệ thống tạm giữ tiền, cam kết hoàn 100% nếu sản phẩm sai mô tả.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-semibold">Nhận đồ 24/7 bằng mã PIN</strong>
                    <span className="text-slate-500">Người mua nhập PIN mở tủ lấy đồ, người bán nhận tiền tự động.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Oreka Value Trust Proposition Bar (3 Core Commitments) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#eb6e34] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Cam kết an toàn 100%</h4>
              <p className="text-[11px] text-slate-500">Tiền được bảo lưu trong hệ thống cho tới khi nhận hàng</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Giao nhận tủ thông minh</h4>
              <p className="text-[11px] text-slate-500">Không cần gặp mặt trực tiếp, chủ động 24/7 mọi lúc</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tiết kiệm & Sống xanh</h4>
              <p className="text-[11px] text-slate-500">Tái sinh vòng đời đồ dùng sinh viên, giảm thiểu rác thải</p>
            </div>
          </div>
        </div>

        {/* 3. Danh mục đa dạng (Oreka Category Grid Section) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#eb6e34]" />
              Danh mục đa dạng
            </h2>
            {categoryId && (
              <button
                onClick={() => handleCategorySelect('')}
                className="text-xs text-[#eb6e34] hover:text-[#d85e25] font-semibold flex items-center gap-1 transition"
              >
                <RotateCcw size={12} /> Xem tất cả danh mục
              </button>
            )}
          </div>

          {/* Oreka category icon buttons grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-7 gap-2.5">
            <button
              onClick={() => handleCategorySelect('')}
              className={`p-3 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                !categoryId
                  ? 'border-[#eb6e34] bg-orange-50/50 text-[#eb6e34] font-bold shadow-2xs'
                  : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50 text-slate-700 font-medium'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <ShoppingBag size={18} />
              </div>
              <span className="text-xs truncate w-full">Tất cả</span>
            </button>

            {categories?.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              const isSelected = categoryId === cat.id.toString();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id.toString())}
                  className={`p-3 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'border-[#eb6e34] bg-orange-50/50 text-[#eb6e34] font-bold shadow-2xs'
                      : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isSelected ? 'bg-orange-100 text-[#eb6e34]' : 'bg-slate-100 text-slate-700'}`}>
                    <Icon size={18} />
                  </div>
                  <span className="text-xs truncate w-full">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Search & Filters Control Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm sản phẩm, giáo trình, laptop, đồ KTX..."
                className="w-full pl-9 pr-24 py-2 border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:border-[#eb6e34] focus:ring-1 focus:ring-[#eb6e34] bg-white transition"
              />
              <Search className="absolute left-3 text-slate-400" size={16} />
              <button
                type="submit"
                className="absolute right-1 px-3.5 py-1.5 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-md text-xs font-semibold transition"
              >
                Tìm kiếm
              </button>
            </form>

            {/* Filter & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Category Select Dropdown */}
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
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
              <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs">
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
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition text-xs flex items-center gap-1"
                  title="Xóa bộ lọc"
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline">Đặt lại</span>
                </button>
              )}

              {/* Post New Listing Action */}
              <Link
                to="/marketplace/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-lg text-xs font-semibold transition shadow-xs"
              >
                <Plus size={15} />
                Đăng tin bán
              </Link>
            </div>
          </div>

          {/* Active Filter Indicators & Total Elements */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs sm:text-sm text-slate-600 gap-2">
            <div className="flex items-center gap-2">
              <span>
                Tìm thấy{' '}
                <strong className="text-slate-900 font-semibold">
                  {productsPage?.totalElements || 0}
                </strong>{' '}
                sản phẩm
              </span>
              {search && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200">
                  Từ khóa: "{search}"
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-slate-600 hover:text-slate-950 underline font-medium"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* 4. Products Grid Section (Oreka 'Gợi ý cho bạn hôm nay') */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eb6e34]"></span>
              Gợi ý cho bạn hôm nay
            </h2>
            <span className="text-xs text-slate-500">
              Đồ dùng sinh viên thanh lý giá tốt
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-3 space-y-3 animate-pulse"
                >
                  <div className="aspect-square bg-slate-200 rounded-lg" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-full pt-2" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center space-y-3">
              <p className="text-rose-700 font-semibold text-sm">
                Không thể tải danh sách sản phẩm lúc này.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-[#eb6e34] text-white rounded-lg text-xs font-semibold hover:bg-[#d85e25] transition"
              >
                Thử lại
              </button>
            </div>
          ) : productsPage?.content.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#eb6e34] mx-auto flex items-center justify-center">
                <ShoppingBag size={28} />
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
                    className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Xóa bộ lọc
                  </button>
                )}
                <Link
                  to="/marketplace/new"
                  className="px-4 py-2 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Đăng tin bán ngay
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {productsPage?.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* 5. Pagination */}
        {productsPage && productsPage.totalPages > 1 && (
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              disabled={page <= 0}
              onClick={() =>
                setSearchParams((prev) => {
                  prev.set('page', (page - 1).toString());
                  return prev;
                })
              }
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
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
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              Trang sau
            </button>
          </div>
        )}

        {/* 6. Marketplace Trust Factors - Clean Minimalist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-slate-700">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 shrink-0">
              <Lock size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900">Mạng Lưới Smart Locker</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Người bán gửi đồ vào ngăn tủ, người mua nhận đồ 24/7 bằng mã PIN bảo mật.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900">Xét duyệt danh tính thành viên</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Người bán được yêu cầu xác thực CCCD trước khi đăng bán, đảm bảo an tâm và minh bạch.
              </p>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800 shrink-0">
              <Sparkles size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900">Tiết Kiệm & Bền Vững</h4>
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
