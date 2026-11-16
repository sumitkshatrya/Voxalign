# VoxAlign — Technical Architecture & System Design

## 1. High-Level Architecture Overview

VoxAlign is designed as a distributed, service-oriented Speech Intelligence platform:

```
+-------------------------------------------------------------+
|                     Client (React 18 + Vite)                |
|  - WaveSurfer 7 Audio Studio & Real-Time Waveform           |
|  - Hindi Guidelines Validation Engine (Client-side)         |
|  - Zustand State Store & Socket.IO Client                   |
|  - Tailwind CSS + VoxAlign Token Design System              |
+------------------------------+------------------------------+
                               | REST APIs / WebSocket
+------------------------------v------------------------------+
|                   Backend API (Node.js / Express)           |
|  - JWT Authentication & Role-Based Access Control           |
|  - Multer Audio Ingestion & music-metadata Inspector        |
|  - Resilient Data Store (MongoDB / Resilient Store)         |
|  - Background Queue (BullMQ / Async Memory Fallback)        |
|  - Socket.IO Real-time Progress Broadcasting                |
+------------------------------+------------------------------+
                               | HTTP / Queue
+------------------------------v------------------------------+
|            AI Alignment Microservice (Python FastAPI)       |
|  - Whisper ASR & Language Identification                    |
|  - CTC Phonetic Forced Alignment (Millisecond Precision)    |
|  - Pyannote Neural Speaker Diarization                      |
+-------------------------------------------------------------+
```

## 2. Audio Processing Pipeline

1. **Ingestion**: User uploads audio (MP3, WAV, M4A, FLAC). `multer` streams to storage while `music-metadata` extracts sample rate, bit depth, channels and exact duration.
2. **Background Queue**: Job is enqueued into BullMQ / worker.
3. **Acoustic Tokenization**: Speech recognition extracts word tokens with confidence scores.
4. **CTC Forced Alignment**: Align phonemes to audio waveform generating millisecond-precise `start` and `end` timestamps.
5. **Diarization**: Neural clustering classifies voices into distinct speaker tracks.
6. **Hindi Guidelines Validation Engine**: All segments are audited against Page 17 rules.
7. **Human-in-the-Loop Studio**: Annotators review, split, merge, adjust timestamps, and verify words on the WaveSurfer interactive timeline.
8. **Multi-Format Export**: Clean data exported to JSON, CSV, TXT, SRT, or WebVTT.

## 3. Technology Stack Summary

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, WaveSurfer.js, Zustand, Axios, Recharts, Lucide React.
* **Backend**: Node.js 20+, Express, Mongoose, JWT, Helmet, Rate Limit, Multer, Socket.IO, BullMQ.
* **AI Service**: Python 3.11, FastAPI, Uvicorn, WhisperX / CTC aligner principles.
* **Infrastructure**: Docker, Docker Compose, Redis, MongoDB.
