"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchBackend, sessionCookie } from "@/lib/auth";

export async function logout() {
  const jar = await cookies();
  const token = jar.get(sessionCookie)?.value;
  if (token) {
    await fetchBackend("/connection-history/end", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
  }
  jar.delete(sessionCookie);
  redirect("/login");
}
