import { IsArray, IsString, IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class AnswerMappingDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsNotEmpty()
  mapping: Record<string, string>;
}

export class CheckQuizAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerMappingDto)
  answers: AnswerMappingDto[];
}
