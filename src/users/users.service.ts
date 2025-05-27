import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(payload: AuthDto): Promise<User> {
    try {
      const hashedPassword: string = await bcrypt.hash(payload.password, 10);
      const user = await this.repository.create({
        email: payload.email,
        password: hashedPassword,
      });
      return await this.repository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if ('code' in error && error.code === '23505') {
          throw new BadRequestException('User already exists');
        }
      }
      Logger.error(error);
      throw new InternalServerErrorException(
        'Something went wrong, our engineers have been notified',
      );
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.repository.findOne({ where: { email } });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(
        'Something went wrong, our engineers have been notified',
      );
    }
  }
}
