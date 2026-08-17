import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // 1. If using a remote cloud database (PostgreSQL / Supabase / Neon), use it directly
  if (envUrl && !envUrl.startsWith('file:')) {
    return envUrl;
  }

  // 2. On Vercel serverless, copy SQLite database to writable /tmp
  if (process.env.VERCEL) {
    const tmpDbPath = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const sourcePath = path.join(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, tmpDbPath);
        }
      }
      return `file:${tmpDbPath}`;
    } catch (err) {
      console.warn('Could not initialize /tmp SQLite copy:', err);
    }
  }

  return envUrl || 'file:./dev.db';
}

const activeDbUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = activeDbUrl;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
