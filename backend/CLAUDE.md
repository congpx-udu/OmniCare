# CLAUDE.md — Quy tắc cho AI khi làm việc trong `backend/`

Đây là REST API của **OmniCare** (Trợ lý Sức khỏe Toàn diện AI). Đọc kỹ trước khi sửa code.

## 1. Bối cảnh dự án

- Sản phẩm: chatbot phân tích triệu chứng sơ bộ, OCR đơn thuốc/bệnh án in máy, gợi ý thực đơn và vận động theo thời tiết + vị trí + cảm nhận + lịch sử bệnh, dashboard nhắc uống thuốc.
- Yêu cầu nghiệp vụ nằm trong BRD (Google Docs). Ngoài phạm vi MVP: chẩn đoán chính thức, kê đơn, đặt lịch/thanh toán, OCR chữ tay, tích hợp smartwatch.
- Frontend web tại `../frontend/web` (Vite, port 5173). Dịch vụ AI/OCR tại `../ai` (gọi qua `AI_SERVICE_URL`).
- Mọi response có dạng `{ success, data, message }` hoặc `{ success: false, message, details }`.
- Xác thực bằng **số điện thoại + mật khẩu**. `phone` là định danh duy nhất (chuẩn hóa `+84` → `0` trong `validators/auth.validator.ts`), `email` tùy chọn và `sparse unique`. `/auth/register` không trả token.

## 2. Stack

- Node 22, TypeScript strict, ESM (`"type": "module"`, import nội bộ **phải có đuôi `.js`**).
- Express 5 (async handler tự bắt lỗi), Mongoose 9, Zod 4, jsonwebtoken, bcryptjs, multer, helmet, cors, express-rate-limit, pino.
- Dev: `tsx watch`. Build: `tsc` ra `dist/`.
- Format: Prettier (không dấu chấm phẩy, nháy đơn). Chưa có linter.

## 3. Lệnh

```
npm run dev        # tsx watch src/server.ts, http://localhost:3000/api
npm run build      # tsc -> dist/
npm start          # node dist/server.js
npm run typecheck  # tsc --noEmit
npm run format
```

Trước khi báo hoàn thành: `npm run typecheck` phải sạch. Cần MongoDB chạy tại `MONGO_URI` để `npm run dev` khởi động được.

## 4. Vị trí code — đặt gì ở đâu

| Thư mục / file | Chứa gì | Ví dụ hiện có |
|---|---|---|
| `src/server.ts` | Entry: kết nối DB, `app.listen`, graceful shutdown. Không thêm logic. | |
| `src/app.ts` | Tạo Express app: helmet, cors, json, pino-http, mount `/api`, `notFound`, `errorHandler`. Chỉ sửa khi thêm middleware toàn cục. | |
| `src/config/` | `env.ts` (parse `process.env` bằng Zod, exit nếu thiếu), `db.ts` (Mongoose connect), `logger.ts` (pino, redact token/password). | `env.ts`, `db.ts`, `logger.ts` |
| `src/routes/` | Khai báo route, gắn middleware + controller. `index.ts` gom tất cả router vào `apiRouter`. Mỗi domain một file `xxx.routes.ts`. **Không** chứa logic. | `auth.routes.ts`, `index.ts` |
| `src/controllers/` | Nhận `req`, gọi service, trả `ok()`/`created()`. Không truy cập Mongoose trực tiếp. Mỗi domain một file `xxx.controller.ts`. | `auth.controller.ts`, `health.controller.ts` |
| `src/services/` | Logic nghiệp vụ, truy vấn model, ném `ApiError`. Mỗi domain một file `xxx.service.ts`. Đây là nơi gọi dịch vụ ngoài (AI, OpenWeather). | `auth.service.ts` |
| `src/models/` | Mongoose schema + model, tên file PascalCase. | `User.ts`, `HealthProfile.ts`, `ChatMessage.ts`, `MedicalRecord.ts` |
| `src/validators/` | Zod schema cho `{ body, params, query }` của từng route, export kèm `z.infer` type. | `auth.validator.ts` |
| `src/middlewares/` | `auth.ts` (`requireAuth` gắn `req.userId`), `validate.ts` (Zod), `upload.ts` (multer ảnh ≤10MB), `rateLimit.ts` (`loginLimiter`, `registerLimiter`), `errorHandler.ts` (`notFound`, `errorHandler`). | |
| `src/utils/` | `ApiError` (static `badRequest/unauthorized/notFound/conflict`), `asyncHandler`, `response.ts` (`ok`, `created`), `jwt.ts`. | |
| `src/types/` | Khai báo type toàn cục, mở rộng `Express.Request` (`userId`). | `express.d.ts` |
| `uploads/` | Ảnh đơn thuốc người dùng tải lên (gitignore). | |

### Luồng xử lý một request

```
routes → validate(zodSchema) → requireAuth → controller → service → model
                                                            ↓
                                              ApiError → errorHandler → JSON
```

### Thêm một endpoint mới

1. Schema Zod trong `validators/<domain>.validator.ts`.
2. Model trong `models/` nếu cần collection mới.
3. Logic trong `services/<domain>.service.ts`.
4. Controller mỏng trong `controllers/<domain>.controller.ts`.
5. Route trong `routes/<domain>.routes.ts`, đăng ký vào `routes/index.ts`.
6. Cập nhật bảng endpoint trong `README.md` và `ENDPOINTS` ở frontend nếu frontend dùng.

## 5. Quy ước code

- TypeScript strict, không `any`. Dữ liệu ngoài (body, env, response dịch vụ ngoài) phải qua Zod trước khi dùng.
- Import nội bộ luôn có `.js` (ESM NodeNext): `import { env } from '../config/env.js'`.
- Controller bọc bằng `asyncHandler`, không try/catch thủ công. Lỗi nghiệp vụ ném `ApiError`, không `res.status().json()` trong service.
- Không log `req.body`, không log dữ liệu sức khỏe hay PII. `logger` đã redact `authorization`, `password`, `token`.
- Model: `timestamps: true`; trường mật khẩu `select: false`; trường tham chiếu user đặt `index: true`.
- Không trả về `password` hay `__v` cho client. Dùng hàm `toPublicUser`-style trong service.
- Tên file: `xxx.routes.ts`, `xxx.controller.ts`, `xxx.service.ts`, `xxx.validator.ts`, model `Xxx.ts`.
- Message lỗi hướng người dùng bằng tiếng Việt có dấu. Tên biến/hàm/comment tiếng Anh.
- Không cài thư viện mới khi chưa hỏi.

## 6. Quy tắc riêng cho sản phẩm y tế

- Không hardcode lời khuyên y khoa, liều thuốc, chẩn đoán trong backend. Nội dung này đến từ dịch vụ AI trong `../ai`, backend chỉ chuyển tiếp và lưu.
- Mọi response chat/gợi ý phải kèm trường `disclaimer` (yêu cầu AI-04). Không bỏ trường này.
- Dữ liệu hồ sơ y tế, chat, ảnh đơn thuốc là PII nhạy cảm: chỉ truy vấn theo `req.userId`, không bao giờ cho user này đọc dữ liệu user khác.
- Ảnh upload: chỉ JPEG/PNG/WEBP, ≤10MB (`middlewares/upload.ts`). Không lưu base64 trong DB.
- Prompt gửi AI phải kèm ngữ cảnh (thời tiết, vị trí, cảm nhận, lịch sử bệnh) nhưng **không** kèm email, tên, số điện thoại.

## 7. Những điều KHÔNG làm

- Không sửa `tsconfig.json`, `package.json` khi không được yêu cầu.
- Không commit `.env`. Biến mới phải thêm vào `.env.example` **và** `config/env.ts`.
- Không ghi route trực tiếp trong `app.ts`; luôn qua `routes/`.
- Không truy cập Mongoose trong controller hoặc route.
- Không viết lại toàn bộ file khi chỉ cần sửa vài dòng.
- Không tự ý thêm tính năng ngoài phạm vi yêu cầu.

## 8. Khi hoàn thành một task

1. Chạy `npm run typecheck`.
2. Nếu thêm endpoint: cập nhật bảng trong `README.md`.
3. Tóm tắt ngắn: file đã thay đổi, quyết định đáng chú ý, việc còn dang dở.
