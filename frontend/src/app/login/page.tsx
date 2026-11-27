import Image from "next/image";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/");

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
        <div className="mt-4 text-center">
          <p>
            Bạn chưa có tài khoản?{" "}
            <span className="text-blue-600">Đăng ký</span>
          </p>
          <p className="text-blue-600">Lấy lại mật khẩu</p>
          <p className="mt-4 text-sm text-slate-500">
            Đăng nhập đồng nghĩa với đã đồng ý{" "}
            <span className="text-blue-600">Điều khoản và chính sách</span>{" "}
            của chúng tôi
          </p>
        </div>
      </section>
    </main>
  );
}
