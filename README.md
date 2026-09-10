# OmniCare — Trợ lý Sức khỏe Toàn diện AI

Nền tảng chăm sóc sức khỏe chủ động: trợ lý AI hai luồng (cảm nhận cơ thể → gợi ý nhóm vấn đề, mức độ, nơi khám; gợi ý món ăn theo thời tiết, vị trí, giờ trong ngày và thể trạng), số hóa bệnh án/đơn thuốc in máy bằng AI vision, thời tiết và "ảnh hưởng đến bạn", nhật ký sức khỏe với phân tích xu hướng và đề xuất cải thiện.

> ⚠️ OmniCare không thay thế chẩn đoán y khoa. Hãy gặp bác sĩ khi có triệu chứng nghiêm trọng.

Yêu cầu nghiệp vụ: BRD-001 v1.0 (Google Docs). Lộ trình và thiết kế trang: `docs/plan/PLAN.md`, `docs/plan/SITEMAP.md` (nội bộ, không commit).

## Trạng thái MVP (09/09/2026)

| Khối chức năng | Trang | Trạng thái |
|---|---|---|
| Đăng ký / đăng nhập bằng số điện thoại, JWT, rate limit | `/login`, `/register` | ✅ |
| Hồ sơ sức khỏe: chiều cao, cân nặng, ngày sinh, giới tính, bệnh nền, dị ứng, BMI | `/profile` | ✅ |
| Thời tiết theo vị trí, dự báo 24h / 5 ngày, khối "Ảnh hưởng đến bạn" (AI) | `/weather` | ✅ |
| Trợ lý AI hai luồng trong một khung, lịch sử tách riêng, banner cấp cứu 115 | `/chat` | ✅ |
| Hồ sơ bệnh án: upload nhiều trang, AI đọc + bóc tách, bảng thuốc theo cột tài liệu, sửa tay, xác nhận | `/records` | ✅ |
| Theo dõi sức khỏe: nhật ký chỉ số/hoạt động, AI phân tích, đề xuất, biểu đồ | `/tracking` | ✅ |
| Tổng quan ghép chỉ số cơ thể, thời tiết, nhật ký, bệnh án gần nhất | `/dashboard` | ✅ |
| Test tự động + CI (backend, AI, web) | — | ✅ |
| Sau MVP: "Tủ bếp" (gợi ý theo nguyên liệu có sẵn), nhắc uống thuốc, token httpOnly cookie | — | ⏳ |

## Cấu trúc repo

```
OmniCare/
├── backend/          REST API — Node 22, Express 5, MongoDB (Mongoose), JWT, Zod
├── frontend/web/     Web app — React 19, Vite, Tailwind v4, Redux Toolkit
├── ai/               Dịch vụ AI — Python 3.12, FastAPI; gọi LLM kiểu OpenAI (Gemini/GLM), vision cho OCR
├── docs/             Tài liệu thiết kế, logo, kế hoạch (nội bộ)
├── .github/workflows/ci.yml  CI: typecheck + test backend (Mongo service), pytest ai, typecheck/lint/build web
└── docker-compose.yml  Mongo + backend + ai cho dev cục bộ
```

## Chạy dự án (dev)

Yêu cầu: Node.js ≥ 20, npm ≥ 10, Docker Desktop (đang chạy). Backend cần MongoDB: Atlas (điền `MONGO_URI` trong `backend/.env`) hoặc Mongo trong Docker. Dịch vụ AI cần Python ≥ 3.12 nếu chạy ngoài Docker.

**Bước 1 — cấu hình (một lần)**

```bash
cd backend && cp .env.example .env   # MONGO_URI, JWT_SECRET (≥ 16 ký tự), OPENWEATHER_API_KEY
cd ../ai && cp .env.example .env     # LLM_API_KEY + LLM_BASE_URL + LLM_MODEL (xem ai/README.md)
```

Khóa cần có: OpenWeather (gói free đủ: current, forecast 5 ngày/3h, geocoding) và một LLM kiểu OpenAI chat/completions có vision. Đã test tốt với Gemini `gemini-3.5-flash-lite` qua `https://generativelanguage.googleapis.com/v1beta/openai` (free 15 RPM / 500 RPD).

**Bước 2 — chạy backend + AI service.** Chọn một trong hai cách:

| | Cách A: Docker (khuyên dùng) | Cách B: npm / uvicorn |
|---|---|---|
| Lệnh | `docker compose up -d --build` (ở thư mục gốc) | `cd backend && npm install && npm run dev` và `cd ai && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000` |
| Khi nào | Không muốn cài Node/Mongo, hoặc muốn chạy nền | Đang sửa code backend, cần hot reload |
| Mongo, AI | Tự chạy kèm container `omnicare-mongo`, `omnicare-ai` | Tự lo (Atlas hoặc `docker compose up -d mongo`) |
| Log | `docker compose logs -f backend` | in ra terminal |
| Dừng | `docker compose down` | Ctrl+C |

Kiểm tra: `curl http://localhost:3000/api/health` phải trả `"db":"connected"` và `"ai":"ok"`.

**Bước 3 — chạy frontend**

```bash
cd frontend/web
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:5173
```

Vite proxy `/api/*` sang `http://localhost:3000`. Nếu trình duyệt báo **502/504** ở `/api/...` nghĩa là backend chưa lên cổng 3000, xem lại Bước 2. Container backend chỉ đọc `.env` lúc khởi động: đổi khóa xong phải `docker compose up -d --build backend` (hoặc `ai`).

### Docker chi tiết

```bash
docker compose up -d                  # Mongo + backend + ai
docker compose up -d --build backend  # build lại image sau khi sửa code backend
docker compose up -d --build ai       # build lại image sau khi sửa code ai/
docker compose up -d mongo            # chỉ Mongo, backend chạy bằng npm
docker compose logs -f backend        # xem log
docker compose ps                     # trạng thái + healthcheck
docker compose down                   # dừng (giữ dữ liệu Mongo và uploads trong volume)
docker compose down -v                # dừng và xóa luôn dữ liệu
```

- Container backend đọc biến từ `backend/.env` (`env_file`). Muốn dùng Mongo trong compose thay vì Atlas, bỏ comment dòng `MONGO_URI: mongodb://mongo:27017/omnicare` trong `docker-compose.yml`.
- Ảnh bệnh án lưu ở volume `backend-uploads`, dữ liệu Mongo ở volume `mongo-data`.
- `frontend/web` không nằm trong `docker-compose.yml` (dev dùng `npm run dev`), nhưng có `Dockerfile` riêng (build Vite rồi phục vụ bằng Nginx) dùng khi deploy — xem mục **Triển khai** bên dưới.

## Test và CI

```bash
cd backend && MONGO_URI_TEST=mongodb://localhost:27017/omnicare_test npm test   # vitest + supertest, cần Mongo (docker compose up -d mongo)
cd ai && pip install -r requirements-dev.txt && pytest                          # test ép JSON, chuẩn hóa OCR, prompt
cd frontend/web && npm run typecheck && npm run lint && npm run build
```

- Test backend chạy tích hợp qua HTTP với DB test riêng (xóa sạch trước mỗi file) và một **AI giả lập** trong `tests/setup.ts`, nên không cần khóa LLM. Phủ: auth, profile, chat hai luồng, records nhiều trang + bảng thuốc, tracking + phân tích, xử lý lỗi (JSON hỏng, quá số file), và IDOR (user này không đọc được dữ liệu user khác).
- GitHub Actions (`.github/workflows/ci.yml`) chạy cả ba phần khi push lên `main`/`development` hoặc mở PR.

## Triển khai (deploy)

Cả 3 dịch vụ đều có `Dockerfile` riêng (`ai/Dockerfile`, `backend/Dockerfile`, `frontend/web/Dockerfile`) — deploy y hệt nhau trên **Render** hoặc **Railway** (hoặc bất kỳ nền tảng nào build Dockerfile từ một thư mục con của repo). Không có blueprint/IaC sẵn trong repo; các bước dưới đây làm thủ công trên dashboard, mất khoảng 15–20 phút.

**Thứ tự: AI → Backend → Frontend** — backend cần biết URL của AI trước khi khởi động; frontend cần biết URL của backend ngay **lúc build** (Vite đóng gói `VITE_API_URL` vào bundle, không đổi được lúc chạy).

### 0) MongoDB Atlas

Vào **Network Access** trên Atlas, thêm `0.0.0.0/0` vào IP Access List (Render/Railway có IP xuất phát động, không whitelist được IP cụ thể trừ khi mua gói Static IP). Nếu tài khoản dev/test còn IP cũ bị chặn, đây là lý do. Đổi mật khẩu user DB nếu đã lộ trong lúc dev.

### 1) Dịch vụ AI (`ai/`)

Không cần public ra Internet, chỉ backend gọi tới:

- **Render**: New → **Private Service**. Root Directory `ai`, nền tảng tự nhận Dockerfile.
- **Railway**: New → GitHub Repo, chọn thư mục `ai`; vào Settings tắt "Public Networking" nếu muốn giữ nội bộ (bật lên cũng không sao, endpoint không có gì nhạy cảm ngoài quota LLM).

Biến môi trường (copy từ `ai/.env`, **dùng khóa LLM riêng cho production**, đừng tái dùng khóa free-tier của lúc dev):

| Biến | Giá trị |
|---|---|
| `AI_ENV` | `production` |
| `LLM_API_KEY` | khóa LLM production |
| `LLM_BASE_URL` | ví dụ `https://generativelanguage.googleapis.com/v1beta/openai` |
| `LLM_MODEL` | ví dụ `gemini-3.5-flash-lite` |
| `LLM_TIMEOUT` | `30` |

Healthcheck `/health` đã khai báo sẵn trong Dockerfile. Sau khi deploy, ghi lại **URL nội bộ** nền tảng cấp cho service (Render: theo tên service, ví dụ service tên `omnicare-ai` thì URL nội bộ là `http://omnicare-ai:8000`; Railway: `http://<service>.railway.internal:8000`) — dùng ở bước 2.

### 2) Backend (`backend/`)

Web Service công khai (Render: New → **Web Service**; Railway: New → GitHub Repo, thư mục `backend`).

| Biến | Giá trị |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | chuỗi kết nối Atlas |
| `JWT_SECRET` | chuỗi ngẫu nhiên ≥ 32 ký tự (Render có nút "Generate") |
| `JWT_EXPIRES_IN` | `7d` |
| `CORS_ORIGIN` | URL frontend (bước 3) — tạm để trống/`*` rồi quay lại sửa sau khi có URL |
| `OPENWEATHER_API_KEY` | khóa OpenWeather riêng cho production |
| `AI_SERVICE_URL` | URL nội bộ của AI ở bước 1 |

Healthcheck `/api/health` phải trả `{"status":"ok","db":"connected","ai":"ok"}`.

### 3) Frontend (`frontend/web/`)

- **Cách gọn nhất (Render Static Site)**: New → **Static Site**, không cần Dockerfile. Build Command `npm ci && npm run build`, Publish Directory `dist`. Thêm **Redirect/Rewrite Rule**: nguồn `/*` → đích `/index.html`, loại **Rewrite** (bắt buộc, không có thì tải thẳng một URL con như `/dashboard` sẽ ra 404 vì đó là route phía React Router, không phải file thật). Miễn phí, có CDN + HTTPS.
- **Cách dùng Dockerfile** (khi nền tảng không có kiểu "Static Site" riêng, ví dụ Railway): deploy như Web Service bình thường, Root Directory `frontend/web`, thêm biến `VITE_API_URL=https://<backend-url>/api` **trước khi bấm Deploy lần đầu** (đổi sau phải build lại mới có tác dụng).

Deploy xong, quay lại bước 2 sửa `CORS_ORIGIN` của backend thành đúng URL frontend rồi redeploy backend.

### Kiểm tra sau khi deploy

```bash
curl https://<backend-url>/api/health
# {"success":true,"data":{"status":"ok","db":"connected","ai":"ok","uptime":...}}
```

Mở frontend, đăng ký tài khoản mới, thử một lượt chat và tải một ảnh đơn thuốc để chắc cả 3 dịch vụ nói chuyện được với nhau.

## Bảo mật và dữ liệu y tế (NFR-05)

- Mọi truy vấn dữ liệu sức khỏe đều lọc theo `req.userId` từ JWT; ảnh bệnh án nằm ngoài thư mục tĩnh, chỉ phục vụ qua `/records/:id/image/:page` sau xác thực, có chống path traversal.
- Payload gửi LLM chỉ chứa ngữ cảnh sức khỏe ẩn danh (tuổi, giới tính, BMI, bệnh nền, dị ứng, thời tiết, nhật ký), không có tên, số điện thoại, email. Dịch vụ AI không log nội dung chat, ảnh hay dữ liệu bóc tách.
- Rate limit: đăng nhập 10/15 phút, đăng ký 5/giờ, chat/phân tích 30/15 phút, OCR 20/giờ (theo IP, khi `NODE_ENV=production`). Helmet bật mặc định, body JSON ≤ 1MB, ảnh ≤ 10MB × 8 trang.
- Mọi phản hồi chat, gợi ý, phân tích đều kèm `disclaimer` (AI-04) và giao diện luôn hiển thị.
- Token JWT hiện lưu ở `localStorage` (đơn giản cho MVP); chuyển sang cookie httpOnly là mục sau MVP.

## Hiệu năng (NFR-03, đo 09/09/2026 với Gemini 3.5 Flash Lite)

| Tác vụ | Thời gian điển hình |
|---|---|
| Chat một lượt (có hồ sơ + thời tiết) | 2–6 s |
| "Ảnh hưởng đến bạn" | 2 s, cache 30 phút |
| OCR 1 trang / 2 trang | 3 s / 8 s |
| Phân tích nhật ký 11 ngày | 5 s |
| Thời tiết | < 1 s, cache 10 phút |

## Luồng xác thực

- Đăng ký bằng **họ tên, số điện thoại, mật khẩu** (email không bắt buộc). Sau khi đăng ký, người dùng về trang đăng nhập với số điện thoại điền sẵn.
- Đăng nhập bằng **số điện thoại + mật khẩu**, nhận JWT. Số điện thoại chấp nhận `0xxxxxxxxx` hoặc `+84xxxxxxxxx`.
- Mọi trang ứng dụng yêu cầu đăng nhập; chưa có token sẽ chuyển về `/login` và quay lại trang cũ sau khi đăng nhập. Landing `/` công khai; sau đăng nhập dùng sidebar trái.

Chi tiết endpoint: [backend/README.md](./backend/README.md). AI service: [ai/README.md](./ai/README.md).

## Design system — "Clinical Clarity"

Nguồn: `docs/img/chủ đạo.png`. Logo: `docs/img-des/`. Token khai báo trong `frontend/web/src/index.css` bằng `@theme` của Tailwind v4.

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

`<Button variant="primary | secondary | inverted | outline | ghost" size="sm | md | lg" loading fullWidth />` trong `frontend/web/src/components/common/Button.tsx`.

## Tài liệu

- `docs/plan/PLAN.md`, `docs/plan/SITEMAP.md` (nội bộ, không commit) — lộ trình theo giai đoạn, thiết kế từng trang.
- [backend/README.md](./backend/README.md) — API, biến môi trường, cấu trúc.
- [frontend/web/README.md](./frontend/web/README.md) — cấu trúc, quy ước, design tokens.
- [ai/README.md](./ai/README.md) — dịch vụ AI, endpoint, biến môi trường LLM.
