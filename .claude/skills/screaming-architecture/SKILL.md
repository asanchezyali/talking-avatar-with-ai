---
name: screaming-architecture
description: Screaming Architecture design principles. Use when organizing code by domain/feature, structuring folders to reflect business capabilities, or making the architecture reveal intent.
---

# Screaming Architecture

## Core Principle
The architecture should **scream** the intent of the system. When you look at the top-level directory structure, you should immediately understand what the application does, not what framework it uses.

## Anti-Pattern (Framework-Centric)
```
src/
  controllers/      # What is this app about?
  models/
  views/
  services/
  repositories/
```

## Correct Pattern (Domain-Centric)
```
src/
  avatar/           # This is about avatars!
  conversation/     # And conversations!
  speech/           # And speech processing!
  lip-sync/         # And lip synchronization!
```

## Structure for This Project

### Backend (Screaming: "I'm a Talking Avatar System!")
```
apps/backend/
  modules/
    avatar/                    # Avatar management
      domain/
      application/
      infrastructure/

    conversation/              # Conversation handling
      domain/
        entities/
          Conversation.ts
          Message.ts
        value-objects/
          FacialExpression.ts
          Animation.ts
        services/
          ResponseGenerator.ts
      application/
        ProcessMessage.usecase.ts
      infrastructure/
        OpenAIAdapter.ts

    speech/                    # Speech processing
      domain/
        services/
          TextToSpeech.ts
          SpeechToText.ts
      infrastructure/
        ElevenLabsAdapter.ts
        WhisperAdapter.ts

    lip-sync/                  # Lip synchronization
      domain/
        services/
          LipSyncGenerator.ts
        value-objects/
          Viseme.ts
          MouthCue.ts
      infrastructure/
        RhubarbAdapter.ts
```

### Frontend (Screaming: "I render 3D Avatars!")
```
apps/frontend/src/
  avatar/                      # 3D Avatar rendering
    components/
      Avatar3D.tsx
      AvatarCanvas.tsx
    hooks/
      useAvatarAnimation.ts
      useLipSync.ts

  conversation/                # Conversation UI
    components/
      ChatInput.tsx
      MessageList.tsx
    hooks/
      useConversation.ts

  shared/                      # Shared utilities
    components/
    hooks/
    utils/
```

## Guidelines

### 1. Name Folders by Business Capability
- `avatar/` not `three-js-renderer/`
- `conversation/` not `langchain-handler/`
- `speech/` not `eleven-labs-client/`

### 2. Keep Technical Details Inside
The infrastructure folder hides framework specifics:
```
speech/
  infrastructure/
    ElevenLabsAdapter.ts    # Technical detail hidden here
```

### 3. Feature Colocation
Keep related files together:
```
avatar/
  Avatar.tsx
  Avatar.test.tsx
  Avatar.styles.ts
  useAvatar.ts
```

### 4. Shared Code Isolation
Only truly shared code goes in `shared/`:
```
shared/
  components/Button.tsx     # Used by multiple features
  utils/formatDate.ts       # Generic utility
```

## Migration Strategy

When refactoring to screaming architecture:
1. Identify business domains
2. Create domain folders
3. Move related code together
4. Extract shared code last
5. Update imports
