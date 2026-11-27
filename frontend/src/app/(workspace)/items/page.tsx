import type { Metadata } from "next";
import { ChevronRight, Plus, SquarePen, X } from "lucide-react";
import Link from "next/link";
import { fetchItems, itemListSchema, itemSchema } from "@/lib/items";
import { ItemForm } from "./item-form";

export const metadata: Metadata = { title: "Danh mục hàng hoá | Anvy EBR" };

const buttonClass =
  "inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50";

export default async function ItemsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 42_949_672 ? rawPage : 1;
  const rawId = typeof params.item === "string" ? Number(params.item) : 0;
  const creating = params.view === "new";
  const selectedId = !creating && Number.isInteger(rawId) && rawId > 0 && rawId <= 2_147_483_647
    ? rawId
    : null;
  const showDetails = creating || selectedId !== null;
  const editing = params.view === "edit";
  function href({ id, view, listPage = page }: { id?: number; view?: string; listPage?: number } = {}) {
    const query = new URLSearchParams();
    if (listPage > 1) query.set("page", String(listPage));
    if (id !== undefined) query.set("item", String(id));
    if (view) query.set("view", view);
    return query.size ? `/items?${query}` : "/items";
  }

  const [listResponse, itemResponse] = await Promise.all([
    fetchItems(page === 1 ? "" : `?page=${page}`),
    selectedId === null ? null : fetchItems(`/${selectedId}`),
  ]);
  const list = itemListSchema.safeParse(
    listResponse?.ok ? await listResponse.json().catch(() => null) : null,
  );
  const selected = itemSchema.safeParse(
    itemResponse?.ok ? await itemResponse.json().catch(() => null) : null,
  ).data;
  const closeHref = href();

  return (
    <section
      className={`m-2 grid min-h-[calc(100%_-_1rem)] content-start overflow-clip rounded-lg bg-white shadow-sm ${showDetails ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]" : ""}`}
    >
      <div className={`min-w-0 ${showDetails ? "hidden border-gray-200 lg:block lg:border-r" : ""}`}>
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-white p-2">
          <h1 className="flex items-center gap-2 font-medium">
            <ChevronRight aria-hidden="true" size={16} />
            Danh mục hàng hoá
          </h1>
          <Link href={href({ view: "new" })} className={buttonClass}>
            <Plus aria-hidden="true" size={16} />
            Thêm hàng hoá
          </Link>
        </div>

        {!list.success ? (
          <p role="alert" className="p-4 text-sm text-red-700">Không thể tải danh mục hàng hoá.</p>
        ) : (
          <>
            {list.data.items.length ? (
              <ul className="px-2">
                {list.data.items.map((item) => (
                  <li key={item.id} className="border-b border-gray-200">
                    <Link
                      href={href({ id: item.id })}
                      aria-current={item.id === selectedId ? "true" : undefined}
                      className={`flex min-h-[100px] items-center gap-4 px-3 py-4 ${item.id === selectedId ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">{item.item_name}</p>
                        <p className="mt-1 truncate text-sm text-gray-600">{item.item_code}</p>
                      </div>
                      <span className="max-w-1/3 shrink-0 truncate text-sm text-gray-700">
                        {item.unit ?? "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-4 text-center text-sm text-gray-600">Chưa có hàng hoá nào.</p>
            )}
            {(page > 1 || list.data.hasMore) && (
              <nav aria-label="Phân trang hàng hoá" className="flex items-center justify-end gap-3 p-2">
                {page > 1 && <Link href={href({ listPage: page - 1 })} className={buttonClass}>Trang trước</Link>}
                <span className="text-sm text-gray-600">Trang {page}</span>
                {list.data.hasMore && <Link href={href({ listPage: page + 1 })} className={buttonClass}>Trang sau</Link>}
              </nav>
            )}
          </>
        )}
      </div>

      {showDetails && (
        <section aria-label="Chi tiết hàng hoá" className="min-w-0 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
            <h2 className="wrap-break-word font-semibold">
              {creating ? "Thêm hàng hoá" : editing ? "Sửa hàng hoá" : selected?.item_code ?? "Chi tiết hàng hoá"}
            </h2>
            <div className="flex gap-2">
              {selected && !editing && (
                <Link href={href({ id: selected.id, view: "edit" })} className={buttonClass}>
                  <SquarePen aria-hidden="true" size={16} /> Sửa
                </Link>
              )}
              <Link href={closeHref} aria-label="Đóng chi tiết" className={buttonClass}>
                <X aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>

          {creating ? (
            <ItemForm key="new" cancelHref={closeHref} />
          ) : selected ? (
            editing ? (
              <ItemForm key={selected.id} item={selected} cancelHref={href({ id: selected.id })} />
            ) : (
              <dl className="mt-4 grid gap-4 rounded-lg border border-gray-200 p-4 text-sm sm:grid-cols-2">
                {[
                  ["Mã hàng", selected.item_code],
                  ["Tên hàng", selected.item_name],
                  ["Đơn vị tính", selected.unit ?? "—"],
                  ["ID", selected.id],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-gray-600">{label}</dt>
                    <dd className="mt-1 wrap-break-word font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            )
          ) : (
            <p role="alert" className="py-4 text-sm text-gray-600">
              {itemResponse?.status === 404 ? "Hàng hoá này không còn tồn tại." : "Không thể tải chi tiết hàng hoá."}
            </p>
          )}
        </section>
      )}
    </section>
  );
}
