"""Schema cho POST /chat. Backend gửi ngữ cảnh đã ẩn danh (không tên, email, SĐT)."""

from typing import Literal

from pydantic import BaseModel, Field

ChatMode = Literal["food", "symptom"]
RiskLevel = Literal["none", "home", "doctor", "emergency"]


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class WeatherContext(BaseModel):
    location: str | None = None
    temp: float | None = None
    feels_like: float | None = None
    humidity: int | None = None
    description: str | None = None
    wind_kmh: float | None = None
    rain_chance: float | None = Field(default=None, ge=0, le=1)


class ProfileContext(BaseModel):
    age: int | None = None
    gender: Literal["male", "female", "other"] | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    bmi: float | None = None
    chronic_conditions: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    mode: ChatMode
    messages: list[ChatTurn] = Field(min_length=1, max_length=20)
    profile: ProfileContext = Field(default_factory=ProfileContext)
    weather: WeatherContext | None = None
    feeling: str | None = Field(default=None, max_length=300)
    # Tóm tắt bệnh án đã lưu (Giai đoạn 4), để trống nếu chưa có
    records_summary: str | None = Field(default=None, max_length=2000)


class MealSuggestion(BaseModel):
    name: str
    why: str
    ingredients: list[str] = Field(default_factory=list)
    notes: str | None = None


class PossibleCondition(BaseModel):
    name: str
    why: str


class ChatResponse(BaseModel):
    mode: ChatMode
    reply: str
    # Luồng symptom
    risk_level: RiskLevel = "none"
    possible_conditions: list[PossibleCondition] = Field(default_factory=list)
    suggested_specialty: str | None = None
    facility_type: str | None = None
    follow_up_questions: list[str] = Field(default_factory=list)
    # Luồng food
    meals: list[MealSuggestion] = Field(default_factory=list)
    activities: list[str] = Field(default_factory=list)
    disclaimer: str
    model: str
    latency_ms: int
