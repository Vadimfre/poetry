import { z } from "zod";
import { passwordSchema } from "./password.validation";

export const loginSchema = z.object({
  email: z.string().min(1, "Email абавязковы").email("Няправільны email"),
  password: z.string().min(6, "Пароль павінен быць мінімум 6 сімвалаў"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Імя павінна быць мінімум 2 сімвалы")
      .max(50, "Імя не павінна перавышаць 50 сімвалаў")
      .optional(),
    email: z.string().min(1, "Email абавязковы").email("Няправільны email"),
    role: z.enum(["STUDENT", "TEACHER"]).optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Пацверджанне пароля абавязкова"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не супадаюць",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
