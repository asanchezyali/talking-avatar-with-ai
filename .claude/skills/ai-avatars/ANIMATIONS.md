# Avatar Animations Reference

## Mixamo Animations Setup

### Downloading Animations
1. Go to [Mixamo](https://www.mixamo.com/)
2. Upload your Ready Player Me avatar
3. Download animations in FBX format
4. Convert to GLB using Blender or gltf-pipeline

### Animation List

| Name | Type | Duration | Loop | Use Case |
|------|------|----------|------|----------|
| Idle | Idle | 4s | Yes | Default standing |
| TalkingOne | Talk | Variable | No | Short responses |
| TalkingThree | Talk | Variable | No | Long explanations |
| SadIdle | Idle | 3s | Yes | Sad context |
| Defeated | Gesture | 3s | No | Giving up |
| Angry | Gesture | 2s | No | Frustration |
| Surprised | Gesture | 2s | No | Unexpected |
| DismissingGesture | Gesture | 2s | No | Disagreement |
| ThoughtfulHeadShake | Gesture | 3s | No | Pondering |

## Animation Blending

```typescript
import { useAnimations } from '@react-three/drei';

function useAnimationController(animations, scene) {
  const { actions, mixer } = useAnimations(animations, scene);
  const currentAction = useRef(null);

  const playAnimation = useCallback((name: string, options = {}) => {
    const {
      fadeIn = 0.5,
      fadeOut = 0.5,
      loop = false,
      clampWhenFinished = true,
    } = options;

    const newAction = actions[name];
    if (!newAction) return;

    // Configure action
    newAction.clampWhenFinished = clampWhenFinished;
    newAction.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;

    // Crossfade from current
    if (currentAction.current) {
      currentAction.current.fadeOut(fadeOut);
    }

    newAction.reset().fadeIn(fadeIn).play();
    currentAction.current = newAction;
  }, [actions]);

  return { playAnimation, mixer };
}
```

## Emotion-Animation Mapping

```typescript
const emotionAnimations: Record<string, AnimationConfig> = {
  happy: {
    idle: 'Idle',
    talking: 'TalkingOne',
    gesture: null,
  },
  sad: {
    idle: 'SadIdle',
    talking: 'TalkingOne',
    gesture: 'Defeated',
  },
  angry: {
    idle: 'Idle',
    talking: 'TalkingThree',
    gesture: 'Angry',
  },
  surprised: {
    idle: 'Idle',
    talking: 'TalkingOne',
    gesture: 'Surprised',
  },
  thinking: {
    idle: 'Idle',
    talking: 'TalkingThree',
    gesture: 'ThoughtfulHeadShake',
  },
  dismissive: {
    idle: 'Idle',
    talking: 'TalkingOne',
    gesture: 'DismissingGesture',
  },
};
```

## Animation Timing

```typescript
function useAnimationTiming(audioRef: HTMLAudioElement) {
  const [phase, setPhase] = useState<'idle' | 'talking' | 'gesture'>('idle');

  useEffect(() => {
    const handleTimeUpdate = () => {
      const duration = audioRef.duration;
      const current = audioRef.currentTime;
      const remaining = duration - current;

      if (remaining < 0.5) {
        setPhase('gesture'); // End with gesture
      } else {
        setPhase('talking');
      }
    };

    const handleEnded = () => setPhase('idle');

    audioRef.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.addEventListener('ended', handleEnded);

    return () => {
      audioRef.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.removeEventListener('ended', handleEnded);
    };
  }, [audioRef]);

  return phase;
}
```

## Performance Optimization

```typescript
// Use animation pooling
const animationPool = new Map<string, THREE.AnimationAction>();

function getPooledAction(name: string, mixer: THREE.AnimationMixer, clip: THREE.AnimationClip) {
  if (!animationPool.has(name)) {
    animationPool.set(name, mixer.clipAction(clip));
  }
  return animationPool.get(name);
}

// Dispose animations on unmount
useEffect(() => {
  return () => {
    animationPool.forEach(action => action.stop());
    animationPool.clear();
    mixer.stopAllAction();
  };
}, []);
```
