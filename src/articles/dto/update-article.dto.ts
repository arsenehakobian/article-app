import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateArticleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  publishedAt?: Date;
}
