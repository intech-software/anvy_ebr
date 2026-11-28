"use client";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Bell, Boxes, ClipboardList, History, Info, LogOut, PackageCheck, Search, Settings, Unplug, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { MdDehaze } from "react-icons/md";
import { UserAvatar } from "@/components/user-avatar";
import type { SessionUser } from "@/lib/auth";
import { version } from "../../package.json";
import { logout } from "./home-actions";

const sections = [
  { name: "Danh sách bán thành phẩm", icon: Boxes, href: "/" },
  { name: "Danh sách thành phẩm", icon: PackageCheck },
  { name: "Danh mục hàng hoá", icon: ClipboardList, href: "/items" },
  { name: "Lịch sử kết nối", icon: Unplug, href: "/connection-history" },
  { name: "Lịch sử thay đổi", icon: History, href: "/audit-logs" },
  { name: "About", icon: Info, href: "/about" },
];

const iconButton =
  "grid size-9 shrink-0 place-items-center rounded-full text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
const dropdownPanel =
  "z-30 min-w-44 rounded-md border border-gray-200 bg-white p-1 text-sm shadow-md";

export function HomeShell({ user, children }: { user: SessionUser; children: ReactNode }) {
  const pathname = usePathname();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const filter = query.trim().toLocaleLowerCase("vi");
  const visibleSections = sections.filter(({ name }) =>
    name.toLocaleLowerCase("vi").includes(filter),
  );
  const displayName = user.name ?? user.username;
  const subtitle = [user.position, user.department].filter(Boolean).join(" · ");

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex h-[60px] shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 sm:px-4">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Menu điều hướng"
            aria-controls="home-sidebar"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`${iconButton} md:hidden`}
          >
            <MdDehaze size={22} />
          </button>
          <button
            type="button"
            aria-label="Menu điều hướng"
            aria-controls="home-sidebar"
            aria-expanded={desktopOpen}
            onClick={() => setDesktopOpen(!desktopOpen)}
            className={`${iconButton} hidden md:grid`}
          >
            <MdDehaze size={22} />
          </button>
          <Image
            src="/brand/logo_anvy.svg"
            alt="Logo Anvy"
            width={470}
            height={568}
            className="h-5 w-auto"
          />
          <h1 className="hidden text-xl md:block">HỒ SƠ LÔ</h1>
        </div>

        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          <div
            role="search"
            aria-label="Tìm trong menu"
            className="group relative h-9 w-9 min-w-0 rounded-full border border-gray-200 transition-[width] duration-300 ease-in-out focus-within:w-40 focus-within:border-blue-600 motion-reduce:transition-none md:w-40 md:focus-within:w-100"
          >
            <input
              ref={searchInput}
              type="search"
              aria-label="Tìm mục trong menu"
              placeholder="Tìm kiếm"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setMobileOpen(true);
                setDesktopOpen(true);
              }}
              className="size-full min-w-0 rounded-full pl-3 pr-9 text-sm text-transparent outline-none placeholder:text-transparent group-focus-within:text-gray-900 group-focus-within:placeholder:text-gray-500 md:text-gray-900 md:placeholder:text-gray-500"
            />
            <button
              type="button"
              aria-label="Tìm kiếm"
              onClick={() => searchInput.current?.focus()}
              className="absolute inset-y-0 right-0 grid w-9 place-items-center rounded-full text-gray-500 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              <Search aria-hidden="true" className="size-4" />
            </button>
          </div>
          <Dropdown.Root>
            <Dropdown.Trigger aria-label="Thông báo" className={iconButton}>
              <Bell size={20} />
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content align="end" sideOffset={8} className={dropdownPanel}>
                <Dropdown.Label className="px-3 py-2 font-medium">
                  Thông báo
                </Dropdown.Label>
                <p className="border-t border-gray-100 px-3 py-3 text-gray-600">
                  Chưa có thông báo
                </p>
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
          <Dropdown.Root>
            <Dropdown.Trigger
              aria-label={`Tài khoản ${displayName}`}
              className="flex shrink-0 items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <span className="hidden max-w-52 flex-col items-end text-right md:flex">
                <span className="max-w-full truncate text-sm font-semibold text-gray-900">
                  {displayName}
                </span>
                <span className="max-w-full truncate text-xs text-gray-600">{subtitle}</span>
              </span>
              <UserAvatar user={user} className="size-9 text-sm" />
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content align="end" sideOffset={8} className={dropdownPanel}>
                <Dropdown.Label className="flex flex-col px-3 py-2">
                  <span className="font-semibold">{displayName}</span>
                  <span className="text-xs text-gray-600">{subtitle}</span>
                </Dropdown.Label>
                <Dropdown.Separator className="my-1 h-px bg-gray-100" />
                <Dropdown.Item asChild>
                  <Link
                    href="/setting"
                    className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 outline-none data-highlighted:bg-blue-50"
                  >
                    <Settings aria-hidden="true" size={16} />
                    Cài đặt
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item asChild>
                  <Link
                    href="/profile"
                    className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 outline-none data-highlighted:bg-blue-50"
                  >
                    <User aria-hidden="true" size={16} />
                    Hồ sơ cá nhân
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item
                  onSelect={() => void logout()}
                  className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 outline-none data-highlighted:bg-blue-50"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {mobileOpen && (
          <button
            type="button"
            aria-label="Đóng menu điều hướng"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 z-10 bg-slate-900/20 md:hidden"
          />
        )}
        <aside
          id="home-sidebar"
          className={`absolute inset-y-0 left-0 z-20 w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white transition-[width] duration-300 motion-reduce:transition-none md:static md:flex ${mobileOpen ? "flex" : "hidden"} ${desktopOpen ? "md:w-64" : "md:w-20"} flex-col`}
        >
          <nav aria-label="Nghiệp vụ EBR" className="p-2">
            <ul>
              {visibleSections.map(({ name, icon: Icon, href }) => {
                const row = `flex min-h-9 w-full items-center gap-2 border-b border-gray-200 px-3 py-2 text-left text-sm ${desktopOpen ? "" : "md:justify-center md:px-0"}`;
                const content = (
                  <>
                    <Icon aria-hidden="true" className="size-5 shrink-0" />
                    <span className={desktopOpen ? undefined : "md:sr-only"}>{name}</span>
                  </>
                );
                return (
                  <li key={name}>
                    {href ? (
                      <Link
                        href={href}
                        aria-current={pathname === href ? "page" : undefined}
                        title={name}
                        onClick={() => setMobileOpen(false)}
                        className={`${row} text-gray-800 hover:bg-blue-50 ${pathname === href ? "bg-blue-100" : ""}`}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title={name}
                        className={`${row} text-gray-500`}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            {visibleSections.length === 0 && (
              <p className="px-3 py-2 text-sm text-gray-600">Không tìm thấy mục phù hợp</p>
            )}
          </nav>
          <Link
            href="/versions"
            aria-current={pathname === "/versions" ? "page" : undefined}
            title="Quản lý phiên bản"
            onClick={() => setMobileOpen(false)}
            className={`mx-2 mb-2 mt-auto rounded-md p-2 text-center text-xs hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 ${pathname === "/versions" ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}
          >
            Phiên bản {version}
          </Link>
        </aside>
        <main className="min-w-0 flex-1 overflow-auto bg-blue-50">
          {children}
        </main>
      </div>
    </div>
  );
}
