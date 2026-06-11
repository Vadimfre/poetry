import { IsString, MinLength, MaxLength } from "class-validator";

export class UpdateCommentDto {
  @IsString()
  @MinLength(1, { message: "Комментарий не может быть пустым" })
  @MaxLength(2000, { message: "Комментарий не может превышать 2000 символов" })
  text: string;
}
