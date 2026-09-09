"""POST /insights/weather — "Ảnh hưởng đến bạn": thời tiết hôm nay + hồ sơ → lưu ý theo thời điểm."""

import time

from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import ValidationError

from app.config import settings
from app.schemas.insight import WeatherInsightRequest, WeatherInsightResponse
from app.services.llm import LLMError, chat_json
from app.services.prompts import build_insight_prompt

router = APIRouter(tags=["insights"])


@router.post("/insights/weather", response_model=WeatherInsightResponse)
async def weather_insight(req: WeatherInsightRequest) -> WeatherInsightResponse:
    system, user = build_insight_prompt(req)
    started = time.perf_counter()
    try:
        raw, model = await run_in_threadpool(
            chat_json, system, [{"role": "user", "content": user}], temperature=0.3
        )
        summary = str(raw.get("summary") or "").strip()
        if not summary:
            raise LLMError("LLM không trả về summary")
        tips = [t for t in raw.get("tips") or [] if isinstance(t, dict)][:4]
        return WeatherInsightResponse(
            summary=summary,
            tips=tips,
            meal_idea=(raw.get("meal_idea") or None),
            activity_idea=(raw.get("activity_idea") or None),
            disclaimer=settings.medical_disclaimer,
            model=model,
            latency_ms=int((time.perf_counter() - started) * 1000),
        )
    except LLMError as exc:
        raise HTTPException(status_code=exc.status, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=502, detail="Phản hồi LLM không đúng schema") from exc
