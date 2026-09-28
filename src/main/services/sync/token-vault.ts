import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { app, safeStorage } from 'electron';
import { GOOGLE_TOKEN_ENDPOINT } from './oauth-pkce';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  email?: string;
  displayName?: string;
  clientId: string;
}

const FALLBACK_KEY = crypto.createHash('sha256').update('sticker-chest-auth-fallback-key').digest();

function getVaultFilePath(): string {
  try {
    const userData = app.getPath('userData');
    return path.join(userData, 'gdrive-auth.enc');
  } catch {
    return path.resolve(process.cwd(), '.data', 'gdrive-auth.enc');
  }
}

function encryptPayload(plaintext: string): Buffer {
  if (safeStorage && safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(plaintext);
  }
  // Fallback AES-256-GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', FALLBACK_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from('FALLBACK:'), iv, tag, encrypted]);
}

function decryptPayload(buffer: Buffer): string {
  if (buffer.toString('utf8', 0, 9) === 'FALLBACK:') {
    const iv = buffer.subarray(9, 21);
    const tag = buffer.subarray(21, 37);
    const ciphertext = buffer.subarray(37);
    const decipher = crypto.createDecipheriv('aes-256-gcm', FALLBACK_KEY, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }
  if (safeStorage && safeStorage.isEncryptionAvailable()) {
    return safeStorage.decryptString(buffer);
  }
  throw new Error('Encryption unavailable to decrypt stored credentials');
}

export class TokenVault {
  private cachedTokens: StoredTokens | null = null;

  public saveTokens(tokens: StoredTokens): void {
    this.cachedTokens = tokens;
    const filePath = getVaultFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const encrypted = encryptPayload(JSON.stringify(tokens));
    fs.writeFileSync(filePath, encrypted);
  }

  public loadTokens(): StoredTokens | null {
    if (this.cachedTokens) return this.cachedTokens;
    const filePath = getVaultFilePath();
    if (!fs.existsSync(filePath)) return null;

    try {
      const buffer = fs.readFileSync(filePath);
      const decrypted = decryptPayload(buffer);
      this.cachedTokens = JSON.parse(decrypted) as StoredTokens;
      return this.cachedTokens;
    } catch (err) {
      console.error('Failed to load or decrypt stored tokens:', err);
      return null;
    }
  }

  public clearTokens(): void {
    this.cachedTokens = null;
    const filePath = getVaultFilePath();
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to remove token vault file:', err);
      }
    }
  }

  public hasTokens(): boolean {
    return this.loadTokens() !== null;
  }

  public async getValidAccessToken(): Promise<string | null> {
    const tokens = this.loadTokens();
    if (!tokens) return null;

    // Buffer of 60 seconds before expiration
    if (Date.now() < tokens.expiresAt - 60000) {
      return tokens.accessToken;
    }

    if (!tokens.refreshToken) {
      console.warn('Google Drive token expired and no refresh token available');
      return null;
    }

    // Refresh token
    try {
      const params = new URLSearchParams({
        client_id: tokens.clientId,
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
      });

      const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Failed to refresh Google OAuth token:', errText);
        return null;
      }

      const data = await response.json();
      const updated: StoredTokens = {
        ...tokens,
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
        refreshToken: data.refresh_token || tokens.refreshToken,
      };

      this.saveTokens(updated);
      return updated.accessToken;
    } catch (err) {
      console.error('Error refreshing Google Drive token:', err);
      return null;
    }
  }
}

let defaultVault: TokenVault | null = null;
export function getTokenVault(): TokenVault {
  if (!defaultVault) defaultVault = new TokenVault();
  return defaultVault;
}
