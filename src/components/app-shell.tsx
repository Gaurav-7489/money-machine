"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";
import { Bell, ChevronRight } from "lucide-react";
import { Logo, LogoMark } from "./logo";
import { Avatar } from "./art";
import { MESSAGE_FOLDERS, SOCIAL_NAV, isActive, primaryNav, toolsNav } from "./nav";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";
import { InstallBanner } from "./install-prompt";
import { ThemeToggle } from "./theme";

const mainNav = (role: Parameters<typeof primaryNav>[0]) => primaryNav(role).filter((i) => i.href !== "/profile");

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold tabular-nums text-white" aria-label={`${n} unread`}>
      {n}
    </span>
  );
}

function NavLink({ href, label, icon: Icon, active, badge, small }: { href: string; label: string; icon: typeof Bell; active: boolean; badge?: number; small?: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`press flex items-center gap-3 rounded-xl px-3 transition-colors ${small ? "py-1.5 text-[14px]" : "py-2.5 text-[15px]"} ${active ? "bg-brand-50 font-semibold text-brand-700" : "text-ink hover:bg-canvas"}`}
    >
      <Icon className={small ? "h-4 w-4" : "h-5 w-5"} strokeWidth={active ? 2.4 : 1.9} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && <CountBadge n={badge} />}
    </Link>
  );
}

function FolderLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname === "/inbox" ? params.get("box") ?? "all" : null;
  return (
    <div className="ml-[22px] mt-0.5 space-y-0.5 border-l border-line pl-2" onClick={onNavigate}>
      {MESSAGE_FOLDERS.filter((f) => f.folder !== "all").map((f) => (
        <NavLink key={f.href} href={f.href} label={f.label} icon={f.icon} active={current === f.folder} small />
      ))}
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { session } = useStore();
  const { unreadCount } = useThreads();
  const MAIN = mainNav(session?.role);
  const TOOLS_NAV = toolsNav(session?.role);
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface px-4 py-6 lg:flex">
      <Link href="/home" className="mb-8 px-3" aria-label="Money Machine home">
        <Logo />
      </Link>
      <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
        {MAIN.map((i) => (
          <div key={i.href}>
            <NavLink {...i} active={isActive(pathname, i.href) || (i.href === "/explore" && pathname.startsWith("/u/"))} badge={i.href === "/inbox" ? unreadCount : undefined} />
            {i.href === "/inbox" && (
              <Suspense>
                <FolderLinks />
              </Suspense>
            )}
          </div>
        ))}
        {SOCIAL_NAV.map((i) => (
          <NavLink key={i.href} {...i} active={isActive(pathname, i.href)} />
        ))}
        <div className="my-2 border-t border-line" />
        {TOOLS_NAV.map((i) => (
          <NavLink key={i.href} {...i} active={isActive(pathname, i.href)} />
        ))}
      </nav>
      <ThemeToggle withLabel className="mt-4 w-full justify-start" />
      {session && (
        <Link href="/profile" className="mt-3 flex items-center gap-3 rounded-2xl border border-line p-2.5 hover:bg-canvas">
          <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} square={session.role === "business"} photoId={session.avatarId} />
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

/** Tablet: a narrow icon rail. */
function Rail() {
  const pathname = usePathname();
  const { unreadCount } = useThreads();
  const { session } = useStore();
  const items = [...mainNav(session?.role), ...SOCIAL_NAV.filter((i) => i.href !== "/notifications"), ...toolsNav(session?.role)];
  return (
    <aside className="sticky top-0 hidden h-dvh w-[76px] shrink-0 flex-col items-center gap-2 overflow-y-auto border-r border-line bg-surface py-6 md:flex lg:hidden">
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
              {href === "/inbox" && unreadCount > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand-500" aria-label={`${unreadCount} unread`} />}
            </Link>
          );
        })}
      </nav>
      <Link href="/profile" className="mt-auto pt-3" aria-label="Profile" aria-current={isActive(pathname, "/profile") ? "page" : undefined}>
        <ProfileDot />
      </Link>
    </aside>
  );
}

function ProfileDot() {
  const { session } = useStore();
  if (!session) return null;
  return <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} square={session.role === "business"} photoId={session.avatarId} />;
}

function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-1 border-b border-line/70 bg-surface/85 px-4 py-2.5 pt-safe backdrop-blur md:hidden">
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
  const { unreadCount } = useThreads();
  const { session } = useStore();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-safe backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2">
        {primaryNav(session?.role).map(({ href, label, icon: Icon }) => {
          const active =
            isActive(pathname, href) ||
            (href === "/profile" && ["/money", "/badges", "/affiliates", "/friends", "/saved"].some((p) => isActive(pathname, p))) ||
            (href === "/explore" && pathname.startsWith("/u/"));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`press relative grid h-14 w-14 place-items-center transition-colors ${active ? "text-brand-700" : "text-ink"}`}
              >
                <Icon className="h-[25px] w-[25px]" strokeWidth={active ? 2.5 : 1.8} />
                {href === "/inbox" && unreadCount > 0 && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-brand-500" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function DesktopHeader() {
  const { session } = useStore();
  return (
    <div className="sticky top-0 z-20 hidden items-center gap-4 border-b border-line/60 bg-canvas/85 px-6 py-3 backdrop-blur md:flex">
      <form action="/explore" className="flex-1" role="search">
        <label className="sr-only" htmlFor="global-search">{session?.role === "business" ? "Search creators" : "Search brands"}</label>
        <input
          id="global-search"
          name="q"
          placeholder="Search creators, brands, opportunities…"
          className="h-10 w-full max-w-md rounded-full border border-line bg-surface px-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </form>
      <ThemeToggle className="lg:hidden" />
      <Link href="/notifications" className="grid h-10 w-10 place-items-center rounded-full hover:bg-surface" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Link>
      <Link href="/profile" aria-label={`Your profile${session ? `, ${session.displayName}` : ""}`}>
        <ProfileDot />
      </Link>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, ready, saveOk } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  // A single conversation (/inbox/<id>, not the folder pages) has its own composer and no bottom menu.
  const inChat = /^\/inbox\/(?!f(?:\/|$))[^/]+\/?$/.test(pathname);

  useEffect(() => {
    if (ready && !session) router.replace("/");
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-xl space-y-4 px-4 pt-6" aria-busy="true" aria-label="Loading">
        <div className="flex items-center gap-3">
          <div className="skeleton h-10 w-10 rounded-full" />
          <div className="skeleton h-4 w-40" />
        </div>
        <div className="skeleton aspect-[4/3] w-full rounded-[var(--radius-card)]" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-4 w-1/3" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <a href="#main" className="sr-only z-50 rounded-full bg-brand-600 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Sidebar />
      <Rail />
      <div className="min-w-0 flex-1">
        <TopBar />
        <DesktopHeader />
        <InstallBanner />
        {!saveOk && (
          <p role="alert" className="mx-4 mt-3 rounded-xl border border-danger/40 px-4 py-2.5 text-sm text-danger md:mx-6">
            This device&apos;s storage is full, so your latest changes can&apos;t be saved. Try removing a photo post.
          </p>
        )}
        <main id="main" className={`mx-auto w-full max-w-6xl px-4 pt-4 md:px-6 md:pb-10 md:pt-6 ${inChat ? "pb-0" : "pb-28"}`}>{children}</main>
      </div>
      {!inChat && <BottomNav />}
    </div>
  );
}
