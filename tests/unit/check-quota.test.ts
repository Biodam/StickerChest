import { describe, it, expect } from 'vitest';
import { checkQuota } from '../../scripts/check-quota.js';

describe('GitHub Actions Quota & Visibility Preflight Checker', () => {
  it('should export checkQuota function', () => {
    expect(typeof checkQuota).toBe('function');
  });

  it('should inspect repository visibility correctly without throwing in non-strict mode', async () => {
    const result = await checkQuota({ strict: false });
    expect(result).toBeDefined();
    expect(typeof result.isPublic).toBe('boolean');
    expect(typeof result.isPrivate).toBe('boolean');
    expect(result.isPublic).toBe(!result.isPrivate);
    expect(typeof result.activeRuns).toBe('number');
  });

  it('should confirm repository is public as configured', async () => {
    const result = await checkQuota({ strict: false });
    expect(result.isPublic).toBe(true);
    expect(result.isPrivate).toBe(false);
  });
});
