import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { z } from 'zod';
import { PrismaService } from '../prisma.service';
import { changePasswordSchema } from './change-password.schema';
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

  async getSessionUser(authorization?: string) {
    const id = await this.getSessionUserId(authorization);
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: { username: true, name: true, position: true, department: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async changePassword(
    authorization: string | undefined,
    { currentPassword, newPassword }: z.infer<typeof changePasswordSchema>,
  ): Promise<void> {
    const id = await this.getSessionUserId(authorization);
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: { password: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!(await compare(currentPassword, user.password))) {
      throw new UnprocessableEntityException('Incorrect current password');
    }

    const password = await hash(newPassword, 12);
    const { count } = await this.prisma.users.updateMany({
      where: { id, password: user.password },
      data: { password },
    });
    if (count !== 1) {
      throw new ConflictException('The password was already changed');
    }
  }

  private async getSessionUserId(authorization?: string): Promise<number> {
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

    return payload.sub;
  }
}
