import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { UserAvatar } from "@/components/brand/UserAvatar";
import type { PublicProfileCardDto } from "@/lib/api/generated/model";

export function TeacherCard({ teacher }: { teacher: PublicProfileCardDto }) {
  return (
    <li>
      <Link
        href={`/u/${teacher.username}`}
        className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <UserAvatar
          id={teacher.username}
          name={teacher.name}
          src={teacher.avatarUrl}
          className="size-14"
          textClassName="text-lg"
        />
        <span className="min-w-0">
          <span className="block truncate font-bold">{teacher.name}</span>
          <span className="flex items-center gap-3 text-sm text-muted-foreground">
            {teacher.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {teacher.city}
              </span>
            )}
            {teacher.ratingAvg > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5 fill-action-rewind text-action-rewind" />{" "}
                {teacher.ratingAvg.toFixed(1)}
              </span>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}
