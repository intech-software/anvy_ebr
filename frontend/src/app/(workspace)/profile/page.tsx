import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ChangePasswordForm } from "./change-password-form";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | Anvy EBR",
};

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const displayName = user.name || user.username;
  const initials = user.name
    ? user.name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("")
    : user.username.slice(0, 2);
  const details = [
    ["Tên nhân sự", user.name],
    ["Mã nhân viên", user.username],
    ["Bộ phận", user.department],
    ["Chức vụ", user.position],
  ];

  return (
    <section className="m-2 rounded-xl bg-white p-3 shadow-sm sm:p-4">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">Hồ sơ cá nhân</h1>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col items-center rounded-lg border border-gray-200 px-4 py-6 text-center shadow-sm">
          <span
            aria-hidden="true"
            className="grid size-20 place-items-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-800"
          >
            {initials.toLocaleUpperCase("vi")}
          </span>
          <p className="mt-4 text-xl font-semibold text-gray-900">{displayName}</p>
          <p className="mt-1 text-sm text-gray-600">{user.department}</p>
        </div>

        <div className="min-w-0 space-y-4">
          <section className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="border-b border-gray-200 pb-3 text-lg font-semibold">
              Thông tin cá nhân
            </h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-gray-600">{label}</dt>
                  <dd className="mt-1 wrap-break-word font-medium">{value || "Chưa cập nhật"}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-lg border border-gray-200 p-4 shadow-sm">
            <h2 className="border-b border-gray-200 pb-3 text-lg font-semibold">
              Thay đổi mật khẩu
            </h2>
            <div className="mt-4 grid gap-5 xl:grid-cols-2">
              <ChangePasswordForm />
              <div className="text-sm text-gray-700">
                <p className="font-medium">Yêu cầu đối với mật khẩu mới</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Từ 8 đến 50 ký tự, tối đa 72 byte</li>
                  <li>Có ít nhất một chữ hoa (A–Z) và một chữ thường (a–z)</li>
                  <li>Có ít nhất một số (0–9)</li>
                  <li>Có ít nhất một ký tự đặc biệt, ví dụ !@#$%^&amp;*</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
