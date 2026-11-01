import { MatchList } from "@/features/matches/MatchList";

export default function MatchesPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-3xl font-extrabold">Matches</h1>
      <MatchList />
    </div>
  );
}
