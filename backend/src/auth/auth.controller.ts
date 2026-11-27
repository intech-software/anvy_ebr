import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  Patch,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { changePasswordSchema } from './change-password.schema';
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
  async session(@Headers('authorization') authorization?: string) {
    await this.auth.getSessionUser(authorization);
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  me(@Headers('authorization') authorization?: string) {
    return this.auth.getSessionUser(authorization);
  }

  @Patch('password')
  @HttpCode(204)
  @Header('Cache-Control', 'no-store')
  changePassword(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
  ) {
    const passwords = changePasswordSchema.safeParse(body);
    if (!passwords.success) {
      throw new BadRequestException('Invalid password format');
    }
    return this.auth.changePassword(authorization, passwords.data);
  }
}
