import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { departmentSchema, newUserSchema } from './settings.schema';
import { SettingsService } from './settings.service';

@Controller('settings')
@ApiTags('Cài đặt')
@ApiBearerAuth()
export class SettingsController {
  constructor(
    private readonly auth: AuthService,
    private readonly settings: SettingsService,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Lấy danh sách phòng ban cho trang Cài đặt',
  })
  async getSettings(@Headers('authorization') authorization?: string) {
    await this.auth.getSessionUser(authorization);
    return this.settings.getSettings();
  }

  @Post('departments')
  @ApiOperation({ summary: 'Thêm phòng ban' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', maxLength: 191 },
        description: { type: 'string', maxLength: 191, nullable: true },
      },
    },
  })
  async createDepartment(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
  ) {
    await this.auth.getSessionUser(authorization);
    const data = departmentSchema.safeParse(body);
    if (!data.success) throw new BadRequestException('Invalid department data');
    return this.settings.createDepartment(data.data);
  }

  @Post('users')
  @ApiOperation({ summary: 'Thêm người dùng' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['username', 'password', 'department'],
      properties: {
        username: { type: 'string', minLength: 2, maxLength: 50 },
        password: {
          type: 'string',
          format: 'password',
          minLength: 8,
          maxLength: 50,
          writeOnly: true,
        },
        department: { type: 'string', maxLength: 191 },
        name: { type: 'string', maxLength: 191, nullable: true },
        email: {
          type: 'string',
          format: 'email',
          maxLength: 191,
          nullable: true,
        },
        position: { type: 'string', maxLength: 191, nullable: true },
      },
    },
  })
  async createUser(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
  ) {
    await this.auth.getSessionUser(authorization);
    const data = newUserSchema.safeParse(body);
    if (!data.success) throw new BadRequestException('Invalid user data');
    return this.settings.createUser(data.data);
  }
}
