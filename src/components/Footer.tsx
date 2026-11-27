import { Link } from 'react-router-dom';
import { BrandMark } from './common/BrandMark';
import { Lock, ShieldCheck, CreditCard } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/90 text-slate-600 font-sans mt-auto">
      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <BrandMark size="sm" tone="dark" />
              <span className="font-display font-bold text-slate-900 text-base tracking-tight">
                Campus<span className="text-emerald-600">Hub</span>
              </span>
            </Link>

            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed max-w-md">
              Nền tảng mua bán và cho thuê đồ dùng học tập dành riêng cho sinh viên. Giao dịch ký quỹ minh bạch qua PayOS và nhận đồ chủ động 24/7 tại hệ thống tủ Smart Locker trong khuôn viên trường.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                Ký quỹ Escrow
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock size={14} className="text-emerald-600" />
                Smart Locker 24/7
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CreditCard size={14} className="text-emerald-600" />
                VietQR &amp; PayOS
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Khám phá
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/marketplace" className="text-slate-500 hover:text-slate-950 transition-colors">
                  Chợ sinh viên
                </Link>
              </li>
              <li>
                <Link to="/marketplace?listingType=BOTH" className="text-slate-500 hover:text-slate-950 transition-colors">
                  Đồ cho thuê
                </Link>
              </li>
              <li>
                <Link to="/marketplace/new" className="text-slate-500 hover:text-slate-950 transition-colors">
                  Đăng tin bán
                </Link>
              </li>
              <li>
                <Link to="/kiosk" className="text-slate-500 hover:text-slate-950 transition-colors">
                  Màn hình Kiosk tủ đồ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Hướng dẫn
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/about-guide" className="text-slate-500 hover:text-slate-950 transition-colors">
                  Tổng quan nền tảng
                </Link>
              </li>
              <li>
                <Link to="/about-guide#how-it-works" className="text-slate-500 hover:text-slate-950 transition-colors">
                  Quy trình Smart Locker
                </Link>
              </li>
              <li>
                <Link to="/verify-identity" className="text-slate-500 hover:text-slate-950 transition-colors">
                  Xác thực CCCD eKYC
                </Link>
              </li>
              <li>
                <Link to="/about-guide#faq" className="text-slate-500 hover:text-slate-950 transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Trust */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Tài khoản &amp; Hỗ trợ
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
              <p className="font-medium text-slate-800">
                Tiền giao dịch luôn được giữ an toàn cho đến khi người mua mở tủ nhận hàng.
              </p>
              <p className="text-[11px] text-slate-500">
                Liên hệ hỗ trợ sinh viên: <span className="font-medium text-slate-700">support@campushub.vn</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/80 bg-slate-50/70 py-4">
        <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>CampusHub — Nền tảng trao đổi đồ dùng học tập &amp; Smart Locker</span>
          <span>© 2026 CampusHub</span>
        </div>
      </div>
    </footer>
  );
};
