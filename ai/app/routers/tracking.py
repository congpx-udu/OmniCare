"""POST /insights/tracking — phân tích nhật ký sức khỏe, đề xuất hoạt động cải thiện theo thời điểm."""

import time

from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import ValidationError

from app.config import settings
from app.schemas.tracking import TrackingRequest, TrackingResponse
from app.services.llm import LLMError, chat_json
from app.services.prompts import build_tracking_prompt

router = APIRouter(tags=["insights"])

_DIRS = {"up", "down", "stable"}
_LEVELS = {"info", "warning", "urgent"}
_CATS = {"activity", "sleep", "diet", "checkup", "other"}


def _s(v: object) -> str | None:
    if v is None:
        return None
    t = str(v).strip()
    return t or None


def _normalize(raw: dict) -> dict:
    trends = []
    for t in raw.get("trends") or []:
        if isinstance(t, dict) and _s(t.get("metric")) and _s(t.get("comment")):
            d = t.get("direction")
            trends.append(
                {
                    "metric": _s(t["metric"]),
                    "direction": d if d in _DIRS else "stable",
                    "comment": _s(t["comment"]),
                }
            )
    alerts = []
    for a in raw.get("alerts") or []:
        if isinstance(a, dict) and _s(a.get("message")):
            lv = a.get("level")
            alerts.append({"level": lv if lv in _LEVELS else "info", "message": _s(a["message"])})
    suggestions = []
    for s in raw.get("suggestions") or []:
        if isinstance(s, dict) and _s(s.get("title")) and _s(s.get("detail")):
            c = s.get("category")
            suggestions.append(
                {
                    "title": _s(s["title"]),
                    "detail": _s(s["detail"]),
                    "category": c if c in _CATS else "other",
                    "when": _s(s.get("when")),
                }
            )
    return {
        "summary": _s(raw.get("summary")) or "",
        "trends": trends[:6],
        "alerts": alerts[:4],
        "suggestions": suggestions[:5],
    }


@router.post("/insights/tracking", response_model=TrackingResponse)
async def tracking_insight(req: TrackingRequest) -> TrackingResponse:
    system, user = build_tracking_prompt(req)
    started = time.perf_counter()
    try:
        raw, model = await run_in_threadpool(
            chat_json,
            system,
            [{"role": "user", "content": user}],
            temperature=0.3,
            max_tokens=3000,
        )
        data = _normalize(raw)
        if not data["summary"]:
            raise LLMError("LLM không trả về summary")
        return TrackingResponse(
            **data,
            disclaimer=settings.medical_disclaimer,
            model=model,
            latency_ms=int((time.perf_counter() - started) * 1000),
        )
    except LLMError as exc:
        raise HTTPException(status_code=exc.status, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=502, detail="Phản hồi LLM không đúng schema") from exc
