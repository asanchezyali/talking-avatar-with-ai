# Ready Player Me Morph Targets Complete Reference

## ARKit Blend Shapes (52)

### Brow
| Name | Description |
|------|-------------|
| browDownLeft | Lower left eyebrow |
| browDownRight | Lower right eyebrow |
| browInnerUp | Raise inner eyebrows |
| browOuterUpLeft | Raise outer left eyebrow |
| browOuterUpRight | Raise outer right eyebrow |

### Cheek
| Name | Description |
|------|-------------|
| cheekPuff | Puff both cheeks |
| cheekSquintLeft | Squint left cheek |
| cheekSquintRight | Squint right cheek |

### Eye
| Name | Description |
|------|-------------|
| eyeBlinkLeft | Close left eye |
| eyeBlinkRight | Close right eye |
| eyeLookDownLeft | Left eye look down |
| eyeLookDownRight | Right eye look down |
| eyeLookInLeft | Left eye look inward |
| eyeLookInRight | Right eye look inward |
| eyeLookOutLeft | Left eye look outward |
| eyeLookOutRight | Right eye look outward |
| eyeLookUpLeft | Left eye look up |
| eyeLookUpRight | Right eye look up |
| eyeSquintLeft | Squint left eye |
| eyeSquintRight | Squint right eye |
| eyeWideLeft | Widen left eye |
| eyeWideRight | Widen right eye |

### Jaw
| Name | Description |
|------|-------------|
| jawForward | Move jaw forward |
| jawLeft | Move jaw left |
| jawOpen | Open jaw |
| jawRight | Move jaw right |

### Mouth
| Name | Description |
|------|-------------|
| mouthClose | Close lips |
| mouthDimpleLeft | Left mouth dimple |
| mouthDimpleRight | Right mouth dimple |
| mouthFrownLeft | Left frown |
| mouthFrownRight | Right frown |
| mouthFunnel | Funnel lips |
| mouthLeft | Move mouth left |
| mouthLowerDownLeft | Lower left lip down |
| mouthLowerDownRight | Lower right lip down |
| mouthPressLeft | Press left lips |
| mouthPressRight | Press right lips |
| mouthPucker | Pucker lips |
| mouthRight | Move mouth right |
| mouthRollLower | Roll lower lip |
| mouthRollUpper | Roll upper lip |
| mouthShrugLower | Shrug lower lip |
| mouthShrugUpper | Shrug upper lip |
| mouthSmileLeft | Left smile |
| mouthSmileRight | Right smile |
| mouthStretchLeft | Stretch left |
| mouthStretchRight | Stretch right |
| mouthUpperUpLeft | Upper left lip up |
| mouthUpperUpRight | Upper right lip up |

### Nose
| Name | Description |
|------|-------------|
| noseSneerLeft | Left nose sneer |
| noseSneerRight | Right nose sneer |

## Oculus OVR Visemes (15)

| Viseme | Phonemes | Description |
|--------|----------|-------------|
| viseme_sil | - | Silence |
| viseme_PP | P, B, M | Lips closed |
| viseme_FF | F, V | Lower lip to upper teeth |
| viseme_TH | Th | Tongue between teeth |
| viseme_DD | T, D, N | Tongue behind upper teeth |
| viseme_kk | K, G, NG | Back of tongue to soft palate |
| viseme_CH | Ch, J, Sh | Tongue to palate |
| viseme_SS | S, Z | Tongue behind teeth |
| viseme_nn | N, L | Tongue to upper teeth ridge |
| viseme_RR | R | Tongue curled back |
| viseme_aa | A | Mouth open wide |
| viseme_E | E | Mouth slightly open |
| viseme_I | I | Mouth narrow |
| viseme_O | O | Lips rounded |
| viseme_U | U | Lips pursed |

## Expression Presets

```typescript
const expressionPresets = {
  smile: {
    mouthSmileLeft: 0.7,
    mouthSmileRight: 0.7,
    cheekSquintLeft: 0.3,
    cheekSquintRight: 0.3,
    eyeSquintLeft: 0.2,
    eyeSquintRight: 0.2,
  },
  sad: {
    mouthFrownLeft: 0.6,
    mouthFrownRight: 0.6,
    browInnerUp: 0.5,
    mouthPressLeft: 0.3,
    mouthPressRight: 0.3,
  },
  angry: {
    browDownLeft: 0.8,
    browDownRight: 0.8,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.4,
    jawForward: 0.3,
    noseSneerLeft: 0.5,
    noseSneerRight: 0.5,
  },
  surprised: {
    eyeWideLeft: 0.8,
    eyeWideRight: 0.8,
    browInnerUp: 0.7,
    browOuterUpLeft: 0.5,
    browOuterUpRight: 0.5,
    jawOpen: 0.3,
  },
  funnyFace: {
    eyeWideLeft: 0.5,
    eyeSquintRight: 0.8,
    mouthLeft: 0.5,
    cheekPuff: 0.6,
  },
  thinking: {
    browDownLeft: 0.3,
    eyeLookUpLeft: 0.4,
    eyeLookUpRight: 0.4,
    mouthPucker: 0.2,
  },
};
```

## Mesh Names in RPM Avatars

```typescript
const rpmMeshes = [
  'Wolf3D_Head',       // Face morph targets
  'Wolf3D_Teeth',      // Teeth visibility
  'Wolf3D_Body',       // Body mesh
  'Wolf3D_Outfit_Top', // Clothing
  'Wolf3D_Hair',       // Hair mesh
  'Wolf3D_Glasses',    // Accessories
];
```
