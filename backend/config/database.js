import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Append PgBouncer and conservative timeout/pool settings for Neon pooler URLs
 * when not already explicitly provided.
 *
 * @param {string|undefined} rawUrl
 * @returns {string|undefined}
 */
export const normalizeDatabaseUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return rawUrl;
  }

  try {
    const parsed = new URL(rawUrl);
    if (
      (parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:') &&
      parsed.hostname.toLowerCase().includes('-pooler')
    ) {
      const defaults = {
        pgbouncer: 'true',
        connect_timeout: '30',
        pool_timeout: '30',
        connection_limit: '5',
      };

      for (const [key, value] of Object.entries(defaults)) {
        if (!parsed.searchParams.has(key)) {
          parsed.searchParams.set(key, value);
        }
      }
      return parsed.toString();
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
};

const normalizedDatabaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prismaClient ||
  new PrismaClient(
    normalizedDatabaseUrl
      ? {
          datasources: {
            db: {
              url: normalizedDatabaseUrl,
            },
          },
          log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
        }
      : {
          log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
        }
  );

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prismaClient = prisma;
}

/**
 * Connect Prisma Client to PostgreSQL.
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('PostgreSQL (Neon) connected via Prisma.');
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Disconnect Prisma Client cleanly during graceful shutdown.
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  await prisma.$disconnect();
};

export default prisma;
