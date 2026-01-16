---
name: ai-avatars
description: AI-powered digital avatar development. Use when implementing avatar animations, facial expressions, lip-sync, 3D rendering with Three.js/React Three Fiber, or avatar conversation systems.
---

# AI Avatars Development

## System Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   Backend   │────▶│  Frontend   │
│   Input     │     │  (LLM+TTS)  │     │  (3D Avatar)│
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │
      │              ┌─────┴─────┐             │
      │              │           │             │
      ▼              ▼           ▼             ▼
   Text/Audio    Response    Audio+Lip     3D Model
                 Generation   Sync         Animation
```

## Avatar Response Structure

```typescript
interface AvatarResponse {
  messages: AvatarMessage[];
}

interface AvatarMessage {
  text: string;
  facialExpression: FacialExpression;
  animation: Animation;
  audio: string;      // Base64 encoded
  lipsync: LipSyncData;
}
```

## Facial Expressions

| Expression | Use Case |
|------------|----------|
| `smile` | Happy, agreeing, friendly |
| `sad` | Empathy, disappointment |
| `angry` | Frustration, disagreement |
| `surprised` | Unexpected information |
| `funnyFace` | Humor, playfulness |
| `default` | Neutral, listening |

## Animations

| Animation | Duration | Use Case |
|-----------|----------|----------|
| `Idle` | Loop | Waiting, listening |
| `TalkingOne` | Variable | Short responses |
| `TalkingThree` | Variable | Long explanations |
| `SadIdle` | Loop | Sad context |
| `Defeated` | 3s | Giving up, failing |
| `Angry` | 2s | Frustration |
| `Surprised` | 2s | Unexpected news |
| `DismissingGesture` | 2s | Disagreement |
| `ThoughtfulHeadShake` | 3s | Pondering |

## React Three Fiber Avatar Component

```tsx
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function Avatar({ animation, expression, lipsync }) {
  const { scene, animations } = useGLTF('/avatar.glb');
  const { actions } = useAnimations(animations, scene);

  // Play animation
  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.5).play();
    return () => actions[animation]?.fadeOut(0.5);
  }, [animation]);

  // Apply morph targets for expressions
  useEffect(() => {
    const mesh = scene.getObjectByName('Head');
    if (mesh?.morphTargetInfluences) {
      // Reset all expressions
      mesh.morphTargetInfluences.fill(0);
      // Apply new expression
      const index = mesh.morphTargetDictionary[expression];
      mesh.morphTargetInfluences[index] = 1;
    }
  }, [expression]);

  // Lip sync
  useFrame(() => {
    if (lipsync) {
      // Apply viseme morph targets based on current time
    }
  });

  return <primitive object={scene} />;
}
```

## Lip Sync Integration

```typescript
// Map Rhubarb visemes to morph targets
const visemeMap: Record<string, string> = {
  'A': 'viseme_aa',
  'B': 'viseme_PP',
  'C': 'viseme_I',
  'D': 'viseme_O',
  'E': 'viseme_U',
  'F': 'viseme_FF',
  'G': 'viseme_TH',
  'H': 'viseme_DD',
  'X': 'viseme_sil',
};

function useLipSync(lipsync: LipSyncData, audioRef: HTMLAudioElement) {
  useFrame(() => {
    const currentTime = audioRef.currentTime;
    const currentCue = lipsync.mouthCues.find(
      cue => currentTime >= cue.start && currentTime < cue.end
    );
    // Apply viseme morph target
  });
}
```

## Emotion-Animation Mapping

```typescript
const emotionToAnimation: Record<string, Animation[]> = {
  happy: ['TalkingOne', 'Idle'],
  sad: ['SadIdle', 'Defeated'],
  angry: ['Angry', 'DismissingGesture'],
  surprised: ['Surprised'],
  thoughtful: ['ThoughtfulHeadShake', 'TalkingThree'],
};
```

## Best Practices

1. **Smooth Transitions**: Use fadeIn/fadeOut for animation blending
2. **Expression Timing**: Change expressions slightly before/after speech
3. **Idle Variations**: Mix idle animations to avoid robotic feel
4. **Audio Sync**: Preload audio before starting lip sync
5. **Performance**: Use LOD (Level of Detail) for complex scenes

For Ready Player Me integration, see `/readyplayer-me` skill.
For LLM response generation, see `/llms` skill.
