import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  password_confirmation: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const uploadFormSchema = z.object({
  name: z.string().max(255).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  password: z.string().min(6).max(255).optional(),
});

export const shareSchema = z
  .object({
    user_id: z.string().optional(),
    email: z.string().email().optional(),
  })
  .refine((value) => Boolean(value.user_id || value.email), {
    message: 'Indiquez user_id ou email.',
  });

export const shareLinkSchema = z.object({
  expires_in_days: z.number().int().min(1).max(7).optional(),
});

export const passwordDownloadSchema = z.object({
  password: z.string().min(1).max(255),
});
