import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().trim().min(2).max(50),
  password: z
    .string()
    .min(6)
    .max(50)
    .refine((password) => Buffer.byteLength(password, 'utf8') <= 72),
});
