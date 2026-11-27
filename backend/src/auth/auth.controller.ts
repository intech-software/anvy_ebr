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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { maxAvatarBytes } from './avatar-storage.service';
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

  @Patch('avatar')
  @HttpCode(204)
  @Header('Cache-Control', 'no-store')
  @UseInterceptors(
    FileInterceptor('avatar', {
      // Multer rejects a file that reaches the parser limit.
      limits: { fileSize: maxAvatarBytes + 1, files: 1, fields: 0 },
    }),
  )
  updateAvatar(
    @Headers('authorization') authorization: string | undefined,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file?.size) throw new BadRequestException('Avatar image is required');
    return this.auth.updateAvatar(authorization, file);
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
