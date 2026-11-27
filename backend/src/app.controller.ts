import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Hệ thống')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái API' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  getStatus() {
    return { status: 'ok' };
  }
}
