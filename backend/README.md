# OmniCare — Backend API

REST API của **OmniCare – Trợ lý Sức khỏe Toàn diện AI**. Quản lý xác thực, hồ sơ sức khỏe, lịch sử chat, tài liệu y tế đã OCR, và làm cầu nối giữa frontend với dịch vụ AI/OCR cùng các API thời tiết, vị trí.

> ⚠️ OmniCare không thay thế chẩn đoán y khoa.

## Công nghệ

| Thành phần | Lựa chọn |
|---|---|
| Runtime | Node.js 22, ESM |
| Ngôn ngữ | TypeScript (strict) |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Validation | Zod 4 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Upload | multer (ảnh ≤ 10MB) |
| Bảo mật | helmet, cors, express-rate-limit |
| Logging | pino + pino-http |
| Dev | tsx watch |

## Yêu cầu

- Node.js ≥ 20 (đang dùng 22)
- MongoDB ≥ 6 chạy cục bộ hoặc qua Docker (`docker compose up mongo` ở thư mục gốc)

## Bắt đầu

```bash
cd backend
npm install
cp .env.example .env      # điền MONGO_URI, JWT_SECRET
npm run dev               # http://localhost:3000/api
```

Kiểm tra nhanh:

```bash
curl http://localhost:3000/api/health
```

## Chạy bằng Docker

```bash
# ở thư mục gốc repo
docker compose up -d --build          # Mongo + backend, http://localhost:3000/api
docker compose logs -f backend
docker compose down
```

`Dockerfile` build 2 stage: `npm ci` + `tsc` → image runtime chỉ chứa `dist/` và dependencies production, chạy `node dist/server.js` với user `node`, healthcheck gọi `/api/health`. Biến môi trường lấy từ `.env` qua `env_file` trong `docker-compose.yml`. Khi kết nối Mongo trong compose, dùng `MONGO_URI=mongodb://mongo:27017/omnicare`.

Lỗi thường gặp: frontend báo `502 Bad Gateway` tại `/api/*` → backend chưa chạy trên cổng 3000.

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy `tsx watch src/server.ts`, tự reload |
| `npm run build` | Biên dịch TypeScript ra `dist/` |
| `npm start` | Chạy bản build `node dist/server.js` |
| `npm run typecheck` | `tsc --noEmit` |
npm test           # vitest + supertest, cần MONGO_URI_TEST (mặc định mongodb://localhost:27017/omnicare_test)
| `npm run format` | Prettier toàn bộ `src/` |

## Biến môi trường

| Biến | Bắt buộc | Mặc định | Ý nghĩa |
|---|---|---|---|
| `NODE_ENV` | | `development` | `development` / `test` / `production` |
| `PORT` | | `3000` | Cổng HTTP |
| `MONGO_URI` | ✅ | | Chuỗi kết nối MongoDB |
| `JWT_SECRET` | ✅ | | Khóa ký JWT, tối thiểu 16 ký tự |
| `JWT_EXPIRES_IN` | | `7d` | Thời hạn token |
| `CORS_ORIGIN` | | `http://localhost:5173` | Origin được phép, phân cách bằng dấu phẩy |
| `OPENWEATHER_API_KEY` | | | Key OpenWeather cho gợi ý theo thời tiết |
| `AI_SERVICE_URL` | | `http://localhost:8000` | URL dịch vụ AI/OCR trong `../ai` |

Biến được kiểm tra bằng Zod khi khởi động (`src/config/env.ts`). Thiếu hoặc sai sẽ dừng server ngay với thông báo rõ ràng.

## Cấu trúc thư mục

```
src/
├── server.ts                 Entry: kết nối DB, listen, graceful shutdown
├── app.ts                    Tạo Express app, middleware toàn cục, mount /api
├── config/
│   ├── env.ts                Parse process.env bằng Zod
│   ├── db.ts                 connectDB / disconnectDB (Mongoose)
│   └── logger.ts             pino, redact authorization/password/token
├── routes/
│   ├── index.ts              apiRouter: /health, /auth, ...
│   ├── auth.routes.ts        POST /register, POST /login, GET /me
│   ├── profile.routes.ts     GET /, PUT / (hồ sơ sức khỏe)
│   ├── context.routes.ts     GET /weather (thời tiết theo vị trí)
│   ├── chat.routes.ts        POST /, GET/DELETE /history (chat AI hai luồng)
│   ├── record.routes.ts      /upload, /, /:id, /:id/image, /:id/reprocess (hồ sơ bệnh án)
│   └── tracking.routes.ts    /logs, /analyze, /advice (theo dõi sức khỏe)
├── controllers/
│   ├── auth.controller.ts    Nhận req, gọi service, trả ok()/created()
│   └── health.controller.ts  Health check + trạng thái DB
├── services/
│   ├── auth.service.ts       register / login / me, hash mật khẩu, ký JWT
│   └── health.service.ts     Trạng thái DB + ping AI service (timeout 2s)
├── models/
│   ├── User.ts               phone (unique), email?, password (select:false), fullName
│   ├── HealthProfile.ts      chiều cao, cân nặng, bệnh nền, dị ứng
│   ├── ChatMessage.ts        lịch sử chat + context (thời tiết, vị trí, cảm nhận)
│   └── MedicalRecord.ts      ảnh đơn thuốc/bệnh án, rawText, extracted, status
├── validators/
│   └── auth.validator.ts     Zod schema cho register / login
├── middlewares/
│   ├── auth.ts               requireAuth: đọc Bearer token, gắn req.userId
│   ├── validate.ts           validate(schema) cho body/params/query
│   ├── upload.ts             multer: JPEG/PNG/WEBP, ≤10MB, lưu uploads/
│   ├── rateLimit.ts          loginLimiter, registerLimiter (express-rate-limit)
│   └── errorHandler.ts       notFound + errorHandler (ApiError, Mongo 11000, 500)
├── utils/
│   ├── ApiError.ts           Lỗi có statusCode + factory badRequest/unauthorized/...
│   ├── asyncHandler.ts       Bọc controller async
│   ├── response.ts           ok(res, data), created(res, data)
│   └── jwt.ts                signToken / verifyToken
└── types/
    └── express.d.ts          Mở rộng Express.Request với userId
uploads/                      Ảnh người dùng tải lên (gitignore)
```

### Luồng xử lý một request

```
routes → validate(zod) → requireAuth → controller → service → model
                                                     ↓
                                       ApiError → errorHandler → JSON
```

### Thêm một endpoint mới

1. Schema Zod trong `src/validators/<domain>.validator.ts`.
2. Model trong `src/models/` nếu cần collection mới.
3. Logic trong `src/services/<domain>.service.ts`.
4. Controller trong `src/controllers/<domain>.controller.ts`.
5. Route trong `src/routes/<domain>.routes.ts`, đăng ký vào `src/routes/index.ts`.
6. Cập nhật bảng endpoint bên dưới.

## Endpoints

Base URL: `/api`. Route có 🔒 cần header `Authorization: Bearer <token>`.

| Method | Path | Mô tả | Trạng thái |
|---|---|---|---|
| GET | `/health` | Trạng thái server, DB và dịch vụ AI (`ai: ok | unreachable`) | ✅ |
| POST | `/auth/register` | ⏱ 5/giờ/IP (prod). Đăng ký `{ fullName, phone, password, email? }` → `{ user }` (không trả token, client chuyển về trang đăng nhập) | ✅ |
| POST | `/auth/login` | ⏱ 10/15 phút/IP (prod). Đăng nhập `{ phone, password }` → `{ token, user }`. `phone` nhận `0xxxxxxxxx` hoặc `+84xxxxxxxxx` | ✅ |
| GET 🔒 | `/auth/me` | Thông tin người dùng hiện tại | ✅ |
| POST 🔒 | `/chat` | ⏱ 30/15 phút/IP (prod). JSON hoặc multipart (`images[]` ≤4 ảnh JPEG/PNG/WEBP ≤10MB, các trường có cấu trúc gửi dạng JSON string). `{ mode: health\|food\|symptom, message, feeling?, location?: {lat,lon}\|{city}, pantry?: string[] (≤30, nguyên liệu đang có, không lưu riêng) }` → `{ userMessage, assistantMessage (meta: intent, riskLevel, meals, possibleConditions...), disclaimer }`. `health` là luồng hợp nhất (frontend dùng): một cuộc trò chuyện hỏi được cả triệu chứng lẫn món ăn, AI trả `intent` từng lượt; `food`/`symptom` giữ cho lịch sử cũ. Gom hồ sơ ẩn danh + thời tiết + 10 tin gần nhất gửi AI | ✅ |
| GET 🔒 | `/chat/history?mode=&limit=` | Lịch sử một luồng, cũ → mới; tin user có `attachments[{index, mime}]` | ✅ |
| GET 🔒 | `/chat/:id/image/:index` | Ảnh đính kèm tin (chỉ chủ sở hữu; xóa lịch sử thì xóa file) | ✅ |
| DELETE 🔒 | `/chat/history?mode=` | Xóa lịch sử một luồng | ✅ |
| POST 🔒 | `/records/upload` | ⏱ 20/giờ/IP (prod). multipart `images[]` (1–8 trang cùng bộ hồ sơ, mỗi ảnh JPEG/PNG/WEBP ≤10MB) + `type?`. Lưu ảnh, gọi AI `/ocr` một lần cho tất cả trang và gộp thành một kết quả, trả record `status: needs_review` (hoặc `failed` kèm `errorMessage`) | ✅ |
| GET 🔒 | `/records/:id/image/:page` | Ảnh trang thứ `page` (0-based, chỉ chủ sở hữu) | ✅ |
| POST 🔒 | `/records/:id/reprocess` | OCR lại ảnh đã lưu | ✅ |
| GET 🔒 | `/records?year=&q=&limit=`, `/records/:id` | Danh sách theo ngày khám giảm dần (`q` tìm chẩn đoán, cơ sở, tên thuốc, ghi chú), chi tiết | ✅ |
| PUT/DELETE 🔒 | `/records/:id` | Sửa tay `{ facility?, doctor?, visitDate?, diagnosis?, medicationTable?: {columns[{key,label}], rows[]} (bảng đúng cột tài liệu, backend suy ra `medications` chuẩn hóa từ bảng), notes?, confirm? }` (loại tài liệu do AI nhận dạng) (`confirm: true` → `done`) / xóa hồ sơ và ảnh | ✅ |
| GET 🔒 | `/profile` | Hồ sơ cá nhân của user hiện tại (trả hồ sơ rỗng nếu chưa có): `fullName`, `email`, `phone` từ tài khoản + chiều cao, ngày sinh, giới tính, bệnh nền, dị ứng. Kèm `weightKg`/`weightDate` (cân nặng mới nhất trong nhật ký theo dõi), `bmi`, `age`, `isComplete` (đủ chiều cao + ngày sinh) | ✅ |
| PUT 🔒 | `/profile` | Upsert `{ fullName?, email? (null = bỏ), heightCm?, dateOfBirth? (yyyy-mm-dd), gender? (male|female|other), chronicConditions?[], allergies?[] }`. Gửi `null` để xóa một trường; trường không gửi giữ nguyên. Cân nặng không nhập ở đây (ghi ở `/tracking/logs/:date`). Email trùng → 409 | ✅ |
| GET 🔒 | `/context/weather?lat=&lon=` hoặc `?city=` | Thời tiết hiện tại + 8 mốc 3h tới + 5 ngày (OpenWeather, cache 10 phút theo tọa độ làm tròn 2 số). 503 nếu thiếu `OPENWEATHER_API_KEY` | ✅ |
| GET 🔒 | `/tracking/logs?from=&to=&limit=` | Nhật ký sức khỏe (cũ → mới) | ✅ |
| PUT 🔒 | `/tracking/logs/:date` | Upsert nhật ký một ngày `{ weightKg?, systolic?, diastolic?, heartRate?, glucose?, sleepHours?, activityMinutes?, activityType?, mood?(1-5), note? }`, null = xóa chỉ số | ✅ |
| DELETE 🔒 | `/tracking/logs/:date` | Xóa nhật ký một ngày | ✅ |
| POST 🔒 | `/tracking/analyze` | ⏱ chatLimiter. `{ days?=30, location? }` → AI phân tích nhật ký + hồ sơ + thời tiết + giờ: `{ summary, trends[], alerts[], suggestions[{title, detail, category, when, done}] }`, lưu HealthAdvice | ✅ |
| GET 🔒 | `/tracking/advice?limit=` | Các lần phân tích gần nhất | ✅ |
| PATCH 🔒 | `/tracking/advice/:id/suggestions/:index` | `{ done }` đánh dấu đề xuất đã làm | ✅ |
| GET 🔒 | `/context/weather/insight?lat=&lon=` hoặc `?city=` | "Ảnh hưởng đến bạn": AI đọc thời tiết + hồ sơ + buổi trong ngày → `{ summary, tips[], mealIdea, activityIdea, timeOfDay, disclaimer }`. Cache 30 phút theo user/vị trí/buổi | ✅ |

### Định dạng response

Thành công:

```json
{ "success": true, "data": { ... }, "message": "..." }
```

Lỗi:

```json
{ "success": false, "message": "Dữ liệu không hợp lệ", "details": [ ...zod issues ] }
```

| Mã | Khi nào |
|---|---|
| 400 | Body/params/query không qua Zod |
| 401 | Thiếu hoặc sai token, sai mật khẩu |
| 404 | Không tìm thấy route hoặc bản ghi |
| 409 | Trùng dữ liệu (số điện thoại hoặc email đã đăng ký) |
| 429 | Vượt rate limit `/auth/*`, xem header `RateLimit-*` |
| 500 | Lỗi không xử lý, stack chỉ hiện khi không phải production |

## Quy ước

- Import nội bộ phải có đuôi `.js` (ESM NodeNext).
- Route → controller → service → model. Không truy cập Mongoose trong controller.
- Lỗi nghiệp vụ ném `ApiError`, `errorHandler` sẽ chuyển thành JSON.
- Không log body request, dữ liệu sức khỏe hay PII.
- Mọi truy vấn dữ liệu cá nhân phải lọc theo `req.userId`.

Quy tắc chi tiết dành cho AI/agent nằm trong `CLAUDE.md`.

## Tài liệu liên quan

- Frontend web: `../frontend/web/README.md`
- Dịch vụ AI/OCR: `../ai`
- BRD, User Personas, SRS: tài liệu Google Docs của dự án.
