import { IsOptional, IsString } from 'class-validator';

export class PlaybookQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
