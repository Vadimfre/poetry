import {
  IsArray,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

class AnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsOptional()
  zoneId?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsOptional()
  content?: string;
}

export class CheckQuizAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
