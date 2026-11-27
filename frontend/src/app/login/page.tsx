import Image from "next/image";
import { redirect } from "next/navigation";
import { hasSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await hasSession()) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <Image
          src="/brand/logo_anvy.svg"
          alt="Logo Anvy"
          width={470}
          height={568}
          className="mx-auto mb-4 h-auto w-24"
        />
        <h1 className="mb-5 text-center text-2xl font-bold text-slate-900">
          Đăng nhập Anvy EBR
        </h1>
        <LoginForm />
      </section>
    </main>
  );
}
