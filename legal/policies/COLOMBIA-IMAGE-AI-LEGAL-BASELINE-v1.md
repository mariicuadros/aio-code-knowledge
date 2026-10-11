# Colombia Image / AI Legal Baseline v1

**Reviewed:** 2026-10-10  
**Purpose:** operational legal baseline for AIO CODE rights/provenance workflows.  
**Boundary:** project compliance record, not legal advice.

## Current enforceable baseline

### Personal data
**Ley 1581 de 2012** requires authorization for personal-data processing and provides reinforced rules for sensitive data. Facial images can constitute personal data; biometric processing may be sensitive depending on the purpose/use.

Official reference:
https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981

### Electronic signatures
**Ley 527 de 1999** and **Decreto 2364 de 2012** recognize electronic-signature mechanisms when the method is reliable and appropriate for the purpose and links the signer to the data/document.

Official reference:
https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php/norma.php?i=50583

### Right to one's own image
Colombian Constitutional Court jurisprudence treats the right to one's own image as autonomous/personal and requires authorization for third-party use. The authorization:
- does not amount to permanent waiver;
- must include informed consent regarding use and purposes;
- cannot absolutely limit future self-determination;
- is constrained by fundamental rights;
- is generally revocable, subject to the facts and lawful effects of prior uses.

Key current/recent references:
- T-025/22
- T-158/26
- T-184/26
- T-241/26

Official references:
https://www.corteconstitucional.gov.co/relatoria/2022/t-025-22.htm
https://www.corteconstitucional.gov.co/relatoria/2026/T-158-26.htm
https://www.corteconstitucional.gov.co/relatoria/2026/T-184-26.htm
https://www.corteconstitucional.gov.co/relatoria/2026/T-241-26.htm

### Synthetic impersonation / deepfakes
AIO CODE treats deceptive impersonation and non-consensual synthetic identity uses as prohibited. Any statutory rule specifically applicable to a planned use must be re-verified immediately before publication or commercial deployment.

## Pending AI legislation — not current law

As of the latest reviewed public congressional material, Colombia did **not** yet have a fully approved general AI law. Proyecto de Ley 043 de 2025 Senado / 324 de 2025 Cámara continued through legislative debate and sought a general ethical/responsible AI framework.

Official congressional references:
https://leyes.senado.gov.co/proyectos/images/documentos/Textos%20Radicados/proyectos%20de%20ley/2025%20-%202026/PL%20043-25%20-%20REGULACION%20INTELIGENCIA%20ARTIFICIAL.pdf
https://www.camara.gov.co/wp-content/uploads/2025/12/proyectos-ley/publicaciones/proyecto-35981/PPDSC-PL-043-25S-324-25C-INTELIGENCIA-ARTIFICIAL-SC.pdf

A pending bill may inform defensive design choices, but it MUST NOT be represented as enacted law.

## Operational requirements

Before using a participant's image/voice:
1. verify the rights-registry status;
2. verify the intended use is inside the recorded scope;
3. require separate approval for any scope marked `separate_consent_required`;
4. preserve private signature/execution evidence;
5. if consent was revoked, block new uses that depend on the revoked authorization;
6. do not expose private contractual evidence in the public repository.

## Review trigger

Re-review this baseline when:
- a Colombian AI framework becomes law;
- data-protection rules materially change;
- binding court precedent changes the image-consent standard;
- a planned use involves biometric identification, persistent voice cloning, political persuasion, intimate content, children/adolescents or another heightened-risk category.
