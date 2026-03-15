import { describe, expect, it } from 'vitest';
import {
  FILE_MAX_SIZE_BYTES,
  FILE_PASSWORD_MIN_LENGTH,
  FORBIDDEN_FILE_EXTENSIONS,
  SHARE_LINK_DEFAULT_EXPIRES_IN_DAYS,
  SHARE_LINK_MAX_EXPIRES_IN_DAYS,
  SHARE_LINK_MIN_EXPIRES_IN_DAYS,
  USER_PASSWORD_MIN_LENGTH,
} from '../../../../src/shared/constants/domainPolicies';

describe('domainPolicies', () => {
  it('expose les constantes attendues', () => {
    expect(FILE_MAX_SIZE_BYTES).toBe(1024 * 1024 * 1024);
    expect(FILE_PASSWORD_MIN_LENGTH).toBe(6);
    expect(USER_PASSWORD_MIN_LENGTH).toBe(8);
    expect(SHARE_LINK_DEFAULT_EXPIRES_IN_DAYS).toBe(7);
    expect(SHARE_LINK_MIN_EXPIRES_IN_DAYS).toBe(1);
    expect(SHARE_LINK_MAX_EXPIRES_IN_DAYS).toBe(7);
    expect(FORBIDDEN_FILE_EXTENSIONS).toContain('.exe');
    expect(FORBIDDEN_FILE_EXTENSIONS).toContain('.bat');
  });
});
