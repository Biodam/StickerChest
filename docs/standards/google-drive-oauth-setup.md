# Google Drive OAuth 2.0 PKCE Setup Guide

This guide walks you through setting up a free Google Cloud project to enable direct Google Drive cloud synchronization for **Sticker Chest**.

---

## 1. Overview

Sticker Chest uses **OAuth 2.0 with PKCE (Proof Key for Code Exchange)** to sync sticker assets and database snapshots directly to your personal Google Drive account.

- **Storage Location**: Private `drive.appdata` folder (`appDataFolder`).
- **Privacy & Isolation**: Files stored in `appDataFolder` are invisible to other apps and hidden from your main Google Drive directory, preventing accidental deletion or clutter.
- **Security**: No client secret is required or stored. All access and refresh tokens are encrypted locally using Electron's `safeStorage` (backed by Windows DPAPI or macOS Keychain).

---

## 2. Step-by-Step Google Cloud Console Setup

### Step 2.1: Create or Select a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. In the top navigation bar, click the project dropdown and select **New Project**.
3. Name your project (e.g. `Sticker Chest Cloud Sync`) and click **Create**.

---

### Step 2.2: Enable the Google Drive API
1. In the left sidebar, navigate to **APIs & Services** > **Library** (or search "Google Drive API" in the search box).
2. Select **Google Drive API** and click **Enable**.

---

### Step 2.3: Configure the OAuth Consent Screen
1. In the left navigation, go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** user type and click **Create**.
3. Fill in the required fields:
   - **App name**: `Sticker Chest`
   - **User support email**: Your own Google email.
   - **Developer contact information**: Your own Google email.
4. Click **Save and Continue**.
5. **Scopes**:
   - Click **Add or Remove Scopes**.
   - Under the Filter, search for `drive.appdata` and check:
     - `.../auth/drive.appdata` (*See, create, and delete its own configuration data in your Google Drive*)
     - `.../auth/userinfo.email` (*See your primary Google Account email address*)
     - `.../auth/userinfo.profile` (*See your personal info, including any personal info you've made publicly available*)
   - Click **Update**, then **Save and Continue**.
6. **Test Users (Crucial)**:
   - Since your app will be in "Testing" mode (which doesn't require Google's commercial verification), click **+ Add Users**.
   - Enter your personal Google email address (and any other Google accounts you intend to sync).
   - Click **Save and Continue**.

---

### Step 2.4: Create OAuth 2.0 Client ID Credentials
1. In the left navigation, go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. In the **Application type** dropdown, select **Desktop app**.
   > [!NOTE]
   > Selecting **Desktop app** allows Google to automatically accept dynamic loopback redirect URIs (`http://127.0.0.1:<port>/callback`) used by Sticker Chest's PKCE ephemeral server.
4. Name it `Sticker Chest Desktop Client` and click **Create**.
5. A modal will pop up displaying your **Client ID** (it looks like `1234567890-abcdef...apps.googleusercontent.com`).
6. Copy the **Client ID** (you do not need the Client Secret).

---

## 3. Connecting Sticker Chest

1. Launch **Sticker Chest**.
2. Open **Settings & Configuration** (gear icon in the top header).
3. Scroll down to the **Google Drive Cloud Sync** section.
4. Click **Custom OAuth App** (link in the lower right corner).
5. Paste your copied **Client ID** into the input box and click **Save Settings**.
6. Re-open Settings (or click directly) and press **Connect with Google Drive**.
7. Your system default browser will open Google's authentication page:
   - Select your Google account.
   - If Google shows a warning saying *"Google hasn't verified this app"*, click **Advanced** -> **Go to Sticker Chest (unsafe)** (this is expected for private/unverified test apps).
   - Review permissions and click **Continue**.
8. The browser will display:  
   `Authentication Successful! You can safely close this browser window and return to Sticker Chest.`
9. Return to Sticker Chest:
   - You will see the green **Connected** badge with your email and Google Drive storage quota bar.
   - Your stickers and database snapshots will now synchronize automatically!
