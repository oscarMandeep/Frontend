"use client";

import { useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { SkillChip } from "@/components/brand/SkillChip";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { createSkill } from "@/lib/api/generated/skills/skills";
import { useSearchSkills } from "@/lib/api/generated/skills/skills";
import type { SkillRefDto } from "@/lib/api/generated/model";

/** Typo-tolerant skill search with a "Create '<text>'" option when nothing matches. */
export function SkillPicker({
  onPick,
  excludeIds,
  placeholder = "Search a skill, e.g. Excel, Guitar, Spanish",
}: {
  onPick: (skill: SkillRefDto) => void;
  excludeIds: readonly string[];
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const q = useDebouncedValue(text.trim(), 250);

  const search = useSearchSkills(
    { q, limit: 8 },
    { query: { enabled: q.length >= 1 } },
  );
  const results = (search.data?.data ?? []).filter(
    (s) => !excludeIds.includes(s.id),
  );
  const exact = results.some(
    (s) => s.name.toLowerCase() === text.trim().toLowerCase(),
  );
  const showCreate = text.trim().length >= 2 && !exact && !search.isFetching;

  function pick(skill: SkillRefDto) {
    onPick(skill);
    setText("");
    setError(null);
  }

  async function create() {
    setCreating(true);
    setError(null);
    try {
      const res = await createSkill({ name: text.trim() });
      if (excludeIds.includes(res.data.id)) {
        setError(`${res.data.name} is already in your list.`);
      } else {
        pick(res.data);
      }
    } catch {
      setError("Could not add that skill. Try different words.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label="Search skills"
          className="h-12 rounded-full pl-10 text-base"
        />
        {search.isFetching && (
          <Loader2 className="absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {text.trim().length > 0 && (results.length > 0 || showCreate) && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover p-1 shadow-xl">
          {results.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => pick(s)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-muted"
              >
                <span className="font-semibold">{s.name}</span>
                <SkillChip category={s.category}>{s.category}</SkillChip>
              </button>
            </li>
          ))}
          {showCreate && (
            <li>
              <button
                type="button"
                disabled={creating}
                onClick={create}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left font-semibold text-brand hover:bg-accent disabled:opacity-60"
              >
                {creating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                Create “{text.trim()}”
              </button>
            </li>
          )}
        </ul>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
