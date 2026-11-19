"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Bell, ChevronRight, Menu, Plus, Search } from "lucide-react";
import { Logo, LogoMark } from "./logo";
import { Avatar } from "./art";
import { MESSAGE_FOLDERS, SOCIAL_NAV, isActive, primaryNav, toolsNav } from "./nav";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";
import { InstallBanner } from "./install-prompt";
import { ThemeToggle } from "./theme";
import { Sheet } from "./ui";
import { motion } from "motion/react";

const mainNav = (role: Parameters<typeof primaryNav>[0]) => primaryNav(role).filter((i) => i.href !== "/profile" && i.href !== "/create");

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-on-danger" aria-label={`${n} unread`}>
      {n}
    </span>
  );
}

function NavLink({ href, label, icon: Icon, active, badge, small }: { href: string; label: string; icon: typeof Bell; active: boolean; badge?: number; small?: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`press flex items-center gap-3 rounded-xl px-3 transition-colors ${small ? "py-1.5 text-[13.5px]" : "py-2 text-[14.5px]"} ${active ? "bg-surface font-medium text-ink shadow-[var(--shadow-card)] ring-1 ring-line" : "text-muted hover:bg-elevated/70 hover:text-ink"}`}
    >
      <Icon className={`${small ? "h-4 w-4" : "h-[18px] w-[18px]"} ${active ? "text-brand-600" : ""}`} strokeWidth={active ? 2.2 : 1.8} />
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
    <div className="ml-5 mt-0.5 space-y-0.5 border-l border-line pl-2" onClick={onNavigate}>
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
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-canvas px-3 py-5 lg:flex">
      <Link href="/home" className="mb-6 px-3 pt-1" aria-label="Money Machine home">
        <Logo />
      </Link>
      <nav aria-label="Main" className="flex flex-1 flex-col gap-0.5">
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
        <p className="mb-1.5 mt-5 px-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">Your tools</p>
        {TOOLS_NAV.map((i) => (
          <NavLink key={i.href} {...i} active={isActive(pathname, i.href)} />
        ))}
        <Link href="/create" className="press btn-glow bg-aurora mt-5 inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full text-[14.5px] font-medium text-on-accent">
          <Plus className="h-[18px] w-[18px]" /> New post
        </Link>
      </nav>
      <ThemeToggle withLabel className="mt-4 w-full justify-start" />
      {session && (
        <Link href="/profile" className="mt-2 flex items-center gap-3 rounded-2xl border border-line bg-surface p-2.5 transition-colors hover:border-ink/20">
          <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{session.displayName}</span>
            <span className="block truncate text-xs text-muted">@{session.handle} · {session.role === "business" ? "Business" : "Creator"}</span>
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
  const { session } = useStore();
  const items = [...mainNav(session?.role), { href: "/create", label: "Create", icon: Plus }, ...SOCIAL_NAV.filter((i) => i.href !== "/notifications"), ...toolsNav(session?.role)];
  return (
    <aside className="sticky top-0 hidden h-dvh w-[88px] shrink-0 flex-col items-center gap-1 overflow-y-auto border-r border-line bg-canvas py-5 md:flex lg:hidden">
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
              className={`press relative flex w-[72px] flex-col items-center gap-0.5 rounded-2xl py-2 text-center text-[11px] font-medium leading-tight transition-colors ${active ? "bg-surface text-ink shadow-[var(--shadow-card)] ring-1 ring-line" : "text-muted hover:bg-elevated/70 hover:text-ink"}`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-brand-600" : ""}`} strokeWidth={active ? 2.2 : 1.8} />
              {label}
              {href === "/inbox" && unreadCount > 0 && <span className="absolute right-3 top-1.5 h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-surface" aria-label={`${unreadCount} unread`} />}
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
  const { session } = useStore();
  const groups = [
    { title: "Main", items: primaryNav(session?.role) },
    { title: "DMs", items: MESSAGE_FOLDERS.map(({ href, label, icon }) => ({ href, label: label === "All" ? "All DMs" : label, icon })) },
    { title: "People", items: SOCIAL_NAV },
    { title: "Your tools", items: toolsNav(session?.role) },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="Menu">
      <nav aria-label="All pages" className="space-y-5" onClick={(e) => (e.target as HTMLElement).closest("a") && onClose()}>
        {groups.map((g) => (
          <section key={g.title}>
            <h3 className="mb-2 px-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{g.title}</h3>
            <div className="grid grid-cols-2 gap-2">
              {g.items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href + label}
                  href={href}
                  className={`press flex min-h-12 items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-sm font-medium ${!href.includes("?") && isActive(pathname, href) ? "border-ink/20 bg-elevated text-ink" : "border-line hover:bg-elevated"}`}
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
  const { unreadCount } = useThreads();
  return (
    <header className="glass sticky top-0 z-30 flex items-center gap-1 border-b border-line px-3 py-2 pt-safe md:hidden">
      <Link href="/home" aria-label="Money Machine home" className="flex items-center gap-2 pl-1">
        <LogoMark className="h-7 w-7" />
        <span className="whitespace-nowrap text-[16px] font-semibold tracking-[-0.02em] max-[360px]:text-[15px]">Money Machine</span>
      </Link>
      <div className="flex-1" />
      <ThemeToggle />
      <Link href="/notifications" className="grid h-10 w-10 place-items-center rounded-full hover:bg-elevated" aria-label="Notifications" title="Notifications">
        <Bell className={`h-[22px] w-[22px] ${unreadCount > 0 ? "ring-bell" : ""}`} />
      </Link>
      <button onClick={() => setMenu(true)} className="press grid h-10 w-10 place-items-center rounded-full border border-line hover:bg-elevated" aria-haspopup="dialog" aria-label="Menu">
        <Menu className="h-[18px] w-[18px]" />
      </button>
      <MenuSheet open={menu} onClose={() => setMenu(false)} />
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useThreads();
  const { session } = useStore();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] md:hidden">
      <ul className="glass mx-auto grid max-w-md grid-cols-5 rounded-[22px] border border-line px-1 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.25)]">
        {primaryNav(session?.role).map(({ href, label, icon: Icon }) => {
          const active =
            isActive(pathname, href) ||
            (href === "/profile" && ["/money", "/badges", "/affiliates", "/friends", "/saved"].some((p) => isActive(pathname, p))) ||
            (href === "/explore" && pathname.startsWith("/u/"));
          const create = href === "/create";
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`press relative flex h-[62px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${active ? "text-ink" : "text-muted"}`}
              >
                <span className={`relative grid h-8 w-12 place-items-center rounded-full ${create ? "bg-aurora text-on-accent" : ""}`}>
                  {active && !create && <motion.span layoutId="bottom-nav" className="absolute inset-0 rounded-full bg-elevated" aria-hidden="true" />}
                  <Icon className="relative h-[22px] w-[22px]" strokeWidth={active || create ? 2.2 : 1.8} />
                </span>
                {label}
                {href === "/inbox" && unreadCount > 0 && (
                  <span className="absolute right-[calc(50%-22px)] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-on-danger">{unreadCount}</span>
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
    <div className="glass sticky top-0 z-20 hidden items-center gap-3 border-b border-line px-6 py-2.5 md:flex">
      <form action="/explore" className="relative flex-1" role="search">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <label className="sr-only" htmlFor="global-search">Search creators and businesses</label>
        <input
          id="global-search"
          name="q"
          placeholder="Search anything: skincare, @handle, a brand…"
          className="h-10 w-full max-w-md rounded-full border border-line bg-surface pl-10 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
        />
      </form>
      <ThemeToggle className="lg:hidden" />
      <Link href="/notifications" className="press flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted hover:bg-elevated hover:text-ink" title="Notifications">
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
      <a href="#main" className="sr-only z-50 rounded-full bg-aurora px-4 py-2 text-on-accent focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
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
        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-32 pt-4 md:px-6 md:pb-10 md:pt-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
