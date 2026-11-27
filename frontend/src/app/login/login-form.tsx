"use client";

import { Eye, EyeClosed } from "lucide-react";
import { useActionState, useState } from "react";
import { login } from "./actions";

const inputClass =
  "w-full rounded border border-gray-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800";

export function LoginForm() {
  const [error, submit, pending] = useActionState(login, "");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={submit} className="space-y-4">
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium">
          Tên đăng nhập
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          minLength={2}
          maxLength={50}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            minLength={6}
            maxLength={50}
            required
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center text-gray-600"
          >
            {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-slate-900 px-4 py-2.5 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
