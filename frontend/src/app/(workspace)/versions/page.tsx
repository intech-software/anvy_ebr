import type { Metadata } from "next";
import { version } from "../../../../package.json";

export const metadata: Metadata = {
  title: "Quản lý phiên bản | Anvy EBR",
};

const details = [
  ["Tên ứng dụng", "Hồ sơ lô điện tử Anvy (Anvy EBR)"],
  ["Phiên bản hiện tại", version],
  ["Đơn vị sở hữu", "Chưa cập nhật"],
  ["Người phát triển", "Chưa cập nhật"],
];

const headings = [
  "Mã phiên bản",
  "Ngày",
  "Nội dung",
  "Người thay đổi",
  "Người xem xét",
  "Người phê duyệt",
];

export default function VersionsPage() {
  return (
    <section className="m-2 space-y-6 rounded-lg bg-white p-4 shadow-sm">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý phiên bản</h1>
        <p className="mt-1 text-sm text-gray-600">
          Thông tin ứng dụng và các bên phụ trách phiên bản.
        </p>
      </div>

      <dl className="grid gap-6 rounded-lg border border-gray-200 p-4 text-sm sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-gray-600">{label}</dt>
            <dd className="mt-1 font-medium text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="rounded-lg border border-gray-200 p-4">
        <h2 id="version-history" className="mb-4 font-semibold">
          Danh sách phiên bản
        </h2>
        <div
          role="region"
          aria-labelledby="version-history"
          tabIndex={0}
          className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <table aria-labelledby="version-history" className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                {headings.map((heading) => (
                  <th key={heading} scope="col" className="whitespace-nowrap px-3 py-2 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody />
          </table>
        </div>
      </section>
    </section>
  );
}
