import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fetchBackend, sessionCookie } from "@/lib/auth";

export const itemSchema = z.object({
  id: z.number().int().positive(),
  item_code: z.string(),
  item_name: z.string(),
  unit: z.string().nullable(),
});

export type Item = z.infer<typeof itemSchema>;

export const itemListSchema = z.object({
  items: z.array(itemSchema),
  hasMore: z.boolean(),
});

export async function fetchItems(path: "" | `?${string}` | `/${number}`, init?: RequestInit) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login");

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetchBackend(`/items${path}`, { ...init, headers }).catch(() => null);
  if (response?.status === 401) redirect("/login");
  return response;
}
