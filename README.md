# CampusHub Frontend (Web & PWA)

> Giao diện Web và Progressive Web App (PWA) cho nền tảng mua bán, cho thuê đồ dùng sinh viên P2P tích hợp thanh toán PayOS QR, định danh eKYC và bàn giao qua Smart Locker 24/7.

[![CampusHub Frontend CI](https://github.com/canhhocit/CampusHub-Frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/canhhocit/CampusHub-Frontend/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8.svg)](https://tailwindcss.com/)

**Hệ sinh thái CampusHub:** **CampusHub-Frontend** | [CampusHub-Backend](https://github.com/canhhocit/CampusHub-Backend) | [CampusHub-OCR](https://github.com/canhhocit/CampusHub-OCR)

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng chính](#tính-năng-chính)
- [Tech Stack](#tech-stack)
- [Cấu trúc thư mục & Tuyến trang](#cấu-trúc-thư-mục--tuyến-trang)
- [Cài đặt và chạy cục bộ](#cài-đặt-và-chạy-cục-bộ)
- [Progressive Web App (PWA)](#progressive-web-app-pwa)
- [Kiểm thử, Linter và CI](#kiểm-thử-linter-và-ci)
- [Lưu ý mô phỏng Smart Locker](#lưu-ý-mô-phỏng-smart-locker)

---

## Tổng quan

**CampusHub Frontend** là ứng dụng đơn trang (SPA) hỗ trợ cài đặt như ứng dụng gốc trên di động/desktop (**PWA**). Ứng dụng kết nối trực tiếp tới `CampusHub-Backend` qua REST API với cơ chế tự động làm mới JWT Access Token khi hết hạn và lazy-loading theo từng nhóm trang để tối ưu tốc độ tải trên mạng di động.

---

## Tính năng chính

### Sinh viên (Buyer / Seller)
- **Marketplace mua bán & cho thuê:** Tìm kiếm, lọc theo danh mục, khoảng giá, hình thức giao dịch (Mua / Thuê theo ngày), phương thức bàn giao (Smart Locker / Gặp trực tiếp) và bản đồ vị trí tủ đồ (Leaflet).
- **Quản lý tin đăng & Lưu sản phẩm:** Đăng tin mới (`/marketplace/new`), chỉnh sửa (`/marketplace/edit/:id`), tải đa ảnh/video qua API upload an toàn của Backend, và đánh dấu lưu sản phẩm với hiệu ứng phản hồi mượt trên cả Web & PWA.
- **Định danh sinh viên eKYC (`/verify-identity`):**
  - Quét nhanh mã QR trên CCCD (client-side `jsqr`) hoặc chụp ảnh mặt trước/sau.
  - Hướng dẫn quay đầu kiểm tra thực thể sống (Active Liveness + Passive Anti-Spoofing) qua webcam trước khi gửi về Backend đối soát với `CampusHub-OCR`.
- **Đơn hàng, Thanh toán PayOS & Đánh giá:**
  - Theo dõi đơn mua (`/orders/buying`), đơn bán (`/orders/selling`) và chi tiết từng bước (`/orders/:id`).
  - Quét mã QR PayOS để thanh toán trực tiếp, theo dõi trạng thái giải ngân và gửi khiếu nại/đánh giá khi phát sinh sự cố.
- **Ví cá nhân (`/wallet`) & Hồ sơ (`/profile`):**
  - Xem số dư khả dụng, lịch sử biến động, liên kết tài khoản ngân hàng và gửi yêu cầu rút tiền.

### Kiosk Tủ đồ (`/kiosk`)
- Giao diện độc lập mô phỏng màn hình cảm ứng tại trạm Smart Locker để người bán gửi hàng và người mua nhập mã PIN 6 chữ số nhận đồ.

### Quản trị viên (`/admin/*`)
- **Dashboard (`/admin/dashboard`):** Theo dõi doanh thu phí sàn, tăng trưởng người dùng và đơn hàng.
- **Quản lý người dùng & Duyệt eKYC (`/admin/users`):** Xem hồ sơ CCCD, khóa/mở tài khoản.
- **Quản lý Smart Locker (`/admin/lockers`):** Tạo trạm tủ mới, cấu hình tọa độ bản đồ, giám sát trạng thái từng ngăn tủ (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).
- **Xử lý rút tiền & Khiếu nại (`/admin/payouts`, `/admin/disputes`):** Phê duyệt lệnh chi và giải quyết tranh chấp.
- **Nhật ký hệ thống (`/admin/audit`):** Truy vết sự kiện bảo mật và giao dịch.

---

## Tech Stack

| Thành phần | Công nghệ / Thư viện | Phiên bản |
|---|---|---|
| Core UI | React + TypeScript | React `19.2`, TypeScript `~6.0` |
| Build & PWA | Vite + `vite-plugin-pwa` (Workbox) | Vite `8.3`, `vite-plugin-pwa` `2.0` |
| Styling | Tailwind CSS + PostCSS + Lucide React | Tailwind `v4.3` |
| Data Fetching | TanStack React Query + Axios | React Query `5.104`, Axios `1.20` |
| Routing | React Router DOM | `7.18` |
| Form & Validation | React Hook Form + Zod | RHF `7.89`, Zod `4.6` |
| Tiện ích chuyên biệt | `leaflet` (bản đồ tủ), `jsqr` (quét QR CCCD) | `leaflet` `1.9.4`, `jsqr` `1.4.0` |
| Chất lượng mã & Test | Oxlint + Node.js Native Test Runner | `oxlint` `1.81` |

---

## Cấu trúc thư mục & Tuyến trang

```text
CampusHub-Frontend/
├── .github/workflows/ci.yml        # CI: oxlint + node tests + vite build
├── .env.example                    # VITE_API_BASE_URL
├── vite.config.ts                  # Cấu hình Vite + Manifest & Workbox PWA
├── package.json
├── public/                         # Icons & tài nguyên tĩnh PWA
├── tests/                          # Empirical & Auth refresh tests (*.test.mjs)
└── src/
    ├── api/                        # Axios interceptors, identityApi, userApi, upload
    ├── components/                 # Layout, Navbar, MobileBottomNav, Admin, Dispute, Review
    ├── contexts/                   # AuthContext (trạng thái đăng nhập & session refresh)
    ├── hooks/                      # Custom hooks (usePendingSellingOrders, ...)
    ├── pages/                      # admin/, auth/, kiosk/, marketplace/, orders/, profile/, wallet/
    ├── types/                      # TypeScript interfaces theo từng module nghiệp vụ
    └── utils/                      # cccdQrParser & helpers
```

---

## Cài đặt và chạy cục bộ

### Yêu cầu môi trường

- **Node.js `22.x`** (khớp với cờ `--experimental-strip-types` của `npm test` và môi trường CI)
- **Backend API:** `CampusHub-Backend` đang chạy (mặc định tại `http://localhost:8080`)

### Cấu hình và khởi chạy

```bash
git clone https://github.com/canhhocit/CampusHub-Frontend.git
cd CampusHub-Frontend
cp .env.example .env
npm ci
npm run dev
```

- Ứng dụng khả dụng tại: `http://localhost:5173`
- Biến môi trường duy nhất cần khai báo trong `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

> Lưu ý: Frontend không giữ API key bí mật của Cloudinary hay OCR; mọi tác vụ tải ảnh và eKYC đều đi qua API có xác thực tại `CampusHub-Backend`.

---

## Progressive Web App (PWA)

Cấu hình trong [`vite.config.ts`](vite.config.ts) tích hợp `vite-plugin-pwa` với chế độ `registerType: 'autoUpdate'`:

- Tự động sinh Web App Manifest (`CampusHub`, `display: standalone`, icon `192x192` & `512x512` `any maskable`) và Service Worker (`Workbox`) cho phép cài đặt lên màn hình chính điện thoại/desktop.
- Precache tài nguyên tĩnh (`js, css, html, ico, png, svg, woff, woff2`) và cache font qua `CacheFirst`.
- Kiểm thử bản build PWA cục bộ:

```bash
npm run build
npm run preview
```

---

## Kiểm thử, Linter và CI

```bash
# Kiểm tra lint với Oxlint
npm run lint

# Chạy bộ test tự động (Node native test runner)
npm test

# Kiểm tra TypeScript (tsc -b) và build production + PWA bundle
npm run build
```

Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) chạy lần lượt `npm ci` -> `npm run lint` -> `npm test` -> `npm run build` trên `ubuntu-latest` (Node.js 22) mỗi khi `push` hoặc mở `pull_request` vào nhánh `main`.

---

## Lưu ý mô phỏng Smart Locker

- Ở giai đoạn hiện tại, giao diện Kiosk (`/kiosk`) và các thao tác mở ngăn tủ/gửi hàng trong khu vực Admin tương tác với **Mock Device Simulation** từ Backend. Các nút thao tác phần cứng đều được gắn nhãn `[MÔ PHỎNG / SIMULATED]` để tách biệt rõ ràng với kết nối phần cứng IoT thực tế.

---

## Tác giả

- **Dự án:** CampusHub
- **Phát triển:** Phạm Hữu Cảnh
