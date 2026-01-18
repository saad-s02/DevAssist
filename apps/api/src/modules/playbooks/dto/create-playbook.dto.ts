import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreatePlaybookDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  template!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
