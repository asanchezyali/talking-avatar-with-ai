# Talking Avatar with AI

![Python](https://img.shields.io/badge/Python-3.13+-3776AB?logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-0.160-000000?logo=three.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-Whisper%20%7C%20GPT-412991?logo=openai&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

https://github.com/asanchezyali/talking-avatar-with-ai/assets/29262782/da316db9-6dd1-4475-9fe5-39dafbeb3cc4

## Overview

A digital human that can talk and listen to you. It uses OpenAI GPT for conversation, Whisper for speech recognition, Eleven Labs for voice synthesis, and a custom Python lip-sync service powered by Whisper for audio-accurate mouth animations — all rendered as a 3D avatar with Three.js.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│     Backend      │────▶│   Lip-Sync      │
│  React/Three │◀────│  Node.js/Express │◀────│  Python/FastAPI  │
│  Port: 5173  │     │   Port: 3000     │     │   Port: 8000    │
└─────────────┘     └──────────────────┘     └─────────────────┘
                           │                        │
                     ┌─────┴─────┐            ┌─────┴─────┐
                     │ OpenAI GPT│            │  Whisper   │
                     │Eleven Labs│            │  g2p-en    │
                     └───────────┘            └───────────┘
```

| Service | Stack | Port | Description |
|---------|-------|------|-------------|
| **Frontend** | React + Three.js + React Three Fiber | `5173` | 3D avatar rendering, lip-sync playback, chat UI |
| **Backend** | Node.js + Express + LangChain | `3000` | LLM orchestration, TTS, request routing |
| **Lip-Sync** | Python + FastAPI + Whisper + g2p-en | `8000` | Audio-based phoneme detection and viseme mapping |

### How It Works

**Text input flow:**
1. User enters text → Backend sends to OpenAI GPT (structured response with text, expression, animation)
2. GPT response → Eleven Labs TTS → MP3 audio
3. Audio + text → Python Lip-Sync service → Whisper extracts word timestamps → g2p-en maps to phonemes → viseme cues
4. Frontend plays audio + syncs avatar mouth/expression/animation in real-time

**Audio input flow:**
1. User records audio → OpenAI Whisper transcribes to text
2. Same flow as text input from step 1

### Response Format

```json
{
  "messages": [
    {
      "text": "spoken text",
      "facialExpression": "smile",
      "animation": "TalkingOne",
      "audio": "<base64 MP3>",
      "lipsync": {
        "metadata": { "duration": 2.1 },
        "mouthCues": [
          { "start": 0.0, "end": 0.08, "value": "X" },
          { "start": 0.08, "end": 0.16, "value": "B" }
        ]
      }
    }
  ]
}
```

## Getting Started

### Requirements

- **Node.js** >= 24.0.0 — `nvm use`
- **Yarn** — Node.js package manager
- **Python** >= 3.13 — for the lip-sync service
- **uv** — Python package manager — `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **ffmpeg** — `brew install ffmpeg` (macOS) / `apt install ffmpeg` (Linux)
- **OpenAI API key** — [openai.com](https://openai.com/product)
- **Eleven Labs API key** — [elevenlabs.io](https://elevenlabs.io/)

### Installation

```bash
# Clone
git clone git@github.com:asanchezyali/talking-avatar-with-ai.git
cd talking-avatar-with-ai

# Install Node.js dependencies
yarn

# Install Python dependencies
cd apps/lip-sync && uv sync && cd ../..

# Configure environment
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your API keys
```

### Environment Variables

Create `apps/backend/.env`:

```bash
# OpenAI
OPENAI_MODEL=gpt-4
OPENAI_API_KEY=<your-key>

# Eleven Labs
ELEVEN_LABS_API_KEY=<your-key>
ELVEN_LABS_VOICE_ID=<your-voice-id>
ELEVEN_LABS_MODEL_ID=<your-model-id>

# Lip-Sync Service
LIP_SYNC_SERVICE_URL=http://localhost:8000
```

### Running

```bash
# Start all services (frontend + backend + lip-sync)
yarn dev

# Start without Python lip-sync (uses text-based fallback)
yarn dev:js-only
```

Open [http://localhost:5173](http://localhost:5173) to see the avatar.

### Docker

```bash
docker compose up
```

This starts the backend (port 3000) and lip-sync service (port 8000). The frontend runs separately via `yarn client`.

## Tech Stack

| Category | Technology |
|----------|-----------|
| **LLM** | OpenAI GPT via LangChain |
| **Speech-to-Text** | OpenAI Whisper API |
| **Text-to-Speech** | Eleven Labs |
| **Lip-Sync** | Whisper (word timestamps) + g2p-en (phonemes) + viseme mapping |
| **3D Avatar** | Ready Player Me + Three.js + React Three Fiber |
| **Animations** | Mixamo |
| **Backend** | Node.js, Express, LangChain |
| **Lip-Sync API** | Python, FastAPI, uv |
| **Frontend** | React, Vite, Tailwind CSS |

## Project Structure

```
talking-avatar-with-ai/
├── apps/
│   ├── frontend/              # React + Three.js
│   │   ├── src/components/    # Avatar, ChatInterface, Scenario
│   │   ├── src/hooks/         # useSpeech context
│   │   └── src/constants/     # viseme mappings, expressions
│   ├── backend/               # Node.js + Express
│   │   ├── modules/           # openAI, elevenLabs, lip-sync
│   │   └── utils/             # file helpers
│   └── lip-sync/              # Python + FastAPI
│       ├── src/lip_sync/
│       │   ├── api/           # FastAPI routes
│       │   ├── application/   # Lip-sync orchestration
│       │   ├── domain/        # Models, phoneme mapping
│       │   └── infrastructure/# Whisper, g2p-en, audio utils
│       └── tests/
├── docker-compose.yml
└── package.json               # Yarn workspaces root
```

## References

- [Build a Digital Human with LLMs](https://monadical.com/posts/build-a-digital-human-with-large-language-models.html) — Original tutorial
- [Ready Player Me — Oculus OVR LipSync](https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets/oculus-ovr-libsync)
- [Ready Player Me — Apple ARKit](https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets/apple-arkit)
- [OpenAI Whisper](https://github.com/openai/whisper)
- [g2p-en](https://github.com/Kyubyong/g2p) — Grapheme-to-phoneme for English
- [Mixamo](https://www.mixamo.com/) — 3D character animations
- [GLTF → React Three Fiber](https://gltf.pmnd.rs/)

## Community

Join the [Math & Code Discord](https://discord.gg/gJ3vCgSWeh) for questions and discussion.

## License

MIT
