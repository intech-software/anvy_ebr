import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccessControlModule } from './access-control/access-control.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConnectionHistoryModule } from './connection-history/connection-history.module';
import { ItemsModule } from './items/items.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ItemsModule,
    AccessControlModule,
    ConnectionHistoryModule,
    SettingsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
