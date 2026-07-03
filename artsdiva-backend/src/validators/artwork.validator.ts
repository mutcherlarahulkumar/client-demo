import { z } from "zod";
import { paginationQuerySchema } from "./common.validator";

const artworkStatusEnum = z.enum(["IN_COLLECTION", "ON_LEASE", "SOLD"]);

const dimensionUnitEnum = z.enum(["cm", "in", "mm"], {
  errorMap: () => ({ message: 'Unit must be "cm", "in", or "mm"' }),
});

export const dimensionsSchema = z.object({
  width: z.coerce
    .number({ invalid_type_error: "Width must be a number" })
    .positive("Width must be greater than 0")
    .max(10000, "Width is unrealistically large"),
  height: z.coerce
    .number({ invalid_type_error: "Height must be a number" })
    .positive("Height must be greater than 0")
    .max(10000, "Height is unrealistically large"),
  unit: dimensionUnitEnum,
});

export const createArtworkSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  artistId: z.string().min(1, "Artist is required"),
  medium: z.string().min(1, "Medium is required").max(200, "Medium too long"),
  dimensions: dimensionsSchema,
  year: z.coerce
    .number({ invalid_type_error: "Year must be a number" })
    .int("Year must be a whole number")
    .min(1800, "Year must be 1800 or later")
    .max(new Date().getFullYear(), `Year cannot be in the future`),
  acquisitionDate: z.coerce.date({
    errorMap: () => ({ message: "Acquisition date must be a valid date" }),
  }),
  status: artworkStatusEnum,
  images: z.array(z.string().url()).optional(),
  notes: z.string().max(2000, "Notes too long").optional(),
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
