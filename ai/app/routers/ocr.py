"""POST /ocr — OCR + bóc tách bệnh án/đơn thuốc in máy bằng LLM đa phương thức (một bước)."""

import re
import time
import unicodedata

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


def _slug(label: str, used: set[str]) -> str:
    base = unicodedata.normalize("NFKD", label).encode("ascii", "ignore").decode()
    base = re.sub(r"[^a-z0-9]+", "_", base.lower()).strip("_") or "col"
    key, n = base, 2
    while key in used:
        key, n = f"{base}_{n}", n + 1
    used.add(key)
    return key


def _normalize_table(raw_table: object) -> dict:
    """Ép bảng thuốc về {columns:[{key,label}], rows:[{key: value}]} với key duy nhất, tối đa 8 cột / 30 dòng."""
    if not isinstance(raw_table, dict):
        return {"columns": [], "rows": []}
    used: set[str] = set()
    columns: list[dict] = []
    key_by_src: dict[str, str] = {}
    cols_in = raw_table.get("columns")
    rows_in = raw_table.get("rows")
    for c in cols_in if isinstance(cols_in, list) else []:
        label = _clean_str(c.get("label") if isinstance(c, dict) else c)
        if not label:
            continue
        src_key = str(c.get("key") if isinstance(c, dict) and c.get("key") else label)
        key = _slug(label, used)
        key_by_src[src_key] = key
        key_by_src[label] = key
        columns.append({"key": key, "label": label})
        if len(columns) >= 8:
            break
    rows: list[dict] = []
    for r in rows_in if isinstance(rows_in, list) else []:
        if not isinstance(r, dict):
            continue
        row = {c["key"]: None for c in columns}
        for k, v in r.items():
            key = key_by_src.get(str(k))
            if key:
                row[key] = _clean_str(v)
        if any(row.values()):
            rows.append(row)
        if len(rows) >= 30:
            break
    return {"columns": columns, "rows": rows}


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
                "quantity": _clean_str(m.get("quantity")),
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
        "medication_table": _normalize_table(raw.get("medication_table")),
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
