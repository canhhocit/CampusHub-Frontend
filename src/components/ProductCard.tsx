import { Link } from 'react-router-dom';
import type { Product } from '../types/marketplace';
import { ImageOff, ShieldCheck, MapPin } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 48) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <Link
      to={`/marketplace/${product.id}`}
      className="group bg-white rounded-xl border border-slate-200/85 hover:border-slate-300 overflow-hidden shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full relative"
    >
      {/* Product Image — Clean 4:3 Editorial Frame */}
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
            <ImageOff size={22} className="text-slate-300" />
            <span className="text-[11px] font-medium text-slate-400">Chưa có hình ảnh</span>
          </div>
        )}

        {/* Restrained Rental Indicator Only When Applicable */}
        {(product.listingType === 'BOTH' || product.listingType === 'RENT') && (
          <div className="absolute top-2.5 left-2.5 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900/85 backdrop-blur-xs text-white">
              {product.listingType === 'RENT' ? 'Cho thuê' : 'Bán & Cho thuê'}
            </span>
          </div>
        )}

        {/* Status Overlay if Inactive */}
        {product.status === 'SOLD' && (
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-rose-600 text-white">
              Đã bán
            </span>
          </div>
        )}
        {product.status === 'HIDDEN' && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-slate-800 text-white">
              Tạm ẩn
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Price First for Fast Scanning */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[15px] sm:text-base font-bold text-slate-950 font-mono tabular-nums tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.listingType === 'BOTH' && product.rentPricePerDay && (
              <span className="text-[11px] font-medium text-emerald-700 font-mono tabular-nums">
                Thuê {formatPrice(product.rentPricePerDay)}/ngày
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-slate-800 text-[13px] sm:text-sm line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Location & Category Meta */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5 truncate">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="truncate">{product.locker?.name || 'Smart Locker KTX'}</span>
            {product.category?.name && (
              <>
                <span className="text-slate-300">·</span>
                <span className="truncate max-w-[120px] text-slate-400">{product.category.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Seller & Posted Time */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-[10px] shrink-0 border border-slate-200/80">
              {product.owner?.fullName?.charAt(0) || product.owner?.username?.charAt(0) || 'U'}
            </div>
            <span className="truncate font-medium text-slate-600">
              {product.owner?.fullName || product.owner?.username || 'Sinh viên'}
            </span>
            {product.owner?.identityVerified && (
              <span title="Đã xác thực CCCD" className="text-emerald-600 shrink-0">
                <ShieldCheck size={13} />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400 shrink-0 text-[10px] sm:text-[11px]">
            <span>{formatDate(product.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
