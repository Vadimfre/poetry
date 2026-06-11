import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateClassroomDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: "Название класса — минимум 2 символа" })
  @MaxLength(80)
  name: string;
}
