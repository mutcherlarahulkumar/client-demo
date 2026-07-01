import type { Artwork, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type {
  CreateArtworkInput,
  ListArtworksQuery,
  UpdateArtworkInput,
  UpdateArtworkStatusInput,
} from "../validators/artwork.validator";
import type { ArtworkWithRelations } from "../types/artwork.types";
import type { PaginatedResponse } from "../types/common.types";

export class ArtworkNotFoundError extends Error {}
export class ArtistNotFoundForArtworkError extends Error {}
export class ArtworkHasLeasesError extends Error {}

export async function listArtworks(query: ListArtworksQuery): Promise<PaginatedResponse<Artwork>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const where: Prisma.ArtworkWhereInput = {
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { medium: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.artistId ? { artistId: query.artistId } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.artwork.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { title: "asc" },
    }),
    prisma.artwork.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getArtworkById(id: string): Promise<ArtworkWithRelations> {
  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: {
      artist: true,
      leaseHistory: {
        where: { status: "ACTIVE" },
        include: { client: true },
        take: 1,
      },
    },
  });

  if (!artwork) {
    throw new ArtworkNotFoundError("Artwork not found");
  }

  const { leaseHistory, ...rest } = artwork;

  return { ...rest, activeLease: leaseHistory[0] ?? null };
}

export async function createArtwork(input: CreateArtworkInput): Promise<Artwork> {
  const artist = await prisma.artist.findUnique({ where: { id: input.artistId } });
  if (!artist) {
    throw new ArtistNotFoundForArtworkError("Artist not found");
  }

  return prisma.artwork.create({
    data: {
      title: input.title,
      artistId: input.artistId,
      medium: input.medium,
      dimensions: input.dimensions,
      year: input.year,
      acquisitionDate: input.acquisitionDate,
      status: input.status,
      images: input.images ?? [],
      notes: input.notes,
    },
  });
}

export async function updateArtwork(id: string, input: UpdateArtworkInput): Promise<Artwork> {
  const existing = await prisma.artwork.findUnique({ where: { id } });
  if (!existing) {
    throw new ArtworkNotFoundError("Artwork not found");
  }

  if (input.artistId) {
    const artist = await prisma.artist.findUnique({ where: { id: input.artistId } });
    if (!artist) {
      throw new ArtistNotFoundForArtworkError("Artist not found");
    }
  }

  return prisma.artwork.update({
    where: { id },
    data: {
      title: input.title,
      artistId: input.artistId,
      medium: input.medium,
      dimensions: input.dimensions,
      year: input.year,
      acquisitionDate: input.acquisitionDate,
      status: input.status,
      images: input.images,
      notes: input.notes,
    },
  });
}

// Dedicated status-only update. NOTE: this intentionally does NOT create or
// touch any Lease record — that's the Lease module's responsibility (Prompt
// 8), which keeps Artwork.status and Lease.status in sync transactionally
// (e.g. completing a lease flips the artwork back to IN_COLLECTION). Calling
// this directly with ON_LEASE without a matching Lease record will desync
// the two — prefer POST /api/leases for lease-driven transitions.
export async function updateArtworkStatus(
  id: string,
  input: UpdateArtworkStatusInput
): Promise<Artwork> {
  const existing = await prisma.artwork.findUnique({ where: { id } });
  if (!existing) {
    throw new ArtworkNotFoundError("Artwork not found");
  }

  return prisma.artwork.update({
    where: { id },
    data: { status: input.status },
  });
}

export async function addArtworkImages(id: string, urls: string[]): Promise<Artwork> {
  const existing = await prisma.artwork.findUnique({ where: { id } });
  if (!existing) {
    throw new ArtworkNotFoundError("Artwork not found");
  }

  return prisma.artwork.update({
    where: { id },
    data: { images: { push: urls } },
  });
}

export async function deleteArtwork(id: string): Promise<void> {
  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: { leaseHistory: { select: { id: true } } },
  });

  if (!artwork) {
    throw new ArtworkNotFoundError("Artwork not found");
  }

  // Same blocking pattern as Artist delete — no orphaned Lease history.
  if (artwork.leaseHistory.length > 0) {
    throw new ArtworkHasLeasesError("Cannot delete artwork with existing lease records");
  }

  await prisma.artwork.delete({ where: { id } });
}
