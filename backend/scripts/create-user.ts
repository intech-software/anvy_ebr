import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { loginSchema } from '../src/auth/login.schema';

async function createUser() {
  const [username, title, departmentName] = process.argv.slice(2);
  const credentials = loginSchema.safeParse({
    username,
    password: process.env.ANVY_USER_PASSWORD,
  });
  const position = title?.trim();
  const department = departmentName?.trim();

  if (
    !credentials.success ||
    !position ||
    position.length > 191 ||
    !department ||
    department.length > 191
  ) {
    throw new Error('Provide a username, password, position and department');
  }

  const password = await hash(credentials.data.password, 12);
  const prisma = new PrismaClient();
  try {
    await prisma.$transaction([
      prisma.departments.upsert({
        where: { name: department },
        update: {},
        create: { name: department },
      }),
      prisma.users.create({
        data: {
          username: credentials.data.username,
          password,
          position,
          department,
        },
      }),
    ]);
    console.log('Created user %s', credentials.data.username);
  } finally {
    await prisma.$disconnect();
  }
}

void createUser().catch((error: unknown) => {
  if (error instanceof Error && 'code' in error && error.code === 'P2002') {
    console.error('Username already exists');
  } else {
    console.error(error instanceof Error ? error.message : 'Could not create user');
  }
  process.exitCode = 1;
});
