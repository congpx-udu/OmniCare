"""Schema cho POST /insights/tracking: nhật ký chỉ số + hoạt động → AI phân tích xu hướng, đề xuất cải thiện."""

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.chat import ProfileContext, WeatherContext


class LogEntry(BaseModel):
    date: str  # yyyy-mm-dd
    weight_kg: float | None = None
    systolic: int | None = None
    diastolic: int | None = None
    heart_rate: int | None = None
    glucose: float | None = None
    sleep_hours: float | None = None
    activity_minutes: int | None = None
    activity_type: str | None = None
    # Cảm nhận 1 (rất tệ) → 5 (rất tốt)
    mood: int | None = Field(default=None, ge=1, le=5)
    note: str | None = Field(default=None, max_length=500)


class TrackingRequest(BaseModel):
    profile: ProfileContext = Field(default_factory=ProfileContext)
    weather: WeatherContext | None = None
    local_time: str | None = None
    time_of_day: str | None = None
    # Nhật ký theo thứ tự cũ → mới, tối đa 60 ngày
    logs: list[LogEntry] = Field(min_length=1, max_length=60)


TrendDirection = Literal["up", "down", "stable"]
AlertLevel = Literal["info", "warning", "urgent"]
SuggestionCategory = Literal["activity", "sleep", "diet", "checkup", "other"]


class Trend(BaseModel):
    metric: str
    direction: TrendDirection
    comment: str


class Alert(BaseModel):
    level: AlertLevel
    message: str


class Suggestion(BaseModel):
    title: str
    detail: str
    category: SuggestionCategory = "other"
    # Khi nào làm, gắn với buổi trong ngày / ngày tới (vd: "sáng mai 6-7h")
    when: str | None = None


class TrackingResponse(BaseModel):
    summary: str
    trends: list[Trend] = Field(default_factory=list)
    alerts: list[Alert] = Field(default_factory=list)
    suggestions: list[Suggestion] = Field(default_factory=list)
    disclaimer: str
    model: str
    latency_ms: int
