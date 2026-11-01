import { z } from "zod";

export const LEVEL_LABELS = [
  "Beginner",
  "Basic",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;
export const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export const MODES = ["ONLINE", "IN_PERSON", "BOTH"] as const;

const level = z.number().int().min(1).max(5);

export const haveSchema = z.object({
  skillId: z.string().min(1),
  name: z.string(),
  category: z.string(),
  level,
});

export const wantSchema = z
  .object({
    skillId: z.string().min(1),
    name: z.string(),
    category: z.string(),
    currentLevel: level,
    goalLevel: level,
    priority: z.enum(PRIORITIES),
  })
  .refine((w) => w.goalLevel >= w.currentLevel, {
    message: "Goal must be at least your current level",
    path: ["goalLevel"],
  });

/** Mirrors the API's rules (docs/04-api-contract.md); the API re-checks everything. */
export const onboardingSchema = z
  .object({
    haves: z
      .array(haveSchema)
      .min(1, "Add at least one skill you can teach")
      .max(20),
    wants: z
      .array(wantSchema)
      .min(1, "Add at least one skill you want to learn")
      .max(20),
    cells: z.array(z.string()).min(1, "Pick at least one time you are free"),
    mode: z.enum(MODES),
    languages: z
      .array(z.string().trim().min(1).max(30))
      .min(1, "Pick at least one language")
      .max(10),
    city: z.string().trim().max(60),
  })
  .superRefine((v, ctx) => {
    if (v.mode !== "ONLINE" && !v.city) {
      ctx.addIssue({
        code: "custom",
        path: ["city"],
        message: "City is required for in-person sessions",
      });
    }
    const haveIds = new Set(v.haves.map((h) => h.skillId));
    if (v.wants.some((w) => haveIds.has(w.skillId))) {
      ctx.addIssue({
        code: "custom",
        path: ["wants"],
        message: "A skill cannot be both something you teach and want to learn",
      });
    }
  });

export type OnboardingValues = z.infer<typeof onboardingSchema>;

/** Which form fields each step must have valid before moving on. */
export const STEP_FIELDS = [
  ["haves"],
  ["wants"],
  ["cells"],
  ["mode", "languages", "city"],
] as const satisfies readonly (readonly (keyof OnboardingValues)[])[];

export const STEP_TITLES = [
  "What can you teach?",
  "What do you want to learn?",
  "When are you free?",
  "How and where?",
] as const;
