"""OmniCare AI service — FastAPI.

/health: backend kiểm tra kết nối. /chat: LLM hai luồng (food, symptom). /ocr: OCR + bóc tách bệnh án/đơn thuốc bằng LLM đa phương thức.
"""

from fastapi import FastAPI

from app.config import settings
from app.routers import chat, health, insight, ocr

app = FastAPI(
    title="OmniCare AI Service",
    version="0.1.0",
    description="Dịch vụ AI/OCR nội bộ. Chỉ backend gọi, không mở ra ngoài.",
)

app.include_router(health.router)
app.include_router(chat.router)
app.include_router(insight.router)
app.include_router(ocr.router)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {"service": settings.service_name, "docs": "/docs"}
