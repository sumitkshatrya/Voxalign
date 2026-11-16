# VoxAlign — Hindi (hi_IN) Alignment Guidelines Specification

This document details the complete functional rules from the **Hindi Alignment Guidelines (`Hindi_Alignment_Guidelines.pdf`)** and how they are implemented and enforced within VoxAlign's automated validation engine and interactive annotation studio.

---

## 1. Single Word Segmentation Standard
* **Rule**: Each segment must contain exactly **one space-separated spoken-form word**.
* **Validation**:
  * Any whitespace within segment text triggers error `SEG_MULTI_WORD`.
  * Suggestion provided to split the segment into separate timestamped blocks.
  * Empty segments trigger error `SEG_EMPTY`.

---

## 2. Script & Casing Conventions
* **Hindi Speech**: Must be transcribed strictly in **Devanagari** script (`[\u0900-\u097F]`).
* **English Speech**: Must be transcribed strictly in **lowercase Latin** script (`[a-z']`).
* **Acronyms & Abbreviations**:
  * Acronyms pronounced as words (e.g., `isro`, `aiims`, `nato`) remain one segment in lowercase Latin.
  * Initials or acronyms spoken letter-by-letter must be split into single-letter segments (e.g. `s`, `p`, `i` or `एस`, `पी`, `आई`).
* **Casing Rule**: Any uppercase character in English words triggers warning `LATIN_UPPERCASE` with one-click auto-lowercasing.
* **Mixed Script**: Mixing Devanagari and Latin letters inside a single word triggers warning `MIXED_SCRIPT`.

---

## 3. Spoken Number Representation (No Digits)
* **Rule**: Numbers must be transcribed strictly in their **spoken word form** (never digits `0-9` or `०-९`).
* **Example**:
  * `5` spoken in Hindi $\rightarrow$ `पांच` (not `5` or `५`).
  * `15` spoken in English $\rightarrow$ `fifteen` (not `15`).
* **Validation**: Triggers error `DIGIT_USAGE` with automatic dictionary suggestion for numbers.

---

## 4. Compound Words & Hyphens
* **Rule**: Ordinary hyphenated compound words must have the hyphen removed and components split into separate segments.
  * Example: `माता-पिता` must be split into two segments: `माता` and `पिता`.
* **Cut-Offs**: When a speaker cuts off mid-word, retain the trailing hyphen.
  * Example: `कम-` or `work-` are valid cut-offs and are preserved.

---

## 5. Hesitation Fillers & Thinking Signals
* **Hesitation Filler**: Canonical Hindi hesitation filler is **`अं`** (Devanagari letter short A + Anusvara).
  * Non-canonical variants like `उम`, `उम्म`, `अम्म` trigger warning `NON_CANONICAL_HESITATION` with suggestion to use `अं`.
* **Thinking Signal**: Canonical Hindi thinking signal is **`हम्म`**.
  * Variants like `हम`, `हम्मम` trigger warning `NON_CANONICAL_THINKING` with suggestion to use `हम्म`.

---

## 6. Uncertainty & Unintelligible Speech
* **Unintelligible Speech**: Must be transcribed as **`(())`** (double parentheses).
* **Plausible Guess**: A best-effort guess must be enclosed in double parentheses: **`((guess))`** or **`((शब्द))`**.

---

## 7. Multi-Component Backchannels
* **Rule**: Backchannels consisting of multiple components must be split into separate segments.
  * Example: `हाँ जी` $\rightarrow$ Segment 1: `हाँ`, Segment 2: `जी`.

---

## 8. Non-Lexical Sounds & Background Noise
* **Rule**: Non-lexical acoustic events (laughter, coughing, sighing, background noise, music) must **not** be transcribed as words (e.g. do not write `[laughter]` or `haha`).
* **Background Speech**: Unattended or faint background speech is not transcribed; only primary foreground speech is annotated.

---

## 9. Special Audio Handling Policies
* **Entirely Synthetic Audio**: Flagged for discard or synthetic corpus tagging.
* **Mixed Human & Synthetic**: Flagged for separate sub-segmentation.
* **Distorted / Unclear Audio**: Marked as degraded or skipped if intelligible threshold (< 50%) is not met.
* **PII (Personally Identifiable Information)**: Numeric sequences like phone numbers or Aadhaar numbers are flagged for redaction.

---

## 10. Page 17 Quality Control Audit Checklist
Before exporting or delivering annotations, the engine and reviewer must verify:
1. Every segment contains exactly one spoken word (or valid tag).
2. Devanagari script for Hindi, lowercase Latin for English, no digits.
3. Monotonic timestamps: $start < end$, no zero or negative durations.
4. No same-speaker overlaps.
5. Compound hyphens removed and components split (except cut-offs ending with `-`).
6. Hesitation and thinking tokens match canonical forms `अं` and `हम्म`.
7. Every segment has an identified speaker label.
