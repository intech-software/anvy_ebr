"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { fetchItems, itemSchema } from "@/lib/items";

export async function saveItem(id: number | null, formData: FormData) {
  const response = await fetchItems(id === null ? "" : `/${id}`, {
    method: id === null ? "POST" : "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      item_code: formData.get("item_code"),
      item_name: formData.get("item_name"),
      unit: formData.get("unit"),
    }),
  });

  if (response?.status === 400) return "Vui lòng kiểm tra mã, tên và đơn vị tính.";
  if (response?.status === 404) return "Hàng hoá này không còn tồn tại.";
  if (response?.status === 409) return "Mã hàng đã tồn tại.";
  if (!response?.ok) return "Không thể lưu hàng hoá. Vui lòng thử lại.";

  const result = itemSchema.safeParse(await response.json().catch(() => null));
  if (!result.success) return "Không thể xác nhận hàng hoá đã lưu.";
  if (id === null) {
    refresh();
    return "";
  }
  redirect(`/items?item=${result.data.id}`);
}
