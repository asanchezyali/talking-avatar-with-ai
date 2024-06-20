import fs from "fs";
import path from "path";
import { execCommand } from "./files.mjs";

async function convertAudioToMp3({ audioData }) {
  const dir = 'tmp';
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  const inputPath = path.join(dir, "input.webm");
  fs.writeFileSync(inputPath, audioData);
  const outputPath = path.join(dir, "output.mp3");
  await execCommand({ command: `ffmpeg -i ${inputPath} ${outputPath}` });
  const mp3AudioData = fs.readFileSync(outputPath);
  fs.unlinkSync(inputPath);
  fs.unlinkSync(outputPath);
  return mp3AudioData;
}

export { convertAudioToMp3 };