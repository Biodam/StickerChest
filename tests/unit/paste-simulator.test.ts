import { describe, it, expect, vi } from 'vitest';
import { simulatePasteKeystroke } from '../../src/main/services/clipboard/paste-simulator';
import { copyAndPasteSticker } from '../../src/main/services/clipboard/clipboard-service';
import { loadSettings } from '../../src/main/services/settings/settings-store';

describe('Paste Simulator & Auto-Paste Workflow', () => {
  it('should default autoPasteOnSelect to true in AppSettings', () => {
    const settings = loadSettings();
    expect(settings.autoPasteOnSelect).toBe(true);
  });

  it('should return false safely when copying non-existent item', async () => {
    const result = await copyAndPasteSticker('non-existent-id-1234');
    expect(result).toBe(false);
  });

  it('should execute simulatePasteKeystroke without throwing unhandled exceptions', async () => {
    // Should resolve safely to a boolean on any OS
    const result = await simulatePasteKeystroke();
    expect(typeof result).toBe('boolean');
  });
});
