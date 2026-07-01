import { z } from "zod";
import { contactInfoSchema, paginationQuerySchema } from "./common.validator";

export const createArtistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  contactInfo: contactInfoSchema.optional(),
  commissionTerms: z.string().min(1, "Commission terms are required"),
  mouStatus: z.enum(["SIGNED", "PENDING", "NOT_REQUIRED"]),
});

export const updateArtistSchema = createArtistSchema.partial();

export const listArtistsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});

export type CreateArtistInput = z.infer<typeof createArtistSchema>;
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>;
export type ListArtistsQuery = z.infer<typeof listArtistsQuerySchema>;
