# CampusHub — Frontend Web Application

Nền tảng thương mại điện tử sinh viên P2P (Peer-to-Peer Marketplace) kết hợp bàn giao qua hệ thống tủ đồ thông minh (Smart Locker) và gặp mặt trực tiếp.

---

## 1. Công nghệ sử dụng

- **Core**: React 19, TypeScript 5+, Vite 8
- **Styling**: Tailwind CSS v4 (Design tokens: Terracotta `#eb6e34`, Slate neutrals)
- **State & Data Fetching**: TanStack React Query v5
- **Routing**: React Router v7
- **Forms & Validation**: React Hook Form, Zod
- **Icons**: Lucide React
- **Linter & Test**: Oxlint, Node.js Native Test Runner

---

## 2. Yêu cầu môi trường

- **Node.js**: >= 20.x
- **Backend API**: CampusHub Spring Boot Monolith (`http://localhost:8080`)

---

## 3. Cài đặt và khởi chạy

### Cài đặt dependencies:
```bash
npm install
```

### Khởi chạy môi trường phát triển (Dev server):
```bash
npm run dev
```
Ứng dụng sẽ khả dụng tại: `http://localhost:5173`

### Chạy kiểm thử tự động (Unit / Auth Refresh Tests):
```bash
npm run test
```

### Kiểm tra cú pháp và chất lượng mã nguồn (Linter):
```bash
npm run lint
```

### Biên dịch và đóng gói kiểm tra sản phẩm (Production Build):
```bash
npm run build
```

---

## 4. Hướng dẫn trải nghiệm & Demo luồng nghiệp vụ

### A. Người dùng thông thường (Sinh viên)
1. **Khám phá Marketplace**:
   - Truy cập trang chủ `/` để xem danh sách sản phẩm.
   - Sử dụng bộ lọc theo danh mục, khoảng giá, tình trạng hàng, phương thức bàn giao (Gặp trực tiếp hoặc Smart Locker).
2. **Đăng tin bán / Cho thuê sản phẩm**:
   - Vào `/marketplace/create` (yêu cầu đăng nhập).
   - Điền thông tin tiêu đề, mô tả, danh mục, giá bán hoặc giá thuê theo ngày, tiền cọc.
   - Tải lên hình ảnh mô tả thực tế.
3. **Mua / Thuê sản phẩm & Bàn giao qua Smart Locker**:
   - Vào chi tiết sản phẩm `/marketplace/:id`, nhấn nút Đặt mua hoặc Thuê.
   - Chọn phương thức bàn giao qua Smart Locker và địa điểm tủ mong muốn.
   - Chờ người bán xác nhận đơn và gửi hàng vào tủ đồ.
4. **Theo dõi đơn hàng & Nhận hàng**:
   - Quản lý đơn mua tại `/orders/buying` và đơn bán tại `/orders/selling`.
   - Xem chi tiết tại `/orders/:id`. Khi hàng đã được đưa vào tủ, người mua nhận mã PIN bảo mật để mở ngăn tủ.

### B. Quản trị viên (Admin)
- Truy cập khu vực quản trị tại `/admin` (tài khoản vai trò `ADMIN`).
- **Tổng quan hệ thống (Overview)**: Giám sát doanh thu phí, số lượng tin đăng, người dùng và đơn hàng.
- **Quản lý người dùng (Users)**: Xem danh sách thành viên, khóa/mở khóa tài khoản, duyệt hồ sơ CCCD/CMND sinh viên.
- **Quản lý Tủ đồ thông minh (Lockers & Compartments)**:
  - Xem danh sách tủ đồ và ngăn tủ tại `/admin/lockers`.
  - Giám sát trạng thái từng ngăn: TRỐNG (AVAILABLE), ĐANG GIỮ HÀNG (OCCUPIED), BẢO TRÌ (MAINTENANCE).
  - Thử nghiệm lệnh gửi hàng, mở tủ [MÔ PHỎNG / SIMULATED].
- **Cấu hình phí & Media**: Tùy chỉnh tỷ lệ phí sàn, phí thuê theo ngày, số lượng ảnh/video tối đa.
- **Audit Logs**: Truy vết toàn bộ nhật ký sự kiện bảo mật, giao dịch và phân quyền.

---

## 5. Lưu ý về Smart Locker [Mô phỏng IoT]

- Giai đoạn hiện tại hệ thống sử dụng **Mock Device Simulation** để mô phỏng tương tác phần cứng tủ đồ thông minh.
- Tất cả các nút bấm mở ngăn tủ, gửi hàng hoặc giải phóng ngăn đều được dán nhãn `[MÔ PHỎNG / SIMULATED]` nhằm đảm bảo tính minh bạch giữa dữ liệu mô phỏng và phần cứng vật lý trong tương lai.

---

## 6. Bản quyền & Tác giả

- **Dự án**: CampusHub (Đồ án tốt nghiệp / Khóa luận tốt nghiệp)
- **Tác giả / Phát triển**: Phạm Hữu Cảnh
