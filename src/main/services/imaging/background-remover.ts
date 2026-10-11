import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import { buildNoBgPath } from './background-paths';

const TIMEOUT_MS = 120_000;

/** Default location of the compiled worker (see vite.config.ts and electron-builder.json asarUnpack). */
export function getDefaultWorkerPath(appPath: string): string {
  const unpacked = path.join(appPath.replace(/app\.asar$/, 'app.asar.unpacked'), 'dist-electron', 'worker', 'background-worker.js');
  if (fs.existsSync(unpacked)) return unpacked;
  return path.join(appPath, 'dist-electron', 'worker', 'background-worker.js');
}

/**
 * Removes the background of a still image using a local ONNX model (offline, no API key).
 * Runs the model in a separate process, writes a new transparent PNG next to the original
 * and returns its path.
 */
export async function removeImageBackground(inputPath: string, workerPath: string): Promise<string> {
  if (!fs.existsSync(inputPath)) throw new Error(`Image not found: ${inputPath}`);
  if (!fs.existsSync(workerPath)) throw new Error(`Background removal worker is missing: ${workerPath}`);

  const outputPath = buildNoBgPath(inputPath, fs.existsSync);

  await new Promise<void>((resolve, reject) => {
    const child = fork(workerPath, [inputPath, outputPath], {
      // ELECTRON_RUN_AS_NODE makes the Electron binary behave as plain Node for the child.
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
      stdio: ['ignore', 'ignore', 'pipe', 'ipc'],
    });

    let stderr = '';
    child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error('Background removal timed out'));
    }, TIMEOUT_MS);

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(stderr.trim().split('\n').pop() || `Worker exited with code ${code}`));
    });
  }).catch((err: Error) => {
    try { fs.rmSync(outputPath, { force: true }); } catch {}
    console.error('Background removal failed:', err);
    throw new Error(`Background removal failed: ${err.message}`);
  });

  return outputPath;
}
