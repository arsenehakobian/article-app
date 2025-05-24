import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('PG_HOST'),
        port: configService.getOrThrow('PG_PORT'),
        username: configService.getOrThrow('PG_USER'),
        password: configService.getOrThrow('PG_PASSWORD'),
        database: configService.getOrThrow('PG_DB'),
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
