import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

enum QuestionType {
  MATCH = "MATCH",
  ORDER = "ORDER",
  FILL = "FILL",
}

class ItemDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

class ZoneDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

class CorrectMappingDto {
  @IsNumber()
  itemIndex: number;

  @IsNumber()
  zoneIndex: number;

  @IsBoolean()
  @IsOptional()
  isCorrect?: boolean;
}

class QuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZoneDto)
  zones: ZoneDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CorrectMappingDto)
  correctMappings: CorrectMappingDto[];
}

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}
