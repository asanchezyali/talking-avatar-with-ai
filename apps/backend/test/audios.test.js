import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { convertAudioToMp3 } from "../utils/audios.mjs";

const commandPaths = (command) => {
  const match = command.match(/^ffmpeg -i "([^"]+)" "([^"]+)"$/);
  assert.ok(match, `unexpected synthetic command: ${command}`);
  return { inputPath: match[1], outputPath: match[2] };
};

test("concurrent conversions keep each request's temporary audio isolated", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "talking-avatar-test-"));
  const requestA = Buffer.from("synthetic-request-a");
  const requestB = Buffer.from("synthetic-request-b");
  const createdDirs = new Set();
  let started = 0;
  let releaseBoth;
  const bothStarted = new Promise((resolve) => {
    releaseBoth = resolve;
  });
  const runCommand = async ({ command }) => {
    const { inputPath, outputPath } = commandPaths(command);
    createdDirs.add(path.dirname(inputPath));
    const input = await readFile(inputPath);
    started += 1;
    if (started === 2) releaseBoth();
    await bothStarted;
    await writeFile(outputPath, input);
  };

  try {
    const [resultA, resultB] = await Promise.all([
      convertAudioToMp3({ audioData: requestA, runCommand, tempRoot }),
      convertAudioToMp3({ audioData: requestB, runCommand, tempRoot }),
    ]);

    assert.notEqual(resultA.tempDir, resultB.tempDir);
    assert.notEqual(resultA.outputPath, resultB.outputPath);
    assert.deepEqual(await readFile(resultA.outputPath), requestA);
    assert.deepEqual(await readFile(resultB.outputPath), requestB);
  } finally {
    for (const dir of createdDirs) {
      await rm(dir, { recursive: true, force: true });
    }
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test("failed conversion removes its request-scoped temporary files", async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "talking-avatar-test-"));
  let tempDir;
  const runCommand = async ({ command }) => {
    const { inputPath } = commandPaths(command);
    tempDir = path.dirname(inputPath);
    throw new Error("synthetic converter failure");
  };

  try {
    await assert.rejects(
      convertAudioToMp3({ audioData: Buffer.from("synthetic-input"), runCommand, tempRoot }),
      /synthetic converter failure/
    );
    assert.deepEqual(await readdir(tempRoot), []);
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
    await rm(tempRoot, { recursive: true, force: true });
  }
});
