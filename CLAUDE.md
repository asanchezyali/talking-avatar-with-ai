# Talking Avatar with AI - Project Guidelines

## Project Overview
This is a **Digital Human / Talking Avatar** monorepo that creates AI-powered avatars capable of realistic conversations with lip-sync, facial expressions, and animations.

## Requirements
- **Node.js**: >= 24.0.0 (LTS Krypton) - use `nvm use` to switch
- **Yarn**: Package manager

## Architecture
- **Monorepo**: Yarn workspaces with apps/frontend and apps/backend
- **Frontend**: React + Three.js + React Three Fiber for 3D avatar rendering
- **Backend**: Node.js/Express with LangChain for LLM orchestration

## Tech Stack
- **LLMs**: OpenAI GPT (via LangChain)
- **TTS**: Eleven Labs (text-to-speech)
- **Lip-Sync**: Rhubarb Lip-Sync
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
- `yarn dev` - Start development (frontend + backend)
- `yarn` - Install dependencies
- `yarn add --dev -W <package>` - Add dev dependency to workspace root

## Environment Variables (apps/backend/.env)
- OPENAI_MODEL, OPENAI_API_KEY
- ELEVEN_LABS_API_KEY, ELVEN_LABS_VOICE_ID, ELEVEN_LABS_MODEL_ID
