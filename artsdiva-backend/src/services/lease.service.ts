import type { Lease, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CreateLeaseInput, ListLeasesQuery } from "../validators/lease.validator";
import type { LeaseWithRelations } from "../types/lease.types";
import type { PaginatedResponse } from "../types/common.types";

export class LeaseNotFoundError extends Error {}
export class ArtworkNotFoundForLeaseError extends Error {}
export class ClientNotFoundForLeaseError extends Error {}
export class ArtworkAlreadyOnActiveLeaseError extends Error {}

export async function listLeases(query: ListLeasesQuery): Promise<PaginatedResponse<Lease>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const where: Prisma.LeaseWhereInput = {
    ...(query.artworkId ? { artworkId: query.artworkId } : {}),
    ...(query.clientId ? { clientId: query.clientId } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.lease.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { startDate: "desc" },
    }),
    prisma.lease.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getLeaseById(id: string): Promise<LeaseWithRelations> {
  const lease = await prisma.lease.findUnique({
    where: { id },
    include: { artwork: true, client: true },
  });

  if (!lease) {
    throw new LeaseNotFoundError("Lease not found");
  }

  return lease;
}

export async function createLease(input: CreateLeaseInput): Promise<Lease> {
  const artwork = await prisma.artwork.findFirst({ where: { id: input.artworkId, isDeleted: false } });
  if (!artwork) {
    throw new ArtworkNotFoundForLeaseError("Artwork not found");
  }

  const client = await prisma.client.findFirst({ where: { id: input.clientId, isDeleted: false } });
  if (!client) {
    throw new ClientNotFoundForLeaseError("Client not found");
  }

  // Business rule: an Artwork can only have one ACTIVE lease at a time.
  const existingActiveLease = await prisma.lease.findFirst({
    where: { artworkId: input.artworkId, status: "ACTIVE" },
  });
  if (existingActiveLease) {
    throw new ArtworkAlreadyOnActiveLeaseError("This artwork already has an active lease");
  }

  // Lease creation + the Artwork.status flip must succeed or fail together,
  // otherwise a lease could exist with the artwork still IN_COLLECTION.
  return prisma.$transaction(async (tx) => {
    const lease = await tx.lease.create({
      data: {
        artworkId: input.artworkId,
        clientId: input.clientId,
        startDate: input.startDate,
        endDate: input.endDate,
        rateAmount: input.rateAmount,
        terms: input.terms,
        status: "ACTIVE",
      },
    });

    await tx.artwork.update({
      where: { id: input.artworkId },
      data: { status: "ON_LEASE" },
    });

    return lease;
  });
}

export async function completeLease(id: string): Promise<Lease> {
  const lease = await prisma.lease.findUnique({ where: { id } });
  if (!lease) {
    throw new LeaseNotFoundError("Lease not found");
  }

  return prisma.$transaction(async (tx) => {
    const updatedLease = await tx.lease.update({
      where: { id },
      data: {
        status: "COMPLETED",
        endDate: lease.endDate ?? new Date(),
      },
    });

    await tx.artwork.update({
      where: { id: lease.artworkId },
      data: { status: "IN_COLLECTION" },
    });

    return updatedLease;
  });
}

export async function cancelLease(id: string): Promise<Lease> {
  const lease = await prisma.lease.findUnique({ where: { id } });
  if (!lease) {
    throw new LeaseNotFoundError("Lease not found");
  }

  return prisma.$transaction(async (tx) => {
    const updatedLease = await tx.lease.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    // Only revert the artwork if this lease was actually the active one â€”
    // cancelling an already-completed/cancelled lease shouldn't touch it.
    if (lease.status === "ACTIVE") {
      await tx.artwork.update({
        where: { id: lease.artworkId },
        data: { status: "IN_COLLECTION" },
      });
    }

    return updatedLease;
  });
}

