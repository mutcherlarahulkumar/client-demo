import { z } from "zod";
import { contactInfoSchema, paginationQuerySchema } from "./common.validator";

export const createArtistSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name too long"),
  bio: z.string().max(5000, "Bio too long").optional(),
  contactInfo: contactInfoSchema.optional(),
  commissionPercent: z.coerce
    .number({ invalid_type_error: "Commission percent must be a number" })
    .min(0, "Commission percent cannot be negative")
    .max(100, "Commission percent cannot exceed 100"),
  commissionTerms: z
    .string()
    .min(1, "Commission terms are required")
    .max(500, "Commission terms too long"),
  mouStatus: z.enum(["SIGNED", "PENDING", "NOT_REQUIRED"], {
    errorMap: () => ({ message: "Invalid MOU status" }),
  }),
});

export const updateArtistSchema = createArtistSchema.partial();

export const listArtistsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});

export type CreateArtistInput = z.infer<typeof createArtistSchema>;
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>;
export type ListArtistsQuery = z.infer<typeof listArtistsQuerySchema>;
