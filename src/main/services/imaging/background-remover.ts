import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import { buildNoBgPath } from './background-paths';

const TIMEOUT_MS = 120_000;

/** Default location of the compiled worker (see vite.config.ts and electron-builder.json asarUnpack). */
export function getDefaultWorkerPath(appPath: string): string {
  const unpacked = path.join(appPath.replace(/app\.asar$/, 'app.asar.unpacked'), 'dist-electron', 'worker', 'background-worker.mjs');
  if (fs.existsSync(unpacked)) return unpacked;
  return path.join(appPath, 'dist-electron', 'worker', 'background-worker.mjs');
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
      if (code === 0) {
        resolve();
      } else {
        // Find meaningful error line (skip stack frames or trailing Node version banner)
        const lines = stderr.trim().split('\n').map((l) => l.trim()).filter(Boolean);
        const errLine = lines.find((l) => l.startsWith('Error:') || l.startsWith('Error ['))
          || lines.find((l) => !l.startsWith('Node.js v') && !l.startsWith('at ') && !l.startsWith('code:'))
          || `Worker exited with code ${code}`;
        reject(new Error(errLine));
      }
    });
  }).catch((err: Error) => {
    try { fs.rmSync(outputPath, { force: true }); } catch {}
    console.error('Background removal failed:', err);
    throw new Error(`Background removal failed: ${err.message}`);
  });

  return outputPath;
}
