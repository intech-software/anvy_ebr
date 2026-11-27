import { cookies } from "next/headers";

export const sessionCookie = "anvy_ebr_session";

export function fetchAuth(path: "login" | "session", init?: RequestInit) {
  const backend = process.env.AUTH_API_URL ?? "http://127.0.0.1:3000";
  return fetch(new URL(`/auth/${path}`, backend), {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
}

export async function hasSession(): Promise<boolean> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return false;

  try {
    const response = await fetchAuth("session", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.status === 204;
  } catch {
    return false;
  }
}
