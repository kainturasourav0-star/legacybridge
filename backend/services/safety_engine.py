import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy import select, desc
from backend.database import AsyncSessionLocal
from backend.models.models import (
    DriftBaseline, DriftFinding, TwinComparison, SecurityFinding,
    ConfidenceGateDecision, Task, Run
)

logger = logging.getLogger("legacybridge.safety")

class SafetyEngineService:
    # -------------------------------------------------------------
    # A. VALIDATION & TESTS
    # -------------------------------------------------------------
    @staticmethod
    def validate_dataset(
        data: Any,
        schema: Dict[str, Any],
        historical_baseline: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Validates extracted records against JSON schema, completeness, null ratios, and historical consistency.
        """
        checks = []
        errors = []
        anomalies = []
        score = 100.0

        if not data:
            return {
                "valid": False,
                "score": 0.0,
                "errors": ["Payload is empty or null."],
                "anomalies": ["Zero records returned by agent."],
                "checks": [{"name": "Payload Presence", "passed": False, "detail": "Empty data"}]
            }

        # 1. Required Schema Properties
        req_fields = schema.get("required", [])
        if isinstance(data, dict):
            missing = [f for f in req_fields if f not in data]
            if missing:
                errors.append(f"Missing required schema fields: {', '.join(missing)}")
                checks.append({"name": "Required Schema Keys", "passed": False, "detail": f"Missing: {missing}"})
                score -= 30.0
            else:
                checks.append({"name": "Required Schema Keys", "passed": True, "detail": "All top-level keys present"})

        # 2. Row Count & Collection Health Check
        items = data.get("items") if isinstance(data, dict) else (data if isinstance(data, list) else None)
        if items is not None:
            if len(items) == 0:
                errors.append("Dataset table contains 0 records.")
                checks.append({"name": "Row Count Non-Zero", "passed": False, "detail": "0 records found"})
                score -= 35.0
            else:
                checks.append({"name": "Row Count Non-Zero", "passed": True, "detail": f"{len(items)} records present"})

            # 3. Null Ratio Check across records (<5% allowed)
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
                anomalies.append(f"High null field ratio: {null_ratio * 100:.1f}% fields missing/empty (exceeds 5% threshold).")
                checks.append({"name": "Null Rate Check", "passed": False, "detail": f"{null_ratio*100:.1f}% nulls"})
                score -= 20.0
            else:
                checks.append({"name": "Null Rate Check", "passed": True, "detail": f"{null_ratio*100:.1f}% nulls (healthy)"})

        # 4. Historical Drift Check
        if historical_baseline and isinstance(data, dict) and isinstance(historical_baseline, dict):
            curr_rev = data.get("total_revenue")
            prev_rev = historical_baseline.get("total_revenue")
            if curr_rev is not None and prev_rev is not None and prev_rev > 0:
                pct_change = ((curr_rev - prev_rev) / prev_rev) * 100.0
                if abs(pct_change) > 30.0:
                    anomalies.append(f"Historical revenue shift: {pct_change:+.1f}% vs baseline (${prev_rev:,.2f} -> ${curr_rev:,.2f})")
                    checks.append({"name": "Historical Drift Baseline", "passed": True, "detail": f"Anomaly: {pct_change:+.1f}% change"})
                else:
                    checks.append({"name": "Historical Drift Baseline", "passed": True, "detail": f"Shift within 30% tolerance ({pct_change:+.1f}%)"})

        score = max(0.0, min(100.0, score))
        valid = len(errors) == 0 and score >= 60.0

        return {
            "valid": valid,
            "score": round(score, 1),
            "anomalies": anomalies,
            "errors": errors,
            "checks": checks
        }

    # -------------------------------------------------------------
    # B. DRIFT DETECTOR
    # -------------------------------------------------------------
    @staticmethod
    async def detect_dom_and_schema_drift(
        task_id: str,
        current_dom: Dict[str, Any],
        current_schema: Dict[str, Any],
        run_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Compares observed DOM selectors, table columns, and schema fields against established baseline.
        Records DriftFinding records in database.
        """
        findings = []
        async with AsyncSessionLocal() as session:
            stmt = select(DriftBaseline).where(DriftBaseline.task_id == task_id).order_by(desc(DriftBaseline.version))
            res = await session.execute(stmt)
            baseline = res.scalar_one_or_none()

            if not baseline:
                # Create initial baseline if none exists
                new_baseline = DriftBaseline(
                    id=f"base-{uuid.uuid4().hex[:8]}",
                    task_id=task_id,
                    version=1,
                    url=current_dom.get("url", "http://localhost:8080"),
                    dom_signature=current_dom,
                    payload_schema=current_schema,
                    sample_record=current_dom.get("sample_record"),
                    created_at=datetime.now(timezone.utc)
                )
                session.add(new_baseline)
                await session.commit()
                return []

            base_dom = baseline.dom_signature or {}
            base_selectors = base_dom.get("selectors", {})
            curr_selectors = current_dom.get("selectors", {})

            # 1. Missing Element Detection
            for key, sel in base_selectors.items():
                if key not in curr_selectors or not curr_selectors[key]:
                    finding = DriftFinding(
                        id=f"drift-{uuid.uuid4().hex[:8]}",
                        task_id=task_id,
                        run_id=run_id,
                        finding_type="missing_element",
                        severity="HIGH",
                        field_name=key,
                        baseline_value=sel,
                        detected_value=None,
                        confidence=0.95,
                        proposed_repair={"action": "fallback_selector", "candidate": f"[data-testid='{key}'], [name='{key}']"},
                        repair_status="requires_review",
                        created_at=datetime.now(timezone.utc)
                    )
                    session.add(finding)
                    findings.append({
                        "id": finding.id,
                        "type": "missing_element",
                        "field": key,
                        "severity": "HIGH",
                        "baseline": sel,
                        "detected": None
                    })

            # 2. Changed Label Detection
            base_labels = base_dom.get("labels", {})
            curr_labels = current_dom.get("labels", {})
            for key, lbl in base_labels.items():
                if key in curr_labels and curr_labels[key] != lbl:
                    finding = DriftFinding(
                        id=f"drift-{uuid.uuid4().hex[:8]}",
                        task_id=task_id,
                        run_id=run_id,
                        finding_type="changed_label",
                        severity="MEDIUM",
                        field_name=key,
                        baseline_value=lbl,
                        detected_value=curr_labels[key],
                        confidence=0.88,
                        proposed_repair={"action": "update_semantic_label", "new_label": curr_labels[key]},
                        repair_status="detected",
                        created_at=datetime.now(timezone.utc)
                    )
                    session.add(finding)
                    findings.append({
                        "id": finding.id,
                        "type": "changed_label",
                        "field": key,
                        "severity": "MEDIUM",
                        "baseline": lbl,
                        "detected": curr_labels[key]
                    })

            # 3. Selector Ambiguity Check
            ambiguous_selectors = current_dom.get("ambiguous_selectors", [])
            for amb in ambiguous_selectors:
                finding = DriftFinding(
                    id=f"drift-{uuid.uuid4().hex[:8]}",
                    task_id=task_id,
                    run_id=run_id,
                    finding_type="selector_ambiguity",
                    severity="HIGH",
                    field_name=amb.get("target"),
                    baseline_value="unique (1 candidate)",
                    detected_value=f"{amb.get('candidates_count', 2)} matching candidates found",
                    confidence=0.92,
                    proposed_repair={"action": "human_disambiguation_required"},
                    repair_status="requires_review",
                    created_at=datetime.now(timezone.utc)
                )
                session.add(finding)
                findings.append({
                    "id": finding.id,
                    "type": "selector_ambiguity",
                    "field": amb.get("target"),
                    "severity": "HIGH",
                    "detected": f"{amb.get('candidates_count', 2)} candidates"
                })

            await session.commit()
            return findings

    # -------------------------------------------------------------
    # C. CONFIDENCE GATE (Explainable Formula)
    # -------------------------------------------------------------
    @staticmethod
    async def evaluate_confidence_gate(
        run_id: str,
        validation_report: Dict[str, Any],
        has_ambiguity: bool = False,
        has_drift: bool = False
    ) -> Dict[str, Any]:
        """
        Explainable Confidence Gate Formula:
        Confidence = (0.35 * SchemaScore) + (0.25 * CompletenessScore) + (0.20 * DriftScore) + (0.20 * SelectorScore)
        Thresholds:
        - >= 85%: PASS (Auto-delivery permitted)
        - 70% - 84.9%: REVIEW_REQUIRED (Staged for human sign-off)
        - < 70%: REJECT (Blocked, delivery aborted)
        """
        schema_score = float(validation_report.get("score", 0.0))
        anomalies_count = len(validation_report.get("anomalies", []))
        errors_count = len(validation_report.get("errors", []))

        completeness_score = max(0.0, 100.0 - (errors_count * 25.0) - (anomalies_count * 5.0))
        drift_score = 50.0 if has_drift else 100.0
        selector_score = 40.0 if has_ambiguity else 100.0

        confidence = (0.35 * schema_score) + (0.25 * completeness_score) + (0.20 * drift_score) + (0.20 * selector_score)
        confidence = round(confidence, 1)

        if confidence >= 85.0 and not has_ambiguity:
            decision = "PASS"
            explanation = f"Confidence {confidence}% exceeds 85% threshold. Zero selector ambiguities detected."
        elif confidence >= 70.0:
            decision = "REVIEW_REQUIRED"
            explanation = f"Confidence {confidence}% falls into review zone (70-84%). Staged for human sign-off."
        else:
            decision = "REJECT"
            explanation = f"Confidence {confidence}% is below 70% safety minimum. Schema or selector failures detected."

        async with AsyncSessionLocal() as session:
            record = ConfidenceGateDecision(
                id=f"conf-{uuid.uuid4().hex[:8]}",
                run_id=run_id,
                confidence_score=confidence,
                schema_score=schema_score,
                completeness_score=completeness_score,
                drift_score=drift_score,
                selector_score=selector_score,
                decision=decision,
                explanation=explanation,
                created_at=datetime.now(timezone.utc)
            )
            session.add(record)
            await session.commit()

        return {
            "confidence_score": confidence,
            "decision": decision,
            "explanation": explanation,
            "breakdown": {
                "schema_score": schema_score,
                "completeness_score": completeness_score,
                "drift_score": drift_score,
                "selector_score": selector_score
            }
        }

    # -------------------------------------------------------------
    # D. MIGRATION SAFETY TWIN
    # -------------------------------------------------------------
    @staticmethod
    async def compare_safety_twin(
        task_id: str,
        legacy_run_id: str,
        legacy_payload: Dict[str, Any],
        target_payload: Dict[str, Any],
        target_service_url: str = "http://internal-target-service:8080/api/v1/sales"
    ) -> Dict[str, Any]:
        """
        Runs field-by-field parity comparison between legacy extracted data and modernized target service.
        """
        legacy_items = legacy_payload.get("items", [])
        target_items = target_payload.get("items", [])

        field_diffs = []
        matching_fields = 0
        total_fields = 0

        # Compare top-level metrics
        for metric in ["total_revenue", "report_title"]:
            if metric in legacy_payload or metric in target_payload:
                total_fields += 1
                leg_val = legacy_payload.get(metric)
                tar_val = target_payload.get(metric)
                match = (leg_val == tar_val)
                if match:
                    matching_fields += 1
                field_diffs.append({
                    "field": metric,
                    "legacy_value": leg_val,
                    "target_value": tar_val,
                    "match": match
                })

        # Compare item records
        max_len = max(len(legacy_items), len(target_items))
        for i in range(max_len):
            leg_item = legacy_items[i] if i < len(legacy_items) else {}
            tar_item = target_items[i] if i < len(target_items) else {}
            for k in set(list(leg_item.keys()) + list(tar_item.keys())):
                total_fields += 1
                lv = leg_item.get(k)
                tv = tar_item.get(k)
                m = (lv == tv)
                if m:
                    matching_fields += 1
                field_diffs.append({
                    "field": f"items[{i}].{k}",
                    "legacy_value": lv,
                    "target_value": tv,
                    "match": m
                })

        parity_score = (matching_fields / total_fields * 100.0) if total_fields > 0 else 100.0
        parity_score = round(parity_score, 1)

        readiness = "READY" if parity_score >= 95.0 else ("GATED" if parity_score >= 80.0 else "BLOCKED")

        async with AsyncSessionLocal() as session:
            twin = TwinComparison(
                id=f"twin-{uuid.uuid4().hex[:8]}",
                task_id=task_id,
                legacy_run_id=legacy_run_id,
                target_service_url=target_service_url,
                parity_score=parity_score,
                field_diffs=field_diffs,
                business_rules_passed=(parity_score >= 80.0),
                readiness_status=readiness,
                created_at=datetime.now(timezone.utc)
            )
            session.add(twin)
            await session.commit()

        return {
            "twin_id": twin.id,
            "parity_score": parity_score,
            "readiness_status": readiness,
            "matching_fields": matching_fields,
            "total_fields": total_fields,
            "diffs_sample": field_diffs[:10]
        }

    # -------------------------------------------------------------
    # F. SECURITY FINDINGS
    # -------------------------------------------------------------
    @staticmethod
    async def evaluate_security_rules(
        url: str,
        is_write_action: bool,
        has_approval: bool,
        payload: Optional[Dict[str, Any]] = None,
        run_id: Optional[str] = None,
        task_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Scans for unauthorized domains, unapproved write mutations, and secret leakage.
        """
        findings = []
        async with AsyncSessionLocal() as session:
            # 1. SSRF & Domain Allowlist Check
            from backend.adapters.delivery_adapters import is_ssrf_safe_url
            if not is_ssrf_safe_url(url) and not ("localhost" in url or "127.0.0.1" in url):
                finding = SecurityFinding(
                    id=f"sec-{uuid.uuid4().hex[:8]}",
                    run_id=run_id,
                    task_id=task_id,
                    rule_id="SEC-SSRF-01",
                    title="Potentially Malicious / Internal Subnet URL Blocked",
                    description=f"Destination URL {url} targets private network or cloud metadata endpoint.",
                    severity="CRITICAL",
                    evidence={"url": url},
                    remediation="Use explicitly allowlisted public or authorized VPC endpoints.",
                    created_at=datetime.now(timezone.utc)
                )
                session.add(finding)
                findings.append({"rule_id": "SEC-SSRF-01", "severity": "CRITICAL", "title": finding.title})

            # 2. Unapproved Write Mutation Check
            if is_write_action and not has_approval:
                finding = SecurityFinding(
                    id=f"sec-{uuid.uuid4().hex[:8]}",
                    run_id=run_id,
                    task_id=task_id,
                    rule_id="SEC-WRITE-UNAPPROVED",
                    title="Write Action Staged Without Required Human Sign-off",
                    description="Task performs database or portal state mutations without explicit approval.",
                    severity="HIGH",
                    evidence={"is_write_action": True, "has_approval": False},
                    remediation="Require operator approval in Confidence Gate before execution.",
                    created_at=datetime.now(timezone.utc)
                )
                session.add(finding)
                findings.append({"rule_id": "SEC-WRITE-UNAPPROVED", "severity": "HIGH", "title": finding.title})

            # 3. Secret Leakage in Payload Check
            if payload:
                payload_str = json.dumps(payload).lower()
                for keyword in ["sk-", "api_key", "password", "client_secret", "bearer "]:
                    if keyword in payload_str:
                        finding = SecurityFinding(
                            id=f"sec-{uuid.uuid4().hex[:8]}",
                            run_id=run_id,
                            task_id=task_id,
                            rule_id="SEC-SECRET-LEAK",
                            title="Potential Secret Exposure in Extracted Dataset",
                            description=f"Extracted payload contains token/credential pattern matching '{keyword}'.",
                            severity="HIGH",
                            evidence={"pattern": keyword},
                            remediation="Mask credential patterns before delivering to downstream destinations.",
                            created_at=datetime.now(timezone.utc)
                        )
                        session.add(finding)
                        findings.append({"rule_id": "SEC-SECRET-LEAK", "severity": "HIGH", "title": finding.title})
                        break

            await session.commit()
            return findings

    # -------------------------------------------------------------
    # G. RECOVERY AND POLICY ENFORCEMENT
    # -------------------------------------------------------------
    @staticmethod
    def evaluate_repair_candidate(
        candidates: List[str],
        confidence_threshold: float = 0.85
    ) -> Tuple[bool, Optional[str], str]:
        """
        Enforces safety policy for self-healing:
        - If exactly 1 unambiguous candidate exists -> APPROVE repair
        - If multiple candidates (ambiguous) or 0 candidates -> REJECT repair, require operator review
        """
        if len(candidates) == 1:
            return True, candidates[0], "Unique unambiguous repair candidate verified. Automatic repair approved."
        elif len(candidates) > 1:
            return False, None, f"Ambiguous recovery candidate: {len(candidates)} candidates found. Automatic repair BLOCKED by safety policy."
        else:
            return False, None, "No plausible selector candidate found. Repair aborted."
