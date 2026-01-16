---
name: monorepo
description: Monorepo patterns with Yarn workspaces. Use when adding dependencies, creating packages, managing workspaces, or configuring shared tooling across apps.
---

# Monorepo with Yarn Workspaces

## Project Structure
```
talking-avatar-with-ai/
  package.json              # Root workspace config
  yarn.lock                 # Single lockfile
  apps/
    frontend/
      package.json          # Frontend app
    backend/
      package.json          # Backend app
  packages/                 # Shared packages (optional)
    shared-types/
      package.json
    utils/
      package.json
```

## Root package.json
```json
{
  "name": "talking-avatar-with-ai",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "yarn workspaces run dev",
    "build": "yarn workspaces run build",
    "test": "yarn workspaces run test",
    "lint": "yarn workspaces run lint"
  }
}
```

## Common Commands

### Install all dependencies
```bash
yarn
```

### Add dependency to specific workspace
```bash
# Add to frontend
yarn workspace frontend add react-three-fiber

# Add to backend
yarn workspace backend add langchain

# Add dev dependency to workspace
yarn workspace frontend add -D @types/three
```

### Add dependency to root (shared dev tools)
```bash
yarn add --dev -W typescript eslint prettier
```

### Run script in specific workspace
```bash
yarn workspace frontend dev
yarn workspace backend build
```

### Run script in all workspaces
```bash
yarn workspaces run test
```

## Creating Shared Packages

### 1. Create package structure
```bash
mkdir -p packages/shared-types
```

### 2. Create package.json
```json
{
  "name": "@talking-avatar/shared-types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  }
}
```

### 3. Use in other workspaces
```json
{
  "dependencies": {
    "@talking-avatar/shared-types": "*"
  }
}
```

## Shared Types Example

```typescript
// packages/shared-types/src/index.ts

export interface AvatarMessage {
  text: string;
  facialExpression: FacialExpression;
  animation: Animation;
  audio?: string;
  lipsync?: LipSyncData;
}

export type FacialExpression =
  | 'smile' | 'sad' | 'angry'
  | 'surprised' | 'funnyFace' | 'default';

export type Animation =
  | 'Idle' | 'TalkingOne' | 'TalkingThree'
  | 'SadIdle' | 'Defeated' | 'Angry'
  | 'Surprised' | 'DismissingGesture' | 'ThoughtfulHeadShake';

export interface LipSyncData {
  metadata: LipSyncMetadata;
  mouthCues: MouthCue[];
}
```

## Dependency Management

### Hoisting
Dependencies are hoisted to root `node_modules` when possible, reducing duplication.

### Version Conflicts
When workspaces need different versions:
```json
{
  "resolutions": {
    "lodash": "4.17.21"
  }
}
```

## CI/CD Considerations

### Build Order
```yaml
# Build shared packages first
- yarn workspace @talking-avatar/shared-types build
- yarn workspace backend build
- yarn workspace frontend build
```

### Caching
Cache `node_modules` and `.yarn/cache` for faster builds.

## Best Practices

1. **Single lockfile**: Always use root yarn.lock
2. **Explicit dependencies**: Each workspace declares its own dependencies
3. **Shared dev tools**: Keep linters, formatters at root
4. **Type sharing**: Use shared packages for cross-workspace types
5. **Scripts consistency**: Use same script names across workspaces
