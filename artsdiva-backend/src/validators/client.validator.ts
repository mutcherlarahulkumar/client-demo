import { z } from "zod";
import { contactInfoSchema, paginationQuerySchema } from "./common.validator";

const hasEmailOrPhone = (contactInfo?: z.infer<typeof contactInfoSchema>) =>
  Boolean(contactInfo?.email || contactInfo?.phone);

const clientBaseSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name too long"),
  contactInfo: contactInfoSchema.optional(),
  preferences: z.string().max(2000, "Preferences too long").optional(),
  notes: z.string().max(2000, "Notes too long").optional(),
});

// Clients must be reachable: at least one of email or phone is required.
export const createClientSchema = clientBaseSchema.superRefine((data, ctx) => {
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
export const updateClientSchema = clientBaseSchema.partial().superRefine((data, ctx) => {
  if (data.contactInfo !== undefined && !hasEmailOrPhone(data.contactInfo)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["contactInfo"],
      message: "Provide at least one of email or phone",
    });
  }
});

export const listClientsQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsQuerySchema>;
