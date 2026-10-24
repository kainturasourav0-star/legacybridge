# LegacyBridge — Security & Threat Modeling (SECURITY.md)

## 1. Threat Model & Security Posture
LegacyBridge inspects and analyzes potentially untrusted legacy source code archives and repository repositories. To safeguard the application and host environment, the platform implements a defense-in-depth security model.

## 2. Ingestion & Sandbox Hardening

### 2.1 Archive Extraction & Path Traversal Prevention
- **Zip-Slip Protection**: All file paths inside uploaded archives are sanitized using canonical absolute path resolution against the isolated project root directory. Any entry with `..`, absolute root paths (`/` or `C:\`), or alternate data streams is rejected immediately.
- **Symlink Elimination**: Symlinks and hardlinks inside uploaded archives are disabled.
- **Decompression Bombs**: Archive decompression is capped at a maximum decompressed size (default: 50MB) and a maximum file count (default: 1,000 files).

### 2.2 Untrusted Code Execution Isolation
- Uploaded code is **NEVER** executed directly on the web application server.
- Regression testing and drift verification occur inside isolated in-memory Node/Python subprocess runners with:
  - Network access disabled (`--unhandled-rejections=strict`, restricted network sockets).
  - Strict execution timeouts (max 5,000ms per test).
  - Read-only filesystem boundaries.
  - No access to application environment variables or host credentials.

## 3. Credential & Secret Management
- **Secret Redaction**: Before any AST or code snippet is passed to AI providers or TinyFish, regex scanners redact:
  - AWS Access Keys (`AKIA[0-9A-Z]{16}`)
  - Private Keys (`-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----`)
  - Generic API Tokens, Bearer Tokens, and passwords.
- **TinyFish Isolation**: The `TINYFISH_API_KEY` is strictly server-side. Private client source code is never sent to TinyFish endpoints; TinyFish is queried only for external framework documentation and public migration guides.

## 4. Authentication & Authorization
- **Clerk Authentication**: Session tokens verified server-side on every API route handler.
- **Supabase Row-Level Security (RLS)**: Enforces that project data, analysis runs, and reports are accessible only by the verified project owner or authorized organization member.
- **No Client Authorization Shortcuts**: Frontend UI guards are cosmetic; every Next.js API route checks user identity before querying the database.

## 5. Audit Trail & Integrity
- Every analysis run, drift detection, and migration approval generates an immutable audit log entry including actor ID, timestamp, target revision, and operation details.
- Modernization reports include SHA-256 integrity checksums over the extracted rules and test outputs.
