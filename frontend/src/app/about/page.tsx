import type { Metadata } from "next";
import Image from "next/image";
import { version } from "../../../package.json";
import { AboutBackButton } from "./back-button";

export const metadata: Metadata = {
  title: "About | Anvy EBR",
};

function aboutUrl(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export default function AboutPage() {
  const feedbackUrl = aboutUrl(process.env.ABOUT_FEEDBACK_URL);
  const developer = process.env.ABOUT_DEVELOPER?.trim();
  const owner = process.env.ABOUT_COPYRIGHT_OWNER?.trim();
  const ageRating = process.env.ABOUT_AGE_RATING?.trim();
  const links = [
    { label: "Terms", href: aboutUrl(process.env.ABOUT_TERMS_URL) },
    { label: "Privacy", href: aboutUrl(process.env.ABOUT_PRIVACY_URL) },
    {
      label: "api reference",
      href: aboutUrl(process.env.ABOUT_API_REFERENCE_URL),
      newTab: true,
    },
  ];
  const feedbackClass =
    "w-36 rounded-md border px-4 py-2 text-center text-sm font-medium";

  return (
    <main className="min-h-dvh bg-white px-4 py-10 text-gray-900 md:py-12">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-3xl flex-col md:min-h-[calc(100dvh-6rem)]">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <Image
            src="/brand/logo_anvy.svg"
            alt="Logo Anvy"
            width={470}
            height={568}
            className="h-14 w-20 shrink-0 object-contain md:h-[68px] md:w-28"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">
              Hồ sơ lô Anvy
            </h1>
            <p className="mt-1 text-sm text-gray-600">Phiên bản {version}</p>
          </div>
          {ageRating && (
            <span className="flex h-11 min-w-16 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-4 font-semibold text-gray-700 md:h-12 md:min-w-20">
              {ageRating}
            </span>
          )}
        </header>

        <div className="mt-8 space-y-4 leading-7 text-gray-700">
          <p>
            Anvy EBR là ứng dụng hồ sơ lô điện tử của Anvy, dùng để theo dõi hồ sơ
            lô bán thành phẩm và thành phẩm.
          </p>
          <dl className="space-y-2">
            <div>
              <dt className="inline font-medium">Người phát triển</dt>
              <dd className="inline"> · {developer || "Chưa cập nhật"}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Đơn vị sở hữu bản quyền</dt>
              <dd className="inline"> · {owner || "Chưa cập nhật"}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-auto flex flex-wrap justify-center gap-3 pb-20 pt-8">
          {feedbackUrl ? (
            <a
              href={feedbackUrl}
              className={`${feedbackClass} border-green-700 text-green-800 hover:bg-green-50`}
            >
              Góp ý
            </a>
          ) : (
            <button type="button" disabled className={`${feedbackClass} border-gray-300 text-gray-500`}>
              Góp ý
            </button>
          )}
          <AboutBackButton />
        </div>

        <footer>
          <ul className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs text-gray-600">
            {links.map(({ label, href, newTab }) => (
              <li key={label} className="flex items-center gap-2">
                {href ? (
                  <a
                    href={href}
                    target={newTab ? "_blank" : undefined}
                    rel={newTab ? "noopener noreferrer" : undefined}
                    className="hover:text-green-800 hover:underline"
                  >
                    {label}
                  </a>
                ) : (
                  <span role="link" aria-disabled="true">{label}</span>
                )}
                <span aria-hidden="true">·</span>
              </li>
            ))}
            <li>Version {version}</li>
          </ul>
        </footer>
      </div>
    </main>
  );
}
