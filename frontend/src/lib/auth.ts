import { cookies } from "next/headers";
import { cache } from "react";
import { z } from "zod";

export const sessionCookie = "anvy_ebr_session";

const sessionUserSchema = z.object({
  username: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable().default(null),
  position: z.string().nullable(),
  department: z.string(),
  avatar: z.string().nullable(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export function fetchAuth(path: "login" | "me" | "password" | "avatar", init?: RequestInit) {
  return fetchBackend(`/auth/${path}`, init);
}

export function fetchBackend(path: string, init?: RequestInit) {
  const backend = process.env.AUTH_API_URL ?? "http://127.0.0.1:3000";
  return fetch(new URL(path, backend), {
    ...init,
    cache: "no-store",
    signal: init?.signal ?? AbortSignal.timeout(5000),
  });
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;

  try {
    const response = await fetchAuth("me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok ? sessionUserSchema.parse(await response.json()) : null;
  } catch {
    return null;
  }
});
