"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ItemForm } from "./item-form";

export function AddItemDialog({ initialOpen, closeHref }: { initialOpen: boolean; closeHref: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const [created, setCreated] = useState(false);

  function changeOpen(next: boolean) {
    setOpen(next);
    if (next) setCreated(false);
    if (initialOpen && !next) router.replace(closeHref, { scroll: false });
  }

  return (
    <Dialog.Root open={open} onOpenChange={changeOpen}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {created && <span role="status" className="text-sm text-green-700">Đã thêm hàng hoá.</span>}
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus aria-hidden="true" size={16} />
            Thêm hàng hoá
          </button>
        </Dialog.Trigger>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/45" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-[640px] -translate-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <Dialog.Title className="mb-4 px-8 text-center text-lg font-semibold">
            Thêm hàng hoá
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Nhập mã hàng, tên hàng và đơn vị tính để thêm hàng hoá vào danh mục.
          </Dialog.Description>
          <ItemForm
            onCancel={() => changeOpen(false)}
            onCreated={() => {
              changeOpen(false);
              setCreated(true);
            }}
          />
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Đóng hộp thoại"
              className="absolute top-3 right-3 grid size-8 place-items-center rounded-md text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
