import { describe, expect, it } from 'vitest';
import { BcryptPasswordHasher } from '../../../../src/infrastructure/security/BcryptPasswordHasher';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher();

  it('hash produit un hash différent du plain', async () => {
    const hash = await hasher.hash('password123');
    expect(hash).not.toBe('password123');
    expect(hash.length).toBeGreaterThan(10);
  });

  it('compare retourne true pour le bon mot de passe', async () => {
    const hash = await hasher.hash('secret');
    expect(await hasher.compare('secret', hash)).toBe(true);
  });

  it('compare retourne false pour mauvais mot de passe', async () => {
    const hash = await hasher.hash('secret');
    expect(await hasher.compare('wrong', hash)).toBe(false);
  });
});
