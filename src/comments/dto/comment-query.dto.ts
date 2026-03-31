import { IsOptional, IsInt, Min, Max, IsEnum } from "class-validator";
import { Type } from "class-transformer";

export class CommentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(["createdAt", "updatedAt"])
  orderBy?: "createdAt" | "updatedAt" = "createdAt";

  @IsOptional()
  @IsEnum(["asc", "desc"])
  order?: "asc" | "desc" = "desc";
}
