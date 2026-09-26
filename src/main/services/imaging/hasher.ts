import { createHash } from 'crypto';
import fs from 'fs';

export async function calculateFileSha256(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
}

export function calculateBufferSha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}
