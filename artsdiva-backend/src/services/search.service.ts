import { prisma } from "../lib/prisma";
import type { SearchQuery } from "../validators/search.validator";
import type { SearchResults } from "../types/search.types";

const SEARCH_RESULT_LIMIT = 10;

export async function search(query: SearchQuery): Promise<SearchResults> {
  const { q } = query;

  const [artworks, artists, clients] = await Promise.all([
    prisma.artwork.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { medium: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true },
      take: SEARCH_RESULT_LIMIT,
    }),
    prisma.artist.findMany({
      where: {
        deletedAt: null,
        name: { contains: q, mode: "insensitive" },
      },
      select: { id: true, name: true },
      take: SEARCH_RESULT_LIMIT,
    }),
    prisma.client.findMany({
      where: {
        deletedAt: null,
        name: { contains: q, mode: "insensitive" },
      },
      select: { id: true, name: true },
      take: SEARCH_RESULT_LIMIT,
    }),
  ]);

  return {
    artworks: artworks.map((a) => ({ id: a.id, label: a.title, type: "artwork" as const })),
    artists: artists.map((a) => ({ id: a.id, label: a.name, type: "artist" as const })),
    clients: clients.map((c) => ({ id: c.id, label: c.name, type: "client" as const })),
  };
}
