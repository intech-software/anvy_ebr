"use client";

import { useActionState } from "react";
import { changePassword, type PasswordFormState } from "./actions";

const fields = [
  {
    id: "currentPassword",
    label: "Mật khẩu hiện tại",
    autoComplete: "current-password",
    minLength: 6,
  },
  { id: "newPassword", label: "Mật khẩu mới", autoComplete: "new-password", minLength: 8 },
  {
    id: "confirmNewPassword",
    label: "Xác nhận mật khẩu mới",
    autoComplete: "new-password",
    minLength: 8,
  },
];

export function ChangePasswordForm() {
  const [state, submit, pending] = useActionState<PasswordFormState, FormData>(
    changePassword,
    { status: "idle", message: "" },
  );

  return (
    <form action={submit} className="space-y-4">
      {fields.map(({ id, label, autoComplete, minLength }) => (
        <div key={id}>
          <label htmlFor={id} className="mb-1 block text-sm font-medium">
            {label}
          </label>
          <input
            id={id}
            name={id}
            type="password"
            autoComplete={autoComplete}
            minLength={minLength}
            maxLength={50}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-blue-600"
          />
        </div>
      ))}

      {state.status !== "idle" && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={state.status === "error" ? "text-sm text-red-700" : "text-sm text-green-700"}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Đang đổi mật khẩu…" : "Đổi mật khẩu"}
      </button>
    </form>
  );
}
