import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ArticlesService,
  ArticleWithTransformedAuthor,
} from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { Public } from 'src/auth/auth.guard';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { FindArticlesDto } from './dto/find-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(
    @Body() createArticleDto: CreateArticleDto,
    @Req() req: { user: { sub: number } },
  ) {
    return this.articlesService.create(createArticleDto, req.user.sub);
  }

  @Public()
  @Get()
  findAll(@Query() filters: FindArticlesDto): Promise<PaginatedResponseDto> {
    return this.articlesService.findAll(filters);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number): Promise<ArticleWithTransformedAuthor> {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateArticleDto: UpdateArticleDto,
    @Req() req: { user: { sub: number } },
  ): Promise<ArticleWithTransformedAuthor> {
    return this.articlesService.update(id, updateArticleDto, req.user.sub);
  }

  @Delete(':id')
  remove(
    @Param('id') id: number,
    @Req() req: { user: { sub: number } },
  ): Promise<void> {
    return this.articlesService.remove(id, req.user.sub);
  }
}
