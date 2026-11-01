import { SessionsView } from "@/features/sessions/SessionsView";

export default function SessionsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-3xl font-extrabold">Sessions</h1>
      <SessionsView />
    </div>
  );
}
