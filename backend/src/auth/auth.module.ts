import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AvatarStorage } from './avatar-storage.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');
        if (Buffer.byteLength(secret, 'utf8') < 32) {
          throw new Error('JWT_SECRET must contain at least 32 bytes');
        }
        return { secret, signOptions: { expiresIn: '8h', issuer: 'anvy-ebr' } };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AvatarStorage, PrismaService],
  exports: [AuthService, PrismaService],
})
export class AuthModule {}
