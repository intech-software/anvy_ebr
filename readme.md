# Anvy EBR

Kho mã nguồn dự án Anvy EBR.

## Cấu trúc thư mục

- `backend/` — NestJS 11, Prisma và MariaDB. API chạy trên cổng `3000`.
- `frontend/` — Next.js 16.1.1 với App Router và Tailwind CSS. Màn hình đăng nhập chạy trên cổng `3002`.

## Cài đặt và chạy

Dùng Node.js 22.13 trở lên trong nhánh Node 22, npm và một database MariaDB hoặc MySQL tên `anvy`. Chạy các lệnh sau từ thư mục gốc của kho mã nguồn trong hai cửa sổ terminal.

**Backend**

```powershell
cd backend
npm.cmd ci
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run start:dev
```

Nếu chưa có `backend/.env`, sao chép `.env.example` thành `.env` trước khi chạy migration. Điền `DATABASE_URL` cho database và đặt `JWT_SECRET` ngẫu nhiên. Có thể tạo giá trị cho `JWT_SECRET` bằng lệnh `node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"`.

Ảnh đại diện trong Hồ sơ cá nhân được lưu trên Cloudinary tại `anvy/avt`. Cấu hình `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` và `CLOUDINARY_API_SECRET` trong `backend/.env`.

**Frontend**

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev
```

Mở `http://localhost:3002/login`. Sau khi đăng nhập thành công, trình duyệt chuyển đến trang Hồ sơ lô tại `/`, có thanh điều hướng và menu tài khoản. Nếu đổi địa chỉ backend, đặt `AUTH_API_URL` trong `frontend/.env.local` theo `.env.example`. Khi phục vụ frontend qua HTTPS, đặt `AUTH_COOKIE_SECURE=true`.

## Tạo tài khoản

Bảng `users` lưu tên đăng nhập duy nhất, mật khẩu băm bằng bcrypt, họ tên, email, chức danh và phòng ban. Cột `users.department` tham chiếu `departments.name`. Lệnh dưới đây tái sử dụng phòng ban đã có hoặc tạo phòng ban mới cùng với tài khoản. Có thể truyền họ tên, mô tả phòng ban và email theo thứ tự sau tên phòng ban.

```powershell
cd backend
$password = Read-Host 'Mật khẩu tài khoản' -AsSecureString
$env:ANVY_USER_PASSWORD = [System.Net.NetworkCredential]::new('', $password).Password
try {
  npm.cmd run user:create -- anvy.user 'Nhân viên' 'Hành chính' 'Nguyễn Văn An' 'Bộ phận hành chính' 'an@example.com'
} finally {
  Remove-Item Env:ANVY_USER_PASSWORD
}
```

## Phát triển

- Chạy `npm.cmd run build` và `npm.cmd run lint` trong từng thư mục.
- Chạy `npm.cmd test` trong `backend/` để kiểm thử.
- Không đưa mật khẩu, khóa API hoặc thông tin nhạy cảm vào kho mã nguồn.

## Phân quyền

Người dùng nhận quyền qua các vai trò được gán. Các bảng `roles`, `permissions`, `user_roles` và `role_permissions` lưu vai trò, quyền và các liên kết tương ứng. Migration chỉ tạo cấu trúc bảng.

Backend hỗ trợ `@RequireRoles(...)` và `@RequirePermissions(...)` trên controller hoặc handler. Người dùng phải đáp ứng tất cả yêu cầu đã khai báo ở cả hai cấp. Guard đọc quyền từ database khi xử lý yêu cầu để phản ánh thay đổi gán quyền.

## Tài liệu API

Swagger UI chạy tại `http://localhost:3000/api-docs`. Bản OpenAPI có tại `/api-docs-json` và `/api-docs-yaml`. Đăng nhập qua `POST /auth/login` rồi nhập `accessToken` vào nút **Authorize** để thử các API yêu cầu xác thực.

Khi triển khai, đặt `ABOUT_API_REFERENCE_URL` trong môi trường frontend thành URL công khai của Swagger UI. Có thể đặt `SWAGGER_API_URL` nếu Swagger cần gửi yêu cầu đến một địa chỉ API khác.

## Lịch sử kết nối

Lịch sử ghi nhận từng tab trong khu vực sau đăng nhập. Tab gửi tín hiệu mỗi 20 giây. Phiên ngắt kết nối được nối lại trong 90 giây, hoặc tối đa 120 giây kể từ tín hiệu cuối nếu backend chưa nhận được sự kiện ngắt. Thời lượng phiên tính từ lần mở đến mốc kết nối cuối hoặc lúc đăng xuất, tùy trạng thái.

Tài khoản xem lịch sử của mình. Quyền `users.list` mở rộng phạm vi sang toàn bộ người dùng. Khi triển khai qua reverse proxy, cấu hình `TRUST_PROXY` theo chuỗi proxy tin cậy để backend nhận đúng IP thiết bị.

## Cài đặt

Mọi tài khoản đã đăng nhập đều có thể mở **Cài đặt** trong menu tài khoản để thêm người dùng và phòng ban.
