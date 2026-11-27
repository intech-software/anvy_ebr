import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { loginSchema } from '../src/auth/login.schema';

async function createUser() {
  const [username, title, departmentName, fullName, departmentDescription] =
    process.argv.slice(2);
  const credentials = loginSchema.safeParse({
    username,
    password: process.env.ANVY_USER_PASSWORD,
  });
  const name = fullName?.trim() || null;
  const position = title?.trim() || null;
  const department = departmentName?.trim();
  const description = departmentDescription?.trim() || null;

  if (
    !credentials.success ||
    !department ||
    department.length > 191 ||
    (position && position.length > 191) ||
    (name && name.length > 191) ||
    (description && description.length > 191)
  ) {
    throw new Error('Provide a valid username, password and department');
  }

  const password = await hash(credentials.data.password, 12);
  const prisma = new PrismaClient();
  try {
    await prisma.$transaction([
      prisma.departments.upsert({
        where: { name: department },
        update: {},
        create: { name: department, description },
      }),
      prisma.users.create({
        data: {
          username: credentials.data.username,
          password,
          name,
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
