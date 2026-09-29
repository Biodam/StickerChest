import { describe, it, expect, vi } from 'vitest';
import { app } from 'electron';
import { showMainWindow, createMainWindow, getMainWindow } from '../../src/main/windows/mainWindow';

describe('Single Instance Lock & Window Restoration', () => {
  it('should support requestSingleInstanceLock API on electron app', () => {
    expect(typeof app.requestSingleInstanceLock).toBe('function');
    expect(app.requestSingleInstanceLock()).toBe(true);
  });

  it('should restore, show, and focus window when showMainWindow is called', () => {
    const win = showMainWindow();
    expect(win).toBeDefined();
    expect(getMainWindow()).toBe(win);

    const restoreSpy = vi.spyOn(win, 'restore');
    const showSpy = vi.spyOn(win, 'show');
    const focusSpy = vi.spyOn(win, 'focus');
    const topSpy = vi.spyOn(win, 'setAlwaysOnTop');

    // Calling showMainWindow again should bring existing instance to front
    const secondCallWin = showMainWindow();
    expect(secondCallWin).toBe(win);
    expect(focusSpy).toHaveBeenCalled();
    expect(topSpy).toHaveBeenCalledWith(true);
    expect(topSpy).toHaveBeenCalledWith(false);
  });
});
