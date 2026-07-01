import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

const artworkStatusEnum = z.enum(["IN_COLLECTION", "ON_LEASE", "SOLD"]);

export const createArtworkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artistId: z.string().min(1, "artistId is required"),
  medium: z.string().min(1, "Medium is required"),
  dimensions: z.string().min(1, "Dimensions are required"),
  year: z.coerce.number().int(),
  acquisitionDate: z.coerce.date(),
  status: artworkStatusEnum,
  images: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const updateArtworkSchema = createArtworkSchema.partial();

export const updateArtworkStatusSchema = z.object({
  status: artworkStatusEnum,
});

export const listArtworksQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: artworkStatusEnum.optional(),
  artistId: z.string().optional(),
});

export type CreateArtworkInput = z.infer<typeof createArtworkSchema>;
export type UpdateArtworkInput = z.infer<typeof updateArtworkSchema>;
export type UpdateArtworkStatusInput = z.infer<typeof updateArtworkStatusSchema>;
export type ListArtworksQuery = z.infer<typeof listArtworksQuerySchema>;
