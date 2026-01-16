---
name: kokoro-tts
description: Kokoro TTS and text-to-speech integration. Use when implementing speech synthesis, voice generation, Kokoro, Eleven Labs, or audio processing for avatars.
---

# Text-to-Speech for Avatars

## TTS Options Comparison

| Service | Quality | Latency | Cost | Local |
|---------|---------|---------|------|-------|
| Eleven Labs | Excellent | Medium | $$$ | No |
| Kokoro | Very Good | Low | Free | Yes |
| OpenAI TTS | Good | Medium | $$ | No |
| Coqui TTS | Good | Medium | Free | Yes |

## Kokoro TTS (Local, Free)

### Installation
```bash
pip install kokoro-onnx
```

### Basic Usage
```python
from kokoro_onnx import Kokoro

# Initialize
kokoro = Kokoro("kokoro-v0_19.onnx", "voices.bin")

# Generate speech
samples, sample_rate = kokoro.create(
    "Hello, I'm your AI avatar!",
    voice="af_bella",
    speed=1.0
)

# Save to file
import soundfile as sf
sf.write("output.wav", samples, sample_rate)
```

### Available Voices
```python
voices = [
    "af_bella",    # American Female
    "af_nicole",   # American Female
    "am_adam",     # American Male
    "am_michael",  # American Male
    "bf_emma",     # British Female
    "bm_george",   # British Male
]
```

### Node.js Integration
```typescript
import { spawn } from 'child_process';
import path from 'path';

async function generateSpeech(text: string, voice = 'af_bella'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      path.join(__dirname, 'scripts/kokoro_tts.py'),
      '--text', text,
      '--voice', voice,
    ]);

    const chunks: Buffer[] = [];
    python.stdout.on('data', (data) => chunks.push(data));
    python.on('close', (code) => {
      if (code === 0) resolve(Buffer.concat(chunks));
      else reject(new Error(`Process exited with code ${code}`));
    });
  });
}
```

## Eleven Labs Integration

### Setup
```typescript
import ElevenLabs from "elevenlabs-node";

const voice = new ElevenLabs({
  apiKey: process.env.ELEVEN_LABS_API_KEY,
  voiceId: process.env.ELEVEN_LABS_VOICE_ID,
});
```

### Generate Speech
```typescript
async function generateSpeechElevenLabs(text: string): Promise<Buffer> {
  const response = await voice.textToSpeech({
    text,
    modelId: "eleven_multilingual_v2",
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.75,
    },
  });

  return Buffer.from(await response.arrayBuffer());
}
```

### Streaming
```typescript
async function streamSpeech(text: string, res: Response) {
  const stream = await voice.textToSpeechStream({
    text,
    modelId: "eleven_turbo_v2",
  });

  stream.pipe(res);
}
```

## Audio Processing

### Convert to Base64
```typescript
function audioToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}
```

### Convert Format with FFmpeg
```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function convertToMp3(inputPath: string, outputPath: string) {
  await execAsync(`ffmpeg -i ${inputPath} -codec:a libmp3lame ${outputPath}`);
}
```

## Integration with Lip Sync

```typescript
interface TTSResponse {
  audio: string;       // Base64 encoded
  duration: number;    // Audio duration in seconds
}

async function generateAvatarSpeech(text: string): Promise<{
  audio: string;
  lipsync: LipSyncData;
}> {
  // Generate speech
  const audioBuffer = await generateSpeech(text);

  // Save temp file for Rhubarb
  const tempPath = `/tmp/speech_${Date.now()}.wav`;
  await fs.writeFile(tempPath, audioBuffer);

  // Generate lip sync
  const lipsync = await generateLipSync(tempPath);

  // Clean up
  await fs.unlink(tempPath);

  return {
    audio: audioBuffer.toString('base64'),
    lipsync,
  };
}
```

## Rhubarb Lip Sync Integration

```typescript
import { exec } from 'child_process';

async function generateLipSync(audioPath: string): Promise<LipSyncData> {
  const outputPath = audioPath.replace('.wav', '.json');

  await execAsync(
    `./bin/rhubarb -f json -o ${outputPath} ${audioPath}`
  );

  const data = JSON.parse(await fs.readFile(outputPath, 'utf8'));
  return data;
}
```

## Voice Emotion Modulation

```typescript
// Adjust voice settings based on emotion
const emotionSettings = {
  happy: { stability: 0.4, similarityBoost: 0.8 },
  sad: { stability: 0.7, similarityBoost: 0.6 },
  angry: { stability: 0.3, similarityBoost: 0.9 },
  calm: { stability: 0.8, similarityBoost: 0.5 },
};

async function generateEmotionalSpeech(text: string, emotion: string) {
  const settings = emotionSettings[emotion] || emotionSettings.calm;

  return await voice.textToSpeech({
    text,
    voiceSettings: settings,
  });
}
```

## Performance Tips

1. **Caching**: Cache common phrases
2. **Streaming**: Use streaming for long texts
3. **Chunking**: Split long texts into sentences
4. **Preloading**: Pregenerate common responses
5. **Local TTS**: Use Kokoro for development/testing

```typescript
const phraseCache = new Map<string, Buffer>();

async function getCachedSpeech(text: string): Promise<Buffer> {
  const cached = phraseCache.get(text);
  if (cached) return cached;

  const audio = await generateSpeech(text);
  phraseCache.set(text, audio);
  return audio;
}
```
