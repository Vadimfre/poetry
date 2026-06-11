import { z } from "zod";
import { passwordSchema } from "@/src/shared/lib/validations/password.validation";

export const NewPasswordSchema = z.object({
  password: passwordSchema,
});

export type TypeNewPasswordSchema = z.infer<typeof NewPasswordSchema>;
