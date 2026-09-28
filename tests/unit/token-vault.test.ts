import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TokenVault, StoredTokens } from '../../src/main/services/sync/token-vault';

describe('TokenVault Credential Management', () => {
  let vault: TokenVault;
  const testDir = path.resolve(process.cwd(), '.data');
  const tokenFile = path.join(testDir, 'gdrive-auth.enc');

  beforeEach(() => {
    vault = new TokenVault();
    vault.clearTokens();
  });

  afterEach(() => {
    vault.clearTokens();
    if (fs.existsSync(tokenFile)) {
      try { fs.unlinkSync(tokenFile); } catch {}
    }
  });

  it('should save and load tokens securely', () => {
    const tokens: StoredTokens = {
      accessToken: 'test-access-token-12345',
      refreshToken: 'test-refresh-token-67890',
      expiresAt: Date.now() + 3600000,
      email: 'user@example.com',
      displayName: 'Test User',
      clientId: 'test-client-id',
    };

    vault.saveTokens(tokens);
    expect(vault.hasTokens()).toBe(true);

    const loaded = vault.loadTokens();
    expect(loaded).toBeDefined();
    expect(loaded?.accessToken).toBe(tokens.accessToken);
    expect(loaded?.refreshToken).toBe(tokens.refreshToken);
    expect(loaded?.email).toBe(tokens.email);
    expect(loaded?.displayName).toBe(tokens.displayName);
  });

  it('should return null when no tokens are stored', () => {
    expect(vault.loadTokens()).toBeNull();
    expect(vault.hasTokens()).toBe(false);
  });

  it('should return valid access token when not expired', async () => {
    const tokens: StoredTokens = {
      accessToken: 'valid-token-xyz',
      refreshToken: 'refresh-xyz',
      expiresAt: Date.now() + 100000, // 100s in future
      clientId: 'client-xyz',
    };

    vault.saveTokens(tokens);
    const token = await vault.getValidAccessToken();
    expect(token).toBe('valid-token-xyz');
  });

  it('should clear stored credentials on clearTokens()', () => {
    vault.saveTokens({
      accessToken: 'tok',
      refreshToken: 'ref',
      expiresAt: Date.now() + 10000,
      clientId: 'cid',
    });

    expect(vault.hasTokens()).toBe(true);
    vault.clearTokens();
    expect(vault.hasTokens()).toBe(false);
    expect(vault.loadTokens()).toBeNull();
  });
});
