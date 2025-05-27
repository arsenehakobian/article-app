import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(payload: AuthDto) {
    const user = await this.usersService.create(payload);
    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      }),
    };
  }

  async signIn(payload: AuthDto): Promise<any> {
    const user: User | null = await this.usersService.findByEmail(
      payload.email,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      payload.password,
      user?.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }
    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      }),
    };
  }
}
