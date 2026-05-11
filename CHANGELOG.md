# Changelog

## [Unreleased] - DH01-UpdateDependencies

### Added

- **Python Lip-Sync Microservice** (`apps/lip-sync/`)
  - FastAPI service that analyzes actual audio for lip-sync generation
  - OpenAI Whisper integration for word-level timestamps from audio
  - g2p-en (CMU dictionary + neural fallback) for accurate phoneme extraction
  - ARPAbet to Rhubarb viseme mapping preserving frontend compatibility
  - Pydantic models matching existing `{metadata, mouthCues}` JSON contract
  - DDD-lite structure: domain, application, infrastructure, and api layers
  - Health endpoint at `GET /api/health`
  - Lip-sync endpoint at `POST /api/lip-sync` (accepts audio file + optional text)
  - Async route handler using `asyncio.to_thread` to avoid blocking the event loop
  - 13 unit tests covering phoneme mapping, service logic, and API endpoints

- **Python Tooling**
  - `uv` as Python package manager with `uv.lock` for reproducible builds
  - `pyproject.toml` with dependencies: fastapi, uvicorn, openai-whisper, g2p-en, pydub, pydantic-settings
  - `audioop-lts` for Python 3.13 compatibility with pydub
  - Dockerfile based on `python:3.13-slim` with uv and ffmpeg

- **Docker Compose** (`docker-compose.yml`)
  - Orchestrates backend and lip-sync services
  - Health check on lip-sync service using Python urllib (no curl in slim images)
  - 30s start period for Whisper model loading
  - Backend depends on lip-sync with `service_healthy` condition

- **Node.js Lip-Sync Fallback Module** (`apps/backend/modules/lip-sync/`)
  - Pure Node.js lip-sync implementation as fallback when Python service is unavailable
  - Rule-based grapheme-to-phoneme conversion (~80% accuracy)
  - Oculus OVR viseme mapping for Ready Player Me morph targets
  - Benchmark script for performance comparison

- **Dev Scripts**
  - `yarn dev` now starts all 3 services (frontend, backend, lip-sync)
  - `yarn dev:js-only` for running without the Python service
  - `yarn lip-sync` to start only the Python service with hot reload

- **Project Configuration**
  - `.nvmrc` pinned to Node.js 24
  - `engines.node >= 24.0.0` in all `package.json` files
  - Python artifacts added to `.gitignore` (`__pycache__/`, `.venv/`, `*.egg-info/`)

- **Documentation**
  - `CLAUDE.md` with project guidelines, architecture, tech stack, commands, and env vars
  - `.claude/skills/` documentation for ai-avatars, ddd, kokoro-tts, llms, monorepo, readyplayer-me, screaming-architecture

### Changed

- **Backend Lip-Sync Pipeline** (`apps/backend/modules/lip-sync.mjs`)
  - Now calls Python lip-sync service via HTTP with 10s timeout
  - Falls back to Node.js text-based lip-sync if Python service is unavailable
  - Improved retry logic with exponential backoff (was fixed delay)
  - Uses native `fetch` and `FormData` (Node.js >= 18)

- **README.md**
  - Full rewrite with shield.io badges (Python, Node.js, React, Three.js, FastAPI, OpenAI, Docker, MIT)
  - ASCII architecture diagram showing services and ports
  - Updated setup instructions with `uv` for Python dependencies
  - Project structure tree and tech stack table
  - Replaced all Rhubarb references with Whisper-based lip-sync

- **CLAUDE.md**
  - Updated requirements to include Python >= 3.13, uv, and ffmpeg
  - Updated architecture to include Python lip-sync service
  - Updated tech stack from Rhubarb to Python microservice
  - Added lip-sync environment variables documentation
  - Added `yarn dev:js-only` and `uv` commands

### Removed

- **Rhubarb Lip-Sync** (`apps/backend/modules/rhubarbLipSync.mjs`)
  - Removed external Rhubarb binary dependency
  - Removed ffmpeg WAV conversion step
  - Removed `getPhonemes()` function that spawned external processes

- **Redundant Lip-Sync Node Module** (`apps/backend/modules/lip-sync-node.mjs`)
  - Logic absorbed into the rewritten `lip-sync.mjs`

### Service Ports

| Service | Port | Stack |
|---------|------|-------|
| Frontend | 5173 | React + Three.js + Vite |
| Backend | 3000 | Node.js + Express |
| Lip-Sync | 8000 | Python + FastAPI + Whisper |
