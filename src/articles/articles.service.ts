import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { PaginatedResponseDto } from './dto/paginated-response.dto';

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
    return this.transformArticle(savedArticle);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponseDto> {
    const skip = (page - 1) * limit;

    const [articles, total] = await this.articlesRepository.findAndCount({
      relations: ['author'],
      skip,
      take: limit,
      order: {
        publishedAt: 'DESC',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: articles.map((article) => this.transformArticle(article)),
      meta: {
        total,
        page: +page,
        limit,
        totalPages,
      },
    };
  }

  // async findOne(id: number): Promise<Article> {
  //   const article = await this.articlesRepository.findOne({ where: { id } });
  //   if (!article) {
  //     throw new NotFoundException(`Article with ID ${id} not found`);
  //   }
  //   return article;
  // }

  // async update(
  //   id: number,
  //   updateArticleDto: UpdateArticleDto,
  // ): Promise<Article> {
  //   const article = await this.findOne(id);

  //   // Only update if there are actual changes
  //   if (Object.keys(updateArticleDto).length > 0) {
  //     await this.articlesRepository.save({
  //       ...article,
  //       ...updateArticleDto,
  //     });
  //   }

  //   return this.findOne(id);
  // }

  // async remove(id: number): Promise<void> {
  //   const result = await this.articlesRepository.delete(id);
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Article with ID ${id} not found`);
  //   }
  // }
}
