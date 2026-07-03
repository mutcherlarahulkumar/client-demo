import { prisma } from "../lib/prisma";
import type { DashboardStats } from "../types/dashboard.types";

const notDeleted = { deletedAt: null };

export async function getStats(): Promise<DashboardStats> {
  const [artistsCount, artworksCount, clientsCount, activeLeasesCount] = await Promise.all([
    prisma.artist.count({ where: notDeleted }),
    prisma.artwork.count({ where: notDeleted }),
    prisma.client.count({ where: notDeleted }),
    prisma.lease.count({ where: { status: "ACTIVE" } }),
  ]);

  return { artistsCount, artworksCount, clientsCount, activeLeasesCount };
}
