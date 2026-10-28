import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Lock,
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 font-sans mt-auto">
      {/* Main Footer Content */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
          {/* Column 1: Brand & Contact Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs group-hover:bg-emerald-700 transition">
                <Package size={18} />
              </div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                CampusHub
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Nền tảng công nghệ trao đổi, mua bán và cho thuê đồ dùng sinh viên hàng đầu. 
              Đặt đồ an toàn, nhanh chóng, minh bạch và tiện lợi qua mạng lưới Smart Locker.
            </p>

            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Trụ sở chính: Khuôn viên Đại học Bách Khoa / Ký túc xá Đại học Quốc gia, Cầu Giấy, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-600 shrink-0" />
                <span>Hotline: <strong className="text-slate-900 font-semibold">1900 6868</strong> (8:00 – 22:00 hàng ngày)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-600 shrink-0" />
                <span>Email hỗ trợ: <strong className="text-slate-900 font-semibold">support@campushub.vn</strong></span>
              </div>
            </div>
          </div>

          {/* Column 2: Liên kết nhanh (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-slate-600 hover:text-emerald-700 transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/about-guide" className="text-slate-600 hover:text-emerald-700 transition font-medium text-emerald-800">
                  Giới thiệu & Hướng dẫn sử dụng
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-slate-600 hover:text-emerald-700 transition">
                  Sàn đồ cũ sinh viên
                </Link>
              </li>
              <li>
                <Link to="/marketplace/new" className="text-slate-600 hover:text-emerald-700 transition">
                  Đăng tin bán / cho thuê
                </Link>
              </li>
              <li>
                <Link to="/about-guide#how-it-works" className="text-slate-600 hover:text-emerald-700 transition">
                  Quy trình tủ Smart Locker
                </Link>
              </li>
              <li>
                <Link to="/about-guide#faq" className="text-slate-600 hover:text-emerald-700 transition">
                  Trung tâm trợ giúp & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Đội ngũ phát triển (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Đội ngũ phát triển
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  C
                </div>
                <div>
                  <strong className="text-slate-900 font-bold block text-sm">
                    Phạm Hữu Cảnh
                  </strong>
                  <span className="text-[11px] text-slate-500 block">
                    Tác giả & Nhà phát triển
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium block">
                    Full-Stack Engineer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Thanh toán & Giao nhận (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard size={14} className="text-emerald-600" />
              Thanh toán & Giao nhận
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chấp nhận thanh toán trực tuyến bảo đảm qua thẻ nội địa Napas, VietQR, thẻ quốc tế Visa, Mastercard và ví điện tử qua cổng PayOS.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1 text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Lock size={12} className="text-emerald-600" />
                <span>Giao nhận Smart Locker 24/7</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Mở tủ tự động bằng mã PIN bảo mật, tiền được lưu giữ trong hệ thống Escrow đến khi nhận hàng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-slate-200 bg-slate-50/60 py-4">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            CampusHub Team — đem công nghệ và tiện ích đến từng khuôn viên trường đại học.
          </div>
          <div>
            © 2026 CampusHub Inc. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </div>
    </footer>
  );
};
