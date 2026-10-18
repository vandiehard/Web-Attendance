import { sanitizeResponse } from './common/sanitize';

describe('sensitive response sanitizer', () => {
  it('removes credentials and storage internals recursively while preserving dates', () => {
    const date = new Date('2026-01-01T00:00:00.000Z');
    const result = sanitizeResponse({ passwordHash: 'argon2', user: { pendingKey: 'PENDING', profile: { fullName: 'Demo' } }, evidence: { objectKey: 'private/key.jpg' }, date }) as { passwordHash?: string; user: { pendingKey?: string; profile: { fullName: string } }; evidence: { objectKey?: string }; date: Date };
    expect(result.passwordHash).toBeUndefined();
    expect(result.user.pendingKey).toBeUndefined();
    expect(result.evidence.objectKey).toBeUndefined();
    expect(result.user.profile.fullName).toBe('Demo');
    expect(result.date).toBe(date);
  });
});
