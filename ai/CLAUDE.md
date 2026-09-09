# CLAUDE.md — Quy tắc cho AI khi làm việc trong `ai/`

Dịch vụ AI/OCR của **OmniCare**, Python 3.12 + FastAPI. Backend Express (`../backend`) là client duy nhất.

## Stack & lệnh

- FastAPI, Pydantic v2, uvicorn, python-dotenv. Chưa có linter/test runner; thêm `ruff` và `pytest` khi được yêu cầu.
- Chạy: `uvicorn app.main:app --reload --port 8000`. Docker: `docker compose up -d --build ai` ở gốc repo.
- LLM gọi qua API kiểu OpenAI `chat/completions` (mặc định GLM của Zhipu) bằng `urllib` chuẩn trong `app/services/llm.py`; cấu hình `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`. Không dùng SDK.

## Vị trí code

| Đường dẫn | Chứa gì |
|---|---|
| `app/main.py` | Tạo app, include router. Không viết logic ở đây. |
| `app/config.py` | `settings` đọc env. Biến mới phải thêm vào `.env.example`. |
| `app/routers/<domain>.py` | `APIRouter` + schema Pydantic cho từng domain (`health`, `chat`, `ocr`). |
| `app/services/` | `llm.py` (client chat/completions, ép JSON, retry 1 lần), `prompts.py` (system prompt hai luồng food/symptom). |
| `app/schemas/` | `chat.py`: ChatRequest/ChatResponse. |

## Quy tắc sản phẩm y tế

- Mọi response chat/gợi ý phải có trường `disclaimer` = `settings.medical_disclaimer` (AI-04).
- Không chẩn đoán chính thức, không kê đơn, không nêu liều. Có red flags thì khuyên gặp bác sĩ ngay.
- Payload không chứa PII (tên, email, số điện thoại). Không log triệu chứng, ảnh, nội dung chat.
- Output LLM phải ép về schema Pydantic, không trả text tự do cho backend.

## Không làm

- Không cài thư viện mới khi chưa hỏi.
- Không mở CORS: dịch vụ này không phục vụ trình duyệt.
- Không sửa `Dockerfile`, `requirements.txt` khi không được yêu cầu.
