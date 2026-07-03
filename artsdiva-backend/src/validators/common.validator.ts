import { z } from "zod";

// International dial code e.g. "+91", "+44", "+1"
const dialCodeRegex = /^\+\d{1,4}$/;

// Local phone number — digits, spaces, dashes, parens; 6–15 chars
const localPhoneRegex = /^[\d\s\-().]{6,15}$/;

export const contactInfoSchema = z.object({
  email: z
    .string()
    .email("Must be a valid email address")
    .optional()
    .or(z.literal("")),
  phoneCountryCode: z
    .string()
    .regex(dialCodeRegex, "Must be a valid dial code (e.g. +91)")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(localPhoneRegex, "Must be a valid phone number (6–15 digits)")
    .optional()
    .or(z.literal("")),
  address: z.string().max(500, "Address too long").optional().or(z.literal("")),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
