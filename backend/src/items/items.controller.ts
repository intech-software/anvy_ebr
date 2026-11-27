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
import { z } from 'zod';
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
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  list(@Query() query: unknown) {
    const filters = filtersSchema.safeParse(query);
    if (!filters.success) throw new BadRequestException('Invalid item filters');
    return this.items.list(filters.data);
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.items.get(id);
  }

  @Post()
  @Header('Cache-Control', 'no-store')
  create(@Body() body: unknown) {
    const item = itemSchema.safeParse(body);
    if (!item.success) throw new BadRequestException('Invalid item');
    return this.items.save(item.data);
  }

  @Patch(':id')
  @Header('Cache-Control', 'no-store')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    const item = itemSchema.safeParse(body);
    if (!item.success) throw new BadRequestException('Invalid item');
    return this.items.save(item.data, id);
  }
}
