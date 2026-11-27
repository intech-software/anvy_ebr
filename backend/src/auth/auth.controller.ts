import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginSchema } from './login.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  login(@Body() body: unknown) {
    const credentials = loginSchema.safeParse(body);
    if (!credentials.success) {
      throw new BadRequestException('Invalid username or password format');
    }
    return this.auth.login(credentials.data);
  }

  @Get('session')
  @HttpCode(204)
  @Header('Cache-Control', 'no-store')
  session(@Headers('authorization') authorization?: string) {
    return this.auth.verifySession(authorization);
  }
}
