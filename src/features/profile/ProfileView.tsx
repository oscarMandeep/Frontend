"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, LogOut, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { GradientButton } from "@/components/brand/GradientButton";
import { UserAvatar } from "@/components/brand/UserAvatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AvailabilityGrid } from "@/features/onboarding/AvailabilityGrid";
import { cellsToSlots, slotsToCells } from "@/features/onboarding/availability";
import { HavesEditor, WantsEditor } from "@/features/onboarding/SkillEditors";
import { MODES, type OnboardingValues } from "@/features/onboarding/schema";
import { isApiError } from "@/lib/api/fetcher";
import { logout } from "@/lib/api/generated/auth/auth";
import {
  getGetMeQueryKey,
  updateMe,
  updateMyAvailability,
  updateMySkills,
  useGetMe,
} from "@/lib/api/generated/me/me";
import type { MeDto } from "@/lib/api/generated/model";
import { cn } from "@/lib/utils";

const MODE_LABEL = {
  ONLINE: "Online",
  IN_PERSON: "In person",
  BOTH: "Both",
} as const;

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-extrabold">{title}</h2>
        {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function SaveButton({
  saving,
  onClick,
  label = "Save",
}: {
  saving: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <GradientButton
      onClick={onClick}
      disabled={saving}
      className="h-11 self-end"
    >
      {saving ? <Loader2 className="size-5 animate-spin" /> : label}
    </GradientButton>
  );
}

function useSaver() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  async function save(fn: () => Promise<unknown>, success: string) {
    setSaving(true);
    try {
      await fn();
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast.success(success);
    } catch (err) {
      const details = isApiError(err)
        ? Object.values(err.error.details ?? {})
            .flat()
            .join(" ")
        : "";
      toast.error(
        (isApiError(err) && err.error.code === "USERNAME_TAKEN"
          ? "That username is taken."
          : details) ||
          (isApiError(err) ? err.error.message : "Could not save. Try again."),
      );
    } finally {
      setSaving(false);
    }
  }
  return { saving, save };
}

function AboutSection({ me }: { me: MeDto }) {
  const { saving, save } = useSaver();
  const [name, setName] = useState(me.name);
  const [username, setUsername] = useState(me.username);
  const [bio, setBio] = useState(me.bio ?? "");
  const [city, setCity] = useState(me.city ?? "");
  const [mode, setMode] = useState(me.mode);
  const [languages, setLanguages] = useState(me.languages.join(", "));
  const [isPublic, setIsPublic] = useState(me.isPublic);

  return (
    <Section title="About you">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Name
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="h-11 rounded-full px-4 text-base"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Username
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          maxLength={30}
          className="h-11 rounded-full px-4 text-base"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Bio
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={3}
          className="resize-none rounded-2xl border border-input bg-transparent p-3 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
      </label>
      <div className="flex flex-col gap-1.5 text-sm font-semibold">
        How do you want to learn?
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "h-10 rounded-full border text-sm font-bold",
                mode === m
                  ? "bg-brand-gradient border-transparent text-white"
                  : "border-border hover:bg-muted",
              )}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </div>
      {mode !== "ONLINE" && (
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          City
          <Input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            maxLength={60}
            className="h-11 rounded-full px-4 text-base"
          />
        </label>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Languages (comma separated)
        <Input
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          className="h-11 rounded-full px-4 text-base"
        />
      </label>
      <label className="flex items-center justify-between gap-4 rounded-2xl bg-surface px-4 py-3">
        <span>
          <span className="block text-sm font-bold">Public profile</span>
          <span className="text-xs text-muted-foreground">
            Lets search engines and visitors see your skills (never your email).
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="size-6 accent-[var(--brand)]"
        />
      </label>
      <SaveButton
        saving={saving}
        onClick={() =>
          save(
            () =>
              updateMe({
                name: name.trim(),
                username: username.trim(),
                bio: bio.trim(),
                city: mode === "ONLINE" ? undefined : city.trim() || undefined,
                mode,
                languages: languages
                  .split(",")
                  .map((l) => l.trim())
                  .filter(Boolean),
                isPublic,
              }),
            "Profile saved",
          )
        }
      />
    </Section>
  );
}

function SkillsSection({ me }: { me: MeDto }) {
  const { saving, save } = useSaver();
  const [haves, setHaves] = useState<OnboardingValues["haves"]>(
    me.haves.map((h) => ({
      skillId: h.skill.id,
      name: h.skill.name,
      category: h.skill.category,
      level: h.level,
    })),
  );
  const [wants, setWants] = useState<OnboardingValues["wants"]>(
    me.wants.map((w) => ({
      skillId: w.skill.id,
      name: w.skill.name,
      category: w.skill.category,
      currentLevel: 1,
      goalLevel: w.goalLevel,
      priority: w.priority,
    })),
  );
  const valid = haves.length > 0 && wants.length > 0;

  return (
    <>
      <Section title="Skills you can teach">
        <HavesEditor haves={haves} wants={wants} onChange={setHaves} />
      </Section>
      <Section title="Skills you want to learn">
        <WantsEditor haves={haves} wants={wants} onChange={setWants} />
        {!valid && (
          <p className="text-sm font-semibold text-destructive">
            Keep at least one skill in each list.
          </p>
        )}
        <SaveButton
          saving={saving}
          label="Save skills"
          onClick={() =>
            valid &&
            save(
              () =>
                updateMySkills({
                  haves: haves.map((h) => ({
                    skillId: h.skillId,
                    level: h.level,
                  })),
                  wants: wants.map((w) => ({
                    skillId: w.skillId,
                    currentLevel: w.currentLevel,
                    goalLevel: w.goalLevel,
                    priority: w.priority,
                  })),
                }),
              "Skills saved. Your deck will update.",
            )
          }
        />
      </Section>
    </>
  );
}

function AvailabilitySection({ me }: { me: MeDto }) {
  const { saving, save } = useSaver();
  const [cells, setCells] = useState(() => slotsToCells(me.availability));
  return (
    <Section title="When you are free" hint={`Your time zone: ${me.timezone}`}>
      <AvailabilityGrid cells={cells} onChange={setCells} />
      <SaveButton
        saving={saving}
        label="Save availability"
        onClick={() =>
          cells.length > 0
            ? save(
                () => updateMyAvailability({ slots: cellsToSlots(cells) }),
                "Availability saved",
              )
            : toast.error("Pick at least one free hour.")
        }
      />
    </Section>
  );
}

export function ProfileView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meQuery = useGetMe();
  const me = meQuery.data?.data;

  async function signOut() {
    await logout().catch(() => undefined);
    queryClient.clear();
    router.replace("/login");
  }

  if (!me) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-36 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-brand-gradient flex items-center gap-4 rounded-3xl p-5 text-white shadow-lg">
        <UserAvatar
          id={me.id}
          name={me.name}
          src={me.avatarUrl}
          className="size-20 border-4 border-white/70"
          textClassName="text-2xl"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-extrabold">{me.name}</p>
          <p className="truncate text-sm text-white/85">@{me.username}</p>
          <p className="mt-1 flex items-center gap-3 text-sm font-semibold">
            {me.ratingCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star className="size-4 fill-white" /> {me.ratingAvg.toFixed(1)}{" "}
                ({me.ratingCount})
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
            <span>{me.sessionsDone} sessions</span>
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        {me.isPublic && (
          <Link
            href={`/u/${me.username}`}
            target="_blank"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-bold hover:bg-muted"
          >
            <ExternalLink className="size-4" /> View public profile
          </Link>
        )}
        <Link
          href="/wallet"
          className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-bold hover:bg-muted"
        >
          Wallet · {me.credits} credits
        </Link>
        <button
          type="button"
          onClick={signOut}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-bold text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </div>

      <AboutSection me={me} />
      <SkillsSection me={me} />
      <AvailabilitySection me={me} />
    </div>
  );
}
