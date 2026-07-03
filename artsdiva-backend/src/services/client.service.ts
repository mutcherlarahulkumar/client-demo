import type { Client, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CreateClientInput, ListClientsQuery, UpdateClientInput } from "../validators/client.validator";
import type { ClientWithLeaseHistory } from "../types/client.types";
import type { PaginatedResponse } from "../types/common.types";

export class ClientNotFoundError extends Error {}
export class ClientHasLeasesError extends Error {}

const notDeleted = { deletedAt: null } satisfies Prisma.ClientWhereInput;

export async function listClients(query: ListClientsQuery): Promise<PaginatedResponse<Client>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const where: Prisma.ClientWhereInput = {
    ...notDeleted,
    ...(query.search ? { name: { contains: query.search, mode: "insensitive" } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.client.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.client.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getClientById(id: string): Promise<ClientWithLeaseHistory> {
  const client = await prisma.client.findUnique({
    where: { id, ...notDeleted },
    include: {
      leases: {
        orderBy: { startDate: "desc" },
        include: {
          artwork: {
            select: { id: true, title: true, images: true, status: true },
          },
        },
      },
    },
  });

  if (!client) {
    throw new ClientNotFoundError("Client not found");
  }

  return client;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  return prisma.client.create({
    data: {
      name: input.name,
      contactInfo: input.contactInfo,
      preferences: input.preferences,
      notes: input.notes,
    },
  });
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
  const existing = await prisma.client.findUnique({ where: { id, ...notDeleted } });
  if (!existing) {
    throw new ClientNotFoundError("Client not found");
  }

  return prisma.client.update({
    where: { id },
    data: {
      name: input.name,
      contactInfo: input.contactInfo,
      preferences: input.preferences,
      notes: input.notes,
    },
  });
}

export async function deleteClient(id: string): Promise<void> {
  const client = await prisma.client.findUnique({
    where: { id, ...notDeleted },
    include: { leases: { select: { id: true } } },
  });

  if (!client) {
    throw new ClientNotFoundError("Client not found");
  }

  if (client.leases.length > 0) {
    throw new ClientHasLeasesError(
      "Cannot delete client with existing lease records. Complete or cancel all leases first."
    );
  }

  await prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
