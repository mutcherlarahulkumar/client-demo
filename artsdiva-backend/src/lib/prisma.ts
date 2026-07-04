import { PrismaClient } from "@prisma/client";

// Set DEBUG=true in your environment to see every Prisma query in the logs.
const logLevels: ("query" | "error" | "warn")[] =
  process.env.DEBUG === "true"
    ? ["query", "error", "warn"]
    : ["error", "warn"];

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logLevels.map((level) => ({ level, emit: "stdout" })),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
