import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AccessControlModule } from '../access-control/access-control.module';
import { AuthModule } from '../auth/auth.module';
import { ConnectionHistoryController } from './connection-history.controller';
import { ConnectionHistoryService } from './connection-history.service';

@Module({
  imports: [AuthModule, AccessControlModule, ScheduleModule.forRoot()],
  controllers: [ConnectionHistoryController],
  providers: [ConnectionHistoryService],
})
export class ConnectionHistoryModule {}
