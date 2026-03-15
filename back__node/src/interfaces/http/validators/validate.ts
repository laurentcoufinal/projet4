import type { ZodSchema } from 'zod';
import { Errors } from '../../../shared/errors/errors';

export function validate<T>(schema: ZodSchema<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw Errors.validation('Erreur de validation.', parsed.error.flatten().fieldErrors);
  }
  return parsed.data;
}
