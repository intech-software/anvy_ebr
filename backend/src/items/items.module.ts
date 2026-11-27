import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { ItemSessionGuard } from './item-session.guard';

@Module({
  imports: [AuthModule],
  controllers: [ItemsController],
  providers: [ItemsService, ItemSessionGuard],
})
export class ItemsModule {}
