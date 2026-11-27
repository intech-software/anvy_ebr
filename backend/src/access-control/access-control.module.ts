import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { AccessControlGuard } from './access-control.guard';
import { AccessControlService } from './access-control.service';

@Module({
  imports: [AuthModule],
  providers: [
    AccessControlService,
    { provide: APP_GUARD, useClass: AccessControlGuard },
  ],
  exports: [AccessControlService],
})
export class AccessControlModule {}
