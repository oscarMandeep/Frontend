import { ProfileView } from "@/features/profile/ProfileView";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="sr-only">Your profile</h1>
      <ProfileView />
    </div>
  );
}
