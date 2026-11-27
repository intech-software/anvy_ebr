"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Item } from "@/lib/items";
import { saveItem } from "./actions";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-blue-600";

export function ItemForm({ item, cancelHref }: { item?: Item; cancelHref: string }) {
  const [error, submit, pending] = useActionState(saveItem.bind(null, item?.id ?? null), "");
  const [code, setCode] = useState(item?.item_code ?? "");
  const [name, setName] = useState(item?.item_name ?? "");
  const [unit, setUnit] = useState(item?.unit ?? "");

  return (
    <form action={submit} className="max-w-2xl space-y-4 py-4">
      <div>
        <label htmlFor="catalog-item-code" className="mb-1 block text-sm font-medium">Mã hàng</label>
        <input
          id="catalog-item-code"
          className={inputClass}
          name="item_code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="off"
          maxLength={191}
          required
        />
      </div>
      <div>
        <label htmlFor="catalog-item-name" className="mb-1 block text-sm font-medium">Tên hàng</label>
        <textarea
          id="catalog-item-name"
          className={inputClass}
          name="item_name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={1000}
          rows={3}
          required
        />
      </div>
      <div>
        <label htmlFor="catalog-item-unit" className="mb-1 block text-sm font-medium">Đơn vị tính</label>
        <input
          id="catalog-item-unit"
          className={inputClass}
          name="unit"
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
          maxLength={191}
        />
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {pending ? "Đang lưu…" : "Lưu hàng hoá"}
        </button>
        <Link href={cancelHref} className="rounded-md border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">
          Huỷ
        </Link>
      </div>
    </form>
  );
}
