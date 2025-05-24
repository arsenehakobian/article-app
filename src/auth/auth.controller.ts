import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Public } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('sign-up')
  signup(@Body() dto: AuthDto) {
    return this.authService.signUp(dto);
  }

  @Public()
  @Post('sign-in')
  signin(@Body() dto: AuthDto) {
    return this.authService.signIn(dto);
  }
}
