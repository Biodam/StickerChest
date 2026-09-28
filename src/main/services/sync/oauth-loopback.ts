import http from 'http';
import { shell } from 'electron';
import { createPkcePair, buildAuthorizationUrl, GOOGLE_TOKEN_ENDPOINT } from './oauth-pkce';
import { getTokenVault, StoredTokens } from './token-vault';

export const DEFAULT_GDRIVE_CLIENT_ID =
  process.env.GDRIVE_CLIENT_ID || '1035284849202-placeholder.apps.googleusercontent.com';

const SUCCESS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sticker Chest - Connected</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f1013; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #1a1b1e; border: 1px solid #2c2e33; border-radius: 16px; padding: 40px; text-align: center; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h2 { color: #3b82f6; margin-top: 0; font-size: 22px; }
    p { color: #9ca3af; font-size: 14px; line-height: 1.6; }
    .badge { display: inline-block; background: #1e3a5f; color: #60a5fa; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 13px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Google Drive Connected</div>
    <h2>Authentication Successful!</h2>
    <p>Sticker Chest has successfully linked with your Google Drive AppData folder.<br><br>You can safely close this browser window and return to Sticker Chest.</p>
  </div>
</body>
</html>
`;

export async function startOAuthFlow(customClientId?: string): Promise<{ success: boolean; email?: string; error?: string }> {
  const clientId = (customClientId && customClientId.trim().length > 0) ? customClientId.trim() : DEFAULT_GDRIVE_CLIENT_ID;

  return new Promise((resolve) => {
    let server: http.Server | null = null;
    let timer: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (server) {
        server.close();
        server = null;
      }
    };

    server = http.createServer(async (req, res) => {
      if (!req.url?.startsWith('/callback')) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      try {
        const parsedUrl = new URL(req.url, `http://127.0.0.1`);
        const code = parsedUrl.searchParams.get('code');
        const state = parsedUrl.searchParams.get('state');
        const error = parsedUrl.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end(`OAuth Error: ${error}`);
          cleanup();
          resolve({ success: false, error });
          return;
        }

        if (!code || state !== pkce.state) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid code or state parameter.');
          cleanup();
          resolve({ success: false, error: 'State validation failed' });
          return;
        }

        // Exchange code for tokens
        const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            code,
            code_verifier: pkce.verifier,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }).toString(),
        });

        if (!tokenRes.ok) {
          const errDetail = await tokenRes.text();
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Failed to exchange authorization code.');
          cleanup();
          resolve({ success: false, error: `Token exchange failed: ${errDetail}` });
          return;
        }

        const tokenData = await tokenRes.json();

        // Fetch User Info
        let userEmail = '';
        let displayName = '';
        try {
          const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            userEmail = userData.email || '';
            displayName = userData.name || '';
          }
        } catch (err) {
          console.warn('Could not fetch user profile details:', err);
        }

        const tokens: StoredTokens = {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || '',
          expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
          email: userEmail,
          displayName,
          clientId,
        };

        getTokenVault().saveTokens(tokens);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(SUCCESS_HTML);

        cleanup();
        resolve({ success: true, email: userEmail });
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal authentication error');
        cleanup();
        resolve({ success: false, error: err.message || 'Authentication error' });
      }
    });

    const pkce = createPkcePair();
    let redirectUri = '';

    server.listen(0, '127.0.0.1', () => {
      const address = server?.address();
      if (!address || typeof address === 'string') {
        cleanup();
        resolve({ success: false, error: 'Could not acquire local port' });
        return;
      }

      redirectUri = `http://127.0.0.1:${address.port}/callback`;
      const authUrl = buildAuthorizationUrl({
        clientId,
        redirectUri,
        challenge: pkce.challenge,
        state: pkce.state,
      });

      shell.openExternal(authUrl);

      // Auto-timeout after 3 minutes
      timer = setTimeout(() => {
        cleanup();
        resolve({ success: false, error: 'Authentication timed out after 3 minutes' });
      }, 180000);
    });

    server.on('error', (err) => {
      cleanup();
      resolve({ success: false, error: `Loopback server error: ${err.message}` });
    });
  });
}
