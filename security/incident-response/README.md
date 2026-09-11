# Incident Response

Neutral operational protocol for security and continuity incidents affecting any ecosystem account or infrastructure.

## Incident classes

- **ACCOUNT-ACCESS** — unexpected login, session or loss of access
- **ACCOUNT-TAKEOVER** — suspected unauthorized control
- **IMPERSONATION** — unauthorized representation of an entity
- **CONTENT-INTEGRITY** — suspected alteration, deletion or unauthorized reuse of source material
- **PLATFORM-RESTRICTION** — account limitation, suspension or removal
- **INFRASTRUCTURE** — domain, DNS, repository or deployment problem

## Response sequence

```text
1. DETECT
2. PRESERVE
3. VERIFY
4. CONTAIN
5. RECOVER
6. ROTATE
7. DOCUMENT
8. REVIEW
```

### 1. DETECT
Record date/time, affected surface and observable facts.

### 2. PRESERVE
Do not overwrite originals or delete relevant records. Preserve screenshots, platform notifications and original files in the private archive when appropriate.

### 3. VERIFY
Separate direct observations from interpretations. Use the evidence labels:

- Observed
- Corroborated
- Verified
- Hypothesized
- Unknown

### 4. CONTAIN
Secure the affected account and connected services. Revoke unknown sessions or integrations and rotate credentials through the platform's official security controls.

### 5. RECOVER
Use the platform's official recovery/appeal process and the private recovery pack.

### 6. ROTATE
After recovery, rotate credentials and review sessions, recovery methods and third-party access.

### 7. DOCUMENT
Record the incident as an operational event, without speculation about motives or individuals.

### 8. REVIEW
Update the security architecture only when the incident reveals a reproducible weakness.

## Privacy boundary

This public document intentionally contains no incident dossier, personal accusations, private communications or sensitive evidence.