# Participant Data Handling Policy v1

## Public repository

Never publish:
- signed participant agreements;
- legal ID numbers or ID scans;
- dates of birth;
- signatures;
- private emails/phones/addresses;
- signature-platform audit trails;
- IP addresses;
- payment details;
- raw biometric templates;
- private voice/identity model files.

## Private custody

Private participant records should use a stable participant ID and keep:
- signed agreement;
- agreement version;
- signature proof/audit trail;
- execution/effective date;
- revocation/expiry notices;
- scope-specific approvals;
- compensation annex if any;
- document SHA-256;
- provenance links to content that used the authorization.

## Public attestation

The public `legal/rights-registry.json` may expose only the minimal status required for machine-readable rights checks.

A public record may say `executed_active` only when private execution evidence exists.

If the private agreement is missing, unverifiable or disputed, downgrade the public record to `unknown` or another accurate lifecycle state.

## Least-disclosure rule

Use the public/professional name and internal participant ID whenever sufficient. Legal names belong in private execution records unless there is a separate documented reason to publish them.

## Revocation

A revocation event must:
1. be timestamped privately;
2. update the public rights status when applicable;
3. block future uses that depended on the revoked scope;
4. preserve only the evidence necessary for compliance, disputes, accounting or lawful historical documentation.

## AI safety

General participation/image consent is never enough to infer permission for:
- persistent voice cloning;
- reusable identity/biometric model training;
- sexual/intimate synthetic content;
- political persuasion;
- unrelated third-party licensing.

These require separate authorization where legally permissible.
