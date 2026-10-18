import { createHash, randomBytes, randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED', FORBIDDEN: 'FORBIDDEN', VALIDATION_ERROR: 'VALIDATION_ERROR', NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED', INVALID_CREDENTIALS: 'INVALID_CREDENTIALS', ACCOUNT_PENDING: 'ACCOUNT_PENDING',
  ACCOUNT_REJECTED: 'ACCOUNT_REJECTED', ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED', EMAIL_ALREADY_USED: 'EMAIL_ALREADY_USED',
  NPM_ALREADY_USED: 'NPM_ALREADY_USED', IDEMPOTENCY_KEY_REQUIRED: 'IDEMPOTENCY_KEY_REQUIRED',
  ATTENDANCE_SESSION_NOT_FOUND: 'ATTENDANCE_SESSION_NOT_FOUND', ATTENDANCE_SESSION_NOT_OPEN: 'ATTENDANCE_SESSION_NOT_OPEN',
  ATTENDANCE_SESSION_CLOSED: 'ATTENDANCE_SESSION_CLOSED', ATTENDANCE_WINDOW_PASSED: 'ATTENDANCE_WINDOW_PASSED',
  ATTENDANCE_ALREADY_RECORDED: 'ATTENDANCE_ALREADY_RECORDED', CHECK_IN_REQUIRED: 'CHECK_IN_REQUIRED', EVIDENCE_REQUIRED: 'EVIDENCE_REQUIRED',
  EVIDENCE_INVALID: 'EVIDENCE_INVALID', EVIDENCE_TOO_LARGE: 'EVIDENCE_TOO_LARGE', EVIDENCE_UPLOAD_FAILED: 'EVIDENCE_UPLOAD_FAILED',
  LOCATION_REQUIRED: 'LOCATION_REQUIRED', LOCATION_INVALID: 'LOCATION_INVALID', EVIDENCE_EXPIRED: 'EVIDENCE_EXPIRED', CONFLICT: 'CONFLICT',
} as const;

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');
export const newToken = (): string => randomBytes(32).toString('hex');
export const newIdempotencyKey = (): string => randomUUID();
export const hashPassword = (value: string): Promise<string> => argon2.hash(value, { type: argon2.argon2id });
export const verifyPassword = (hash: string, value: string): Promise<boolean> => argon2.verify(hash, value);
export const validPassword = (value: string): boolean => value.length >= 10 && value.length <= 128 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value);
export const validUuid = (value: string): boolean => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
