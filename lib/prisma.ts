import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_DATABASE_URL or DATABASE_URL must be set.");
}

if (connectionString.startsWith("prisma+postgres://")) {
  throw new Error("DIRECT_DATABASE_URL must be a PostgreSQL TCP URL for Prisma Client.");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
