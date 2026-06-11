import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateReadingAssignmentDto {
  @IsInt()
  proseWorkId: number;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateReadingProgressDto {
  @IsInt()
  @IsOptional()
  lastChapterId?: number;

  @IsInt()
  @IsOptional()
  progressPercent?: number;

  @IsOptional()
  completed?: boolean;
}
