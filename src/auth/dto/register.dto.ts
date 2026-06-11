import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  IsIn,
} from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Введите корректный email адрес" })
  @IsNotEmpty({ message: "Email обязателен" })
  email: string;

  @IsString({ message: "Пароль должен быть строкой" })
  @MinLength(8, { message: "Пароль должен содержать минимум 8 символов" })
  @Matches(/(?=.*[a-z])/, {
    message: "Пароль должен содержать хотя бы одну строчную букву",
  })
  @Matches(/(?=.*[A-Z])/, {
    message: "Пароль должен содержать хотя бы одну заглавную букву",
  })
  @Matches(/(?=.*\d)/, {
    message: "Пароль должен содержать хотя бы одну цифру",
  })
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message:
      "Пароль должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)",
  })
  @Matches(/^(?!.*(.)\1\1)/, {
    message: "Пароль не должен содержать три одинаковых символа подряд",
  })
  password: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsIn(["STUDENT", "TEACHER"])
  @IsOptional()
  role?: "STUDENT" | "TEACHER";
}
