import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { z } from 'zod';
import { PrismaService } from '../prisma.service';
import { loginSchema } from './login.schema';

// Run bcrypt for unknown usernames too, so failures take comparable time.
const dummyHash =
  '$2b$12$vvNZBn6wEpR6pwFodRIWoOxOK0UiROOwTUaW9QqVRj6TTkI9zpqK2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login({ username, password }: z.infer<typeof loginSchema>) {
    const user = await this.prisma.users.findUnique({
      where: { username },
      select: { id: true, password: true },
    });
    const valid = await compare(password, user?.password ?? dummyHash);

    if (!user || !valid) {
      throw new UnauthorizedException();
    }

    return { accessToken: await this.jwt.signAsync({ sub: user.id }) };
  }

  async verifySession(authorization?: string): Promise<void> {
    const token = authorization?.match(/^Bearer (\S+)$/i)?.[1];
    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = await this.jwt
      .verifyAsync<{ sub?: number }>(token, {
        issuer: 'anvy-ebr',
        algorithms: ['HS256'],
      })
      .catch(() => {
        throw new UnauthorizedException();
      });
    if (typeof payload.sub !== 'number' || !Number.isSafeInteger(payload.sub)) {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.users.findUnique({
      where: { id: payload.sub },
      select: { id: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
  }
}
