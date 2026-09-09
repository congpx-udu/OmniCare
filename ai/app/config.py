"""Đọc biến môi trường. Thiếu biến bắt buộc thì fail ngay khi khởi động."""

import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    service_name: str = "omnicare-ai"
    env: str = os.getenv("AI_ENV", "development")
    port: int = int(os.getenv("AI_PORT", "8000"))
    # Dùng ở Giai đoạn 3 (chat). Để trống được trong Giai đoạn 0.
    anthropic_api_key: str | None = os.getenv("ANTHROPIC_API_KEY") or None
    # Disclaimer bắt buộc kèm mọi response chat/gợi ý (yêu cầu AI-04)
    medical_disclaimer: str = (
        "OmniCare không thay thế chẩn đoán y khoa. Hãy gặp bác sĩ khi có triệu chứng nghiêm trọng."
    )

    @property
    def is_prod(self) -> bool:
        return self.env == "production"


settings = Settings()
