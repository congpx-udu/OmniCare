# OmniCare — Trợ lý Sức khỏe Toàn diện AI

Nền tảng chăm sóc sức khỏe chủ động: chatbot phân tích triệu chứng sơ bộ, số hóa đơn thuốc/bệnh án in máy bằng OCR, gợi ý thực đơn và vận động theo thời tiết, vị trí, cảm nhận và lịch sử bệnh, cùng dashboard nhắc uống thuốc.

> ⚠️ OmniCare không thay thế chẩn đoán y khoa. Hãy gặp bác sĩ khi có triệu chứng nghiêm trọng.

Yêu cầu nghiệp vụ: BRD-001 v1.0 (Google Docs). Lộ trình triển khai: `docs/plan/PLAN.md` (nội bộ, không commit).

## Cấu trúc repo

```
OmniCare/
├── backend/          REST API — Node 22, Express 5, MongoDB (Mongoose), JWT
├── frontend/web/     Web app — React 19, Vite, Tailwind v4, Redux Toolkit
├── ai/               Dịch vụ AI/OCR — Python FastAPI (Giai đoạn 3)
├── docs/             Tài liệu thiết kế, logo, bảng màu
├── docker-compose.yml  MongoDB cho dev cục bộ
└── docs/plan/PLAN.md Kế hoạch theo giai đoạn (nội bộ)
```

## Chạy dự án (dev)

Yêu cầu: Node.js ≥ 20, npm ≥ 10, Docker Desktop (đang chạy). Backend cần MongoDB: dùng Atlas (điền `MONGO_URI` trong `backend/.env`) hoặc Mongo trong Docker.

**Bước 1 — cấu hình backend (một lần)**

```bash
cd backend
cp .env.example .env        # điền MONGO_URI, JWT_SECRET (≥ 16 ký tự)
```

**Bước 2 — chạy backend.** Chọn một trong hai cách:

| | Cách A: Docker (khuyên dùng) | Cách B: npm |
|---|---|---|
| Lệnh | `docker compose up -d --build` (ở thư mục gốc) | `cd backend && npm install && npm run dev` |
| Khi nào | Không muốn cài Node/Mongo, hoặc muốn chạy nền | Đang sửa code backend, cần hot reload |
| Mongo | Tự chạy kèm container `omnicare-mongo` | Tự lo (Atlas hoặc `docker compose up -d mongo`) |
| Log | `docker compose logs -f backend` | in ra terminal |
| Dừng | `docker compose down` | Ctrl+C |

Kiểm tra: `curl http://localhost:3000/api/health` phải trả `"db":"connected"`.

**Bước 3 — chạy frontend**

```bash
cd frontend/web
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:5173
```

Vite proxy `/api/*` sang `http://localhost:3000`. Nếu trình duyệt báo **502 Bad Gateway** ở `/api/...` nghĩa là backend chưa chạy hoặc chưa lên cổng 3000, xem lại Bước 2.

### Docker chi tiết

```bash
docker compose up -d                  # Mongo + backend
docker compose up -d --build backend  # build lại image sau khi sửa code backend
docker compose up -d mongo            # chỉ Mongo, backend chạy bằng npm
docker compose logs -f backend        # xem log
docker compose ps                     # trạng thái + healthcheck
docker compose down                   # dừng (giữ dữ liệu Mongo và uploads trong volume)
docker compose down -v                # dừng và xóa luôn dữ liệu
```

- `backend/Dockerfile`: multi-stage, build TypeScript ra `dist/` rồi chạy `node dist/server.js` với user không phải root, có healthcheck `/api/health`.
- Container backend đọc biến từ `backend/.env` (`env_file`). Muốn dùng Mongo trong compose thay vì Atlas, bỏ comment dòng `MONGO_URI: mongodb://mongo:27017/omnicare` trong `docker-compose.yml`. Trong mạng Docker, host của Mongo là `mongo`, không phải `localhost`.
- Ảnh upload lưu ở volume `backend-uploads`, dữ liệu Mongo ở volume `mongo-data`.
- Frontend và `ai/` chưa có Dockerfile, sẽ thêm ở Giai đoạn 6.

## Luồng xác thực

- Đăng ký bằng **họ tên, số điện thoại, mật khẩu** (email không bắt buộc). Sau khi đăng ký thành công, người dùng được đưa về trang đăng nhập với số điện thoại điền sẵn.
- Đăng nhập bằng **số điện thoại + mật khẩu**, nhận JWT. Số điện thoại chấp nhận `0xxxxxxxxx` hoặc `+84xxxxxxxxx`.
- Mọi trang chính yêu cầu đăng nhập; chưa có token sẽ chuyển về `/login` và quay lại trang cũ sau khi đăng nhập.

Chi tiết endpoint: [backend/README.md](./backend/README.md).

## Design system — "Clinical Clarity"

Nguồn: `docs/img/chủ đạo.png`. Logo: `docs/img-des/` (bản có chữ và bản biểu tượng). Token khai báo trong `frontend/web/src/index.css` bằng `@theme` của Tailwind v4.

### Màu chủ đạo

| Token | Hex | Vai trò |
|---|---|---|
| `primary` | `#0B2545` | Navy. Tiêu đề, nút chính, header, panel thương hiệu |
| `secondary` | `#007A78` | Teal (màu logo). Điểm nhấn, link, trạng thái tích cực |
| `tertiary` | `#0284C7` | Sky blue. Thông tin, focus ring, biểu đồ |
| `neutral` | `#64748B` | Slate. Text phụ, viền, placeholder |

Mỗi màu có thang `50 → 900` (ví dụ `bg-primary-50`, `text-secondary-700`) cùng alias `-light` / `-dark`.

### Nền, bề mặt và trạng thái

| Token | Hex | Vai trò |
|---|---|---|
| `background` | `#EEF3FA` | Nền trang |
| `surface` | `#FFFFFF` | Card, form, header |
| `surface-muted` | `#E6EEF8` | Nút secondary, ô tìm kiếm, khối phụ |
| `danger` | `#B91C1C` | Lỗi, xóa |
| `warning` | `#D97706` | Cảnh báo, disclaimer |
| `success` | `#007A78` | Thành công (dùng teal) |
| `info` | `#0284C7` | Thông tin |

### Typography

| Token | Font | Dùng cho |
|---|---|---|
| `font-heading` | Manrope | Headline, label, nút |
| `font-sans` | Plus Jakarta Sans | Body |

Font nạp từ Google Fonts trong `frontend/web/index.html`. Thẻ `h1–h4` mặc định dùng `font-heading`, đậm, màu `primary`.

### Nút

`<Button variant="primary | secondary | inverted | outline | ghost" size="sm | md | lg" loading fullWidth />` trong `frontend/web/src/components/common/Button.tsx`, bám theo 4 kiểu nút trong bảng thiết kế.

## Tài liệu

- `docs/plan/PLAN.md` (nội bộ, không commit) — lộ trình 7 giai đoạn, ánh xạ yêu cầu BRD → module.
- [backend/README.md](./backend/README.md) — API, biến môi trường, cấu trúc.
- [frontend/web/README.md](./frontend/web/README.md) — cấu trúc, quy ước, design tokens.
