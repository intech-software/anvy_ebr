import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { version } from "../../../package.json";

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
  const links = [
    { label: "Terms", href: aboutUrl(process.env.ABOUT_TERMS_URL) },
    { label: "Privacy", href: aboutUrl(process.env.ABOUT_PRIVACY_URL) },
    {
      label: "API reference",
      href: aboutUrl(process.env.ABOUT_API_REFERENCE_URL),
      newTab: true,
    },
  ];

  return (
    <main className="min-h-dvh bg-white px-4 py-10 text-gray-900 md:py-12">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-3xl flex-col md:min-h-[calc(100dvh-6rem)]">
        <header className="flex items-center gap-4 border-b border-gray-200 pb-5">
          <Image
            src="/brand/logo_anvy.svg"
            alt="Logo Anvy"
            width={470}
            height={568}
            className="h-auto w-16 shrink-0 md:w-20"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-950 md:text-3xl">
              Hồ sơ lô Anvy
            </h1>
            <p className="mt-1 text-sm text-gray-600">Phiên bản {version}</p>
          </div>
        </header>

        <p className="mt-8 leading-7 text-gray-700">
          Anvy EBR là ứng dụng hồ sơ lô điện tử của Anvy, dùng để theo dõi hồ sơ
          lô bán thành phẩm và thành phẩm.
        </p>

        <div className="mt-auto flex flex-wrap justify-center gap-3 pb-12 pt-8 md:pb-20">
          {feedbackUrl && (
            <a
              href={feedbackUrl}
              className="w-36 rounded-md border border-blue-600 px-4 py-2 text-center text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Góp ý
            </a>
          )}
          <Link
            href="/"
            className="w-36 rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            OK
          </Link>
        </div>

        <footer>
          <ul className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs text-gray-600">
            {links.map(({ label, href, newTab }) =>
              href ? (
                <li key={label} className="flex items-center gap-2">
                  <a
                    href={href}
                    target={newTab ? "_blank" : undefined}
                    rel={newTab ? "noopener noreferrer" : undefined}
                    className="hover:text-blue-700 hover:underline"
                  >
                    {label}
                  </a>
                  <span aria-hidden="true">·</span>
                </li>
              ) : null,
            )}
            <li>Version {version}</li>
          </ul>
        </footer>
      </div>
    </main>
  );
}
