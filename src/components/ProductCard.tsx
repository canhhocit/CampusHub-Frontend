import { Link } from 'react-router-dom';
import type { Product } from '../types/marketplace';
import { ImageOff, ShieldCheck, Lock, Clock, Sparkles } from 'lucide-react';

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
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Product Image Area with 1:1 Aspect Ratio */}
      <div className="aspect-square bg-slate-100/80 relative overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-200/60 flex items-center justify-center">
              <ImageOff size={24} className="text-slate-400" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Chưa có ảnh</span>
          </div>
        )}

        {/* Ambient bottom gradient for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-900/80 backdrop-blur-md text-white shadow-xs truncate max-w-[120px] border border-white/10">
            {product.category?.name || 'Khác'}
          </span>
          {product.listingType === 'BOTH' && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs border border-emerald-400/30 flex items-center gap-1">
              <Sparkles size={10} />
              Cho thuê
            </span>
          )}
        </div>

        {/* Smart Locker Delivery Pill with Active Live Pulse */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-slate-900/85 backdrop-blur-md text-emerald-300 shadow-xs max-w-full truncate border border-emerald-500/20">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Lock size={10} className="text-emerald-400 shrink-0" />
            <span className="truncate font-semibold text-white">{product.locker?.name || 'Smart Locker 24/7'}</span>
          </span>
        </div>

        {/* Status Overlay if not active */}
        {product.status === 'SOLD' && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-lg shadow-rose-900/40">
              ĐÃ BÁN
            </span>
          </div>
        )}
        {product.status === 'HIDDEN' && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-800 text-white shadow-md">
              TẠM ẨN
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Title with line clamp */}
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Price Area */}
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-emerald-600 tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.listingType === 'BOTH' && product.rentPricePerDay && (
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                Thuê: {formatPrice(product.rentPricePerDay)}/ngày
              </span>
            )}
          </div>
        </div>

        {/* Seller Info & Meta */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs text-slate-600 gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 truncate max-w-[120px] sm:max-w-[150px]">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-2xs">
              {product.owner?.fullName?.charAt(0) || product.owner?.username?.charAt(0) || 'U'}
            </div>
            <span className="truncate font-semibold text-slate-700">
              {product.owner?.fullName || product.owner?.username || 'Sinh viên'}
            </span>
            {product.owner?.identityVerified && (
              <span title="Đã duyệt CCCD bảo chứng" className="text-emerald-600 shrink-0">
                <ShieldCheck size={13} className="text-emerald-500 fill-emerald-100" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-400 shrink-0 text-[10px] sm:text-[11px]">
            <Clock size={11} />
            <span>{formatDate(product.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
