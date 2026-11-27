"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessionCookie } from "@/lib/auth";

export async function logout() {
  (await cookies()).delete(sessionCookie);
  redirect("/login");
}
