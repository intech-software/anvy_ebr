"use client";

import * as Avatar from "@radix-ui/react-avatar";
import type { SessionUser } from "@/lib/auth";

export function UserAvatar({
  user,
  className,
}: {
  user: Pick<SessionUser, "name" | "username" | "avatar">;
  className: string;
}) {
  const name = user.name?.trim();
  const initials = name
    ? name.split(/\s+/).slice(-2).map((part) => part[0]).join("")
    : user.username.slice(0, 2);

  return (
    <Avatar.Root
      aria-hidden="true"
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 font-semibold text-blue-800 ${className}`}
    >
      <Avatar.Image src={user.avatar ?? undefined} alt="" className="size-full object-cover" />
      <Avatar.Fallback>{initials.toLocaleUpperCase("vi")}</Avatar.Fallback>
    </Avatar.Root>
  );
}
