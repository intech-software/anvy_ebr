import { z } from 'zod';
import { loginPasswordSchema } from './login.schema';

export const newPasswordSchema = loginPasswordSchema
  .min(8)
  .regex(/[A-Z]/)
  .regex(/[a-z]/)
  .regex(/[0-9]/)
  .regex(/[\p{P}\p{S}]/u);

export const changePasswordSchema = z
  .object({
    currentPassword: loginPasswordSchema,
    newPassword: newPasswordSchema,
  })
  .refine(
    ({ currentPassword, newPassword }) => currentPassword !== newPassword,
  );
