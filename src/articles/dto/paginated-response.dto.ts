import { ArticleWithTransformedAuthor } from '../articles.service';

export class PaginatedResponseDto {
  data: ArticleWithTransformedAuthor[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
