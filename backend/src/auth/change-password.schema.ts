import { z } from 'zod';
import { loginPasswordSchema } from './login.schema';

export const changePasswordSchema = z
  .object({
    currentPassword: loginPasswordSchema,
    newPassword: loginPasswordSchema
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[\p{P}\p{S}]/u),
  })
  .refine(
    ({ currentPassword, newPassword }) => currentPassword !== newPassword,
  );
