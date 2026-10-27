import { Link } from 'react-router-dom';
import type { Product } from '../types/marketplace';
import { ImageOff, ShieldCheck, Lock, Clock } from 'lucide-react';

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
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <Link
      to={`/marketplace/${product.id}`}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 transition-all flex flex-col h-full"
    >
      {/* Product Image (1:1 Ratio) */}
      <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
            <ImageOff size={28} className="text-slate-300" />
            <span className="text-[11px] font-medium">Chưa có ảnh</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900/70 backdrop-blur-xs text-white shadow-2xs truncate max-w-[120px]">
            {product.category?.name || 'Khác'}
          </span>
          {product.listingType === 'BOTH' && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-700/90 backdrop-blur-xs text-white shadow-2xs">
              Cho thuê
            </span>
          )}
        </div>

        {/* Smart Locker Delivery Pill with Location */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-800/85 backdrop-blur-xs text-white shadow-2xs max-w-full truncate">
            <Lock size={10} className="text-white shrink-0" />
            <span className="truncate">{product.locker?.name || 'Smart Locker'}</span>
          </span>
        </div>

        {/* Status Overlay if not active */}
        {product.status === 'SOLD' && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-rose-600 text-white shadow-xs">
              ĐÃ BÁN
            </span>
          </div>
        )}
        {product.status === 'HIDDEN' && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-slate-800 text-white shadow-xs">
              TẠM ẨN
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Title with line clamp */}
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Price (Oreka fresh green prominent price) */}
          <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold text-emerald-700 tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.listingType === 'BOTH' && product.rentPricePerDay && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                Thuê: {formatPrice(product.rentPricePerDay)}/ngày
              </span>
            )}
          </div>
        </div>

        {/* Seller Info & Meta */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-1.5 truncate max-w-[140px]">
            <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[9px] shrink-0">
              {product.owner?.fullName?.charAt(0) || product.owner?.username?.charAt(0) || 'U'}
            </div>
            <span className="truncate font-medium text-slate-700">
              {product.owner?.fullName || product.owner?.username || 'Sinh viên'}
            </span>
            {product.owner?.identityVerified && (
              <span title="Đã xác minh CCCD">
                <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <Clock size={11} />
            <span>{formatDate(product.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
