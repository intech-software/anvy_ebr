"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fetchAuth, sessionCookie } from "@/lib/auth";

const tokenSchema = z.object({ accessToken: z.string().min(1) });
const unavailable = "Không thể kết nối đến hệ thống. Vui lòng thử lại.";

export async function login(_previousError: string, formData: FormData) {
  let token: string;
  try {
    const response = await fetchAuth("login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    });

    if (response.status === 400) {
      return "Tên đăng nhập hoặc mật khẩu không đúng định dạng.";
    }
    if (response.status === 401) {
      return "Tên đăng nhập hoặc mật khẩu không đúng.";
    }
    if (!response.ok) return unavailable;

    token = tokenSchema.parse(await response.json()).accessToken;
  } catch {
    return unavailable;
  }

  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    secure:
      process.env.AUTH_COOKIE_SECURE === undefined
        ? process.env.NODE_ENV === "production"
        : process.env.AUTH_COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  redirect("/");
}
