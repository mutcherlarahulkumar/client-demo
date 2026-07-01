import type { Artist, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CreateArtistInput, ListArtistsQuery, UpdateArtistInput } from "../validators/artist.validator";
import type { ArtistWithArtworks } from "../types/artist.types";
import type { PaginatedResponse } from "../types/common.types";

export class ArtistNotFoundError extends Error {}
export class ArtistHasArtworksError extends Error {}

export async function listArtists(query: ListArtistsQuery): Promise<PaginatedResponse<Artist>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const where: Prisma.ArtistWhereInput = query.search
    ? { name: { contains: query.search, mode: "insensitive" } }
    : {};

  const [data, total] = await Promise.all([
    prisma.artist.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.artist.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getArtistById(id: string): Promise<ArtistWithArtworks> {
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: { artworks: true },
  });

  if (!artist) {
    throw new ArtistNotFoundError("Artist not found");
  }

  return artist;
}

export async function createArtist(input: CreateArtistInput): Promise<Artist> {
  return prisma.artist.create({
    data: {
      name: input.name,
      bio: input.bio,
      contactInfo: input.contactInfo,
      commissionTerms: input.commissionTerms,
      mouStatus: input.mouStatus,
    },
  });
}

export async function updateArtist(id: string, input: UpdateArtistInput): Promise<Artist> {
  const existing = await prisma.artist.findUnique({ where: { id } });
  if (!existing) {
    throw new ArtistNotFoundError("Artist not found");
  }

  return prisma.artist.update({
    where: { id },
    data: {
      name: input.name,
      bio: input.bio,
      contactInfo: input.contactInfo,
      commissionTerms: input.commissionTerms,
      mouStatus: input.mouStatus,
    },
  });
}

export async function deleteArtist(id: string): Promise<void> {
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: { artworks: { select: { id: true } } },
  });

  if (!artist) {
    throw new ArtistNotFoundError("Artist not found");
  }

  // Business rule: block delete rather than cascade or orphan Artwork
  // records. Cascade/soft-delete could be revisited later if needed.
  if (artist.artworks.length > 0) {
    throw new ArtistHasArtworksError("Cannot delete artist with existing artworks");
  }

  await prisma.artist.delete({ where: { id } });
}
