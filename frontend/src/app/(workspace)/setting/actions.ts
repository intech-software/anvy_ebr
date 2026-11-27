"use server";

import { refresh } from "next/cache";
import { fetchSettings } from "./settings-api";

export type SettingsFormState = { status: "idle" | "error" | "success"; message: string };

export async function addDepartment(_previous: SettingsFormState, data: FormData): Promise<SettingsFormState> {
  const response = await fetchSettings("/departments", {
    name: data.get("name"),
    description: data.get("description"),
  });
  if (response?.ok) {
    refresh();
    return { status: "success", message: "Đã thêm phòng ban." };
  }
  if (response?.status === 409) return { status: "error", message: "Tên phòng ban đã tồn tại." };
  if (response?.status === 400) return { status: "error", message: "Vui lòng kiểm tra tên và mô tả phòng ban." };
  return { status: "error", message: "Không thể thêm phòng ban. Vui lòng thử lại." };
}

export async function addUser(_previous: SettingsFormState, data: FormData): Promise<SettingsFormState> {
  const password = data.get("password");
  if (typeof password !== "string" || password !== data.get("confirmation")) {
    return { status: "error", message: "Mật khẩu xác nhận không khớp." };
  }

  const response = await fetchSettings("/users", {
    username: data.get("username"),
    name: data.get("name"),
    email: data.get("email"),
    position: data.get("position"),
    department: data.get("department"),
    password,
  });
  if (response?.ok) return { status: "success", message: "Đã tạo tài khoản người dùng." };
  if (response?.status === 409) return { status: "error", message: "Tên đăng nhập hoặc email đã tồn tại." };
  if (response?.status === 400) return { status: "error", message: "Vui lòng kiểm tra thông tin người dùng, mật khẩu và phòng ban." };
  return { status: "error", message: "Không thể thêm người dùng. Vui lòng thử lại." };
}
