import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anvy EBR",
  icons: {
    icon: { url: "/brand/favicon-anvy.png", type: "image/png", sizes: "32x32" },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
