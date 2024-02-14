import fs from "fs";
import { execCommand } from "./files.mjs";

async function convertAudioToMp3({ audioData }) {
  console.log(fs);
  const inputPath = "/tmp/input.webm";
  fs.writeFileSync(inputPath, audioData);
  const outputPath = "/tmp/output.mp3";
  await execCommand({ command: `ffmpeg -i ${inputPath} ${outputPath}` });
  const mp3AudioData = fs.readFileSync(outputPath);
  fs.unlinkSync(inputPath);
  fs.unlinkSync(outputPath);
  return mp3AudioData;
}

export { convertAudioToMp3 };
