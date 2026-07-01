import { z } from "zod";

export const contactInfoSchema = z.object({
  email: z.string().email("Must be a valid email address").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
