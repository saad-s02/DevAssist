import { IsArray, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateKbArticleDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  body?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}
