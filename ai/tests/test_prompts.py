"""Prompt phải chứa ngữ cảnh (hồ sơ, thời tiết, giờ) và quy tắc an toàn; không chứa PII."""

from app.schemas.chat import ChatRequest
from app.schemas.insight import WeatherInsightRequest
from app.schemas.tracking import TrackingRequest
from app.services.prompts import (
    OCR_SYSTEM,
    build_insight_prompt,
    build_system_prompt,
    build_tracking_prompt,
)


def _chat(mode: str) -> ChatRequest:
    return ChatRequest(
        mode=mode,
        messages=[{"role": "user", "content": "xin chào"}],
        profile={"age": 34, "gender": "female", "chronic_conditions": ["Tăng huyết áp"], "allergies": ["Hải sản"]},
        weather={"location": "Hà Nội", "temp": 35, "description": "Nắng nóng", "humidity": 60},
        local_time="19:30",
        time_of_day="buổi tối",
    )


def test_food_prompt_has_context_and_allergy_rules():
    p = build_system_prompt(_chat("food"))
    assert "Tăng huyết áp" in p and "Hải sản" in p
    assert "Hà Nội" in p and "35°C" in p
    assert "19:30" in p and "buổi tối" in p
    assert "mắm tôm" in p  # tránh nguyên liệu phái sinh
    assert "KHÔNG phải bác sĩ" in p


def test_food_prompt_includes_pantry_only_for_food_mode():
    req = _chat("food").model_copy(update={"pantry": ["trứng gà", "cà chua", "hành lá"]})
    p = build_system_prompt(req)
    assert "Tủ bếp (nguyên liệu đang có): trứng gà, cà chua, hành lá" in p
    assert "missing" in p

    sym = _chat("symptom").model_copy(update={"pantry": ["trứng gà"]})
    assert "Tủ bếp" not in build_system_prompt(sym)


def test_health_prompt_covers_both_symptom_and_food_and_links_turns():
    req = _chat("health").model_copy(update={"pantry": ["trứng gà"]})
    p = build_system_prompt(req)
    assert "intent" in p and "risk_level" in p and "meals" in p
    assert "MỘT cuộc trò chuyện" in p and "đau dạ dày" in p
    assert "Tủ bếp (nguyên liệu đang có): trứng gà" in p
    assert "115" in p and "Hải sản" in p


def test_prompt_mentions_attached_images():
    req = _chat("health").model_copy(
        update={"images": [{"image_base64": "x" * 120, "mime_type": "image/png"}]}
    )
    p = build_system_prompt(req)
    assert "gửi kèm 1 ảnh" in p and "KHÔNG chẩn đoán" in p


def test_symptom_prompt_has_risk_levels_and_emergency_rule():
    p = build_system_prompt(_chat("symptom"))
    for level in ("emergency", "doctor", "home", "none"):
        assert level in p
    assert "115" in p


def test_insight_prompt_returns_system_and_user():
    system, user = build_insight_prompt(
        WeatherInsightRequest(
            weather={"location": "Đà Nẵng", "temp": 31, "description": "Mưa"},
            forecast_note="ngày mai 24-30°C",
            local_time="07:00",
            time_of_day="buổi sáng",
        )
    )
    assert "JSON" in system and "buổi sáng" in system
    assert "Đà Nẵng" in user and "ngày mai 24-30°C" in user and "07:00" in user


def test_tracking_prompt_lists_logs_with_units():
    system, user = build_tracking_prompt(
        TrackingRequest(
            logs=[
                {"date": "2026-09-01", "weight_kg": 66.5, "systolic": 130, "diastolic": 85, "sleep_hours": 6.5},
                {"date": "2026-09-02", "activity_minutes": 30, "activity_type": "walking", "mood": 4, "note": "ok"},
            ]
        )
    )
    assert "140/90" in system  # ngưỡng cảnh báo mềm
    assert "2026-09-01: cân nặng 66.5 kg, huyết áp 130/85 mmHg" in user
    assert "vận động 30 phút walking" in user and "cảm nhận 4/5" in user


def test_ocr_prompt_forbids_medical_advice_and_asks_for_table():
    assert "medication_table" in OCR_SYSTEM
    assert "Không đưa lời khuyên y khoa" in OCR_SYSTEM
