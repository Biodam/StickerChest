import { describe, it, expect } from 'vitest';
import { buildNoBgPath, guessMimeType } from '../../src/main/services/imaging/background-paths';

describe('background-paths', () => {
  describe('buildNoBgPath', () => {
    it('creates -nobg.png for fresh file', () => {
      const out = buildNoBgPath('/stickers/pikachu.png', () => false);
      expect(out.replace(/\\/g, '/')).toBe('/stickers/pikachu-nobg.png');
    });

    it('creates -nobg.png for jpg or webp file', () => {
      const out = buildNoBgPath('/stickers/mario.jpeg', () => false);
      expect(out.replace(/\\/g, '/')).toBe('/stickers/mario-nobg.png');
    });

    it('increments index when -nobg.png already exists', () => {
      const existing = new Set(['/stickers/sonic-nobg.png', '/stickers/sonic-nobg-2.png']);
      const out = buildNoBgPath('/stickers/sonic.png', (p) => existing.has(p.replace(/\\/g, '/')));
      expect(out.replace(/\\/g, '/')).toBe('/stickers/sonic-nobg-3.png');
    });

    it('handles removing background of an existing -nobg file without nesting endlessly', () => {
      const out = buildNoBgPath('/stickers/tails-nobg.png', () => false);
      expect(out.replace(/\\/g, '/')).toBe('/stickers/tails-nobg.png');
    });
  });

  describe('guessMimeType', () => {
    it('detects common image mimes', () => {
      expect(guessMimeType('test.png')).toBe('image/png');
      expect(guessMimeType('test.jpg')).toBe('image/jpeg');
      expect(guessMimeType('test.jpeg')).toBe('image/jpeg');
      expect(guessMimeType('test.webp')).toBe('image/webp');
      expect(guessMimeType('test.gif')).toBe('image/gif');
    });
  });
});
