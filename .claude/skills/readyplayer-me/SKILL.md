---
name: readyplayer-me
description: Ready Player Me avatar integration. Use when loading RPM avatars, configuring morph targets, setting up ARKit/OVR lip sync, or customizing avatar appearance.
---

# Ready Player Me Integration

## Overview
Ready Player Me provides customizable 3D avatars with standardized morph targets for facial expressions and lip sync.

## Avatar URL Structure

```
https://models.readyplayer.me/{avatar-id}.glb?morphTargets=ARKit,Oculus+Visemes
```

### Query Parameters
| Parameter | Values | Description |
|-----------|--------|-------------|
| `morphTargets` | `ARKit`, `Oculus+Visemes` | Facial blend shapes |
| `textureAtlas` | `256`, `512`, `1024` | Texture resolution |
| `lod` | `0`, `1`, `2` | Level of detail |
| `pose` | `A`, `T` | Default pose |

## Loading Avatar in React Three Fiber

```tsx
import { useGLTF } from '@react-three/drei';

const AVATAR_URL = 'https://models.readyplayer.me/YOUR_AVATAR_ID.glb?morphTargets=ARKit,Oculus+Visemes';

function ReadyPlayerMeAvatar() {
  const { scene } = useGLTF(AVATAR_URL);

  // Find the head mesh with morph targets
  const headMesh = scene.getObjectByName('Wolf3D_Head');
  const teethMesh = scene.getObjectByName('Wolf3D_Teeth');

  return <primitive object={scene} />;
}

// Preload the avatar
useGLTF.preload(AVATAR_URL);
```

## Morph Targets

### ARKit Blend Shapes (52 shapes)
Used for facial expressions:

```typescript
const arkitBlendShapes = [
  'browDownLeft', 'browDownRight', 'browInnerUp',
  'browOuterUpLeft', 'browOuterUpRight',
  'cheekPuff', 'cheekSquintLeft', 'cheekSquintRight',
  'eyeBlinkLeft', 'eyeBlinkRight',
  'eyeLookDownLeft', 'eyeLookDownRight',
  'eyeLookInLeft', 'eyeLookInRight',
  'eyeLookOutLeft', 'eyeLookOutRight',
  'eyeLookUpLeft', 'eyeLookUpRight',
  'eyeSquintLeft', 'eyeSquintRight',
  'eyeWideLeft', 'eyeWideRight',
  'jawForward', 'jawLeft', 'jawOpen', 'jawRight',
  'mouthClose', 'mouthDimpleLeft', 'mouthDimpleRight',
  'mouthFrownLeft', 'mouthFrownRight',
  'mouthFunnel', 'mouthLeft', 'mouthLowerDownLeft',
  'mouthLowerDownRight', 'mouthPressLeft', 'mouthPressRight',
  'mouthPucker', 'mouthRight', 'mouthRollLower', 'mouthRollUpper',
  'mouthShrugLower', 'mouthShrugUpper',
  'mouthSmileLeft', 'mouthSmileRight',
  'mouthStretchLeft', 'mouthStretchRight',
  'mouthUpperUpLeft', 'mouthUpperUpRight',
  'noseSneerLeft', 'noseSneerRight',
];
```

### Oculus OVR Lip Sync Visemes (15 visemes)
Used for lip synchronization:

```typescript
const oculusVisemes = [
  'viseme_sil',   // Silence
  'viseme_PP',    // P, B, M
  'viseme_FF',    // F, V
  'viseme_TH',    // Th
  'viseme_DD',    // T, D
  'viseme_kk',    // K, G
  'viseme_CH',    // Ch, J, Sh
  'viseme_SS',    // S, Z
  'viseme_nn',    // N, L
  'viseme_RR',    // R
  'viseme_aa',    // A
  'viseme_E',     // E
  'viseme_I',     // I
  'viseme_O',     // O
  'viseme_U',     // U
];
```

## Applying Expressions

```typescript
function applyExpression(mesh: THREE.Mesh, expression: string) {
  if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

  const expressions = {
    smile: { mouthSmileLeft: 0.7, mouthSmileRight: 0.7, cheekSquintLeft: 0.3, cheekSquintRight: 0.3 },
    sad: { mouthFrownLeft: 0.6, mouthFrownRight: 0.6, browInnerUp: 0.5 },
    angry: { browDownLeft: 0.8, browDownRight: 0.8, jawForward: 0.3 },
    surprised: { eyeWideLeft: 0.8, eyeWideRight: 0.8, browInnerUp: 0.7, jawOpen: 0.3 },
    default: {}, // Reset all to 0
  };

  // Reset all morph targets
  mesh.morphTargetInfluences.fill(0);

  // Apply expression
  const targets = expressions[expression] || {};
  for (const [name, value] of Object.entries(targets)) {
    const index = mesh.morphTargetDictionary[name];
    if (index !== undefined) {
      mesh.morphTargetInfluences[index] = value;
    }
  }
}
```

## Lip Sync with Rhubarb Mapping

```typescript
// Map Rhubarb output to Oculus visemes
const rhubarbToOculus: Record<string, string> = {
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

function applyViseme(mesh: THREE.Mesh, viseme: string, weight = 1) {
  const oculusViseme = rhubarbToOculus[viseme] || 'viseme_sil';
  const index = mesh.morphTargetDictionary[oculusViseme];

  // Smooth transition
  mesh.morphTargetInfluences.fill(0);
  mesh.morphTargetInfluences[index] = weight;
}
```

## Avatar Customization

```typescript
// Create avatar with specific options
const avatarUrl = new URL('https://models.readyplayer.me/YOUR_ID.glb');
avatarUrl.searchParams.set('morphTargets', 'ARKit,Oculus+Visemes');
avatarUrl.searchParams.set('textureAtlas', '512');
avatarUrl.searchParams.set('lod', '1');
```

## Resources
- [RPM Morph Targets Docs](https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets)
- [ARKit Reference](https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets/apple-arkit)
- [Oculus OVR LipSync](https://docs.readyplayer.me/ready-player-me/api-reference/avatars/morph-targets/oculus-ovr-libsync)
