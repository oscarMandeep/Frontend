import { SwipeDeck } from "@/features/discover/SwipeDeck";

export default function DiscoverPage() {
  return (
    <div className="mx-auto flex w-full max-w-[420px] flex-col gap-4 px-4 py-5 sm:py-8">
      <h1 className="sr-only">Discover</h1>
      <SwipeDeck />
    </div>
  );
}
