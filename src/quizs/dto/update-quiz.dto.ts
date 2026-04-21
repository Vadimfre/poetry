import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
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

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsOptional()
  questions?: QuestionDto[];
}
