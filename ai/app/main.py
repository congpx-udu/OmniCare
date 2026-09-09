"""OmniCare AI service — FastAPI.

Giai đoạn 0: chỉ có /health để backend kiểm tra kết nối.
Giai đoạn 3 thêm POST /chat (LLM), Giai đoạn 4 thêm POST /ocr.
"""

from fastapi import FastAPI

from app.config import settings
from app.routers import health

app = FastAPI(
    title="OmniCare AI Service",
    version="0.1.0",
    description="Dịch vụ AI/OCR nội bộ. Chỉ backend gọi, không mở ra ngoài.",
)

app.include_router(health.router)


@app.get("/", include_in_schema=False)
def root() -> dict[str, str]:
    return {"service": settings.service_name, "docs": "/docs"}
