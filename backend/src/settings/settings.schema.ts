import { z } from 'zod';
import { newPasswordSchema } from '../auth/change-password.schema';
import { loginSchema } from '../auth/login.schema';

const nameField = z.string().trim().min(1).max(191);
const optionalText = z
  .string()
  .trim()
  .max(191)
  .nullable()
  .optional()
  .transform((value) => value || null);

export const departmentSchema = z.object({
  name: nameField,
  description: optionalText,
});

export const newUserSchema = loginSchema.extend({
  password: newPasswordSchema,
  name: optionalText,
  email: optionalText.refine(
    (email) => !email || z.email().safeParse(email).success,
  ),
  position: optionalText,
  department: nameField,
});
