# OmniCare — AI Service

Dịch vụ AI/OCR nội bộ của **OmniCare**, viết bằng Python + FastAPI. Chỉ backend Express gọi vào (qua `AI_SERVICE_URL`), không mở ra Internet.

> ⚠️ OmniCare không thay thế chẩn đoán y khoa. Mọi response chat/gợi ý phải kèm `disclaimer`.

## Trạng thái

| Endpoint | Giai đoạn | Trạng thái |
|---|---|---|
| `GET /health` | 0 | ✅ |
| `POST /chat` — phân tích triệu chứng, gợi ý thực đơn/vận động (LLM) | 3 | ⏳ |
| `POST /ocr` — OCR đơn thuốc/bệnh án in máy → JSON có cấu trúc | 4 | ⏳ |

## Chạy

```bash
cd ai
python -m venv .venv
.venv\Scripts\activate           # Windows  |  source .venv/bin/activate (macOS/Linux)
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000     # http://localhost:8000/health, docs tại /docs
```

Hoặc bằng Docker ở thư mục gốc repo: `docker compose up -d --build ai`.

## Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `AI_ENV` | `development` | `development` / `production` |
| `AI_PORT` | `8000` | Cổng uvicorn (chỉ dùng khi chạy tay) |
| `LLM_API_KEY` | | Khóa API LLM (GLM/Zhipu hoặc nhà cung cấp OpenAI-compatible), cần cho `/chat` |
| `LLM_BASE_URL` | `https://open.bigmodel.cn/api/paas/v4` | Base URL API chat/completions. Gemini: `https://generativelanguage.googleapis.com/v1beta/openai` (model `gemini-3.5-flash-lite`) |
| `LLM_MODEL` | `glm-4.7` | Tên model |
| `LLM_TIMEOUT` | `20` | Timeout mỗi lần gọi (giây), retry 1 lần |
| `LLM_MAX_TOKENS` | `2000` | Giới hạn token trả về |

## Cấu trúc

```
app/
├── main.py           Tạo FastAPI app, include router
├── config.py         Settings đọc từ env (.env qua python-dotenv)
├── routers/
│   ├── health.py     GET /health
│   ├── chat.py       POST /chat — hai luồng food / symptom, output JSON ép schema
│   ├── insight.py    POST /insights/weather
│   └── ocr.py        POST /ocr — ảnh base64 → JSON bệnh án/đơn thuốc (LLM vision, một bước) — "ảnh hưởng đến bạn" theo hồ sơ + giờ trong ngày
├── schemas/          chat.py, insight.py
└── services/
    ├── llm.py        Client chat/completions (urllib), ép JSON, retry
    └── prompts.py    System prompt + ngữ cảnh (hồ sơ ẩn danh, thời tiết, cảm nhận)
```

## POST /chat

Body: `{ mode: "food" | "symptom", messages: [{role, content}], profile?: {age, gender, height_cm, weight_kg, bmi, chronic_conditions[], allergies[]}, weather?: {location, temp, feels_like, humidity, description, rain_chance}, feeling?, records_summary? }`.

Trả: `{ mode, reply, risk_level, possible_conditions[], suggested_specialty, facility_type, follow_up_questions[], meals[], activities[], disclaimer, model, latency_ms }`.

## POST /insights/weather

Body: `{ profile?, weather, forecast_note?, local_time?, time_of_day? }` → `{ summary, tips[{title, detail}], meal_idea, activity_idea, disclaimer, model, latency_ms }`. Gợi ý bữa ăn/vận động bám theo buổi trong ngày.

## POST /ocr

Body: `{ images: [{ image_base64, mime_type: image/jpeg|png|webp }] (1–8 trang cùng bộ hồ sơ), hint_type? }` → `{ document_type, facility, doctor, visit_date, diagnosis, medications[{name, dose, frequency, duration, instructions}], medication_table {columns[{key,label}], rows[]} (bảng đúng cột của tài liệu), notes, raw_text (mỗi trang mở đầu bằng `--- Trang N ---`), pages_read, confidence, warnings[], model, latency_ms }`. Nhiều ảnh được gộp thành một kết quả. Dùng LLM đa phương thức (Gemini) đọc ảnh trực tiếp, không cần Tesseract. 422 nếu không đọc được gì. Lỗi LLM: 503 (chưa cấu hình / key sai / quá tải), 502 (phản hồi lỗi), 504 (timeout).

Thêm endpoint mới: tạo `app/routers/<domain>.py` với `APIRouter`, schema request/response bằng Pydantic, rồi `include_router` trong `main.py`.

## Quy ước

- Pydantic cho mọi input/output, không trả dict tự do.
- Không log nội dung triệu chứng, ảnh hay PII.
- Không nhận email/tên/số điện thoại trong payload. Backend chỉ gửi ngữ cảnh sức khỏe ẩn danh.
