import pytest
from backend.services.validator import DataValidatorService

def test_validator_happy_path():
    schema = {
        "type": "object",
        "properties": {
            "report_title": {"type": "string"},
            "items": {"type": "array"}
        },
        "required": ["report_title", "items"]
    }
    payload = {
        "report_title": "Quarterly Sales",
        "items": [
            {"region": "North", "revenue": 1000},
            {"region": "South", "revenue": 2000}
        ],
        "total_revenue": 3000
    }
    baseline = {"total_revenue": 2900}

    report = DataValidatorService.validate_payload(payload, schema, baseline)
    assert report.valid is True
    assert report.score >= 90.0
    assert len(report.errors) == 0

def test_validator_missing_required_fields():
    schema = {
        "type": "object",
        "properties": {
            "report_title": {"type": "string"},
            "mandatory_key": {"type": "string"}
        },
        "required": ["report_title", "mandatory_key"]
    }
    payload = {
        "report_title": "Incomplete Report"
    }

    report = DataValidatorService.validate_payload(payload, schema)
    assert report.valid is False
    assert any("mandatory_key" in err for err in report.errors)

def test_validator_empty_rows_failure():
    schema = {
        "type": "object",
        "properties": {"items": {"type": "array"}},
        "required": ["items"]
    }
    payload = {"items": []}
    report = DataValidatorService.validate_payload(payload, schema)
    assert report.valid is False
    assert any("0 rows" in err for err in report.errors)

def test_validator_null_rate_detection():
    schema = {
        "type": "object",
        "properties": {"items": {"type": "array"}},
        "required": ["items"]
    }
    payload = {
        "items": [
            {"colA": None, "colB": "", "colC": "N/A"},
            {"colA": "OK", "colB": None, "colC": ""}
        ]
    }
    report = DataValidatorService.validate_payload(payload, schema)
    assert any("High null field ratio" in anom for anom in report.anomalies)
