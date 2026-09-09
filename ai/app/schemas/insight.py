"""Schema cho POST /insights/weather: thời tiết + hồ sơ ẩn danh → lưu ý cá nhân theo thời điểm."""

from pydantic import BaseModel, Field

from app.schemas.chat import ProfileContext, WeatherContext


class WeatherInsightRequest(BaseModel):
    profile: ProfileContext = Field(default_factory=ProfileContext)
    weather: WeatherContext
    # Dự báo ngắn để AI nhắc trước (ví dụ chiều mưa, tối lạnh)
    forecast_note: str | None = Field(default=None, max_length=300)
    local_time: str | None = Field(default=None, max_length=5)
    time_of_day: str | None = Field(default=None, max_length=20)


class InsightTip(BaseModel):
    title: str
    detail: str


class WeatherInsightResponse(BaseModel):
    # Một câu tổng quan thời tiết hôm nay ảnh hưởng gì đến người này
    summary: str
    tips: list[InsightTip] = Field(default_factory=list)
    # Gợi ý cho thời điểm hiện tại
    meal_idea: str | None = None
    activity_idea: str | None = None
    disclaimer: str
    model: str
    latency_ms: int
