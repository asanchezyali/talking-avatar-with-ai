import fs from "fs";
import os from "os";
import path from "path";
import { execCommand } from "./files.mjs";

async function convertAudioToMp3({ audioData, runCommand = execCommand, tempRoot = os.tmpdir() }) {
  const tempDir = await fs.promises.mkdtemp(path.join(tempRoot, "talking-avatar-sts-"));
  const inputPath = path.join(tempDir, "input.webm");
  const outputPath = path.join(tempDir, "output.mp3");

  try {
    await fs.promises.writeFile(inputPath, audioData);
    await runCommand({ command: `ffmpeg -i "${inputPath}" "${outputPath}"` });
    return { outputPath, tempDir };
  } catch (error) {
    await fs.promises.rm(tempDir, { recursive: true, force: true });
    throw error;
  }
}

export { convertAudioToMp3 };
