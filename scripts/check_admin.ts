import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total users:', users.length);
  for (const u of users) {
    console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, Role: ${u.role}`);
  }

  // Ensure default admin account exists
  let admin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@sentinalai.com' },
        { role: 'ADMIN' }
      ]
    }
  });

  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await prisma.user.create({
      data: {
        name: 'Sentinal Admin',
        email: 'admin@sentinalai.com',
        password: hashedPassword,
        role: 'ADMIN',
      }
    });
    console.log('Created default admin: admin@sentinalai.com / admin123');
  } else {
    console.log('Admin account found:', admin.email, 'Role:', admin.role);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
