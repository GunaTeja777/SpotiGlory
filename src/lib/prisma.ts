import { PrismaClient } from "../generated/client";

// Ensure fallback environment variables exist during Next.js build-time evaluation
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgres://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable";
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL =
    "postgres://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
