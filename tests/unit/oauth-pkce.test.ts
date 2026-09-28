import { describe, it, expect } from 'vitest';
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  createPkcePair,
  buildAuthorizationUrl,
  GDRIVE_SCOPES,
  GOOGLE_AUTH_ENDPOINT,
} from '../../src/main/services/sync/oauth-pkce';

describe('OAuth PKCE Utilities', () => {
  it('should generate a code verifier with proper length and URL-safe characters', () => {
    const verifier = generateCodeVerifier(64);
    expect(verifier).toBeDefined();
    expect(verifier.length).toBe(64);
    // URL-safe base64 regex (no +, /, or =)
    expect(/^[A-Za-z0-9_-]+$/.test(verifier)).toBe(true);
  });

  it('should generate deterministic code challenge from verifier using SHA-256', () => {
    const verifier = 'test-verifier-string-1234567890-abcdefghijklmnop';
    const challenge1 = generateCodeChallenge(verifier);
    const challenge2 = generateCodeChallenge(verifier);

    expect(challenge1).toBe(challenge2);
    expect(challenge1.length).toBeGreaterThan(20);
    expect(/^[A-Za-z0-9_-]+$/.test(challenge1)).toBe(true);
  });

  it('should generate unique state tokens', () => {
    const state1 = generateState();
    const state2 = generateState();
    expect(state1).not.toBe(state2);
    expect(state1.length).toBe(48); // 24 bytes hex = 48 chars
  });

  it('should create complete PKCE pair with verifier, challenge and state', () => {
    const pair = createPkcePair();
    expect(pair.verifier).toBeDefined();
    expect(pair.challenge).toBeDefined();
    expect(pair.state).toBeDefined();
    expect(generateCodeChallenge(pair.verifier)).toBe(pair.challenge);
  });

  it('should build proper Google OAuth authorization URL with PKCE parameters and appdata scope', () => {
    const params = {
      clientId: 'my-test-client-id.apps.googleusercontent.com',
      redirectUri: 'http://127.0.0.1:4567/callback',
      challenge: 'challenge-xyz-123',
      state: 'state-abc-789',
    };

    const urlString = buildAuthorizationUrl(params);
    const url = new URL(urlString);

    expect(urlString.startsWith(GOOGLE_AUTH_ENDPOINT)).toBe(true);
    expect(url.searchParams.get('client_id')).toBe(params.clientId);
    expect(url.searchParams.get('redirect_uri')).toBe(params.redirectUri);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('code_challenge')).toBe(params.challenge);
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('state')).toBe(params.state);
    expect(url.searchParams.get('scope')).toBe(GDRIVE_SCOPES);
    expect(url.searchParams.get('access_type')).toBe('offline');
    expect(url.searchParams.get('prompt')).toBe('consent');
  });
});
