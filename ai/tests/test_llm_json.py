"""Ép JSON từ output LLM: bọc code fence, chữ thừa, xuống dòng thật trong chuỗi, dấu phẩy thừa."""

import pytest

from app.services.llm import LLMError, _extract_json, _repair_json


def test_plain_json():
    assert _extract_json('{"a": 1}') == {"a": 1}


def test_code_fence_and_prefix_text():
    text = 'Đây là kết quả:\n```json\n{"reply": "ok", "meals": []}\n```\nHết.'
    assert _extract_json(text) == {"reply": "ok", "meals": []}


def test_repairs_raw_newlines_inside_strings():
    text = '{"raw_text": "dòng 1\ndòng 2\tcó tab", "n": 1}'
    data = _extract_json(text)
    assert data["raw_text"] == "dòng 1\ndòng 2\tcó tab"


def test_repairs_trailing_commas():
    assert _extract_json('{"a": [1, 2,], "b": {"c": 3,},}') == {"a": [1, 2], "b": {"c": 3}}


def test_keeps_escaped_quotes():
    text = '{"s": "nói \\"xin chào\\""}'
    assert _extract_json(text)["s"] == 'nói "xin chào"'


def test_repair_is_noop_on_valid_json():
    valid = '{"x": "a\\nb", "y": [1, 2]}'
    assert _repair_json(valid) == valid


def test_rejects_non_object():
    with pytest.raises(LLMError):
        _extract_json("[1, 2, 3]")


def test_rejects_garbage():
    with pytest.raises(LLMError):
        _extract_json("không có json ở đây")
