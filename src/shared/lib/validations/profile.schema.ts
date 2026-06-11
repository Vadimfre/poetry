import { z } from "zod";
import { passwordSchema } from "./password.validation";

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Имя должно быть минимум 2 символа")
    .max(50, "Имя не может быть длиннее 50 символов"),
  email: z.string().email("Некорректный email"),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Текущий пароль обязателен"),
    newPassword: passwordSchema, // Используем усиленную валидацию
    confirmPassword: z.string().min(1, "Подтверждение пароля обязательно"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
