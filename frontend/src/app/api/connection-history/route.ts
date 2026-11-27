import { cookies } from "next/headers";
import { fetchBackend, sessionCookie } from "@/lib/auth";

async function forward(path: string, init?: RequestInit) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return new Response(null, { status: 401 });
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const response = await fetchBackend(path, { ...init, headers }).catch(() => null);
  if (!response) return new Response(null, { status: 503 });
  return new Response(response.body, {
    status: response.status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export function GET(request: Request) {
  return forward(`/connection-history${new URL(request.url).search}`);
}

export async function POST(request: Request) {
  if (
    request.headers.get("sec-fetch-site") === "cross-site" ||
    !request.headers.get("content-type")?.startsWith("application/json") ||
    Number(request.headers.get("content-length")) > 512
  ) {
    return new Response(null, { status: 400 });
  }
  const body = await request.text();
  if (body.length > 512) return new Response(null, { status: 400 });
  return forward("/connection-history/presence", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": request.headers.get("user-agent") ?? "",
      "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
    },
    body,
  });
}
