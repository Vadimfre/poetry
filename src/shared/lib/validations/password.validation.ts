import { z } from "zod";

// Вспомогательные функции для проверки сложности пароля
export const hasUpperCase = (str: string) => /[A-Z]/.test(str);
export const hasLowerCase = (str: string) => /[a-z]/.test(str);
export const hasDigit = (str: string) => /\d/.test(str);
export const hasSpecialChar = (str: string) =>
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
export const hasNoThreeRepeatingChars = (str: string) => !/(.)\1\1/.test(str);
export const hasNoSimpleSequences = (str: string) =>
  !/(123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(
    str,
  );

// Базовая схема валидации пароля
export const passwordSchema = z
  .string()
  .min(8, "Пароль должен содержать минимум 8 символов")
  .refine(hasUpperCase, {
    message: "Пароль должен содержать хотя бы одну заглавную букву",
  })
  .refine(hasLowerCase, {
    message: "Пароль должен содержать хотя бы одну строчную букву",
  })
  .refine(hasDigit, {
    message: "Пароль должен содержать хотя бы одну цифру",
  })
  .refine(hasSpecialChar, {
    message:
      "Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)",
  })
  .refine(hasNoThreeRepeatingChars, {
    message: "Пароль не должен содержать три одинаковых символа подряд",
  })
  .refine(hasNoSimpleSequences, {
    message: "Пароль не должен содержать простые последовательности символов",
  });
