import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Sparkles,
  UserCheck,
  ShoppingBag,
  Send,
} from 'lucide-react';

export const AboutGuide = () => {
  const [activeRoleTab, setActiveRoleTab] = useState<'buyer' | 'seller'>('buyer');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Hệ thống Smart Locker hoạt động như thế nào?',
      a: 'Sau khi người mua thanh toán đơn hàng qua PayOS, hệ thống sẽ tự động gán một ngăn tủ Locker tại vị trí người bán chọn. Người bán nhận mã PIN gửi đồ để đặt hàng vào ngăn tủ. Khi đồ đã nằm trong tủ, người mua sẽ nhận được mã PIN lấy đồ 6 số để tự đến mở tủ lấy hàng 24/7 mà không cần gặp mặt.',
    },
    {
      q: 'Tiền của tôi có được an toàn khi mua hàng không?',
      a: 'Hoàn toàn an toàn! CampusHub áp dụng cơ chế thanh toán tạm giữ Escrow: Tiền của người mua sẽ được hệ thống giữ an toàn và chỉ chuyển cho người bán sau khi người mua mở tủ kiểm tra và nhận hàng thành công. Nếu người bán không gửi đồ đúng hẹn, hệ thống sẽ tự động hoàn 100% tiền cho người mua.',
    },
    {
      q: 'Quy trình thuê đồ và hoàn tiền cọc diễn ra thế nào?',
      a: 'Khi thuê đồ, bạn chỉ cần trả phí thuê tính theo ngày và một khoản tiền cọc đảm bảo. Khi hết thời hạn thuê, bạn mang đồ gửi lại vào trạm tủ Smart Locker. Người cho thuê nhận lại đồ và kiểm tra, sau đó hệ thống sẽ tự động hoàn trả 100% tiền cọc về tài khoản của bạn.',
    },
    {
      q: 'Tại sao tôi cần xác minh danh tính bằng CCCD?',
      a: 'Để đảm bảo an toàn tuyệt đối cho cộng đồng sinh viên, loại trừ tài khoản ảo, lừa đảo và gian lận. Hệ thống tích hợp camera quét mã QR trên thẻ CCCD theo chuẩn Bộ Công an, giúp xác thực danh tính nhanh chóng, không lưu giữ ảnh thô nhạy cảm.',
    },
    {
      q: 'Tôi có thể đến lấy đồ vào ban đêm hoặc cuối tuần không?',
      a: 'Có! Hệ thống tủ Smart Locker đặt tại các sảnh chính Tòa nhà A, Thư viện và Ký túc xá hoạt động tự động 24/7. Bạn có thể đến nhập mã PIN mở tủ lấy đồ bất kỳ lúc nào thuận tiện trong thời hạn nhận hàng.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pb-16">
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-b from-orange-50/80 via-amber-50/30 to-transparent border-b border-orange-100 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-100/90 text-orange-800 border border-orange-200">
            <Sparkles size={14} className="text-[#eb6e34]" />
            Nền tảng Công nghệ & Tiện ích Thông minh Sinh viên
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Giải pháp Mua bán, Cho thuê Đồ dùng & Giao nhận qua{' '}
            <span className="text-[#eb6e34]">Smart Locker</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            CampusHub kết nối cộng đồng sinh viên trao đổi giáo trình, máy tính và đồ dùng KTX.
            Tự động hóa giao nhận 24/7 không cần gặp mặt, bảo đảm thanh toán 100% qua Escrow.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/marketplace"
              className="px-6 py-3 bg-[#eb6e34] hover:bg-[#d85e25] text-white rounded-xl text-sm font-bold shadow-xs transition flex items-center gap-2"
            >
              <ShoppingBag size={17} />
              Khám phá Chợ đồ cũ
            </Link>
            <Link
              to="/marketplace/new"
              className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <Send size={16} />
              Đăng tin thanh lý ngay
            </Link>
          </div>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 max-w-4xl mx-auto text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#eb6e34] flex items-center justify-center font-bold">
                <Lock size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Giao nhận Tủ Smart Locker</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Người bán gửi đồ vào ngăn tủ, người mua tự nhập mã PIN lấy đồ 24/7. Không tốn thời gian hẹn gặp.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Thanh toán Bảo đảm Escrow</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tiền được hệ thống tạm giữ an toàn. Chỉ giải ngân cho người bán khi người mua đã kiểm tra và nhận đồ.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <UserCheck size={20} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Xác minh Danh tính CCCD</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Công nghệ quét mã QR CCCD chuẩn hóa, đảm bảo mọi thành viên giao dịch đều là sinh viên thật.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Giới thiệu dự án & Tác giả */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold text-[#eb6e34] uppercase tracking-wider block">
                Về Dự Án & Sứ Mệnh
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Tái sinh vòng đời đồ dùng sinh viên — Văn minh, Tiết kiệm & Tự động hóa
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Mỗi kỳ học kết thúc, hàng nghìn cuốn giáo trình đại cương, sách bài tập, máy tính cầm tay và đồ dùng sinh hoạt KTX còn mới nguyên nhưng không còn nhu cầu sử dụng. Ngược lại, tân sinh viên lại phải bỏ ra chi phí lớn để mua mới.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                <strong>CampusHub</strong> ra đời để kết nối hai nhu cầu đó, đồng thời loại bỏ rào cản lớn nhất: <em>sự bất tiện và rủi ro khi hẹn gặp mặt trực tiếp</em>. Bằng việc ứng dụng mạng lưới tủ <strong>Smart Locker</strong> đặt ngay tại sảnh KTX và giảng đường, việc trao đổi đồ dùng trở nên đơn giản như nhận bưu phẩm tự động.
              </p>
            </div>

            {/* Author Card: Pham Huu Canh */}
            <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4">
                <div className="w-12 h-12 rounded-xl bg-[#eb6e34] text-white flex items-center justify-center font-black text-lg shadow-xs">
                  C
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Phạm Hữu Cảnh</h3>
                  <span className="text-xs text-orange-300 font-medium block">
                    Tác giả & Nhà phát triển hệ thống
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Khoa Công nghệ Thông tin
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Xây dựng kiến trúc Full-Stack Spring Boot & React</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Tích hợp hệ thống IoT Smart Locker & QR CCCD</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Cổng thanh toán tự động PayOS & VietQR</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 text-center">
                <span className="text-[11px] text-slate-400">
                  Email: <strong className="text-slate-200">canh.ph@campushub.vn</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quy trình & Hướng dẫn sử dụng chi tiết (Step-by-Step Guide) */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center space-y-3 mb-8">
          <span className="text-xs font-bold text-[#eb6e34] uppercase tracking-wider block">
            Hướng dẫn sử dụng
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quy trình giao nhận qua Smart Locker trong 4 bước
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Lựa chọn vai trò của bạn để xem hướng dẫn từng bước cụ thể
          </p>

          {/* Role Tabs */}
          <div className="inline-flex p-1 bg-slate-200 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveRoleTab('buyer')}
              className={`px-5 py-2 rounded-lg transition ${
                activeRoleTab === 'buyer'
                  ? 'bg-white text-[#eb6e34] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dành cho Người Mua / Thuê đồ
            </button>
            <button
              onClick={() => setActiveRoleTab('seller')}
              className={`px-5 py-2 rounded-lg transition ${
                activeRoleTab === 'seller'
                  ? 'bg-white text-[#eb6e34] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dành cho Người Bán / Cho thuê
            </button>
          </div>
        </div>

        {/* Tab Content: Buyer */}
        {activeRoleTab === 'buyer' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Tìm kiếm & Lọc món đồ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vào trang Chợ, sử dụng bộ lọc Shopee để tìm theo mức giá, danh mục, hoặc trạm tủ Locker gần bạn nhất.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Đặt hàng & Thanh toán QR</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bấm Đặt mua hoặc Chọn ngày thuê. Quét mã QR PayOS để thanh toán. Tiền được lưu giữ an toàn trong hệ thống Escrow.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Nhận mã PIN mở tủ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sau khi người bán mang đồ gửi vào tủ, hệ thống lập tức gửi mã PIN lấy hàng 6 số bảo mật vào trang chi tiết đơn hàng của bạn.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Mở tủ nhận đồ 24/7</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đến vị trí tủ Smart Locker, nhập mã PIN để mở ngăn tủ và lấy đồ. (Nếu là đồ thuê, mang trả lại tủ khi hết hạn để nhận lại cọc).
              </p>
            </div>
          </div>
        ) : (
          /* Tab Content: Seller */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Xác thực CCCD chính chủ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đăng nhập và quét mã QR trên thẻ CCCD để kích hoạt quyền đăng bán. Hoàn tất trong 30 giây.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Đăng tin & Chọn tủ Locker</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tải ảnh sản phẩm, điền giá bán/thuê và chọn vị trí trạm tủ Locker thuận tiện nhất với bạn để gửi hàng.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Mang đồ đặt vào ngăn tủ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Khi có người mua thanh toán, bạn nhận mã PIN gửi đồ. Mang đồ ra tủ Locker, nhập mã để mở ngăn và đặt đồ vào trong.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#eb6e34] font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Nhận tiền tự động</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ngay khi người mua đến mở tủ lấy đồ thành công, tiền bán hàng lập tức được giải ngân tự động về tài khoản của bạn.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 4. Mạng lưới trạm tủ Smart Locker */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
              Hệ Sinh Thái Phần Cứng
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Mạng Lưới Tủ Smart Locker trong Khuôn Viên
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Các trạm tủ được bố trí tại những điểm nút sinh hoạt chính của sinh viên, mở cửa 24/7 có camera giám sát và khóa điện tử tự động.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HOẠT ĐỘNG 24/7
                </span>
                <span className="text-xs font-mono text-slate-400">LK-A1</span>
              </div>
              <h4 className="font-bold text-white text-base">Tủ Khu A - Tầng 1</h4>
              <p className="text-xs text-slate-400">Sảnh chính Tòa nhà A, Giảng đường Trung tâm</p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HOẠT ĐỘNG 24/7
                </span>
                <span className="text-xs font-mono text-slate-400">LK-B2</span>
              </div>
              <h4 className="font-bold text-white text-base">Tủ Thư Viện - Tầng 2</h4>
              <p className="text-xs text-slate-400">Khu tự học Thư viện Trung tâm sinh viên</p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HOẠT ĐỘNG 24/7
                </span>
                <span className="text-xs font-mono text-slate-400">LK-C1</span>
              </div>
              <h4 className="font-bold text-white text-base">Tủ Ký Túc Xá C1</h4>
              <p className="text-xs text-slate-400">Sảnh Ký túc xá Khu B, Tòa nhà C1</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Câu hỏi thường gặp (FAQ) */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#eb6e34] uppercase tracking-wider block">
            Hỗ Trợ & Giải Đáp
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Câu Hỏi Thường Gặp (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-slate-900 font-bold text-sm hover:text-[#eb6e34] transition"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-[#eb6e34] shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform text-slate-400 ${
                      isOpen ? 'rotate-180 text-[#eb6e34]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-gradient-to-r from-orange-500 to-[#eb6e34] rounded-3xl p-8 sm:p-12 text-white text-center space-y-4 shadow-md">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Sẵn sàng trải nghiệm CampusHub ngay hôm nay?
          </h2>
          <p className="text-orange-100 text-xs sm:text-base max-w-xl mx-auto leading-relaxed">
            Tham gia cộng đồng sinh viên thông minh, trao gửi đồ dùng và trải nghiệm giao nhận Smart Locker 24/7 an tâm tuyệt đối.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              to="/marketplace"
              className="px-6 py-3 bg-white text-[#eb6e34] hover:bg-orange-50 rounded-xl text-sm font-bold shadow-xs transition"
            >
              Xem ngay các món đồ đang bán & cho thuê
            </Link>
            <Link
              to="/marketplace/new"
              className="px-6 py-3 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-xl text-sm font-semibold transition border border-white/20"
            >
              Đăng tin thanh lý đầu tiên
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
