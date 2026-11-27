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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  SessionUserResponse,
} from '../swagger/api-models';
import { AuthService } from './auth.service';
import { maxAvatarBytes } from './avatar-storage.service';
import { changePasswordSchema } from './change-password.schema';
import { loginSchema } from './login.schema';

@Controller('auth')
@ApiTags('Xác thực và hồ sơ')
@ApiUnauthorizedResponse({
  description: 'Thông tin đăng nhập hoặc phiên không hợp lệ.',
})
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Đăng nhập và lấy accessToken' })
  @ApiBody({ type: LoginRequest })
  @ApiOkResponse({ type: LoginResponse })
  @ApiBadRequestResponse({ description: 'Dữ liệu đăng nhập không hợp lệ.' })
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
  @ApiOperation({ summary: 'Kiểm tra phiên đăng nhập' })
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Phiên đăng nhập hợp lệ.' })
  async session(@Headers('authorization') authorization?: string) {
    await this.auth.getSessionUser(authorization);
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Xem hồ sơ tài khoản đang đăng nhập' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: SessionUserResponse })
  me(@Headers('authorization') authorization?: string) {
    return this.auth.getSessionUser(authorization);
  }

  @Patch('avatar')
  @HttpCode(204)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Thay đổi ảnh đại diện' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['avatar'],
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: `Ảnh JPG, PNG hoặc WebP, tối đa ${maxAvatarBytes / (1024 * 1024)} MB.`,
        },
      },
    },
  })
  @ApiNoContentResponse({ description: 'Đã cập nhật ảnh đại diện.' })
  @ApiBadRequestResponse({
    description: 'Thiếu ảnh hoặc định dạng ảnh không hợp lệ.',
  })
  @ApiPayloadTooLargeResponse({ description: 'Ảnh vượt giới hạn dung lượng.' })
  @ApiConflictResponse({
    description: 'Ảnh đại diện vừa được thay đổi bởi yêu cầu khác.',
  })
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
  @ApiOperation({ summary: 'Đổi mật khẩu của tài khoản đang đăng nhập' })
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordRequest })
  @ApiNoContentResponse({ description: 'Đã đổi mật khẩu.' })
  @ApiBadRequestResponse({ description: 'Dữ liệu mật khẩu không hợp lệ.' })
  @ApiUnprocessableEntityResponse({
    description: 'Mật khẩu hiện tại không đúng.',
  })
  @ApiConflictResponse({
    description: 'Mật khẩu vừa được thay đổi bởi yêu cầu khác.',
  })
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
