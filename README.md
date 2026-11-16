# VoxAlign — Every Word. Every Second. Aligned.

![VoxAlign Logo](client/public/brand/voxalign-logo-primary.svg)

> **VoxAlign** is a premium AI audio intelligence and speech annotation platform designed for freelance audio annotators, AI data professionals, transcription teams, and enterprise speech intelligence organizations.

Compliant with the primary functional specification: **`Hindi_Alignment_Guidelines.pdf` (hi_IN)**.

---

## 🌟 Key Features

* **AI Transcription & Forced Alignment**: Word-level phonetic timestamps for Hindi, English, and code-switched Hinglish speech.
* **Hindi Guidelines Engine (hi_IN)**: Automatic validation of:
  * Single space-separated word per segment.
  * Devanagari script for Hindi, lowercase Latin for English.
  * Prohibiting numerals (`0-9` and `०-९`) with spoken number suggestions.
  * Compound hyphen removal and component splitting.
  * Preserving actual cut-offs (e.g. `कम-`).
  * Enforcing canonical hesitation `अं` and thinking signal `हम्म`.
  * Multi-component backchannel splitting (e.g. `हाँ जी`).
  * Formatting unintelligible speech as `(())` and plausible guesses as `((guess))`.
* **Professional 3-Panel Annotation Studio**:
  * Real **WaveSurfer.js** audio waveform with synchronized word segment boundaries.
  * Keyboard shortcuts (Space to play/pause, S to split, Arrow keys to skip, Ctrl+Z to undo).
  * Variable playback rates (0.5x, 0.75x, 1x, 1.25x, 1.5x) and segment looping.
* **Speaker Diarization**: Multi-speaker classification, speaker re-assignment, and overlap detection.
* **Page 17 Quality Control Audit Checklist**: 7-criteria pre-export verification.
* **Export Engine**: One-click downloads for **JSON**, **CSV**, **TXT**, **SRT**, and **WebVTT**.
* **Enterprise SaaS Architecture**: Role-based access control (Admin, Annotator, Reviewer), user quotas, audit trails, and system telemetry.

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone repository
git clone https://github.com/voxalign/voxalign.git
cd voxalign

# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 2. Running Locally

**Terminal 1 (Backend API Server):**
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🔑 Demo Accounts

VoxAlign comes pre-configured with instant demo credentials for quick access:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Platform Admin** | `admin@voxalign.ai` | `Admin@123456` | Full admin telemetry, users, quotas |
| **Senior Annotator** | `annotator@voxalign.ai` | `Annotator@123456` | Annotation workspace & projects |

---

## 🧪 Testing & Verification

Run the comprehensive 8-point acceptance test suite verifying the Hindi Guidelines Engine and core data models:

```bash
cd server
npx ts-node src/test.ts
```

All 8/8 tests pass, covering:
1. User Store & Role-based authentication
2. Multi-word segmentation errors
3. Digit prohibition & spoken conversion
4. Compound hyphen splitting vs cut-offs
5. Canonical hesitation `अं` and thinking `हम्म` tokens
6. English lowercase Latin script rules
7. Uncertainty markers `(())` and `((guess))`
8. Page 17 Quality Control Checklist compilation

---

## 🐳 Docker Deployment

To launch the full containerized stack:

```bash
docker-compose up --build
```

Services:
* `voxalign-client`: Frontend Nginx container on port `5173`
* `voxalign-server`: Node.js Express API on port `5000`
* `voxalign-ai-service`: Python FastAPI microservice on port `8000`
* `mongodb`: MongoDB 7.0 database on port `27017`
* `redis`: Redis 7.2 queue broker on port `6379`

---

## 📜 Brand Guidelines

* **Colors**:
  * Primary Background: `#0B1422`
  * Secondary Background: `#172538`
  * Accent Teal: `#52DDBB`
  * Accent Blue: `#64C8FF`
* **Typography**:
  * Headings: **Manrope**
  * Body: **Inter**
  * Timestamps: **JetBrains Mono**
* **Tagline**: *"Every Word. Every Second. Aligned."*
