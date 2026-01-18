import { IsArray, IsString, MinLength } from "class-validator";

export class CreateKbArticleDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  body!: string;

  @IsArray()
  tags!: string[];
}
