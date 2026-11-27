"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAuth, sessionCookie } from "@/lib/auth";
import { avatarSizeError, maxAvatarBytes } from "./avatar-options";

export type AvatarFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export async function uploadAvatar(
  _previous: AvatarFormState,
  formData: FormData,
): Promise<AvatarFormState> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login");

  const file = formData.get("avatar");
  if (!(file instanceof File) || !file.size) {
    return { status: "error", message: "Vui lòng chọn ảnh đại diện." };
  }
  if (file.size > maxAvatarBytes) {
    return { status: "error", message: avatarSizeError };
  }

  const payload = new FormData();
  payload.set("avatar", file);

  const response = await fetchAuth("avatar", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: payload,
    signal: AbortSignal.timeout(35000),
  }).catch(() => null);

  switch (response?.status) {
    case 204:
      refresh();
      return { status: "success", message: "Đã cập nhật ảnh đại diện." };
    case 401:
      redirect("/login");
    case 400:
      return { status: "error", message: "Vui lòng chọn ảnh JPG, PNG hoặc WebP hợp lệ." };
    case 413:
      return { status: "error", message: avatarSizeError };
    case 409:
      return { status: "error", message: "Ảnh đại diện vừa thay đổi. Vui lòng thử lại." };
    default:
      return { status: "error", message: "Không thể lưu ảnh đại diện. Vui lòng thử lại." };
  }
}
