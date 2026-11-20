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
    if (diffInHours < 24) return `${diffInHours}h trước`;
    if (diffInHours < 48) return 'Hôm qua';
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <Link
      to={`/marketplace/${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Product Image Area with 1:1 Aspect Ratio (Crisp, Uncluttered) */}
      <div className="aspect-square bg-slate-100/80 relative overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-200/70 flex items-center justify-center">
              <ImageOff size={22} className="text-slate-400" />
            </div>
            <span className="text-[11px] font-medium text-slate-500 font-mono">Chưa có ảnh</span>
          </div>
        )}

        {/* Minimal Top Badges (UI/UX Pro Max Mono Pills) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-white/95 backdrop-blur-md text-slate-800 shadow-xs truncate max-w-[120px] border border-slate-200/90">
            {product.category?.name || 'Khác'}
          </span>
          {product.listingType === 'BOTH' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-slate-900 text-white shadow-xs">
              Cho thuê
            </span>
          )}
        </div>

        {/* Status Overlay if not active */}
        {product.status === 'SOLD' && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-rose-600 text-white shadow-md">
              ĐÃ BÁN
            </span>
          </div>
        )}
        {product.status === 'HIDDEN' && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-slate-800 text-white shadow-md">
              TẠM ẨN
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
        <div className="space-y-1.5">
          {/* Smart Locker Location */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono font-medium truncate">
            <Lock size={12} className="text-emerald-600 shrink-0" />
            <span className="truncate">{product.locker?.name || 'Smart Locker'}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Price with High-Contrast Typography */}
          <div className="pt-0.5 flex flex-wrap items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.listingType === 'BOTH' && product.rentPricePerDay && (
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded">
                Thuê: {formatPrice(product.rentPricePerDay)}/ngày
              </span>
            )}
          </div>
        </div>

        {/* Seller Info & Meta */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs text-slate-600 gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 truncate max-w-[120px] sm:max-w-[150px]">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">
              {product.owner?.fullName?.charAt(0) || product.owner?.username?.charAt(0) || 'U'}
            </div>
            <span className="truncate font-medium text-slate-700">
              {product.owner?.fullName || product.owner?.username || 'Sinh viên'}
            </span>
            {product.owner?.identityVerified && (
              <span title="Đã duyệt CCCD bảo chứng" className="text-emerald-600 shrink-0">
                <ShieldCheck size={13} className="text-emerald-600" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400 shrink-0 text-[10px] sm:text-[11px]">
            <Clock size={11} />
            <span className="font-mono">{formatDate(product.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
