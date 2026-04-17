import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

class ItemDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  correctZoneIndex: number; // индекс зоны в массиве zones вопроса
}

class ZoneDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

class QuestionDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZoneDto)
  zones: ZoneDto[];
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
