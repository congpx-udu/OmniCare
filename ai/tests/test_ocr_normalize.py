"""Chuẩn hóa output OCR: bảng thuốc theo cột tài liệu, thuốc chuẩn hóa, giá trị lạ."""

from app.routers.ocr import _normalize, _normalize_table


def test_table_slugs_vietnamese_labels_and_keeps_order():
    table = _normalize_table(
        {
            "columns": [{"label": "Tên thuốc - Hàm lượng"}, {"label": "SL"}, {"label": "Cách dùng"}],
            "rows": [
                {"Tên thuốc - Hàm lượng": "Amoxicillin 500mg", "SL": "21 viên", "Cách dùng": "3 lần/ngày"},
            ],
        }
    )
    assert [c["key"] for c in table["columns"]] == ["ten_thuoc_ham_luong", "sl", "cach_dung"]
    assert table["rows"][0] == {
        "ten_thuoc_ham_luong": "Amoxicillin 500mg",
        "sl": "21 viên",
        "cach_dung": "3 lần/ngày",
    }


def test_table_maps_rows_by_model_key_too():
    table = _normalize_table(
        {
            "columns": [{"key": "name", "label": "Tên thuốc"}, {"key": "qty", "label": "SL"}],
            "rows": [{"name": "Paracetamol", "qty": "10 viên"}],
        }
    )
    assert table["rows"] == [{"ten_thuoc": "Paracetamol", "sl": "10 viên"}]


def test_table_dedupes_duplicate_labels_and_drops_empty_rows():
    table = _normalize_table(
        {
            "columns": [{"label": "SL"}, {"label": "SL"}],
            "rows": [{"SL": ""}, {"SL": "5"}],
        }
    )
    assert [c["key"] for c in table["columns"]] == ["sl", "sl_2"]
    assert len(table["rows"]) == 1


def test_table_handles_garbage():
    assert _normalize_table(None) == {"columns": [], "rows": []}
    assert _normalize_table({"columns": "x", "rows": 5}) == {"columns": [], "rows": []}


def test_normalize_medications_and_confidence():
    data = _normalize(
        {
            "document_type": "prescription",
            "medications": [
                {"name": " Amoxicillin 500mg ", "dose": "1 viên", "quantity": "21 viên", "duration": "7 ngày"},
                {"name": "", "dose": "bỏ vì không tên"},
                "không phải dict",
            ],
            "confidence": "1.7",
            "warnings": ["mờ"],
            "raw_text": "abc",
        }
    )
    assert data["document_type"] == "prescription"
    assert len(data["medications"]) == 1
    assert data["medications"][0]["quantity"] == "21 viên"
    assert data["medications"][0]["duration"] == "7 ngày"
    assert data["confidence"] == 1.0
    assert data["warnings"] == ["mờ"]


def test_unknown_document_type_falls_back_to_other():
    assert _normalize({"document_type": "xyz", "raw_text": "x"})["document_type"] == "other"
