import { describe, it, expect } from 'vitest';
import {
  calculateNextIndex,
  getTabFromKey,
  getNextTab,
  isPrintableKey,
} from '../../src/renderer/picker/keyboard-navigation';

describe('Picker Keyboard Navigation Utilities', () => {
  describe('calculateNextIndex', () => {
    it('should return 0 when total count is 0', () => {
      expect(calculateNextIndex(0, 0, 'ArrowRight')).toBe(0);
    });

    it('should navigate right and clamp at boundary', () => {
      expect(calculateNextIndex(2, 10, 'ArrowRight')).toBe(3);
      expect(calculateNextIndex(9, 10, 'ArrowRight')).toBe(9);
    });

    it('should navigate left and clamp at 0', () => {
      expect(calculateNextIndex(3, 10, 'ArrowLeft')).toBe(2);
      expect(calculateNextIndex(0, 10, 'ArrowLeft')).toBe(0);
    });

    it('should navigate down by 4 columns and clamp at end', () => {
      expect(calculateNextIndex(1, 10, 'ArrowDown')).toBe(5);
      expect(calculateNextIndex(8, 10, 'ArrowDown')).toBe(9);
    });

    it('should navigate up by 4 columns and clamp at 0', () => {
      expect(calculateNextIndex(5, 10, 'ArrowUp')).toBe(1);
      expect(calculateNextIndex(2, 10, 'ArrowUp')).toBe(0);
    });

    it('should jump to start with Home and end with End', () => {
      expect(calculateNextIndex(5, 20, 'Home')).toBe(0);
      expect(calculateNextIndex(5, 20, 'End')).toBe(19);
    });

    it('should jump pages with PageDown and PageUp', () => {
      expect(calculateNextIndex(0, 50, 'PageDown')).toBe(16);
      expect(calculateNextIndex(40, 50, 'PageDown')).toBe(49);
      expect(calculateNextIndex(20, 50, 'PageUp')).toBe(4);
      expect(calculateNextIndex(10, 50, 'PageUp')).toBe(0);
    });

    it('should return current index for unhandled keys', () => {
      expect(calculateNextIndex(5, 20, 'KeyA')).toBe(5);
    });
  });

  describe('getTabFromKey', () => {
    it('should map Ctrl/Cmd + 1, 2, 3 to tabs', () => {
      expect(getTabFromKey('1', true)).toBe('recent');
      expect(getTabFromKey('2', true)).toBe('favorites');
      expect(getTabFromKey('3', true)).toBe('all');
    });

    it('should return null if Ctrl/Cmd is not pressed', () => {
      expect(getTabFromKey('1', false)).toBeNull();
    });

    it('should return null for other numbers or characters', () => {
      expect(getTabFromKey('4', true)).toBeNull();
      expect(getTabFromKey('a', true)).toBeNull();
    });
  });

  describe('getNextTab', () => {
    it('should cycle forward', () => {
      expect(getNextTab('recent', 'next')).toBe('favorites');
      expect(getNextTab('favorites', 'next')).toBe('all');
      expect(getNextTab('all', 'next')).toBe('recent');
    });

    it('should cycle backward', () => {
      expect(getNextTab('recent', 'prev')).toBe('all');
      expect(getNextTab('all', 'prev')).toBe('favorites');
      expect(getNextTab('favorites', 'prev')).toBe('recent');
    });
  });

  describe('isPrintableKey', () => {
    it('should identify printable characters', () => {
      expect(isPrintableKey({ key: 'a' })).toBe(true);
      expect(isPrintableKey({ key: '9' })).toBe(true);
      expect(isPrintableKey({ key: ' ' })).toBe(true);
    });

    it('should reject navigation, control, or modifier combinations', () => {
      expect(isPrintableKey({ key: 'Enter' })).toBe(false);
      expect(isPrintableKey({ key: 'Escape' })).toBe(false);
      expect(isPrintableKey({ key: 'c', ctrlKey: true })).toBe(false);
      expect(isPrintableKey({ key: 'v', metaKey: true })).toBe(false);
    });
  });
});
