import { z } from "zod";
import { contactInfoSchema, paginationQuerySchema } from "./common.validator";

export const createClientSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name too long"),
  contactInfo: contactInfoSchema.optional(),
  preferences: z.string().max(2000, "Preferences too long").optional(),
  notes: z.string().max(2000, "Notes too long").optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const listClientsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
