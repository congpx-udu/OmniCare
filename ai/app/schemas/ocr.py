"""Schema cho POST /ocr: ảnh bệnh án / đơn thuốc in máy → dữ liệu có cấu trúc."""

from typing import Literal

from pydantic import BaseModel, Field

DocumentType = Literal["prescription", "medical_record", "lab_result", "other"]


class OcrImage(BaseModel):
    # Ảnh mã hóa base64 (không kèm tiền tố data:), backend đọc từ file đã upload
    image_base64: str = Field(min_length=100)
    mime_type: Literal["image/jpeg", "image/png", "image/webp"]


class OcrRequest(BaseModel):
    # Các trang của cùng một bộ hồ sơ (đơn nhiều tờ, bệnh án nhiều trang), theo thứ tự
    images: list[OcrImage] = Field(min_length=1, max_length=8)
    # Gợi ý loại tài liệu nếu người dùng chọn trước; AI vẫn tự nhận dạng
    hint_type: DocumentType | None = None


class Medication(BaseModel):
    name: str
    dose: str | None = None
    frequency: str | None = None
    duration: str | None = None
    instructions: str | None = None


class OcrResponse(BaseModel):
    document_type: DocumentType
    facility: str | None = None
    doctor: str | None = None
    # yyyy-mm-dd nếu đọc được
    visit_date: str | None = None
    diagnosis: str | None = None
    medications: list[Medication] = Field(default_factory=list)
    notes: str | None = None
    # Toàn bộ chữ đọc được, giữ thứ tự dòng; nhiều trang thì có dòng "--- Trang N ---"
    raw_text: str
    pages_read: int
    # Độ tin cậy tổng thể 0–1 do model tự đánh giá (ảnh mờ, chữ tay → thấp)
    confidence: float = Field(ge=0, le=1)
    # Cảnh báo cho người dùng: ảnh mờ, thiếu góc, chữ viết tay...
    warnings: list[str] = Field(default_factory=list)
    model: str
    latency_ms: int
