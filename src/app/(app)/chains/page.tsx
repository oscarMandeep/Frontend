import { ChainsView } from "@/features/chains/ChainsView";

export default function ChainsPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <h1 className="text-3xl font-extrabold">Swap chains</h1>
      <p className="mt-1 mb-5 text-muted-foreground">
        No direct swap? A loop of three or more people can still all learn what they want.
      </p>
      <ChainsView />
    </div>
  );
}
