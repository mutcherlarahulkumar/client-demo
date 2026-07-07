import { z } from "zod";
import { contactInfoSchema, paginationQuerySchema, sortQuerySchema } from "./common.validator";

const hasEmailOrPhone = (contactInfo?: z.infer<typeof contactInfoSchema>) =>
  Boolean(contactInfo?.email || contactInfo?.phone);

const artistBaseSchema = z.object({
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

// Artists must be reachable: at least one of email or phone is required.
export const createArtistSchema = artistBaseSchema.superRefine((data, ctx) => {
  if (!hasEmailOrPhone(data.contactInfo)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["contactInfo"],
      message: "Provide at least one of email or phone",
    });
  }
});

// On update, only enforce reachability when contactInfo is being changed —
// otherwise a partial update (e.g. rename) would fail for no reason.
export const updateArtistSchema = artistBaseSchema.partial().superRefine((data, ctx) => {
  if (data.contactInfo !== undefined && !hasEmailOrPhone(data.contactInfo)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["contactInfo"],
      message: "Provide at least one of email or phone",
    });
  }
});

export const listArtistsQuerySchema = paginationQuerySchema
  .extend({ search: z.string().optional() })
  .merge(sortQuerySchema(["name", "commissionPercent", "mouStatus", "createdAt"]));

export type CreateArtistInput = z.infer<typeof createArtistSchema>;
export type UpdateArtistInput = z.infer<typeof updateArtistSchema>;
export type ListArtistsQuery = z.infer<typeof listArtistsQuerySchema>;
