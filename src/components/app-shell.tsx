"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Bell, ChevronRight, Menu, Plus, Search } from "lucide-react";
import { Logo, LogoMark } from "./logo";
import { Avatar } from "./art";
import { MESSAGE_FOLDERS, PRIMARY_NAV, SOCIAL_NAV, TOOLS_NAV, isActive } from "./nav";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";
import { InstallBanner } from "./install-prompt";
import { ThemeToggle } from "./theme";
import { Sheet } from "./ui";

const MAIN = PRIMARY_NAV.filter((i) => i.href !== "/profile" && i.href !== "/create");

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white" aria-label={`${n} unread`}>
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
  const current = pathname === "/inbox" ? params.get("folder") ?? "inbox" : null;
  return (
    <div className="ml-5 mt-0.5 space-y-0.5 border-l border-line pl-2" onClick={onNavigate}>
      {MESSAGE_FOLDERS.filter((f) => f.folder !== "inbox").map((f) => (
        <NavLink key={f.href} href={f.href} label={f.label} icon={f.icon} active={current === f.folder} small />
      ))}
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { session } = useStore();
  const { unreadCount } = useThreads();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface px-4 py-6 lg:flex">
      <Link href="/home" className="mb-6 px-3" aria-label="Money Machine home">
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
        <p className="mb-1 mt-4 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Your tools</p>
        {TOOLS_NAV.map((i) => (
          <NavLink key={i.href} {...i} active={isActive(pathname, i.href)} />
        ))}
        <Link
          href={session?.role === "business" ? "/affiliates/new" : "/create"}
          className="press mt-5 inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 text-[15px] font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          <Plus className="h-5 w-5" /> {session?.role === "business" ? "New Program" : "New Post"}
        </Link>
      </nav>
      <ThemeToggle withLabel className="mt-4 w-full justify-start" />
      {session && (
        <Link href="/profile" className="mt-2 flex items-center gap-3 rounded-2xl border border-line p-2.5 hover:bg-canvas">
          <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{session.displayName}</span>
            <span className="block truncate text-xs text-muted">@{session.handle} · <span className="capitalize">{session.role}</span></span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted" />
        </Link>
      )}
    </aside>
  );
}

/** Tablet: narrow rail, but every icon still has a short text label under it. */
function Rail() {
  const pathname = usePathname();
  const { unreadCount } = useThreads();
  const items = [...MAIN, { href: "/create", label: "Create", icon: Plus }, ...SOCIAL_NAV.filter((i) => i.href !== "/notifications"), ...TOOLS_NAV];
  return (
    <aside className="sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-line bg-surface py-5 md:flex lg:hidden">
      <Link href="/home" className="mb-4" aria-label="Money Machine home">
        <LogoMark className="h-8 w-8" />
      </Link>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`press relative flex w-[72px] flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-medium transition-colors ${active ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-canvas"}`}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.9} />
              {label}
              {href === "/inbox" && unreadCount > 0 && <span className="absolute right-3 top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-surface" aria-label={`${unreadCount} unread`} />}
            </Link>
          );
        })}
      </nav>
      <Link href="/profile" className="mt-auto flex flex-col items-center gap-0.5 pt-3 text-[11px] font-medium" aria-current={isActive(pathname, "/profile") ? "page" : undefined}>
        <ProfileDot />
        Profile
      </Link>
    </aside>
  );
}

function ProfileDot() {
  const { session } = useStore();
  if (!session) return null;
  return <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} />;
}

/** Mobile: full list of destinations so nothing is hidden behind gestures. */
function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { unreadCount } = useThreads();
  const groups = [
    { title: "Main", items: PRIMARY_NAV },
    { title: "Messages", items: MESSAGE_FOLDERS.map(({ href, label, icon }) => ({ href, label: label === "Inbox" ? "Inbox" : `${label} messages`, icon })) },
    { title: "People", items: SOCIAL_NAV },
    { title: "Your tools", items: TOOLS_NAV },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="Menu">
      <nav aria-label="All pages" className="space-y-5" onClick={(e) => (e.target as HTMLElement).closest("a") && onClose()}>
        {groups.map((g) => (
          <section key={g.title}>
            <h3 className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{g.title}</h3>
            <div className="grid grid-cols-2 gap-2">
              {g.items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href + label}
                  href={href}
                  className={`press flex min-h-12 items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-sm font-medium ${!href.includes("?") && isActive(pathname, href) ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line hover:bg-canvas"}`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {href === "/inbox" && <CountBadge n={unreadCount} />}
                </Link>
              ))}
            </div>
          </section>
        ))}
        <section className="border-t border-line pt-3">
          <ThemeToggle withLabel className="w-full justify-start" />
        </section>
      </nav>
    </Sheet>
  );
}

function TopBar() {
  const [menu, setMenu] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex items-center gap-1 border-b border-line/70 bg-surface/90 px-3 py-2 backdrop-blur pt-safe md:hidden">
      <Link href="/home" aria-label="Money Machine home" className="flex items-center gap-2 pl-1">
        <LogoMark className="h-8 w-8" />
        <span className="text-[15px] font-bold tracking-tight">Money Machine</span>
      </Link>
      <div className="flex-1" />
      <ThemeToggle />
      <Link href="/notifications" className="grid h-10 w-10 place-items-center rounded-full hover:bg-canvas" aria-label="Notifications" title="Notifications">
        <Bell className="h-[22px] w-[22px]" />
      </Link>
      <button onClick={() => setMenu(true)} className="press flex h-10 items-center gap-1.5 rounded-full border border-line px-3 text-sm font-semibold hover:bg-canvas" aria-haspopup="dialog">
        <Menu className="h-[18px] w-[18px]" /> Menu
      </button>
      <MenuSheet open={menu} onClose={() => setMenu(false)} />
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useThreads();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-safe md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5 px-1">
        {PRIMARY_NAV.map(({ href, label, icon: Icon }) => {
          const active =
            isActive(pathname, href) ||
            (href === "/profile" && ["/money", "/badges", "/affiliates", "/friends", "/saved"].some((p) => isActive(pathname, p))) ||
            (href === "/explore" && pathname.startsWith("/u/"));
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`press relative flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${active ? "text-brand-700" : "text-muted"}`}
              >
                <span className={`grid h-8 w-12 place-items-center rounded-full transition-colors ${active ? "bg-brand-50" : ""}`}>
                  <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 1.9} />
                </span>
                {label}
                {href === "/inbox" && unreadCount > 0 && (
                  <span className="absolute right-[calc(50%-22px)] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{unreadCount}</span>
                )}
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
    <div className="sticky top-0 z-20 hidden items-center gap-3 border-b border-line/60 bg-canvas/85 px-6 py-3 backdrop-blur md:flex">
      <form action="/explore" className="relative flex-1" role="search">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <label className="sr-only" htmlFor="global-search">Search creators and businesses</label>
        <input
          id="global-search"
          name="q"
          placeholder="Search creators, brands, niches…"
          className="h-10 w-full max-w-md rounded-full border border-line bg-surface pl-10 pr-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
      </form>
      <ThemeToggle className="lg:hidden" />
      <Link href="/notifications" className="press flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium hover:bg-surface" title="Notifications">
        <Bell className="h-5 w-5" />
        <span className="hidden xl:inline">Notifications</span>
        <span className="sr-only xl:hidden">Notifications</span>
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
          <p role="alert" className="mx-4 mt-3 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700 md:mx-6">
            This device&apos;s storage is full, so your latest changes can&apos;t be saved. Try removing a photo post.
          </p>
        )}
        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 md:px-6 md:pb-10 md:pt-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
