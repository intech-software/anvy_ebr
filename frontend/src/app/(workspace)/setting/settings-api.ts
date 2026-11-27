import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fetchBackend, sessionCookie } from "@/lib/auth";

export const settingsSchema = z.object({
  departments: z.array(z.object({ name: z.string(), description: z.string().nullable() })),
});

export type SettingsData = z.infer<typeof settingsSchema>;

export async function fetchSettings(path: "" | "/users" | "/departments" = "", body?: Record<string, unknown>) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login");

  const headers: HeadersInit = { Authorization: `Bearer ${token}` };
  if (body) headers["Content-Type"] = "application/json";
  const response = await fetchBackend(`/settings${path}`, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => null);

  if (response?.status === 401) redirect("/login");
  return response;
}
