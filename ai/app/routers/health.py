import time

from fastapi import APIRouter
from pydantic import BaseModel

from app.config import settings

router = APIRouter(tags=["health"])
_started_at = time.monotonic()


class HealthResponse(BaseModel):
    status: str
    service: str
    env: str
    uptime: float
    llm_configured: bool


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.service_name,
        env=settings.env,
        uptime=round(time.monotonic() - _started_at, 2),
        llm_configured=settings.anthropic_api_key is not None,
    )
