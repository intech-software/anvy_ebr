import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, ItemsModule],
  controllers: [AppController],
})
export class AppModule {}
