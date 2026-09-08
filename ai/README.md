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
| `ANTHROPIC_API_KEY` | | Khóa Claude API, cần từ Giai đoạn 3 |

## Cấu trúc

```
app/
├── main.py           Tạo FastAPI app, include router
├── config.py         Settings đọc từ env (.env qua python-dotenv)
└── routers/
    └── health.py     GET /health
```

Thêm endpoint mới: tạo `app/routers/<domain>.py` với `APIRouter`, schema request/response bằng Pydantic, rồi `include_router` trong `main.py`.

## Quy ước

- Pydantic cho mọi input/output, không trả dict tự do.
- Không log nội dung triệu chứng, ảnh hay PII.
- Không nhận email/tên/số điện thoại trong payload. Backend chỉ gửi ngữ cảnh sức khỏe ẩn danh.
