"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type PathValue } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Globe2,
  Loader2,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { GradientButton } from "@/components/brand/GradientButton";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api/fetcher";
import { getGetMeQueryKey, useGetMe } from "@/lib/api/generated/me/me";
import {
  completeOnboarding,
  updateMe,
  updateMyAvailability,
  updateMySkills,
} from "@/lib/api/generated/me/me";
import type { MeDto } from "@/lib/api/generated/model";
import { cn } from "@/lib/utils";
import { AvailabilityGrid } from "./AvailabilityGrid";
import { cellsToSlots, slotsToCells } from "./availability";
import {
  MODES,
  onboardingSchema,
  STEP_FIELDS,
  STEP_TITLES,
  type OnboardingValues,
} from "./schema";
import { HavesEditor, WantsEditor } from "./SkillEditors";

const SUGGESTED_LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Tamil",
  "Bengali",
  "Japanese",
];

const MODE_CARDS = [
  {
    value: "ONLINE",
    title: "Online",
    text: "Video calls from anywhere",
    icon: Globe2,
  },
  {
    value: "IN_PERSON",
    title: "In person",
    text: "Meet people in your city",
    icon: MapPin,
  },
  { value: "BOTH", title: "Both", text: "Whatever works", icon: Users },
] as const satisfies readonly {
  value: (typeof MODES)[number];
  title: string;
  text: string;
  icon: unknown;
}[];

/** Loads the profile first, so the form can start from what was already saved. */
export function OnboardingFlow() {
  const router = useRouter();
  const me = useGetMe();
  const profile = me.data?.data;

  useEffect(() => {
    if (profile?.onboarded) router.replace("/discover");
  }, [profile?.onboarded, router]);

  if (!profile || profile.onboarded) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }
  return <OnboardingForm profile={profile} />;
}

function initialValues(profile: MeDto): OnboardingValues {
  return {
    haves: profile.haves.map((h) => ({
      skillId: h.skill.id,
      name: h.skill.name,
      category: h.skill.category,
      level: h.level,
    })),
    wants: profile.wants.map((w) => ({
      skillId: w.skill.id,
      name: w.skill.name,
      category: w.skill.category,
      currentLevel: 1,
      goalLevel: w.goalLevel,
      priority: w.priority,
    })),
    cells: slotsToCells(profile.availability),
    mode: profile.mode,
    languages: profile.languages.length ? profile.languages : ["English"],
    city: profile.city ?? "",
  };
}

function OnboardingForm({ profile }: { profile: MeDto }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [langText, setLangText] = useState("");

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: initialValues(profile),
  });
  const { setValue, trigger, control, formState } = form;
  const values = useWatch({ control }) as OnboardingValues;
  const {
    haves = [],
    wants = [],
    cells = [],
    mode = "BOTH",
    languages = [],
    city = "",
  } = values;

  const set = <K extends keyof OnboardingValues>(
    key: K,
    value: OnboardingValues[K],
  ) =>
    setValue(key, value as PathValue<OnboardingValues, K>, {
      shouldValidate: true,
      shouldDirty: true,
    });

  const toggleLanguage = (lang: string) =>
    set(
      "languages",
      languages.includes(lang)
        ? languages.filter((l) => l !== lang)
        : [...languages, lang],
    );

  const stepError = (): string | undefined => {
    for (const f of STEP_FIELDS[step]) {
      const err = formState.errors[f];
      if (err) {
        const message = (err as { message?: string }).message;
        if (message) return message;
        // array fields report the first failing item
        const first = Array.isArray(err) ? err.find(Boolean) : undefined;
        const nested =
          first &&
          Object.values(first as object).find(
            (v) => (v as { message?: string })?.message,
          );
        return (nested as { message?: string } | undefined)?.message;
      }
    }
  };

  async function next() {
    const ok = await trigger([...STEP_FIELDS[step]]);
    if (!ok) return;
    if (step < STEP_TITLES.length - 1) setStep(step + 1);
    else await finish();
  }

  async function finish() {
    setSaving(true);
    try {
      const v = form.getValues();
      await updateMe({
        mode: v.mode,
        languages: v.languages,
        city: v.city || undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      await updateMySkills({
        haves: v.haves.map((h) => ({ skillId: h.skillId, level: h.level })),
        wants: v.wants.map((w) => ({
          skillId: w.skillId,
          currentLevel: w.currentLevel,
          goalLevel: w.goalLevel,
          priority: w.priority,
        })),
      });
      await updateMyAvailability({ slots: cellsToSlots(v.cells) });
      await completeOnboarding();
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast.success("You are all set. Let's find your first swap!");
      router.push("/discover");
    } catch (err) {
      const details = isApiError(err)
        ? Object.values(err.error.details ?? {})
            .flat()
            .join(" ")
        : "";
      toast.error(details || "Could not save. Please try again.");
      setSaving(false);
    }
  }

  const error = stepError();
  const progress = ((step + 1) / STEP_TITLES.length) * 100;
  const last = step === STEP_TITLES.length - 1;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 pb-28">
      <header className="flex items-center justify-between py-5">
        <Logo />
        <span className="text-sm font-semibold text-muted-foreground">
          Step {step + 1} of {STEP_TITLES.length}
        </span>
      </header>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={step + 1}
        aria-valuemax={4}
      >
        <motion.div
          className="bg-brand-gradient h-full"
          animate={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
          className="mt-8 flex flex-col gap-6"
        >
          <h1 className="text-3xl font-extrabold">{STEP_TITLES[step]}</h1>

          {step === 0 && (
            <>
              <p className="-mt-3 text-muted-foreground">
                Add skills you could teach a beginner, and how good you are.
              </p>
              <HavesEditor
                haves={haves}
                wants={wants}
                onChange={(v) => set("haves", v)}
              />
            </>
          )}

          {step === 1 && (
            <>
              <p className="-mt-3 text-muted-foreground">
                Pick what you would love to learn, and the level you are aiming
                for.
              </p>
              <WantsEditor
                haves={haves}
                wants={wants}
                onChange={(v) => set("wants", v)}
              />
            </>
          )}

          {step === 2 && (
            <>
              <p className="-mt-3 text-muted-foreground">
                Paint the hours you are usually free (in your local time). Drag
                across cells. We only suggest times when both of you are free.
              </p>
              <AvailabilityGrid
                cells={cells}
                onChange={(c) => set("cells", c)}
              />
              <p className="text-sm text-muted-foreground">
                {cells.length} free hours per week selected
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {MODE_CARDS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    aria-pressed={mode === m.value}
                    onClick={() => set("mode", m.value)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition",
                      mode === m.value
                        ? "border-brand bg-accent ring-2 ring-brand/30"
                        : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    <m.icon className="size-6 text-brand" />
                    <span className="mt-1 font-bold">{m.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {m.text}
                    </span>
                  </button>
                ))}
              </div>

              {mode !== "ONLINE" && (
                <label className="flex flex-col gap-2">
                  <span className="font-semibold">Your city</span>
                  <Input
                    value={city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="e.g. Dehradun"
                    className="h-12 rounded-full px-4 text-base"
                  />
                </label>
              )}

              <div className="flex flex-col gap-2">
                <span className="font-semibold">Languages you can chat in</span>
                <div className="flex flex-wrap gap-2">
                  {[...new Set([...SUGGESTED_LANGUAGES, ...languages])].map(
                    (l) => (
                      <button
                        key={l}
                        type="button"
                        aria-pressed={languages.includes(l)}
                        onClick={() => toggleLanguage(l)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                          languages.includes(l)
                            ? "bg-brand-gradient border-transparent text-white"
                            : "border-border text-muted-foreground hover:bg-muted",
                        )}
                      >
                        {languages.includes(l) && (
                          <Check className="size-3.5" />
                        )}
                        {l}
                      </button>
                    ),
                  )}
                </div>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const t = langText.trim();
                    if (t && !languages.includes(t))
                      set("languages", [...languages, t]);
                    setLangText("");
                  }}
                >
                  <Input
                    value={langText}
                    onChange={(e) => setLangText(e.target.value)}
                    placeholder="Another language"
                    aria-label="Add another language"
                    className="h-10 rounded-full px-4"
                  />
                  <button
                    type="submit"
                    aria-label="Add language"
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-border hover:bg-muted"
                  >
                    <Plus className="size-4" />
                  </button>
                </form>
              </div>
            </>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive"
            >
              {error}
            </p>
          )}
        </motion.section>
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 0 || saving}
            className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-semibold text-muted-foreground hover:bg-muted disabled:invisible"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <GradientButton onClick={next} disabled={saving} className="min-w-36">
            {saving ? (
              <Loader2 className="size-5 animate-spin" />
            ) : last ? (
              "Finish"
            ) : (
              "Continue"
            )}
          </GradientButton>
        </div>
      </div>
    </div>
  );
}
