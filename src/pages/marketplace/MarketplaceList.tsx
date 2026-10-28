import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axios';
import type { PageResponse, Product, Category } from '../../types/marketplace';
import type { Locker } from '../../types/locker';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  RotateCcw,
  MapPin,
  Tag,
  DollarSign,
  X,
  BookOpen,
  Laptop,
  Home,
  Shirt,
  Package,
  Layers,
} from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';

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

  // Local state for inputs
  const [searchInput, setSearchInput] = useState(search);
  const [priceMinInput, setPriceMinInput] = useState(minPrice);
  const [priceMaxInput, setPriceMaxInput] = useState(maxPrice);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync inputs when URL changes
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

  // Fetch Lockers for location filtering
  const { data: lockersPage } = useQuery<PageResponse<Locker>>({
    queryKey: ['lockers-filter'],
    queryFn: () => axiosInstance.get('/api/v1/lockers?size=50').then((res) => res.data),
  });

  const lockers = lockersPage?.content || [];

  // Fetch public active products with all filters
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

  // Quick preset keywords for Shopee-style instant searches
  const quickKeywords = ['Giáo trình', 'Casio', 'IELTS', 'Bàn phím', 'Bàn học', 'Tai nghe'];

  // Category Icon Helper
  const getCategoryIcon = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes('sách') || lower.includes('giáo trình')) return BookOpen;
    if (lower.includes('điện tử') || lower.includes('laptop') || lower.includes('máy tính')) return Laptop;
    if (lower.includes('ktx') || lower.includes('nhà') || lower.includes('gia dụng')) return Home;
    if (lower.includes('thời trang') || lower.includes('quần') || lower.includes('áo') || lower.includes('giày')) return Shirt;
    return Package;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-4 sm:py-6 font-sans">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        {/* 1. Shopee-style Search Header & Quick Chips */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm, giáo trình, máy tính Casio, bàn phím, đồ KTX..."
                  className="w-full pl-10 pr-24 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 focus:border-emerald-500 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition"
                />
                <Search className="absolute left-3.5 text-slate-400" size={17} />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-22 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
                >
                  <Search size={13} />
                  <span>Tìm kiếm</span>
                </button>
              </div>
            </form>

            {/* Mobile Filter Toggle & Post Product Button */}
            <div className="flex items-center gap-2 justify-between md:justify-end">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white"
              >
                <Filter size={14} className="text-emerald-600" />
                <span>Bộ lọc {hasActiveFilters && '•'}</span>
              </button>

              <Link
                to="/marketplace/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs shrink-0"
              >
                <Plus size={16} />
                <span>Đăng bán đồ cũ</span>
              </Link>
            </div>
          </div>

          {/* Quick Keyword Chips */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs text-slate-500">
            <span className="font-semibold text-slate-700 shrink-0">Gợi ý tìm kiếm:</span>
            {quickKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => {
                  setSearchInput(kw);
                  setSearchParams((prev) => {
                    prev.set('search', kw);
                    prev.set('page', '0');
                    return prev;
                  });
                }}
                className={`px-2.5 py-1 rounded-md text-xs transition shrink-0 ${
                  search === kw
                    ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/80'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Main Shopee Two-Column Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Left Sidebar: Shopee-style Filter Pane */}
          <aside
            className={`${
              mobileFilterOpen ? 'block' : 'hidden'
            } md:block md:col-span-4 lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-5`}
          >
            {/* Sidebar Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Filter size={15} className="text-emerald-600" />
                Bộ lọc tìm kiếm
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                >
                  <RotateCcw size={11} /> Xóa tất cả
                </button>
              )}
            </div>

            {/* Filter 1: Danh mục sản phẩm */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                Danh mục
              </span>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                    !categoryId
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers size={14} /> Tất cả danh mục
                  </span>
                  {!categoryId && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                </button>

                {categories?.map((cat) => {
                  const Icon = getCategoryIcon(cat.name);
                  const isSelected = categoryId === cat.id.toString();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id.toString())}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Icon size={14} className={isSelected ? 'text-emerald-700' : 'text-slate-400'} />
                        <span className="truncate">{cat.name}</span>
                      </span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter 2: Địa điểm tủ Smart Locker */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <MapPin size={13} className="text-emerald-600" />
                Địa điểm tủ Locker
              </span>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => handleLockerSelect('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                    !lockerId
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Tất cả các tủ</span>
                  {!lockerId && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                </button>

                {lockers.map((lk) => {
                  const isSelected = lockerId === lk.id.toString();
                  return (
                    <button
                      key={lk.id}
                      onClick={() => handleLockerSelect(lk.id.toString())}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{lk.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{lk.location}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter 3: Hình thức Thuê / Bán */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Tag size={13} className="text-emerald-600" />
                Hình thức giao dịch
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  onClick={() => handleListingTypeSelect('')}
                  className={`px-3 py-1.5 rounded-lg text-left transition border ${
                    !listingType
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Tất cả hình thức
                </button>
                <button
                  onClick={() => handleListingTypeSelect('SALE')}
                  className={`px-3 py-1.5 rounded-lg text-left transition border ${
                    listingType === 'SALE'
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Mua bán đồ cũ
                </button>
                <button
                  onClick={() => handleListingTypeSelect('BOTH')}
                  className={`px-3 py-1.5 rounded-lg text-left transition border ${
                    listingType === 'BOTH'
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cho thuê đồ sinh viên
                </button>
              </div>
            </div>

            {/* Filter 4: Khoảng giá */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <DollarSign size={13} className="text-emerald-600" />
                Khoảng giá (VND)
              </span>

              <form onSubmit={handleApplyPriceFilter} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="Từ đ"
                    value={priceMinInput}
                    onChange={(e) => setPriceMinInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="Đến đ"
                    value={priceMaxInput}
                    onChange={(e) => setPriceMaxInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold uppercase tracking-wider transition shadow-2xs"
                >
                  Áp dụng
                </button>
              </form>

              {/* Quick price presets */}
              <div className="space-y-1 pt-1 text-[11px]">
                <button
                  onClick={() => handleQuickPrice(undefined, 100000)}
                  className={`w-full text-left px-2 py-1 rounded transition ${
                    minPrice === '' && maxPrice === '100000'
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Dưới 100.000đ
                </button>
                <button
                  onClick={() => handleQuickPrice(100000, 300000)}
                  className={`w-full text-left px-2 py-1 rounded transition ${
                    minPrice === '100000' && maxPrice === '300000'
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  100.000đ - 300.000đ
                </button>
                <button
                  onClick={() => handleQuickPrice(300000, 500000)}
                  className={`w-full text-left px-2 py-1 rounded transition ${
                    minPrice === '300000' && maxPrice === '500000'
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  300.000đ - 500.000đ
                </button>
                <button
                  onClick={() => handleQuickPrice(500000, undefined)}
                  className={`w-full text-left px-2 py-1 rounded transition ${
                    minPrice === '500000' && maxPrice === ''
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Trên 500.000đ
                </button>
              </div>
            </div>

            {/* Clear All Button */}
            {hasActiveFilters && (
              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw size={13} />
                  <span>Xóa tất cả bộ lọc</span>
                </button>
              </div>
            )}
          </aside>

          {/* Right Column: Product Results & Shopee Sort Toolbar */}
          <main className="col-span-1 md:col-span-8 lg:col-span-9 space-y-3.5">
            {/* Shopee-style Sort Toolbar */}
            <div className="bg-[#ededed] p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-700 font-semibold">Sắp xếp theo:</span>

                {/* Newest Button */}
                <button
                  onClick={() => handleSortChange('createdAt', 'desc')}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    sort === 'createdAt' && direction === 'desc'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  Mới nhất
                </button>

                {/* Priority for Rentals */}
                <button
                  onClick={() => {
                    handleListingTypeSelect(listingType === 'BOTH' ? '' : 'BOTH');
                  }}
                  className={`px-3 py-1.5 rounded-md font-semibold transition ${
                    listingType === 'BOTH'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  Đang cho thuê
                </button>

                {/* Price Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sort === 'price' ? `${sort}-${direction}` : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [s, d] = e.target.value.split('-');
                        handleSortChange(s, d);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-md font-semibold focus:outline-hidden transition cursor-pointer ${
                      sort === 'price'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <option value="" disabled className="bg-white text-slate-800">
                      Giá
                    </option>
                    <option value="price-asc" className="bg-white text-slate-800">
                      Giá: Thấp đến Cao
                    </option>
                    <option value="price-desc" className="bg-white text-slate-800">
                      Giá: Cao đến Thấp
                    </option>
                  </select>
                </div>
              </div>

              {/* Total Elements Summary */}
              <div className="text-slate-600 font-medium">
                Tìm thấy <strong className="text-slate-900 font-bold">{productsPage?.totalElements || 0}</strong> sản phẩm
              </div>
            </div>

            {/* Active Filters Tag Bar (Shopee Style) */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                <span className="text-slate-500 text-[11px] font-medium mr-1">Bộ lọc đang áp dụng:</span>

                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 font-medium">
                    Từ khóa: "{search}"
                    <button onClick={handleClearSearch} className="hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {activeCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 font-medium">
                    Danh mục: {activeCategory.name}
                    <button onClick={() => handleCategorySelect('')} className="hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {activeLocker && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 font-medium">
                    Tủ: {activeLocker.name}
                    <button onClick={() => handleLockerSelect('')} className="hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {listingType && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 font-medium">
                    Hình thức: {listingType === 'SALE' ? 'Mua bán' : 'Cho thuê'}
                    <button onClick={() => handleListingTypeSelect('')} className="hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                )}

                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-slate-800 font-medium">
                    Giá:{' '}
                    {minPrice && maxPrice
                      ? `${Number(minPrice).toLocaleString()}đ - ${Number(maxPrice).toLocaleString()}đ`
                      : minPrice
                      ? `>= ${Number(minPrice).toLocaleString()}đ`
                      : `<= ${Number(maxPrice).toLocaleString()}đ`}
                    <button onClick={() => handleQuickPrice(undefined, undefined)} className="hover:text-rose-600">
                      <X size={12} />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleResetFilters}
                  className="text-xs text-emerald-700 hover:underline font-semibold ml-1"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Product Grid Area */}
            <div>
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
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
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition shadow-2xs"
                  >
                    Thử lại
                  </button>
                </div>
              ) : productsPage?.content.length === 0 ? (
                <div className="bg-white rounded-lg border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <Search size={26} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Không tìm thấy sản phẩm phù hợp
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Hãy thử xóa bớt bộ lọc khoảng giá, địa điểm tủ hoặc thử tìm với từ khóa chung hơn.
                  </p>
                  <div className="pt-2 flex justify-center gap-2.5">
                    {hasActiveFilters && (
                      <button
                        onClick={handleResetFilters}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Xóa toàn bộ bộ lọc
                      </button>
                    )}
                    <Link
                      to="/marketplace/new"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                    >
                      Đăng bán ngay
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                  {productsPage?.content.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

            {/* Shopee-style Pagination */}
            {productsPage && productsPage.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-4">
                <button
                  disabled={page <= 0}
                  onClick={() =>
                    setSearchParams((prev) => {
                      prev.set('page', (page - 1).toString());
                      return prev;
                    })
                  }
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Trước
                </button>

                {Array.from({ length: productsPage.totalPages }).map((_, idx) => {
                  // Show current page, first, last, and immediate neighbors
                  if (
                    idx === 0 ||
                    idx === productsPage.totalPages - 1 ||
                    Math.abs(idx - page) <= 1
                  ) {
                    return (
                      <button
                        key={idx}
                        onClick={() =>
                          setSearchParams((prev) => {
                            prev.set('page', idx.toString());
                            return prev;
                          })
                        }
                        className={`min-w-8 h-8 rounded-md text-xs font-bold transition ${
                          page === idx
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
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
                  disabled={page >= productsPage.totalPages - 1}
                  onClick={() =>
                    setSearchParams((prev) => {
                      prev.set('page', (page + 1).toString());
                      return prev;
                    })
                  }
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Sau
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
