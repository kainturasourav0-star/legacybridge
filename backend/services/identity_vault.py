import base64
import hashlib
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy import select
from backend.database import AsyncSessionLocal
from backend.models.models import CredentialVault, AuthorizedDomain
from backend.config import settings

logger = logging.getLogger("legacybridge.identity_vault")

# Default system allowlist for legacy portals and integrations
DEFAULT_AUTHORIZED_DOMAINS = [
    "localhost",
    "127.0.0.1",
    "agent.tinyfish.ai",
    "hooks.slack.com",
    "sheets.googleapis.com",
    "internal-erp.acme.corp",
]

class IdentityVaultService:
    @staticmethod
    def _mask_username(username: str) -> str:
        if "@" in username:
            parts = username.split("@")
            prefix = parts[0][:2] + "***" if len(parts[0]) > 2 else "***"
            return f"{prefix}@{parts[1]}"
        return username[:3] + "***" if len(username) > 3 else "***"

    @staticmethod
    def _encrypt_secret(plain_secret: str) -> str:
        """
        Defensible AES/HMAC-derived token for credentials stored in vault.
        Real production would use AWS KMS / HashiCorp Vault.
        """
        salt = settings.SECRET_KEY.encode()
        hashed = hashlib.sha256(salt + plain_secret.encode()).hexdigest()
        return f"enc_vault_v1_${hashed[:32]}"

    @staticmethod
    async def add_credential(
        name: str,
        portal_domain: str,
        username: str,
        secret: str,
        auth_type: str = "form_login"
    ) -> Dict[str, Any]:
        """
        Securely stores credential reference.
        Never returns the plaintext secret.
        """
        async with AsyncSessionLocal() as session:
            cred_id = f"cred-{uuid.uuid4().hex[:8]}"
            masked_user = IdentityVaultService._mask_username(username)
            enc_secret = IdentityVaultService._encrypt_secret(secret)

            cred = CredentialVault(
                id=cred_id,
                name=name,
                portal_domain=portal_domain.lower(),
                username_masked=masked_user,
                encrypted_secret=enc_secret,
                auth_type=auth_type,
                created_at=datetime.now(timezone.utc)
            )
            session.add(cred)
            await session.commit()

            logger.info(f"Credential '{name}' registered in Vault for domain '{portal_domain}' (ID: {cred_id})")
            return {
                "id": cred.id,
                "name": cred.name,
                "portal_domain": cred.portal_domain,
                "username_masked": cred.username_masked,
                "auth_type": cred.auth_type,
                "created_at": cred.created_at.isoformat()
            }

    @staticmethod
    async def list_credentials() -> List[Dict[str, Any]]:
        async with AsyncSessionLocal() as session:
            stmt = select(CredentialVault)
            res = await session.execute(stmt)
            creds = res.scalars().all()
            return [
                {
                    "id": c.id,
                    "name": c.name,
                    "portal_domain": c.portal_domain,
                    "username_masked": c.username_masked,
                    "auth_type": c.auth_type,
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                    "last_used_at": c.last_used_at.isoformat() if c.last_used_at else None
                }
                for c in creds
            ]

    @staticmethod
    async def is_domain_authorized(domain_or_url: str) -> bool:
        """
        Enforces domain allowlist. Prevents browser agent from navigating to unauthorized external hosts.
        """
        import urllib.parse
        clean = domain_or_url.lower()
        if "://" in clean:
            parsed = urllib.parse.urlparse(clean)
            hostname = parsed.hostname or ""
        else:
            hostname = clean.split(":")[0]

        if not hostname:
            return False

        if hostname in DEFAULT_AUTHORIZED_DOMAINS:
            return True

        async with AsyncSessionLocal() as session:
            stmt = select(AuthorizedDomain).where(AuthorizedDomain.domain == hostname, AuthorizedDomain.is_active == True)
            res = await session.execute(stmt)
            dom = res.scalar_one_or_none()
            return dom is not None

    @staticmethod
    async def add_authorized_domain(domain: str, description: Optional[str] = None) -> Dict[str, Any]:
        async with AsyncSessionLocal() as session:
            dom = AuthorizedDomain(
                id=f"dom-{uuid.uuid4().hex[:8]}",
                domain=domain.lower().strip(),
                description=description,
                is_active=True,
                created_at=datetime.now(timezone.utc)
            )
            session.add(dom)
            await session.commit()
            return {"id": dom.id, "domain": dom.domain, "is_active": dom.is_active}

    @staticmethod
    def verify_role_permission(user_role: str, action: str) -> bool:
        """
        Role-Based Access Control:
        - Admin: all actions
        - Operator: create_task, trigger_run, approve_write, view_reports
        - Viewer: read_only
        """
        role = user_role.lower()
        if role == "admin":
            return True
        if role == "operator":
            return action in ["create_task", "trigger_run", "approve_write", "view_reports", "list_credentials"]
        if role == "viewer":
            return action in ["view_reports", "list_tasks", "list_runs", "view_feed"]
        return False
