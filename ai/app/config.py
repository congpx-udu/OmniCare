"""Đọc biến môi trường. Thiếu biến bắt buộc thì fail ngay khi khởi động."""

import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    service_name: str = "omnicare-ai"
    env: str = os.getenv("AI_ENV", "development")
    port: int = int(os.getenv("AI_PORT", "8000"))

    # LLM qua API kiểu OpenAI (chat/completions). Mặc định GLM của Zhipu (bigmodel.cn).
    # Đổi LLM_BASE_URL/LLM_MODEL là dùng được nhà cung cấp khác có cùng chuẩn.
    llm_api_key: str | None = os.getenv("LLM_API_KEY") or None
    llm_base_url: str = os.getenv("LLM_BASE_URL", "https://open.bigmodel.cn/api/paas/v4").rstrip("/")
    llm_model: str = os.getenv("LLM_MODEL", "glm-4.7")
    llm_timeout: float = float(os.getenv("LLM_TIMEOUT", "20"))
    llm_max_tokens: int = int(os.getenv("LLM_MAX_TOKENS", "2000"))

    # Disclaimer bắt buộc kèm mọi response chat/gợi ý (yêu cầu AI-04)
    medical_disclaimer: str = (
        "OmniCare không thay thế chẩn đoán y khoa. Hãy gặp bác sĩ khi có triệu chứng nghiêm trọng."
    )

    @property
    def is_prod(self) -> bool:
        return self.env == "production"

    @property
    def llm_configured(self) -> bool:
        return self.llm_api_key is not None


settings = Settings()
