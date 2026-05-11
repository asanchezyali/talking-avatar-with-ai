# Talking Avatar with AI - Project Guidelines

## Project Overview
This is a **Digital Human / Talking Avatar** monorepo that creates AI-powered avatars capable of realistic conversations with lip-sync, facial expressions, and animations.

## Requirements
- **Node.js**: >= 24.0.0 (LTS Krypton) - use `nvm use` to switch
- **Yarn**: Package manager (Node.js apps)
- **Python**: >= 3.11 (lip-sync service)
- **uv**: Python package manager - `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **ffmpeg**: Required by Whisper and pydub - `brew install ffmpeg`

## Architecture
- **Monorepo**: Yarn workspaces (apps/frontend, apps/backend) + Python service (apps/lip-sync)
- **Frontend**: React + Three.js + React Three Fiber for 3D avatar rendering
- **Backend**: Node.js/Express with LangChain for LLM orchestration
- **Lip-Sync Service**: Python/FastAPI microservice with Whisper + g2p-en

## Tech Stack
- **LLMs**: OpenAI GPT (via LangChain)
- **TTS**: Eleven Labs (text-to-speech)
- **Lip-Sync**: Python microservice (Whisper for audio analysis + g2p-en for phonemes)
- **3D Avatars**: Ready Player Me + Three.js
- **Animations**: Mixamo

## Code Conventions
- Use TypeScript for type safety
- Follow DDD (Domain-Driven Design) principles
- Apply Screaming Architecture for clear domain boundaries
- Use structured JSON responses for avatar interactions

## Response Format
Avatar responses must follow this structure:
```json
{
  "messages": [
    {
      "text": "spoken text",
      "facialExpression": "smile|sad|angry|surprised|funnyFace|default",
      "animation": "Idle|TalkingOne|TalkingThree|SadIdle|Defeated|Angry|Surprised|DismissingGesture|ThoughtfulHeadShake"
    }
  ]
}
```

## Commands
- `yarn dev` - Start all services (frontend + backend + lip-sync)
- `yarn dev:js-only` - Start without Python lip-sync service
- `yarn` - Install Node.js dependencies
- `cd apps/lip-sync && uv sync` - Install Python dependencies
- `yarn add --dev -W <package>` - Add dev dependency to workspace root
- `cd apps/lip-sync && uv add <package>` - Add Python dependency

## Environment Variables (apps/backend/.env)
- OPENAI_MODEL, OPENAI_API_KEY
- ELEVEN_LABS_API_KEY, ELVEN_LABS_VOICE_ID, ELEVEN_LABS_MODEL_ID
- LIP_SYNC_SERVICE_URL (default: http://localhost:8000)

## Environment Variables (apps/lip-sync)
- LIP_SYNC_WHISPER_MODEL (default: base)
- LIP_SYNC_HOST (default: 0.0.0.0)
- LIP_SYNC_PORT (default: 8000)
