import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Public } from 'src/auth/auth.guard';
import { PaginatedResponseDto } from './dto/paginated-response.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(
    @Body() createArticleDto: CreateArticleDto,
    @Req() req: { id: number },
  ) {
    return this.articlesService.create(createArticleDto, req.id); // TODO: Get userId from auth
  }

  @Public()
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedResponseDto> {
    return this.articlesService.findAll(page, limit);
  }
}
