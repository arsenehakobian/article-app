import { ReadUserDto } from 'src/users/dto/read-user.dto';

export class ReadArticleDto {
  id: number;
  name: string;
  description: string;
  publishedAt: Date;
  author: ReadUserDto;
}
