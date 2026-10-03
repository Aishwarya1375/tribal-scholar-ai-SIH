# MoTA Sample Demonstration Documents

All documents in this directory are **SAMPLE / PROTOTYPE DATA** generated solely for the Smart India Hackathon (SIH) demonstration flow. They are not official government records.

| Filename | Purpose in Demo | Expected AI Result |
| :--- | :--- | :--- |
| `sample_st_caste_certificate.txt` / `.pdf` | Standard ST Certificate | Verified ST Status, Name: Birsa Soren, Tribe: Santhal (Confidence: 98%) |
| `sample_mismatched_caste_certificate.txt` | Cross-Document Mismatch Test | Triggers warning: Name mismatch ("Birsa Kumar Sahu" vs "Birsa Soren", RapidFuzz similarity 54%) |
| `sample_unreadable_income_certificate.txt` | Deficiency Engine Test | Triggers quality issue: Low resolution / obscured seal, raises deficiency |
| `sample_valid_income_certificate.txt` | Standard Valid Income | Income: ₹3,50,000, passes annual threshold |
| `sample_pg_marksheet.txt` | Academic Verification | Marks: 74.5%, satisfies ≥ 55% rule |
| `sample_phd_admission_letter.txt` | Research Admission Verification | Verified unconditional admission at Ranchi University |
| `sample_foreign_offer_letter.txt` | NOS Overseas Admission | Verified unconditional admission at University of Edinburgh |
| `sample_duplicate_caste_certificate.txt` | Duplicate Detection Test | Matches SHA-256 hash with applicant 1's uploaded document |
