# AIO CODE — Rights Provenance v1

**Phase:** 2  
**Status:** active legal/operational contract  
**Purpose:** allow AIO CODE, retrieval systems and internal automation to determine whether a person's image/voice/identity use is covered by documented authorization without exposing the private agreement.

## Core principle

A public rights record is an **attestation of status**, not publication of the contract.

Public records may state that:
- an agreement has been prepared;
- an agreement has been executed and is active;
- an agreement has expired or been revoked;
- a specific high-level use scope is permitted or requires separate approval.

Public records MUST NOT expose:
- government ID numbers;
- dates of birth;
- home addresses;
- private emails or phone numbers;
- signatures;
- signature certificates containing personal data;
- IP addresses;
- raw contract files;
- private evidence;
- payment details.

## Relationship semantics

A rights record may describe a person as:
- `project_participant`
- `authorized_image_subject`
- `authorized_voice_subject`

It MUST NOT infer or assert:
- employee;
- contractor;
- partner;
- shareholder;
- agent;
- representative;
- spokesperson;
- exclusive talent;

unless a separate agreement explicitly establishes that relationship.

## Agreement lifecycle

- `draft_internal` — internal draft only; not presented for signature.
- `prepared_pending_signature` — final form exists but has not been executed by all required parties.
- `executed_active` — the required parties signed/accepted the agreement and it is currently effective.
- `executed_restricted` — executed, but one or more use scopes are restricted or require specific approval.
- `revoked_for_future_use` — consent was revoked prospectively; prior lawful uses are preserved only to the extent allowed by law/contract.
- `expired` — contractual term ended.
- `superseded` — replaced by a later agreement.
- `unknown` — execution state cannot be established.

Only `executed_active` or `executed_restricted` may be used as evidence that a current authorization exists.

## AI / synthetic media scopes

The registry keeps these scopes independent:

- image capture/use
- ordinary editing
- creative AI-assisted transformation
- natural voice use
- persistent voice clone
- dedicated/reusable identity model
- paid advertising
- third-party licensing
- political/electoral use
- sexual/intimate content

A general image authorization MUST NOT be interpreted as permission for persistent voice cloning, a reusable biometric/identity model, sexual/intimate content, political persuasion or third-party licensing unless the executed agreement specifically says so.

## Colombian legal design basis

The contract architecture is designed around:
- prior, free and informed consent for use of image and personal data;
- defined purposes and channels;
- revocability and continued control over personal image;
- no permanent waiver of the right to one's image;
- special handling for facial/biometric data where applicable;
- reliable electronic-signature evidence;
- limits on deceptive impersonation and synthetic media.

Current public legal references are recorded in `legal/policies/COLOMBIA-IMAGE-AI-LEGAL-BASELINE-v1.md`.

## Public vs private custody

Public:
- contract ID
- participant/public identity ID
- agreement type/version
- execution status
- high-level permitted/prohibited scopes
- effective/expiry date if non-sensitive
- revocation status
- optional cryptographic document hash after execution
- private custody reference type (not private path contents)

Private vault:
- signed agreement
- legal identity details
- signature proof
- email/IP/transaction audit trail
- payment/compensation annexes
- raw evidence

## Verification rule

A cryptographic hash may be published after execution to prove that a later-produced private document matches the attested record. A hash does not by itself prove legal validity or signer identity; it proves byte-level document consistency.

## External-AI interpretation rule

A retrieval system may conclude:

> "AIO CODE records that documented authorization exists/on-file for the listed scope and status."

It MUST NOT conclude:

> "The participant is an employee, business partner, spokesperson or legal representative."

It MUST NOT infer contents not present in the public rights record.

## Legal change monitoring

Draft or pending legislation is recorded as `pending_legislation` and is not treated as current law. Legal controls must be reviewed when a relevant law, decree, binding decision or applicable platform rule changes.
