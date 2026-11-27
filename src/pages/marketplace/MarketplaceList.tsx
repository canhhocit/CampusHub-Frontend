import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { PageResponse, Product, Category } from '../../types/marketplace';
import type { Locker } from '../../types/locker';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';
import { ProductCardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const MarketplaceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Query Params
  const rawPage = Number(searchParams.get('page') || 0);
  const page = Number.isSafeInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const categoryId = searchParams.get('categoryId') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const listingType = searchParams.get('listingType') || '';
  const lockerId = searchParams.get('lockerId') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const direction = searchParams.get('direction') || 'desc';

  // Local input states
  const [searchInput, setSearchInput] = useState(search);
  const [priceMinInput, setPriceMinInput] = useState(minPrice);
  const [priceMaxInput, setPriceMaxInput] = useState(maxPrice);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [lockerSearchTerm, setLockerSearchTerm] = useState('');

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setPriceMinInput(minPrice);
    setPriceMaxInput(maxPrice);
  }, [minPrice, maxPrice]);

  // Fetch Categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => axiosInstance.get('/api/v1/categories').then((res) => res.data),
  });

  // Fetch Lockers
  const { data: lockersPage } = useQuery<PageResponse<Locker>>({
    queryKey: ['lockers-filter'],
    queryFn: () => axiosInstance.get('/api/v1/lockers?size=50').then((res) => res.data),
  });

  const lockers = lockersPage?.content || [];

  const filteredLockers = lockers.filter((lk) => {
    if (!lockerSearchTerm.trim()) return true;
    const term = lockerSearchTerm.toLowerCase();
    return (
      lk.name?.toLowerCase().includes(term) ||
      lk.location?.toLowerCase().includes(term)
    );
  });

  // Fetch public active products
  const { data: productsPage, isLoading, isError, refetch } = useQuery<PageResponse<Product>>({
    queryKey: ['products', page, categoryId, search, minPrice, maxPrice, listingType, lockerId, sort, direction],
    queryFn: () =>
      axiosInstance
        .get('/api/v1/products', {
          params: {
            page,
            size: 16,
            categoryId: categoryId || undefined,
            search: search || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            listingType: listingType || undefined,
            lockerId: lockerId || undefined,
            sort,
            direction,
          },
        })
        .then((res) => res.data),
  });

  // Handlers
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

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchParams((prev) => {
      prev.delete('search');
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

  const handleLockerSelect = (selectedLockerId: string) => {
    setSearchParams((prev) => {
      if (selectedLockerId) {
        prev.set('lockerId', selectedLockerId);
      } else {
        prev.delete('lockerId');
      }
      prev.set('page', '0');
      return prev;
    });
  };

  const handleListingTypeSelect = (type: string) => {
    setSearchParams((prev) => {
      if (type) {
        prev.set('listingType', type);
      } else {
        prev.delete('listingType');
      }
      prev.set('page', '0');
      return prev;
    });
  };

  const handleApplyPriceFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchParams((prev) => {
      if (priceMinInput.trim()) {
        prev.set('minPrice', priceMinInput.trim());
      } else {
        prev.delete('minPrice');
      }
      if (priceMaxInput.trim()) {
        prev.set('maxPrice', priceMaxInput.trim());
      } else {
        prev.delete('maxPrice');
      }
      prev.set('page', '0');
      return prev;
    });
  };

  const handleQuickPrice = (min?: number, max?: number) => {
    setSearchParams((prev) => {
      if (min !== undefined) {
        prev.set('minPrice', min.toString());
        setPriceMinInput(min.toString());
      } else {
        prev.delete('minPrice');
        setPriceMinInput('');
      }

      if (max !== undefined) {
        prev.set('maxPrice', max.toString());
        setPriceMaxInput(max.toString());
      } else {
        prev.delete('maxPrice');
        setPriceMaxInput('');
      }

      prev.set('page', '0');
      return prev;
    });
  };

  const handleSortChange = (newSort: string, newDirection: string) => {
    setSearchParams((prev) => {
      prev.set('sort', newSort);
      prev.set('direction', newDirection);
      prev.set('page', '0');
      return prev;
    });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setPriceMinInput('');
    setPriceMaxInput('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    categoryId || search || minPrice || maxPrice || listingType || lockerId
  );

  const activeCategory = categories?.find((c) => c.id.toString() === categoryId);
  const activeLocker = lockers.find((l) => l.id.toString() === lockerId);
  const quickKeywords = ['Giáo trình', 'Casio', 'IELTS', 'Bàn phím', 'Tai nghe', 'Đèn bàn'];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      {/* Compact Editorial Commerce Masthead & Category Tabs */}
      <section className="bg-white border-b border-slate-200/85">
        <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0 space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                Chợ sinh viên CampusHub
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-500">
                Mua bán và cho thuê đồ dùng học tập ký quỹ bảo đảm · Giao nhận chủ động 24/7 tại{' '}
                <span className="font-medium text-slate-700">
                  {lockers.length > 0 ? `${lockers.length} điểm Smart Locker` : 'hệ thống Smart Locker'}
                </span>
                .
              </p>
            </div>

            {/* Listing Type Segmented Filter */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 self-start md:self-auto">
              {[
                { value: '', label: 'Tất cả' },
                { value: 'SALE', label: 'Mua đứt' },
                { value: 'BOTH', label: 'Cho thuê' },
              ].map((opt) => (
                <button
                  key={opt.value || 'all'}
                  type="button"
                  onClick={() => handleListingTypeSelect(opt.value)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    listingType === opt.value
                      ? 'bg-white text-slate-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Search Bar (Navbar hides search on < md) */}
          <form onSubmit={handleSearchSubmit} className="md:hidden">
            <div className="relative flex items-center bg-slate-100 border border-slate-200 focus-within:bg-white focus-within:border-slate-400 rounded-lg overflow-hidden transition">
              <Search size={15} className="ml-3 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm giáo trình, máy tính Casio, đồ KTX..."
                className="w-full px-2.5 py-2.5 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-hidden min-w-0"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-2 text-slate-400 hover:text-slate-700"
                  aria-label="Xóa từ khóa"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="submit"
                className="px-3.5 py-2.5 bg-slate-900 text-white text-xs font-semibold shrink-0"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Horizontal Category Tabs (Single Source of Truth) */}
          {categories && categories.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mb-px">
              <button
                type="button"
                onClick={() => handleCategorySelect('')}
                className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 shrink-0 transition-colors ${
                  !categoryId
                    ? 'border-emerald-600 text-slate-950 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                Tất cả danh mục
              </button>
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id.toString();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id.toString())}
                    className={`px-3.5 py-2.5 text-[13px] font-medium border-b-2 shrink-0 transition-colors ${
                      isSelected
                        ? 'border-emerald-600 text-slate-950 font-semibold'
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Main Storefront Content */}
      <div className="bg-slate-50 py-4 sm:py-6 font-sans">
        <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sticky Filter Rail */}
          <aside
            className={`${
              mobileFilterOpen ? 'block' : 'hidden'
            } lg:block lg:col-span-3 lg:sticky lg:top-20 bg-white rounded-xl border border-slate-200/85 p-5 space-y-6`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-slate-500" />
                Bộ lọc
              </h2>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-medium inline-flex items-center gap-1"
                  >
                    <RotateCcw size={12} /> Đặt lại
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="lg:hidden text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100"
                  aria-label="Đóng bộ lọc"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Filter 1: Smart Locker Station */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                Điểm tủ Smart Locker
              </span>

              {lockers.length > 4 && (
                <div className="relative">
                  <input
                    type="text"
                    value={lockerSearchTerm}
                    onChange={(e) => setLockerSearchTerm(e.target.value)}
                    placeholder="Tìm trạm tủ..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                    aria-label="Tìm kiếm trạm tủ locker"
                  />
                  <Search size={13} className="absolute left-2.5 top-2 text-slate-400" />
                  {lockerSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setLockerSearchTerm('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
                      aria-label="Xóa tìm kiếm trạm tủ"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              )}

              <div className="max-h-52 overflow-y-auto pr-1 space-y-1.5 text-xs scrollbar-thin">
                <button
                  type="button"
                  onClick={() => handleLockerSelect('')}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                    !lockerId
                      ? 'bg-slate-900 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>Tất cả trạm tủ</span>
                </button>

                {filteredLockers.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-3 text-center">
                    Không có trạm tủ phù hợp
                  </p>
                ) : (
                  filteredLockers.map((lk) => {
                    const isSelected = lockerId === lk.id.toString();
                    return (
                      <button
                        type="button"
                        key={lk.id}
                        onClick={() => handleLockerSelect(lk.id.toString())}
                        className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white font-medium'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="truncate">{lk.name}</div>
                        {lk.location && (
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isSelected ? 'text-slate-300' : 'text-slate-400'
                            }`}
                          >
                            {lk.location}
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Filter 2: Price Range */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-semibold text-slate-800 block">
                Khoảng giá (VND)
              </span>

              <form onSubmit={handleApplyPriceFilter} className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="Từ"
                    value={priceMinInput}
                    onChange={(e) => setPriceMinInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono tabular-nums bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="Đến"
                    value={priceMaxInput}
                    onChange={(e) => setPriceMaxInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono tabular-nums bg-slate-50 focus:bg-white focus:outline-hidden focus:border-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Áp dụng khoảng giá
                </button>
              </form>

              <div className="space-y-1 pt-1 text-xs">
                {[
                  { label: 'Dưới 100.000đ', min: undefined, max: 100000, active: minPrice === '' && maxPrice === '100000' },
                  { label: '100.000đ – 300.000đ', min: 100000, max: 300000, active: minPrice === '100000' && maxPrice === '300000' },
                  { label: '300.000đ – 500.000đ', min: 300000, max: 500000, active: minPrice === '300000' && maxPrice === '500000' },
                  { label: 'Trên 500.000đ', min: 500000, max: undefined, active: minPrice === '500000' && maxPrice === '' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleQuickPrice(preset.min, preset.max)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                      preset.active
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Keywords */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-semibold text-slate-800 block">
                Từ khóa phổ biến
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => {
                      setSearchInput(kw);
                      setSearchParams((prev) => {
                        prev.set('search', kw);
                        prev.set('page', '0');
                        return prev;
                      });
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      search === kw
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Column: Sort Bar & Product Grid */}
          <div className="lg:col-span-9 space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <SlidersHorizontal size={13} />
                  <span>Bộ lọc</span>
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                </button>
                <p className="text-xs sm:text-[13px] text-slate-500">
                  Hiển thị{' '}
                  <strong className="font-semibold text-slate-900 font-mono tabular-nums">
                    {productsPage?.totalElements || 0}
                  </strong>{' '}
                  sản phẩm
                </p>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown size={13} className="text-slate-400 hidden sm:block" />
                <select
                  aria-label="Sắp xếp sản phẩm"
                  value={`${sort}-${direction}`}
                  onChange={(e) => {
                    const [s, d] = e.target.value.split('-');
                    handleSortChange(s, d);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 hover:border-slate-300 focus:outline-hidden focus:border-slate-400 cursor-pointer"
                >
                  <option value="createdAt-desc">Mới đăng nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>

            {/* Active Filters Row */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {search && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                    Từ khóa: &ldquo;{search}&rdquo;
                    <button type="button" onClick={handleClearSearch} className="text-slate-400 hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeCategory && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                    {activeCategory.name}
                    <button type="button" onClick={() => handleCategorySelect('')} className="text-slate-400 hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {activeLocker && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                    Tủ: {activeLocker.name}
                    <button type="button" onClick={() => handleLockerSelect('')} className="text-slate-400 hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {listingType && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium">
                    {listingType === 'SALE' ? 'Mua đứt' : 'Cho thuê'}
                    <button type="button" onClick={() => handleListingTypeSelect('')} className="text-slate-400 hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-medium font-mono tabular-nums">
                    {minPrice && maxPrice
                      ? `${Number(minPrice).toLocaleString()}đ – ${Number(maxPrice).toLocaleString()}đ`
                      : minPrice
                        ? `>= ${Number(minPrice).toLocaleString()}đ`
                        : `<= ${Number(maxPrice).toLocaleString()}đ`}
                    <button type="button" onClick={() => handleQuickPrice(undefined, undefined)} className="text-slate-400 hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold ml-1"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Product Grid */}
            <div>
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <ProductCardSkeleton key={idx} />
                  ))}
                </div>
              ) : isError ? (
                <div className="bg-white border border-rose-200 rounded-xl p-10 text-center space-y-3">
                  <p className="text-rose-700 font-semibold text-sm">
                    Không thể tải danh sách sản phẩm lúc này.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Thử lại
                  </button>
                </div>
              ) : productsPage?.content.length === 0 ? (
                <EmptyState
                  icon={<Search size={20} className="text-slate-500" />}
                  title="Không tìm thấy sản phẩm phù hợp"
                  description="Hãy thử nới lỏng khoảng giá, chọn trạm tủ khác hoặc xóa bớt bộ lọc đang áp dụng."
                  action={
                    hasActiveFilters
                      ? { label: 'Xóa toàn bộ bộ lọc', onClick: handleResetFilters }
                      : undefined
                  }
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                  {productsPage?.content.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {productsPage && productsPage.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-6">
                <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() =>
                    setSearchParams((prev) => {
                      prev.set('page', (page - 1).toString());
                      return prev;
                    })
                  }
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Trước
                </button>

                {Array.from({ length: productsPage.totalPages }).map((_, idx) => {
                  if (
                    idx === 0 ||
                    idx === productsPage.totalPages - 1 ||
                    Math.abs(idx - page) <= 1
                  ) {
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() =>
                          setSearchParams((prev) => {
                            prev.set('page', idx.toString());
                            return prev;
                          })
                        }
                        className={`min-w-9 h-9 rounded-lg text-xs font-semibold font-mono tabular-nums transition ${
                          page === idx
                            ? 'bg-slate-900 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  }
                  if (idx === 1 && page > 2) {
                    return <span key={idx} className="text-slate-400 text-xs px-1">...</span>;
                  }
                  if (idx === productsPage.totalPages - 2 && page < productsPage.totalPages - 3) {
                    return <span key={idx} className="text-slate-400 text-xs px-1">...</span>;
                  }
                  return null;
                })}

                <button
                  type="button"
                  disabled={page >= productsPage.totalPages - 1}
                  onClick={() =>
                    setSearchParams((prev) => {
                      prev.set('page', (page + 1).toString());
                      return prev;
                    })
                  }
                  className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
