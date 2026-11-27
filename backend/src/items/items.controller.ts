import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { z } from 'zod';
import {
  ItemListResponse,
  ItemRequest,
  ItemResponse,
} from '../swagger/api-models';
import { ItemSessionGuard } from './item-session.guard';
import { ItemsService, itemPageSize } from './items.service';

const filtersSchema = z.object({
  q: z.string().trim().max(191).default(''),
  unit: z.string().trim().max(191).default(''),
  page: z.coerce
    .number()
    .int()
    .min(1)
    .max(Math.floor(2147483647 / itemPageSize))
    .default(1),
});

const itemSchema = z.object({
  item_code: z.string().trim().min(1).max(191),
  item_name: z.string().trim().min(1).max(1000),
  unit: z
    .string()
    .trim()
    .max(191)
    .nullable()
    .optional()
    .transform((unit) => unit || null),
});

@Controller('items')
@UseGuards(ItemSessionGuard)
@ApiTags('Danh mục hàng hoá')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Phiên đăng nhập không hợp lệ.' })
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Lấy danh sách hàng hoá' })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Tìm theo mã hoặc tên hàng.',
  })
  @ApiQuery({
    name: 'unit',
    required: false,
    type: String,
    description: 'Tìm theo đơn vị tính.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    schema: { type: 'integer', minimum: 1, default: 1 },
    description: `Số trang. Mỗi trang có tối đa ${itemPageSize} hàng hoá.`,
  })
  @ApiOkResponse({ type: ItemListResponse })
  @ApiBadRequestResponse({ description: 'Tham số danh sách không hợp lệ.' })
  list(@Query() query: unknown) {
    const filters = filtersSchema.safeParse(query);
    if (!filters.success) throw new BadRequestException('Invalid item filters');
    return this.items.list(filters.data);
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Xem chi tiết hàng hoá' })
  @ApiParam({ name: 'id', schema: { type: 'integer', minimum: 1 } })
  @ApiOkResponse({ type: ItemResponse })
  @ApiBadRequestResponse({ description: 'ID phải là số nguyên.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hàng hoá.' })
  get(@Param('id', ParseIntPipe) id: number) {
    return this.items.get(id);
  }

  @Post()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Thêm hàng hoá' })
  @ApiBody({ type: ItemRequest })
  @ApiCreatedResponse({ type: ItemResponse })
  @ApiBadRequestResponse({ description: 'Dữ liệu hàng hoá không hợp lệ.' })
  @ApiConflictResponse({ description: 'Mã hàng đã tồn tại.' })
  create(@Body() body: unknown) {
    const item = itemSchema.safeParse(body);
    if (!item.success) throw new BadRequestException('Invalid item');
    return this.items.save(item.data);
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Cập nhật hàng hoá' })
  @ApiParam({ name: 'id', schema: { type: 'integer', minimum: 1 } })
  @ApiBody({ type: ItemRequest })
  @ApiOkResponse({ type: ItemResponse })
  @ApiBadRequestResponse({
    description: 'ID hoặc dữ liệu hàng hoá không hợp lệ.',
  })
  @ApiNotFoundResponse({ description: 'Không tìm thấy hàng hoá.' })
  @ApiConflictResponse({ description: 'Mã hàng đã tồn tại.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    const item = itemSchema.safeParse(body);
    if (!item.success) throw new BadRequestException('Invalid item');
    return this.items.save(item.data, id);
  }
}
