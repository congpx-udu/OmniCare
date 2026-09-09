"""Client tối giản cho API chat/completions kiểu OpenAI (GLM, Gemini, ...) bằng thư viện chuẩn.

Không dùng SDK để tránh thêm dependency; gọi blocking trong threadpool của FastAPI.
"""

import json
import logging
import re
import urllib.error
import urllib.request
from typing import Any

from app.config import settings

log = logging.getLogger("omnicare.llm")


class LLMError(Exception):
    """Lỗi gọi LLM: mạng, HTTP, hoặc output không parse được."""

    def __init__(self, message: str, status: int = 502) -> None:
        super().__init__(message)
        self.status = status


class LLMNotConfigured(LLMError):
    def __init__(self) -> None:
        super().__init__("LLM chưa được cấu hình (thiếu LLM_API_KEY)", status=503)


def _extra_params() -> dict[str, Any]:
    """Tham số riêng theo nhà cung cấp, để giữ NFR-03 (trả lời ≤ 5s) và không cắt JSON.

    - GLM 4.5+: 'thinking' bật mặc định → tắt.
    - Gemini (OpenAI-compatible): thinking mặc định ngốn max_tokens làm JSON bị cắt → reasoning_effort=low.
    """
    host = settings.llm_base_url
    if "bigmodel.cn" in host or "z.ai" in host:
        return {"thinking": {"type": "disabled"}}
    if "googleapis.com" in host:
        return {"reasoning_effort": "low"}
    return {}


def _repair_json(text: str) -> str:
    """Sửa lỗi JSON hay gặp ở LLM: xuống dòng/tab thật bên trong chuỗi, dấu phẩy thừa trước ] hoặc }."""
    out: list[str] = []
    in_str = False
    escaped = False
    for ch in text:
        if in_str:
            if escaped:
                escaped = False
                out.append(ch)
            elif ch == "\\":
                escaped = True
                out.append(ch)
            elif ch == '"':
                in_str = False
                out.append(ch)
            elif ch == "\n":
                out.append("\\n")
            elif ch == "\r":
                out.append("\\r")
            elif ch == "\t":
                out.append("\\t")
            else:
                out.append(ch)
        else:
            if ch == '"':
                in_str = True
            out.append(ch)
    repaired = "".join(out)
    return re.sub(r",\s*([\]}])", r"\1", repaired)


def _extract_json(text: str) -> dict[str, Any]:
    """Model đôi khi bọc JSON trong ```json ... ``` hoặc thêm chữ; lấy object đầu tiên, sửa lỗi nhẹ."""
    text = text.strip()
    fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.S)
    if fenced:
        text = fenced.group(1)
    if not text.startswith("{"):
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1:
            raise LLMError("LLM không trả về JSON")
        text = text[start : end + 1]
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        try:
            data = json.loads(_repair_json(text))
        except json.JSONDecodeError as exc:
            raise LLMError("JSON từ LLM không hợp lệ") from exc
    if not isinstance(data, dict):
        raise LLMError("JSON từ LLM không phải object")
    return data


def chat_json(
    system: str,
    messages: list[dict[str, Any]],
    *,
    temperature: float = 0.4,
    retries: int = 1,
    max_tokens: int | None = None,
) -> tuple[dict[str, Any], str]:
    """Gọi chat/completions ép JSON, trả (dict, model). Thử lại 1 lần khi lỗi mạng/JSON."""
    if not settings.llm_api_key:
        raise LLMNotConfigured()

    payload: dict[str, Any] = {
        "model": settings.llm_model,
        "messages": [{"role": "system", "content": system}, *messages],
        "temperature": temperature,
        "max_tokens": max_tokens or settings.llm_max_tokens,
        "response_format": {"type": "json_object"},
        **_extra_params(),
    }
    req = urllib.request.Request(
        f"{settings.llm_base_url}/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.llm_api_key}",
        },
        method="POST",
    )

    last_error: LLMError | None = None
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=settings.llm_timeout) as res:
                body = json.loads(res.read().decode("utf-8"))
            choice = body["choices"][0]
            content = choice["message"]["content"]
            model = str(body.get("model", settings.llm_model))
            try:
                return _extract_json(content), model
            except LLMError:
                # Không log nội dung (có thể là dữ liệu y tế); chỉ log kích thước và lý do dừng
                log.warning(
                    "LLM JSON parse failed: len=%s finish_reason=%s",
                    len(content or ""),
                    choice.get("finish_reason"),
                )
                raise
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")[:300]
            log.warning("LLM HTTP %s (attempt %s): %s", exc.code, attempt, detail)
            if exc.code in (401, 403):
                raise LLMError("API key LLM không hợp lệ", status=503) from exc
            if exc.code == 429:
                last_error = LLMError("LLM đang quá tải, thử lại sau", status=503)
            else:
                last_error = LLMError("Dịch vụ LLM trả lỗi", status=502)
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            log.warning("LLM network error (attempt %s): %s", attempt, exc)
            last_error = LLMError("Không kết nối được dịch vụ LLM", status=504)
        except (KeyError, IndexError, TypeError) as exc:
            log.warning("LLM response shape unexpected (attempt %s): %s", attempt, exc)
            last_error = LLMError("Phản hồi LLM không đúng định dạng", status=502)
        except LLMError as exc:
            log.warning("LLM JSON error (attempt %s): %s", attempt, exc)
            last_error = exc
    assert last_error is not None
    raise last_error
