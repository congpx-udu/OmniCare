"""POST /chat — hai luồng: food (gợi ý ẩm thực) và symptom (cảm nhận cơ thể)."""

import time

from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import ValidationError

from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.llm import LLMError, chat_json
from app.services.prompts import build_system_prompt

router = APIRouter(tags=["chat"])


def _normalize(mode: str, raw: dict) -> dict:
    """Bảo đảm các trường đúng luồng, bỏ trường lạ, ép kiểu mềm."""
    out: dict = {"mode": mode, "reply": str(raw.get("reply") or "").strip()}
    if not out["reply"]:
        raise LLMError("LLM không trả về nội dung trả lời")
    out["follow_up_questions"] = [str(q) for q in raw.get("follow_up_questions") or []][:3]
    if mode == "health":
        intent = raw.get("intent")
        out["intent"] = intent if intent in ("symptom", "food", "general") else "general"
    if mode in ("food", "health"):
        out["meals"] = [m for m in raw.get("meals") or [] if isinstance(m, dict)][:4]
        out["activities"] = [str(a) for a in raw.get("activities") or []][:3]
    if mode in ("symptom", "health"):
        level = raw.get("risk_level")
        out["risk_level"] = level if level in ("none", "home", "doctor", "emergency") else "none"
        out["possible_conditions"] = [
            c for c in raw.get("possible_conditions") or [] if isinstance(c, dict)
        ][:3]
        out["suggested_specialty"] = raw.get("suggested_specialty") or None
        out["facility_type"] = raw.get("facility_type") or None
    return out


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    system = build_system_prompt(req)
    messages = [{"role": t.role, "content": t.content} for t in req.messages]
    started = time.perf_counter()
    try:
        raw, model = await run_in_threadpool(chat_json, system, messages)
        data = _normalize(req.mode, raw)
        return ChatResponse(
            **data,
            disclaimer=settings.medical_disclaimer,
            model=model,
            latency_ms=int((time.perf_counter() - started) * 1000),
        )
    except LLMError as exc:
        raise HTTPException(status_code=exc.status, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=502, detail="Phản hồi LLM không đúng schema") from exc
