import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { FindArticlesDto } from './dto/find-articles.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RedisService } from 'src/redis/redis.service';

export type ArticleWithTransformedAuthor = Omit<Article, 'author'> & {
  author: { id: number; email: string } | null;
};

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  private transformArticle(article: Article): ArticleWithTransformedAuthor {
    const { author, ...rest } = article;
    return {
      ...rest,
      author: author ? { id: author.id, email: author.email } : null,
    };
  }

  async create(
    createArticleDto: CreateArticleDto,
    userId: number,
  ): Promise<ArticleWithTransformedAuthor> {
    const author = await this.userRepository.findOne({ where: { id: userId } });
    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const article = this.articlesRepository.create({
      ...createArticleDto,
      publishedAt: new Date(),
      author,
    });
    const savedArticle = await this.articlesRepository.save(article);
    const response = this.transformArticle(savedArticle);
    await this.redisService.set(
      `article:${savedArticle.id}`,
      JSON.stringify(response),
    );

    return response;
  }

  async findAll(filters: FindArticlesDto): Promise<PaginatedResponseDto> {
    const cachedArticles = await this.redisService.get(
      `articles:${JSON.stringify(filters)}`,
    );
    if (cachedArticles) {
      return JSON.parse(cachedArticles) as PaginatedResponseDto;
    }

    const {
      page = 1,
      limit = 10,
      authorId,
      publishedAfter,
      publishedBefore,
    } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.articlesRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .skip(skip)
      .take(limit)
      .orderBy('article.publishedAt', 'DESC');

    if (authorId) {
      queryBuilder.andWhere('author.id = :authorId', { authorId });
    }

    if (publishedAfter) {
      queryBuilder.andWhere('article.publishedAt >= :publishedAfter', {
        publishedAfter,
      });
    }

    if (publishedBefore) {
      queryBuilder.andWhere('article.publishedAt <= :publishedBefore', {
        publishedBefore,
      });
    }

    const [articles, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    const response = {
      data: articles.map((article) => this.transformArticle(article)),
      meta: {
        total,
        page: +page,
        limit,
        totalPages,
      },
    };

    await this.redisService.set(
      `articles:${JSON.stringify(filters)}`,
      JSON.stringify(response),
    );

    return response;
  }

  async findOne(id: number): Promise<ArticleWithTransformedAuthor> {
    const cachedArticle = await this.redisService.get(`article:${id}`);
    if (cachedArticle) {
      return JSON.parse(cachedArticle) as ArticleWithTransformedAuthor;
    }

    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    const response = this.transformArticle(article);
    await this.redisService.set(`article:${id}`, JSON.stringify(response));
    return response;
  }

  private async validateArticleOwnership(
    id: number,
    userId: number,
  ): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
    if (article.author?.id !== userId) {
      throw new ForbiddenException('You are not the author of this article');
    }
    return article;
  }

  async update(
    id: number,
    updateArticleDto: UpdateArticleDto,
    userId: number,
  ): Promise<ArticleWithTransformedAuthor> {
    const article = await this.validateArticleOwnership(id, userId);

    // Only update if there are actual changes
    if (Object.keys(updateArticleDto).length > 0) {
      const updatedArticle = await this.articlesRepository.save({
        ...article,
        ...updateArticleDto,
      });
      const response = this.transformArticle(updatedArticle);
      await this.redisService.set(
        `article:${updatedArticle.id}`,
        JSON.stringify(response),
      );
      return response;
    }

    return this.transformArticle(article);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.validateArticleOwnership(id, userId);
    await this.articlesRepository.delete(id);
    await this.redisService.del(`article:${id}`);
  }
}
