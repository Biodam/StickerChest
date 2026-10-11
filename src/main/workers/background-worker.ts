/**
 * Background-removal worker. Runs in its own process (forked by background-remover.ts) so the
 * model runtime's bundled native libraries never load alongside the app's own `sharp`.
 *
 * Usage: node background-worker.js <inputPath> <outputPath>
 */
import fs from 'fs';
import { removeBackground } from '@imgly/background-removal-node';
import { guessMimeType } from '../services/imaging/background-paths';

async function run(inputPath: string, outputPath: string): Promise<void> {
  const bytes = fs.readFileSync(inputPath);
  const input = new Blob([new Uint8Array(bytes)], { type: guessMimeType(inputPath) });
  const result = await removeBackground(input, { model: 'small', output: { format: 'image/png' } });
  fs.writeFileSync(outputPath, Buffer.from(await result.arrayBuffer()));
}

const [inputArg, outputArg] = process.argv.slice(2);
if (!inputArg || !outputArg) {
  console.error('Usage: background-worker <inputPath> <outputPath>');
  process.exit(2);
}

run(inputArg, outputArg)
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
