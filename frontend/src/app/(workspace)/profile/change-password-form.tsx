"use client";

import { Eye, EyeClosed } from "lucide-react";
import { useActionState, useState } from "react";
import { changePassword, type PasswordFormState } from "./actions";

const fields = [
  {
    id: "currentPassword",
    label: "Mật khẩu hiện tại",
    visibilityLabel: "mật khẩu hiện tại",
    autoComplete: "current-password",
    minLength: 6,
  },
  {
    id: "newPassword",
    label: "Mật khẩu mới",
    visibilityLabel: "mật khẩu mới",
    autoComplete: "new-password",
    minLength: 8,
  },
  {
    id: "confirmNewPassword",
    label: "Xác nhận mật khẩu mới",
    visibilityLabel: "mật khẩu xác nhận",
    autoComplete: "new-password",
    minLength: 8,
  },
] as const;

type PasswordField = (typeof fields)[number]["id"];

export function ChangePasswordForm() {
  const [state, submit, pending] = useActionState<PasswordFormState, FormData>(
    changePassword,
    { status: "idle", message: "" },
  );
  const [visibleFields, setVisibleFields] = useState<
    Partial<Record<PasswordField, boolean>>
  >({});

  return (
    <form action={submit} onSubmit={() => setVisibleFields({})} className="space-y-4">
      {fields.map(({ id, label, visibilityLabel, autoComplete, minLength }) => {
        const visible = visibleFields[id];

        return (
          <div key={id}>
            <label htmlFor={id} className="mb-1 block text-sm font-medium">
              {label}
            </label>
            <div className="relative">
              <input
                id={id}
                name={id}
                type={visible ? "text" : "password"}
                autoComplete={autoComplete}
                minLength={minLength}
                maxLength={50}
                required
                className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-11 text-sm focus-visible:outline-2 focus-visible:outline-blue-600"
              />
              <button
                type="button"
                aria-label={`${visible ? "Ẩn" : "Hiện"} ${visibilityLabel}`}
                aria-controls={id}
                onClick={() =>
                  setVisibleFields((previous) => ({ ...previous, [id]: !previous[id] }))
                }
                className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-gray-600 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-blue-600"
              >
                {visible ? <EyeClosed size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        );
      })}

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
