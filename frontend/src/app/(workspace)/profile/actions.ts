"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchAuth, sessionCookie } from "@/lib/auth";

export type PasswordFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export async function changePassword(
  _previous: PasswordFormState,
  formData: FormData,
): Promise<PasswordFormState> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login");

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmation = formData.get("confirmNewPassword");
  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return { status: "error", message: "Vui lòng điền đủ thông tin mật khẩu." };
  }
  if (newPassword !== confirmation) {
    return { status: "error", message: "Mật khẩu xác nhận không khớp." };
  }
  if (newPassword === currentPassword) {
    return { status: "error", message: "Mật khẩu mới phải khác mật khẩu hiện tại." };
  }

  const response = await fetchAuth("password", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  }).catch(() => null);

  switch (response?.status) {
    case 204:
      return { status: "success", message: "Đổi mật khẩu thành công." };
    case 400:
      return {
        status: "error",
        message: "Vui lòng kiểm tra độ dài và các yêu cầu đối với mật khẩu mới.",
      };
    case 401:
      redirect("/login");
    case 409:
      return { status: "error", message: "Mật khẩu vừa được thay đổi. Vui lòng thử lại." };
    case 422:
      return { status: "error", message: "Mật khẩu hiện tại không đúng." };
    default:
      return { status: "error", message: "Không thể đổi mật khẩu. Vui lòng thử lại." };
  }
}
