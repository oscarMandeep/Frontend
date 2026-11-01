import { z } from "zod";

/** Mirrors the API's rules (docs/04-api-contract.md); the API re-checks everything. */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("That does not look like an email"),
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name (at least 2 letters)")
    .max(60, "Keep it under 60 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("That does not look like an email"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(72, "Use at most 72 characters"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
