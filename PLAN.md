# OmniCare — Kế hoạch triển khai MVP

Nguồn yêu cầu: BRD-001 v1.0 (Google Docs, 01/09/2026). Kế hoạch này đi từ mức cơ sở nhất: chạy được hệ thống end-to-end trước, rồi mới thêm từng tính năng theo thứ tự ưu tiên trong BRD.

## 0. Hiện trạng (08/09/2026)

| Thành phần | Trạng thái |
|---|---|
| `backend/` | Skeleton Express 5 + Mongoose hoàn chỉnh: env, logger, errorHandler, JWT auth (`/auth/register`, `/auth/login`, `/auth/me`), 4 model (User, HealthProfile, ChatMessage, MedicalRecord), middleware upload. Typecheck sạch. Chưa có route chat / ocr / profile / context. |
| `frontend/web/` | Skeleton React 19 + Vite + Tailwind v4 + Redux + Router. Layout, disclaimer, authSlice, authService, các page đều là placeholder (chỉ có tiêu đề). Chưa có trang Register, chưa có route guard. |
| `ai/` | Trống. |
| `docker-compose.yml`, `README.md` (root) | Trống. Chưa có MongoDB local (`mongod` không có trên máy, có Docker). |
| Tài liệu BRD | Đã có BRD + Personas. Các mục **BPMN, Use Case, SRS, NFRs & Compliance, Thiết kế DL & UI còn trống**. |
| Git | Thư mục chưa `git init`. Root `.gitignore` đang ignore cả thư mục `docs/`. |

## 1. Ánh xạ yêu cầu BRD → module

| ID | Yêu cầu | P | Backend | AI service | Frontend |
|---|---|---|---|---|---|
| AI-01 | Chatbot triệu chứng, gợi ý chuyên khoa | 1 | `POST /chat`, `GET /chat/history` | `POST /chat` (LLM) | ChatPage |
| AI-02 | API thời tiết + vị trí realtime | 1 | `GET /context/weather` | — | `useGeolocation`, ContextBar |
| AI-03 | Gợi ý thực đơn/vận động = triệu chứng + thời tiết + lịch sử | 1 | gom context gửi AI | prompt có context | Hiển thị gợi ý trong chat |
| AI-04 | Disclaimer trên mọi khung chat | 1 | trường `disclaimer` trong response | — | `<MedicalDisclaimer />` (đã có) |
| DM-03 | Profile sức khỏe | 1 | `GET/PUT /profile` | — | ProfilePage |
| DM-01 | Upload ảnh bệnh án/đơn thuốc | 2 | `POST /ocr/upload` (multer đã có) | — | OcrPage dropzone |
| DM-02 | OCR in máy → dữ liệu cấu trúc | 2 | `GET /ocr/:id`, lưu MedicalRecord | `POST /ocr` | Hiển thị kết quả, cho sửa |
| Dashboard | Nhắc thuốc, cảnh báo chỉ số | 2-3 | `Reminder` model, `/reminders` | — | DashboardPage |
| NFR-03 | Chat ≤ 3-5s | — | cache thời tiết, timeout | streaming/model nhanh | loading state |
| NFR-04 | OCR tiếng Việt ≥ 85% | — | — | chọn engine + test set | — |
| NFR-05 | PII, JWT | — | đã có JWT; cần rate limit, hash | không log PII | token trong localStorage |

## 2. Lộ trình theo giai đoạn

Mỗi giai đoạn kết thúc bằng một thứ **chạy được và demo được**. Không sang giai đoạn sau khi giai đoạn trước chưa xanh (typecheck + lint + chạy tay).

### Giai đoạn 0 — Nền tảng chạy được (1-2 ngày)

Mục tiêu: `docker compose up` → mở web → đăng ký → đăng nhập → thấy trang chủ có tên mình.

1. `git init`, sửa root `.gitignore` (bỏ ignore `docs/`, thêm `node_modules`, `.env*`, `uploads/*`, `dist/`).
2. `docker-compose.yml`: service `mongo` (7.x, volume), sau này thêm `backend`, `ai`, `web`.
3. Root `README.md`: cách chạy 3 service, cấu trúc repo, link BRD.
4. Backend: xác nhận `npm run dev` kết nối Mongo, gọi thử 3 endpoint auth bằng curl/REST client. Thêm `express-rate-limit` cho `/auth/*` (hỏi trước khi cài).
5. Frontend: `RegisterPage`, hoàn thiện `LoginPage` với form + Zod, `RequireAuth` guard cho các route trong `MainLayout`, `authSlice` gọi `/auth/me` khi có token. Header hiển thị tên user + nút đăng xuất.
6. `ai/`: khởi tạo FastAPI tối thiểu với `GET /health`, `requirements.txt`, `Dockerfile`, `.env.example`. Backend `GET /api/health` gọi sang AI health để thấy toàn chuỗi thông.

### Giai đoạn 1 — Profile sức khỏe (DM-03) (1 ngày)

1. Backend: `profile.validator.ts`, `profile.service.ts` (upsert theo `req.userId`), `profile.controller.ts`, `profile.routes.ts` (`GET /profile`, `PUT /profile`).
2. Frontend: `profileService.ts`, `profileSlice.ts`, `ProfilePage` form (chiều cao, cân nặng, ngày sinh, bệnh nền, dị ứng) validate Zod.
3. Đây là dữ liệu nền cho prompt AI ở giai đoạn 3.

### Giai đoạn 2 — Bối cảnh môi trường (AI-02) (1 ngày)

1. Backend: `context.service.ts` gọi OpenWeather Current Weather + Reverse Geocoding (cùng key, không cần Google Maps ở MVP). Cache theo (lat, lon làm tròn 2 số) trong 10 phút để giữ NFR-03. Validate response bằng Zod.
2. `GET /context/weather?lat=&lon=` hoặc `?city=` (fallback nhập tay theo quy tắc frontend).
3. Frontend: `contextService.ts`, component `ContextBar` (vị trí, nhiệt độ, độ ẩm, mô tả) dùng `useGeolocation`. Hiện ở trang chủ và trên khung chat.

### Giai đoạn 3 — Chatbot AI (AI-01, AI-03, AI-04) (3-4 ngày) — lõi MVP

**AI service (`ai/`, Python FastAPI):**
1. `POST /chat` nhận `{ messages[], context: { weather, location, feeling }, profile: { age, heightCm, weightKg, chronicConditions, allergies }, history_summary }` → trả `{ reply, suggested_specialty?, recommendations: { meals[], activities[] }, risk_level, disclaimer }`.
2. System prompt: vai trò triage sơ bộ, **không chẩn đoán/kê đơn**, luôn khuyên gặp bác sĩ khi có dấu hiệu nguy hiểm (red flags), gợi ý thực đơn/vận động theo thời tiết + thể trạng. Output ép JSON bằng schema (Pydantic).
3. LLM: dùng Claude API (đọc skill `claude-api` trước khi viết). Có timeout 20s, retry 1 lần.
4. Test bộ prompt với 10-15 kịch bản từ 3 persona (Appendix 2 của BRD) — lưu trong `ai/tests/scenarios/`.

**Backend:**
5. `chat.validator.ts`, `chat.service.ts`: lấy profile + 10 tin gần nhất + context → gọi AI → lưu cả 2 message vào `ChatMessage` → trả response kèm `disclaimer`.
6. `POST /chat`, `GET /chat/history?limit=`. Không gửi email/tên sang AI.

**Frontend:**
7. `chatService.ts`, `chatSlice.ts`, `ChatPage` với `MessageBubble`, `ChatInput`, ô "cảm nhận hôm nay", `ContextBar`, `<MedicalDisclaimer />` cố định, card gợi ý thực đơn/vận động.

### Giai đoạn 4 — OCR đơn thuốc/bệnh án (DM-01, DM-02) (3-4 ngày)

1. AI service `POST /ocr`: nhận ảnh → OCR (bắt đầu với Tesseract `vie`, đo accuracy trên test set Appendix 1; nếu < 85% chuyển sang PaddleOCR hoặc Vision LLM) → LLM bóc tách JSON `{ diagnosis, medications[{name, dose, frequency, duration}], doctor, facility, date }`.
2. Backend: `POST /ocr/upload` (multer đã có) tạo `MedicalRecord` status `pending`, gọi AI, cập nhật `done/failed`. `GET /ocr/:id`, `GET /ocr` (danh sách/timeline).
3. Frontend: `OcrPage` dropzone + preview, trạng thái xử lý, hiển thị kết quả cho **người dùng sửa tay** rồi lưu, timeline hồ sơ.
4. Sau bước này, `chat.service` đưa tóm tắt hồ sơ vào prompt (hoàn thiện AI-03).

### Giai đoạn 5 — Dashboard & nhắc nhở (2-3 ngày)

1. Model `Reminder` (thuốc, giờ, lặp), `GET/POST/PATCH/DELETE /reminders`. Tự đề xuất reminder từ kết quả OCR.
2. `DashboardPage`: reminder hôm nay, chỉ số cơ bản (BMI), cảnh báo thời tiết cho persona 2, hồ sơ gần nhất.
3. Thông báo trong app (chưa push notification).

### Giai đoạn 6 — Củng cố NFR & bàn giao (2-3 ngày)

1. NFR-05: rate limit, helmet CSP, kiểm tra IDOR (mọi query theo `userId`), đổi lưu token sang httpOnly cookie nếu còn thời gian.
2. NFR-03: đo latency chat, cache thời tiết, streaming nếu cần.
3. Test: backend `vitest` + `supertest` cho auth/profile/chat; AI service `pytest` cho schema output.
4. Dockerfile cho 3 service, `docker compose up` chạy trọn bộ. CI cơ bản (typecheck, lint, test).
5. RAG (mục Glossary BRD) — chỉ làm nếu prompt thuần LLM bịa thông tin trong test giai đoạn 3.

## 3. Tài liệu cần bổ sung vào Google Docs (song song giai đoạn 0-1)

- **Use Case Diagram**: 1 actor User; use case Đăng ký/Đăng nhập, Quản lý profile, Chat triệu chứng, Xem gợi ý, Upload & OCR, Xem timeline hồ sơ, Quản lý nhắc nhở.
- **BPMN**: 2 luồng chính — Chat (context inputs → AI → lưu → hiển thị) và OCR (upload → OCR → bóc tách → user xác nhận → lưu).
- **SRS**: chốt API contract theo bảng mục 1 và schema JSON của AI service.
- **Thiết kế dữ liệu**: 5 collection User, HealthProfile, ChatMessage, MedicalRecord, Reminder (đã có 4 trong code, dùng làm nguồn).
- **NFRs & Compliance**: bổ sung red-flag policy cho chatbot và chính sách lưu trữ ảnh.

## 4. Quyết định kỹ thuật cần chốt sớm

1. **LLM cho chat & bóc tách OCR**: đề xuất Claude API (đã có sẵn skill). Cần API key.
2. **Engine OCR**: Tesseract `vie` trước vì miễn phí, đo accuracy rồi quyết.
3. **Vị trí**: dùng OpenWeather Geocoding thay Google Maps ở MVP (một key, ít chi phí). Google Maps để dành cho gợi ý quán ăn gần đó (persona 3, giai đoạn sau).
4. **Mobile**: BRD nói Web + Mobile; MVP làm web responsive trước.

## 5. Thứ tự việc ngay hôm nay

1. `git init` + sửa `.gitignore` + commit skeleton.
2. `docker-compose.yml` với Mongo, chạy backend, test 3 endpoint auth.
3. Frontend Register/Login/guard.
4. Khởi tạo `ai/` FastAPI health.
