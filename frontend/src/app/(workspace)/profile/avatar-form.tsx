"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";
import type { SessionUser } from "@/lib/auth";
import { uploadAvatar, type AvatarFormState } from "./avatar-action";
import { avatarSizeError, maxAvatarBytes, maxAvatarMegabytes } from "./avatar-options";

export function AvatarForm({ user }: { user: SessionUser }) {
  const [fileError, setFileError] = useState("");
  const [state, submit, pending] = useActionState<AvatarFormState, FormData>(
    uploadAvatar,
    { status: "idle", message: "" },
  );
  const message = fileError || state.message;
  const hasError = Boolean(fileError) || state.status === "error";

  return (
    <form action={submit} className="flex flex-col items-center">
      <label className="relative block">
        <UserAvatar user={user} className="size-28 text-3xl" />
        <input
          type="file"
          name="avatar"
          aria-label="Đổi ảnh đại diện"
          aria-describedby="avatar-formats"
          accept="image/jpeg,image/png,image/webp"
          disabled={pending}
          className="peer sr-only"
          onChange={({ currentTarget }) => {
            const file = currentTarget.files?.[0];
            if (!file) return;
            if (file.size > maxAvatarBytes) {
              setFileError(avatarSizeError);
              currentTarget.value = "";
              return;
            }
            setFileError("");
            currentTarget.form?.requestSubmit();
          }}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 grid size-8 cursor-pointer place-items-center rounded-full bg-blue-600 text-white hover:bg-blue-700 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600 peer-disabled:cursor-wait peer-disabled:opacity-60"
        >
          <Pencil size={15} />
        </span>
      </label>
      <p id="avatar-formats" className="mt-2 text-xs text-gray-600">
        JPG, PNG, WebP · Tối đa {maxAvatarMegabytes} MB
      </p>
      {pending ? (
        <p role="status" className="mt-2 text-sm text-gray-600">Đang lưu ảnh đại diện…</p>
      ) : message && (
        <p role={hasError ? "alert" : "status"} className={`mt-2 text-sm ${hasError ? "text-red-700" : "text-green-700"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
