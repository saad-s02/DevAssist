import { IsOptional, IsString } from "class-validator";

export class KbQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
