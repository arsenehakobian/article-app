import { IsDateString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class FindArticlesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  authorId?: number;

  @IsOptional()
  @IsDateString()
  publishedAfter?: string;

  @IsOptional()
  @IsDateString()
  publishedBefore?: string;
}
