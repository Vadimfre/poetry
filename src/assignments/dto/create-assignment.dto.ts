import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateAssignmentDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  quizIds: string[];

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsBoolean()
  @IsOptional()
  sendEmailResults?: boolean;
}
