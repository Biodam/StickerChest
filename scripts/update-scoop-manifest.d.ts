export interface ScoopManifest {
  version: string;
  architecture: { '64bit': { url: string; hash: string } };
  shortcuts: string[][];
  [key: string]: unknown;
}

export function updateManifest(manifest: Partial<ScoopManifest> & Record<string, unknown>, version: string, sha256: string): ScoopManifest;
export function sha256File(filePath: string): string;
