"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Bell, ChevronRight, Plus } from "lucide-react";
import { Logo, LogoMark } from "./logo";
import { Avatar } from "./art";
import { PRIMARY_NAV, TOOLS_NAV, isActive } from "./nav";
import { useStore } from "@/lib/store";
import { SAMPLE_THREADS } from "@/lib/sample-data";
import { InstallBanner } from "./install-prompt";

function useUnread() {
  const { readThreads } = useStore();
  return SAMPLE_THREADS.filter((t) => t.unread && !readThreads.includes(t.id)).length;
}

function Sidebar() {
  const pathname = usePathname();
  const { session } = useStore();
  const unread = useUnread();
  const items = [...PRIMARY_NAV.filter((i) => i.href !== "/profile"), ...TOOLS_NAV];
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-white px-4 py-6 lg:flex">
      <Link href="/home" className="mb-8 px-3">
        <Logo />
      </Link>
      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors ${active ? "bg-brand-50 font-semibold text-brand-700" : "text-ink hover:bg-canvas"}`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.9} />
              <span className="flex-1">{label}</span>
              {href === "/inbox" && unread > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">{unread}</span>
              )}
            </Link>
          );
        })}
        <Link
          href={session?.role === "business" ? "/affiliates/new" : "/create"}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-brand-600 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> {session?.role === "business" ? "New Program" : "New Post"}
        </Link>
      </nav>
      {session && (
        <Link href="/profile" className="mt-4 flex items-center gap-3 rounded-2xl border border-line p-2.5 hover:bg-canvas">
          <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{session.handle}</span>
            <span className="block text-xs capitalize text-muted">{session.role}</span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
      )}
    </aside>
  );
}

function Rail() {
  const pathname = usePathname();
  const unread = useUnread();
  const items = [...PRIMARY_NAV.filter((i) => i.href !== "/profile"), ...TOOLS_NAV];
  return (
    <aside className="sticky top-0 hidden h-dvh w-[76px] shrink-0 flex-col items-center gap-2 border-r border-line bg-white py-6 md:flex lg:hidden">
      <Link href="/home" className="mb-6" aria-label="Money Machine home">
        <LogoMark className="h-8 w-8" />
      </Link>
      <nav aria-label="Main" className="flex flex-col gap-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              title={label}
              aria-current={active ? "page" : undefined}
              className={`relative grid h-12 w-12 place-items-center rounded-2xl transition-colors ${active ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-canvas"}`}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.9} />
              {href === "/inbox" && unread > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-500" />}
            </Link>
          );
        })}
      </nav>
      <Link href="/profile" className="mt-auto" aria-label="Profile">
        <ProfileDot />
      </Link>
    </aside>
  );
}

function ProfileDot() {
  const { session } = useStore();
  if (!session) return null;
  return <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} />;
}

function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line/70 bg-white/85 px-4 py-2.5 backdrop-blur pt-safe md:hidden">
      <Link href="/home" aria-label="Money Machine home">
        <LogoMark className="h-8 w-8" />
      </Link>
      <div className="flex-1" />
      <Link href="/notifications" className="grid h-10 w-10 place-items-center rounded-full hover:bg-canvas" aria-label="Notifications">
        <Bell className="h-[22px] w-[22px]" />
      </Link>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const unread = useUnread();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur pb-safe md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href) || (href === "/profile" && ["/money", "/badges", "/affiliates"].some((p) => isActive(pathname, p)));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`relative grid h-14 w-14 place-items-center ${active ? "text-brand-700" : "text-ink"}`}
              >
                <Icon className="h-[25px] w-[25px]" strokeWidth={active ? 2.5 : 1.8} />
                {href === "/inbox" && unread > 0 && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-brand-500" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function DesktopHeader() {
  return (
    <div className="sticky top-0 z-20 hidden items-center gap-4 border-b border-line/60 bg-canvas/85 px-6 py-3 backdrop-blur md:flex">
      <form action="/explore" className="flex-1">
        <label className="sr-only" htmlFor="global-search">Search</label>
        <input
          id="global-search"
          name="q"
          placeholder="Search creators, brands, opportunities…"
          className="h-10 w-full max-w-md rounded-full border border-line bg-white px-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </form>
      <Link href="/notifications" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Link>
      <Link href="/profile" aria-label="Profile">
        <ProfileDot />
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, ready } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace("/");
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="grid min-h-dvh place-items-center" aria-busy="true">
        <LogoMark className="h-10 w-10 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <Rail />
      <div className="min-w-0 flex-1">
        <TopBar />
        <DesktopHeader />
        <InstallBanner />
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:px-6 md:pb-10 md:pt-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
