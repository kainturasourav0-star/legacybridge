import asyncio
import logging
from typing import Dict, Any, Optional, AsyncGenerator, List
from backend.adapters.tinyfish_client import get_tinyfish_client
from backend.services.identity_vault import IdentityVaultService
from backend.services.audit_service import AuditService

logger = logging.getLogger("legacybridge.browser_agent")

class BrowserAgentService:
    """
    SERVICE 5 — BROWSER AGENT / TINYFISH ADAPTER
    Owns execution of authorized browser automation via TinyFish.
    Enforces domain allowlists and captures live progress streams.
    """

    @staticmethod
    async def execute_browser_workflow(
        url: str,
        goal: str,
        run_id: str,
        credentials: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Executes browser automation task after verifying domain allowlist.
        Returns extracted data, replay URL, and execution metadata.
        """
        # Security Policy: Domain allowlist verification
        is_auth = await IdentityVaultService.is_domain_authorized(url)
        if not is_auth:
            err_msg = f"Security Policy Violation: URL '{url}' is not on the authorized domain allowlist. Browser invocation blocked."
            logger.error(err_msg)
            await AuditService.log_event(
                service_name="browser_agent",
                action="execution.blocked_unauthorized_domain",
                resource_type="run",
                resource_id=run_id,
                details={"target_url": url, "reason": "unauthorized_domain"}
            )
            return {
                "status": "BLOCKED",
                "error": err_msg,
                "extracted_data": None,
                "replay_url": None
            }

        client = get_tinyfish_client()
        try:
            logger.info(f"Submitting browser agent workflow for run {run_id} to '{url}'")
            res = await client.run_automation(url, goal, credentials)
            return {
                "status": "COMPLETED",
                "extracted_data": res.get("extracted_data"),
                "replay_url": res.get("replay_url"),
                "goal": goal
            }
        except Exception as e:
            logger.error(f"TinyFish execution failure for run {run_id}: {str(e)}")
            return {
                "status": "FAILED",
                "error": str(e),
                "extracted_data": None,
                "replay_url": None
            }

    @staticmethod
    async def stream_browser_progress(
        url: str,
        goal: str,
        run_id: str,
        credentials: Optional[Dict[str, str]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Streams step-by-step browser progress events (signing_in, navigating, extracting, completed).
        """
        is_auth = await IdentityVaultService.is_domain_authorized(url)
        if not is_auth:
            yield {
                "run_id": run_id,
                "step": "security_check",
                "status": "FAILED",
                "message": f"Navigation blocked: Domain for '{url}' is not authorized."
            }
            return

        client = get_tinyfish_client()
        async for event in client.stream_automation_events(url, goal, credentials):
            yield event
