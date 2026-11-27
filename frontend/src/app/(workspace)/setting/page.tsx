import type { Metadata } from "next";
import { Building2, UsersRound } from "lucide-react";
import Link from "next/link";
import { DepartmentForm, UserForm } from "./forms";
import { fetchSettings, settingsSchema, type SettingsData } from "./settings-api";

export const metadata: Metadata = { title: "Cài đặt | Anvy EBR" };

const sections = [
  { key: "users", label: "Người dùng", description: "Tạo tài khoản và chọn phòng ban.", icon: UsersRound },
  { key: "departments", label: "Phòng ban", description: "Thêm phòng ban vào danh mục.", icon: Building2 },
] as const;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string | string[] }>;
}) {
  const [{ section }, response] = await Promise.all([searchParams, fetchSettings()]);
  const settings = settingsSchema.safeParse(
    response?.ok ? await response.json().catch(() => null) : null,
  );

  return (
    <section className="m-2 flex min-h-[calc(100%_-_1rem)] flex-col gap-3 rounded-lg bg-white p-3 shadow-sm">
      <header className="border-b border-gray-200 pb-3">
        <h1 className="text-xl font-semibold">Cài đặt</h1>
        <p className="mt-1 text-sm text-gray-600">Quản lý người dùng và phòng ban.</p>
      </header>

      {settings.success ? (
        <SettingsContent settings={settings.data} section={section} />
      ) : (
        <p role="alert" className="rounded-md border border-gray-200 p-4 text-sm text-gray-700">
          Không thể tải trang Cài đặt. Vui lòng thử lại.
        </p>
      )}
    </section>
  );
}

function SettingsContent({ settings, section }: { settings: SettingsData; section?: string | string[] }) {
  const active = section === "departments" ? "departments" : "users";

  return (
    <div className="grid flex-1 gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
      <nav aria-label="Các mục cài đặt" className="space-y-1 rounded-md border border-gray-200 bg-gray-50 p-2">
        {sections.map(({ key, label, description, icon: Icon }) => (
          <Link
            key={key}
            href={`/setting?section=${key}`}
            aria-current={active === key ? "page" : undefined}
            className={`flex items-start gap-3 rounded-md p-3 ${active === key ? "bg-white shadow-sm ring-1 ring-blue-100" : "hover:bg-white"}`}
          >
            <Icon aria-hidden="true" size={20} className={`mt-0.5 shrink-0 ${active === key ? "text-blue-600" : "text-gray-500"}`} />
            <span>
              <span className="block text-sm font-semibold">{label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-gray-600">{description}</span>
            </span>
          </Link>
        ))}
      </nav>
      <section className="min-w-0 rounded-md border border-gray-200 p-4 sm:p-5" aria-labelledby="setting-section-title">
        <h2 id="setting-section-title" className="mb-4 border-b border-gray-200 pb-3 text-lg font-semibold">
          {active === "users" ? "Thêm người dùng" : "Thêm phòng ban"}
        </h2>
        {active === "users" ? (
          <>
            {!settings.departments.length && (
              <p role="status" className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                Cần có ít nhất một phòng ban trước khi thêm người dùng.
              </p>
            )}
            <UserForm departments={settings.departments} />
          </>
        ) : (
          <>
            <DepartmentForm />
            <h3 className="mt-8 border-b border-gray-200 pb-2 font-semibold">Danh sách phòng ban</h3>
            {settings.departments.length ? (
              <ul className="divide-y divide-gray-100">
                {settings.departments.map(({ name, description }) => (
                  <li key={name} className="py-2.5">
                    <p className="wrap-break-word text-sm font-medium">{name}</p>
                    {description && <p className="wrap-break-word text-xs text-gray-600">{description}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-sm text-gray-600">Chưa có phòng ban.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
