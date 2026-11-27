import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth";
import { HomeShell } from "../home-shell";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return <HomeShell user={user}>{children}</HomeShell>;
}
