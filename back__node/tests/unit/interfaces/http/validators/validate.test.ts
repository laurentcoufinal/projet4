import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { validate } from '../../../../../src/interfaces/http/validators/validate';

describe('validate', () => {
  it('retourne les données parsées si valides', () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const result = validate(schema, { name: 'Alice', age: 30 });
    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('lance une erreur de validation avec details si invalide', () => {
    const schema = z.object({ name: z.string().min(1), age: z.number() });
    expect(() => validate(schema, { name: '', age: 'not-a-number' })).toThrow(/Erreur de validation/);
  });
});
