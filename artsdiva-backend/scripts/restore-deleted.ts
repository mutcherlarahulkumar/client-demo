/**
 * One-time script: restore all soft-deleted artists, artworks, and clients
 * by clearing their deletedAt field.
 *
 * Run from artsdiva-backend/:
 *   npx ts-node scripts/restore-deleted.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [artists, artworks, clients] = await Promise.all([
    prisma.artist.updateMany({
      where: { deletedAt: { not: null } },
      data: { deletedAt: null },
    }),
    prisma.artwork.updateMany({
      where: { deletedAt: { not: null } },
      data: { deletedAt: null },
    }),
    prisma.client.updateMany({
      where: { deletedAt: { not: null } },
      data: { deletedAt: null },
    }),
  ]);

  console.log(`Restored: ${artists.count} artists, ${artworks.count} artworks, ${clients.count} clients`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => void prisma.$disconnect());
