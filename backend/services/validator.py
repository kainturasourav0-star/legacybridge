from typing import Dict, Any, List, Optional
import math
from pydantic import BaseModel, create_model, Field, ValidationError

class ValidationReport(BaseModel):
    valid: bool
    score: float # 0.0 to 100.0
    anomalies: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    checks: List[Dict[str, Any]] = Field(default_factory=list)

class DataValidatorService:
    @staticmethod
    def validate_payload(
        data: Any,
        schema: Dict[str, Any],
        historical_baseline: Optional[Dict[str, Any]] = None
    ) -> ValidationReport:
        checks: List[Dict[str, Any]] = []
        errors: List[str] = []
        anomalies: List[str] = []
        score = 100.0

        if not data:
            return ValidationReport(
                valid=False,
                score=0.0,
                errors=["Payload is empty or None"],
                checks=[{"name": "Empty Payload Check", "passed": False, "detail": "No data returned by agent"}]
            )

        # 1. Schema Key & Required Properties Check
        schema_props = schema.get("properties", {})
        required_keys = schema.get("required", [])

        if isinstance(data, dict):
            missing_keys = [k for k in required_keys if k not in data]
            if missing_keys:
                errors.append(f"Missing required schema fields: {', '.join(missing_keys)}")
                checks.append({"name": "Required Schema Keys", "passed": False, "detail": f"Missing: {missing_keys}"})
                score -= 30.0
            else:
                checks.append({"name": "Required Schema Keys", "passed": True, "detail": "All top-level keys present"})
        elif isinstance(data, list):
            if not data:
                errors.append("Extracted list is empty (0 records).")
                checks.append({"name": "List Population", "passed": False, "detail": "Empty array"})
                score -= 40.0
            else:
                checks.append({"name": "List Population", "passed": True, "detail": f"{len(data)} items present"})

        # 2. Row Count & Collection Health Check
        items = data.get("items") if isinstance(data, dict) else (data if isinstance(data, list) else None)
        if items is not None:
            if len(items) == 0:
                errors.append("Report table contains 0 rows.")
                checks.append({"name": "Row Count Non-Zero", "passed": False, "detail": "0 records found"})
                score -= 25.0
            else:
                checks.append({"name": "Row Count Non-Zero", "passed": True, "detail": f"{len(items)} records extracted"})

            # 3. Null Value Ratio Check across records
            total_fields = 0
            null_fields = 0
            for item in items:
                if isinstance(item, dict):
                    for _, val in item.items():
                        total_fields += 1
                        if val is None or val == "" or val == "N/A":
                            null_fields += 1

            null_ratio = (null_fields / total_fields) if total_fields > 0 else 0.0
            if null_ratio > 0.05:
                anomalies.append(f"High null field ratio: {null_ratio * 100:.1f}% fields missing/empty.")
                checks.append({"name": "Null Rate Check", "passed": False, "detail": f"{null_ratio*100:.1f}% exceeds 5% limit"})
                score -= 20.0
            else:
                checks.append({"name": "Null Rate Check", "passed": True, "detail": f"{null_ratio*100:.1f}% nulls (within threshold)"})

        # 4. Historical Drift & Anomaly Check
        if historical_baseline and isinstance(data, dict) and isinstance(historical_baseline, dict):
            curr_rev = data.get("total_revenue")
            prev_rev = historical_baseline.get("total_revenue")
            if curr_rev is not None and prev_rev is not None and prev_rev > 0:
                pct_change = ((curr_rev - prev_rev) / prev_rev) * 100.0
                if abs(pct_change) > 30.0:
                    anomalies.append(f"Significant revenue drift: {pct_change:+.1f}% shift compared to baseline run (${prev_rev:,.2f} -> ${curr_rev:,.2f})")
                    checks.append({"name": "Historical Drift Baseline", "passed": True, "detail": f"Anomaly flagged: {pct_change:+.1f}% drift"})
                else:
                    checks.append({"name": "Historical Drift Baseline", "passed": True, "detail": f"Revenue drift within normal limits ({pct_change:+.1f}%)"})

        score = max(0.0, min(100.0, score))
        is_valid = len(errors) == 0 and score >= 60.0

        return ValidationReport(
            valid=is_valid,
            score=round(score, 1),
            anomalies=anomalies,
            errors=errors,
            checks=checks
        )

    @staticmethod
    def generate_self_heal_prompt(validation_report: ValidationReport, original_goal: str) -> str:
        error_context = "; ".join(validation_report.errors)
        return (
            f"PREVIOUS ATTEMPT FAILED VALIDATION.\n"
            f"Validator reported errors: {error_context}\n"
            f"Original Goal: {original_goal}\n"
            f"INSTRUCTION FOR SELF-HEAL: Inspect the DOM elements again, verify table rows, "
            f"ensure all required columns are captured, and output strictly conforming JSON."
        )
