import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, RotateCcw, Search } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fetchBackend, sessionCookie } from "@/lib/auth";

export const metadata: Metadata = { title: "Lịch sử thay đổi | Anvy EBR" };

const actions = { CREATE: "Tạo", UPDATE: "Cập nhật", DELETE: "Xóa" } as const;
const resultSchema = z.object({
  data: z.array(z.object({
    id: z.string(),
    created_at: z.string(),
    actor_id: z.number().int(),
    actor_name: z.string().nullable(),
    entity_type: z.string(),
    entity_id: z.string(),
    entity_name: z.string().nullable(),
    action: z.enum(["CREATE", "UPDATE", "DELETE"]),
    old_values: z.record(z.string(), z.unknown()).nullable(),
    new_values: z.record(z.string(), z.unknown()).nullable(),
    reason: z.string().nullable(),
  })),
  meta: z.object({ page: z.number(), total: z.number(), total_pages: z.number() }),
  scope: z.enum(["all", "self"]),
});
const columns = [
  "Thời gian", "Người thao tác", "Bảng", "Đối tượng", "Thao tác",
  "Giá trị cũ", "Giá trị mới", "Lý do",
];
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Ho_Chi_Minh",
});
const input = "min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-blue-600";
const button = "inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50";

function JsonValue({ value }: { value: Record<string, unknown> | null }) {
  if (!value) return <span className="text-gray-500">—</span>;
  return (
    <pre className="max-h-40 min-w-40 max-w-80 overflow-auto whitespace-pre-wrap wrap-anywhere rounded bg-slate-50 p-2 font-mono text-xs text-slate-700">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) redirect("/login");
  const params = await searchParams;
  const keyword = typeof params.keyword === "string" ? params.keyword.trim().slice(0, 191) : "";
  const entity = typeof params.entity_type === "string" ? params.entity_type.trim().slice(0, 100) : "";
  const action = typeof params.action === "string" && Object.hasOwn(actions, params.action) ? params.action : "";
  const rawPage = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 107_374_182 ? rawPage : 1;
  const query = new URLSearchParams();
  if (keyword) query.set("keyword", keyword);
  if (entity) query.set("entity_type", entity);
  if (action) query.set("action", action);
  function url(nextPage: number) {
    const target = new URLSearchParams(query);
    target.set("page", String(nextPage));
    return `/audit-logs?${target}`;
  }

  const response = await fetchBackend(url(page), {
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => null);
  if (response?.status === 401) redirect("/login");
  const result = resultSchema.safeParse(response?.ok ? await response.json().catch(() => null) : null);
  const history = result.data;

  return (
    <section className="m-2 flex min-h-[calc(100%_-_1rem)] min-w-0 flex-col rounded-lg bg-white shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-4">
        <h1 className="text-xl font-semibold">Lịch sử thay đổi</h1>
        {history && (
          <p className="text-sm text-gray-600">{history.scope === "all" ? "Toàn bộ thao tác" : "Thao tác của tôi"}</p>
        )}
      </header>
      <form action="/audit-logs" key={JSON.stringify([keyword, entity, action])} className="grid gap-3 border-b border-gray-200 p-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_200px_180px_auto]">
        <input type="search" name="keyword" defaultValue={keyword} maxLength={191} className={input}
          placeholder="Đối tượng, người thao tác hoặc lý do" aria-label="Tìm lịch sử thay đổi" />
        <input name="entity_type" defaultValue={entity} maxLength={100} className={input}
          placeholder="Tên bảng, ví dụ items" aria-label="Lọc theo tên bảng" />
        <select name="action" defaultValue={action} className={input} aria-label="Lọc theo thao tác">
          <option value="">Tất cả thao tác</option>
          {Object.entries(actions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
            <Search size={16} aria-hidden="true" /> Lọc
          </button>
          <Link href="/audit-logs" className={button} aria-label="Xóa bộ lọc" title="Xóa bộ lọc">
            <RotateCcw size={16} aria-hidden="true" />
          </Link>
        </div>
      </form>

      <div role="region" aria-label="Bảng lịch sử thay đổi" tabIndex={0} className="min-w-0 flex-1 overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="bg-gray-50">
            <tr>{columns.map((column) => <th key={column} scope="col" className="px-3 py-3 font-medium">{column}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history?.data.map((log) => (
              <tr key={log.id} className="align-top">
                <td className="whitespace-nowrap px-3 py-3"><time dateTime={log.created_at}>{dateFormatter.format(new Date(log.created_at))}</time></td>
                <td className="px-3 py-3">
                  <span className="block">{log.actor_name || "Hệ thống"}</span>
                  <span className="block text-xs text-gray-500">ID {log.actor_id}</span>
                </td>
                <td className="px-3 py-3 font-mono text-xs">{log.entity_type}</td>
                <td className="max-w-52 wrap-break-word px-3 py-3">
                  <span className="block">{log.entity_name || "—"}</span>
                  <span className="block text-xs text-gray-500">ID {log.entity_id}</span>
                </td>
                <td className="px-3 py-3"><span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-1 text-xs">{actions[log.action]}</span></td>
                <td className="px-3 py-3"><JsonValue value={log.old_values} /></td>
                <td className="px-3 py-3"><JsonValue value={log.new_values} /></td>
                <td className="max-w-52 wrap-break-word px-3 py-3">{log.reason || "—"}</td>
              </tr>
            ))}
            {!history?.data.length && (
              <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-gray-600" role={history ? undefined : "alert"}>
                {history ? "Chưa có lịch sử thay đổi phù hợp." : "Không thể tải lịch sử thay đổi. Vui lòng thử lại."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
      {history && (page > 1 || history.meta.total_pages > 1) && (
        <nav aria-label="Phân trang lịch sử thay đổi" className="flex items-center justify-end gap-3 border-t border-gray-200 px-4 py-3 text-sm">
          {page > 1 && <Link href={url(page - 1)} className={button}><ChevronLeft size={16} aria-hidden="true" /> Trước</Link>}
          <span>Trang {page}/{Math.max(1, history.meta.total_pages)}</span>
          {page < history.meta.total_pages && <Link href={url(page + 1)} className={button}>Sau <ChevronRight size={16} aria-hidden="true" /></Link>}
        </nav>
      )}
    </section>
  );
}
