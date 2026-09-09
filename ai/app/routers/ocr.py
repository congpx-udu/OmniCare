"""POST /ocr — OCR + bóc tách bệnh án/đơn thuốc in máy bằng LLM đa phương thức (một bước)."""

import time

from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from pydantic import ValidationError

from app.schemas.ocr import OcrRequest, OcrResponse
from app.services.llm import LLMError, chat_json
from app.services.prompts import OCR_SYSTEM, build_ocr_user_content

router = APIRouter(tags=["ocr"])

_DOC_TYPES = {"prescription", "medical_record", "lab_result", "other"}


def _clean_str(v: object) -> str | None:
    if v is None:
        return None
    s = str(v).strip()
    return s or None


def _normalize(raw: dict) -> dict:
    meds = []
    for m in raw.get("medications") or []:
        if not isinstance(m, dict) or not _clean_str(m.get("name")):
            continue
        meds.append(
            {
                "name": _clean_str(m.get("name")),
                "dose": _clean_str(m.get("dose")),
                "frequency": _clean_str(m.get("frequency")),
                "duration": _clean_str(m.get("duration")),
                "instructions": _clean_str(m.get("instructions")),
            }
        )
    doc_type = raw.get("document_type")
    try:
        confidence = float(raw.get("confidence", 0.5))
    except (TypeError, ValueError):
        confidence = 0.5
    return {
        "document_type": doc_type if doc_type in _DOC_TYPES else "other",
        "facility": _clean_str(raw.get("facility")),
        "doctor": _clean_str(raw.get("doctor")),
        "visit_date": _clean_str(raw.get("visit_date")),
        "diagnosis": _clean_str(raw.get("diagnosis")),
        "medications": meds[:30],
        "notes": _clean_str(raw.get("notes")),
        "raw_text": str(raw.get("raw_text") or "").strip(),
        "confidence": min(max(confidence, 0.0), 1.0),
        "warnings": [str(w) for w in raw.get("warnings") or []][:5],
    }


@router.post("/ocr", response_model=OcrResponse)
async def ocr(req: OcrRequest) -> OcrResponse:
    # Không log ảnh hay nội dung bóc tách (PII y tế)
    user_content = build_ocr_user_content(req)
    started = time.perf_counter()
    try:
        raw, model = await run_in_threadpool(
            chat_json,
            OCR_SYSTEM,
            [{"role": "user", "content": user_content}],
            temperature=0.1,
            max_tokens=8000,
        )
        data = _normalize(raw)
        if not data["raw_text"] and not data["medications"] and not data["diagnosis"]:
            raise LLMError("Không đọc được nội dung trong ảnh", status=422)
        return OcrResponse(
            **data,
            pages_read=len(req.images),
            model=model,
            latency_ms=int((time.perf_counter() - started) * 1000),
        )
    except LLMError as exc:
        raise HTTPException(status_code=exc.status, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=502, detail="Phản hồi LLM không đúng schema") from exc
