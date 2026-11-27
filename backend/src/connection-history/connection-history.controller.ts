import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Header,
  Headers,
  HttpCode,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { AuthService } from '../auth/auth.service';
import {
  ConnectionHistoryService,
  connectionStatuses,
} from './connection-history.service';

const presenceSchema = z.object({
  event: z.enum(['connect', 'beat', 'disconnect']),
  tab: z.uuid(),
  connection: z.uuid(),
});
const filtersSchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    from: z.iso.date().optional(),
    to: z.iso.date().optional(),
    status: z.enum(connectionStatuses).optional(),
    page: z.coerce.number().int().min(1).max(42_949_672).default(1),
  })
  .refine(({ from, to }) => !from || !to || from <= to);

@Controller('connection-history')
@ApiTags('Lịch sử kết nối')
@ApiBearerAuth()
export class ConnectionHistoryController {
  constructor(
    private readonly auth: AuthService,
    private readonly history: ConnectionHistoryService,
  ) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Xem lịch sử kết nối theo quyền tài khoản' })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({
    name: 'from',
    required: false,
    schema: { type: 'string', format: 'date' },
  })
  @ApiQuery({
    name: 'to',
    required: false,
    schema: { type: 'string', format: 'date' },
  })
  @ApiQuery({ name: 'status', required: false, enum: [...connectionStatuses] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  async list(
    @Headers('authorization') authorization: string | undefined,
    @Query() query: unknown,
  ) {
    const { userId } = await this.identity(authorization);
    const filters = filtersSchema.safeParse(query);
    if (!filters.success)
      throw new BadRequestException('Invalid connection filters');
    return this.history.list(userId, filters.data);
  }

  @Post('presence')
  @Header('Cache-Control', 'no-store')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cập nhật kết nối của một tab' })
  @ApiNoContentResponse()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['event', 'tab', 'connection'],
      properties: {
        event: { type: 'string', enum: ['connect', 'beat', 'disconnect'] },
        tab: { type: 'string', format: 'uuid' },
        connection: { type: 'string', format: 'uuid' },
      },
    },
  })
  async presence(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
    @Req() request: Request,
  ) {
    const identity = await this.identity(authorization);
    const event = presenceSchema.safeParse(body);
    if (!event.success) throw new BadRequestException('Invalid presence event');
    const saved = await this.history.record(
      identity,
      event.data,
      request.ip,
      request.get('user-agent'),
    );
    if (!saved) throw new ConflictException('Connection needs a new handshake');
  }

  @Post('end')
  @Header('Cache-Control', 'no-store')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Kết thúc các kết nối thuộc phiên đăng nhập hiện tại',
  })
  @ApiNoContentResponse()
  async end(@Headers('authorization') authorization?: string) {
    await this.history.endLogin(await this.identity(authorization));
  }

  private async identity(authorization?: string) {
    const userId = await this.auth.getSessionUserId(authorization);
    const token = authorization!.slice(7);
    return {
      userId,
      loginKey: createHash('sha256').update(token).digest('hex'),
    };
  }
}
