import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Headers,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { z } from 'zod';
import { AuthService } from '../auth/auth.service';
import { AuditLogsService, auditPageSize } from './audit-logs.service';

const filters = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .max(Math.floor(2_147_483_647 / auditPageSize))
    .default(1),
  keyword: z.string().trim().max(191).optional(),
  entity_type: z.string().trim().max(100).optional(),
  action: z.enum(AuditAction).optional(),
});

@Controller('audit-logs')
@ApiTags('Lịch sử thay đổi')
@ApiBearerAuth()
export class AuditLogsController {
  constructor(
    private readonly auth: AuthService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Lấy lịch sử thay đổi theo quyền tài khoản' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'entity_type', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, enum: AuditAction })
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query() query: unknown,
  ) {
    const userId = await this.auth.getSessionUserId(authorization);
    const parsed = filters.safeParse(query);
    if (!parsed.success) throw new BadRequestException('Invalid audit filters');
    return this.auditLogs.list(userId, parsed.data);
  }
}
