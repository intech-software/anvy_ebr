"use client";

import { Activity, Clock3, RefreshCw, Search, Unplug } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

const statuses = {
  connected: { label: "Đang kết nối", badge: "bg-emerald-50 text-emerald-800", icon: Activity },
  reconnecting: { label: "Chờ kết nối lại", badge: "bg-amber-50 text-amber-800", icon: Clock3 },
  ended: { label: "Đã kết thúc", badge: "bg-slate-100 text-slate-700", icon: Unplug },
} as const;

type Status = keyof typeof statuses;
type Connection = {
  id: number;
  user: { username: string; name: string | null };
  connected_at: string;
  last_seen_at: string;
  disconnected_at: string | null;
  ended_at: string | null;
  connection_count: number;
  ip_address: string | null;
  user_agent: string | null;
  status: Status;
};
type History = {
  data: Connection[];
  summary: Record<Status, number>;
  hasMore: boolean;
  asOf: string;
  scope: "all" | "self";
};

const columns = [
  "Phiên / Người dùng", "Mở EBR lúc", "Lần cuối kết nối", "Ngắt / Kết thúc lúc",
  "Thời lượng phiên", "Trạng thái", "Số lần kết nối", "Địa chỉ IP",
];
const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short", timeStyle: "medium", timeZone: "Asia/Ho_Chi_Minh",
});
const formatDate = (date: string | null) => date ? dateFormatter.format(new Date(date)) : "—";
const button = "inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-40";
const input = "rounded-md border border-gray-300 px-2 py-1.5 text-sm";

function duration(session: Connection, now: string) {
  const end = session.ended_at ?? (session.status === "connected" ? now : session.disconnected_at ?? session.last_seen_at);
  const seconds = Math.max(0, Math.floor((Date.parse(end) - Date.parse(session.connected_at)) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours} giờ ${minutes} phút` : minutes ? `${minutes} phút` : `${seconds} giây`;
}

async function readHistory(url: string): Promise<History> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load connection history");
  return response.json();
}

export function ConnectionHistory() {
  const [filter, setFilter] = useState<{ page: number; from: string; to: string; q: string; status?: Status }>({
    page: 1, from: "", to: "", q: "",
  });
  const invalidRange = Boolean(filter.from && filter.to && filter.from > filter.to);
  const query = new URLSearchParams({ page: String(filter.page) });
  for (const key of ["q", "from", "to", "status"] as const) {
    const value = filter[key];
    if (value) query.set(key, value);
  }
  const { data, error, isLoading, isValidating, mutate } = useSWR<History>(
    invalidRange ? null : `/api/connection-history?${query}`, readHistory,
    { refreshInterval: 15_000 },
  );
  const update = (next: Partial<typeof filter>) =>
    setFilter((current) => ({ ...current, page: 1, ...next }));

  return (
    <section className="m-2 flex min-h-[calc(100%_-_1rem)] flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-xl font-semibold">Lịch sử kết nối</h1>
        {data && <p className="text-sm text-gray-600">{data.scope === "all" ? "Toàn bộ người dùng" : "Phiên của tôi"}</p>}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {(Object.keys(statuses) as Status[]).map((status) => {
          const { label, badge, icon: Icon } = statuses[status];
          return (
            <button
              key={status}
              type="button"
              aria-label={label}
              aria-pressed={filter.status === status}
              onClick={() => update({ status: filter.status === status ? undefined : status })}
              className={`flex min-w-0 items-center justify-between gap-2 rounded-lg border px-2 py-3 text-left shadow-sm sm:px-5 ${filter.status === status ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-blue-50"}`}
            >
              <span className="min-w-0 text-xs text-gray-600 sm:text-sm">
                {label}
                <span className="mt-1 block text-2xl font-semibold text-gray-900">
                  {data?.summary[status].toLocaleString("vi-VN") ?? "—"}
                </span>
              </span>
              <span className={`hidden rounded-lg p-3 sm:block ${badge}`}><Icon aria-hidden="true" size={20} /></span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-1 flex-col rounded-lg border border-gray-200 bg-white shadow-sm" aria-busy={isLoading}>
        <form
          className="flex flex-wrap items-end justify-end gap-2 border-b border-gray-200 p-2"
          onSubmit={(event) => {
            event.preventDefault();
            update({ q: String(new FormData(event.currentTarget).get("q") ?? "").trim() });
          }}
        >
          <label className="flex flex-1 flex-col gap-1 text-xs text-gray-600">
            Tìm theo tài khoản, tên hoặc IP
            <input name="q" type="search" maxLength={100} className={input} />
          </label>
          <button type="submit" className={button}><Search size={16} aria-hidden="true" /> Tìm</button>
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            Từ ngày
            <input type="date" value={filter.from} onChange={(event) => update({ from: event.target.value })} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            Đến ngày
            <input type="date" value={filter.to} onChange={(event) => update({ to: event.target.value })} className={input} />
          </label>
          <button type="button" className={button} disabled={isValidating || invalidRange} onClick={() => void mutate().catch(() => null)}>
            <RefreshCw size={16} aria-hidden="true" /> Làm mới
          </button>
        </form>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Bảng lịch sử kết nối">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-gray-50">
              <tr>{columns.map((column) => <th key={column} scope="col" className="px-3 py-3 font-medium">{column}</th>)}</tr>
            </thead>
            <tbody>
              {data?.data.map((session) => (
                <tr key={session.id} className="border-t border-gray-100">
                  <td className="px-3 py-3" title={session.user_agent ?? undefined}>
                    <span className="font-medium">{session.user.name || session.user.username}</span>
                    <span className="block text-xs text-gray-600">#{session.id} · {session.user.username}</span>
                  </td>
                  <td className="px-3 py-3 text-xs">{formatDate(session.connected_at)}</td>
                  <td className="px-3 py-3 text-xs">{formatDate(session.last_seen_at)}</td>
                  <td className="px-3 py-3 text-xs">{formatDate(session.ended_at ?? session.disconnected_at)}</td>
                  <td className="px-3 py-3 text-xs">{duration(session, data.asOf)}</td>
                  <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs ${statuses[session.status].badge}`}>{statuses[session.status].label}</span></td>
                  <td className="px-3 py-3">{session.connection_count}</td>
                  <td className="px-3 py-3 text-xs">{session.ip_address ?? "—"}</td>
                </tr>
              ))}
              {!data?.data.length && (
                <tr><td colSpan={columns.length} className="px-3 py-12 text-center text-sm text-gray-600" role={invalidRange || error ? "alert" : undefined}>
                  {invalidRange ? "Từ ngày phải trước hoặc bằng đến ngày." : error ? "Không thể tải lịch sử kết nối." : isLoading ? "Đang tải lịch sử kết nối…" : "Chưa có phiên kết nối phù hợp."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {(filter.page > 1 || data?.hasMore) && (
          <nav aria-label="Phân trang lịch sử kết nối" className="mt-auto flex items-center justify-end gap-2 border-t border-gray-200 p-2">
            <button type="button" className={button} disabled={filter.page === 1} onClick={() => update({ page: filter.page - 1 })}>Trang trước</button>
            <span className="text-sm text-gray-600">Trang {filter.page}</span>
            <button type="button" className={button} disabled={!data?.hasMore} onClick={() => update({ page: filter.page + 1 })}>Trang sau</button>
          </nav>
        )}
      </div>
    </section>
  );
}
