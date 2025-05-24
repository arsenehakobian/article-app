import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './src/users/entities/user.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow('PG_HOST'),
  port: configService.getOrThrow('PG_PORT'),
  username: configService.getOrThrow('PG_USER'),
  password: configService.getOrThrow('PG_PASSWORD'),
  database: configService.getOrThrow('PG_DB'),
  migrations: ['migrations/**'],
  entities: [User],
});
