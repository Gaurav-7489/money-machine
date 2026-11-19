"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, ChevronRight, Menu, Plus, Search } from "lucide-react";
import { Logo, LogoMark } from "./logo";
import { Avatar } from "./art";
import { MESSAGE_FOLDERS, SOCIAL_NAV, isActive, primaryNav, toolsNav } from "./nav";
import { useStore } from "@/lib/store";
import { useThreads } from "@/lib/threads";
import { InstallBanner } from "./install-prompt";
import { ThemeToggle } from "./theme";
import { motion } from "motion/react";

const mainNav = (role: Parameters<typeof primaryNav>[0]) => primaryNav(role).filter((i) => i.href !== "/profile" && i.href !== "/create");

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-signal px-1.5 text-[11px] font-bold tabular-nums text-on-signal" aria-label={`${n} unread`}>
      {n}
    </span>
  );
}

function NavLink({ href, label, icon: Icon, active, badge, small }: { href: string; label: string; icon: typeof Bell; active: boolean; badge?: number; small?: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`press group relative flex items-center gap-3 rounded-lg px-3 transition-colors ${small ? "py-1.5 text-[14px]" : "py-2 text-[15px]"} ${active ? "font-semibold text-ink" : "text-muted hover:text-ink"}`}
    >
      {active && <motion.span layoutId={small ? "side-sub" : "side-main"} className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-signal" aria-hidden="true" />}
      <Icon className={small ? "h-4 w-4" : "h-[18px] w-[18px]"} strokeWidth={active ? 2.2 : 1.7} />
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
    <div className="ml-[21px] mt-0.5 space-y-0.5 border-l border-line pl-2" onClick={onNavigate}>
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
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-canvas px-4 py-6 lg:flex">
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
        <p className="mb-1 mt-5 border-t border-line px-3 pt-4 text-[12px] font-medium text-muted">Your tools</p>
        {TOOLS_NAV.map((i) => (
          <NavLink key={i.href} {...i} active={isActive(pathname, i.href)} />
        ))}
        <div className="mt-6 w-full">
          <Link href="/create" className="press inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-signal text-[15px] font-semibold text-on-signal hover:brightness-105">
            <Plus className="h-5 w-5" strokeWidth={2.4} /> New post
          </Link>
        </div>
      </nav>
      <ThemeToggle withLabel className="mt-4 w-full justify-start" />
      {session && (
        <Link href="/profile" className="mt-2 flex items-center gap-3 rounded-xl border-t border-line p-2.5 pt-4 hover:bg-elevated">
          <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} square={session.role === "business"} photoId={session.avatarId} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{session.displayName}</span>
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
              className={`press relative flex w-[72px] flex-col items-center gap-1 rounded-xl py-2 text-center text-[11px] font-medium leading-tight transition-colors ${active ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              <span className={`grid h-8 w-11 place-items-center rounded-full ${active ? "bg-signal text-on-signal" : ""}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.7} />
              </span>
              {label}
              {href === "/inbox" && unreadCount > 0 && <span className="absolute right-3 top-1.5 h-2.5 w-2.5 rounded-full bg-accent-2 ring-2 ring-canvas" aria-label={`${unreadCount} unread`} />}
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
  return <Avatar name={session.displayName} tone={session.role === "business" ? "violet" : "rose"} square={session.role === "business"} photoId={session.avatarId} />;
}

/** Two bars that fold into an ×. */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3 w-4" aria-hidden="true">
      <span className={`absolute left-0 h-[1.75px] w-4 rounded-full bg-current transition-transform duration-300 ease-[var(--ease-out-expo)] ${open ? "top-[5px] rotate-45" : "top-[2px]"}`} />
      <span className={`absolute left-0 h-[1.75px] rounded-full bg-current transition-all duration-300 ease-[var(--ease-out-expo)] ${open ? "top-[5px] w-4 -rotate-45" : "top-[8px] w-2.5"}`} />
    </span>
  );
}

/**
 * Mobile: a full-screen menu. Every destination is one tap away, the main ones
 * set large, the rest in a compact grid. A native <dialog> keeps focus inside
 * and closes on Escape.
 */
function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const { unreadCount } = useThreads();
  const { session } = useStore();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Navigating closes the menu.
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const main = primaryNav(session?.role);
  const more = [...SOCIAL_NAV, ...toolsNav(session?.role)];
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-label="Menu"
      className="menu-overlay m-0 h-dvh max-h-none w-full max-w-none bg-canvas p-0 text-ink backdrop:bg-transparent"
    >
      <div className="flex min-h-full flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between py-2">
          <span className="flex items-center gap-2 pl-1"><LogoMark className="h-7 w-7" /><span className="font-display text-[20px]">Money Machine</span></span>
          <button onClick={onClose} className="press inline-flex h-10 items-center gap-2 rounded-full bg-ink pl-4 pr-3.5 text-[14px] font-semibold text-canvas" aria-label="Close menu">
            Close <MenuGlyph open />
          </button>
        </div>

        <nav aria-label="All pages" className="mt-6 flex-1">
          <ul className="border-b border-line">
            {main.map(({ href, label }, i) => {
              const active = isActive(pathname, href);
              return (
                <li key={href} className="menu-item border-t border-line" style={{ ["--i" as string]: i }}>
                  <Link href={href} aria-current={active ? "page" : undefined} className="flex items-center justify-between py-2.5">
                    <span className={`font-display text-[clamp(2.6rem,13vw,3.6rem)] leading-[1] ${active ? "" : "text-ink/85"}`}>
                      {label}
                    </span>
                    <span className="flex items-center gap-2">
                      {href === "/inbox" && unreadCount > 0 && <span className="grid h-7 min-w-7 place-items-center rounded-full bg-signal px-2 text-[13px] font-bold tabular-nums text-on-signal" aria-label={`${unreadCount} unread`}>{unreadCount}</span>}
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-signal" aria-hidden="true" />}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className="mt-6 grid grid-cols-2 gap-x-4">
            {more.map(({ href, label, icon: Icon }, i) => (
              <li key={href} className="menu-item" style={{ ["--i" as string]: main.length + i * 0.5 }}>
                <Link href={href} aria-current={isActive(pathname, href) ? "page" : undefined} className="flex items-center gap-2.5 border-b border-line py-3 text-[15px] font-medium aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-signal aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-4">
                  <Icon className="h-[18px] w-[18px] text-muted" strokeWidth={1.7} /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-8 flex items-center gap-3 border-t border-line pt-4">
          {session && (
            <Link href="/profile" className="flex min-w-0 flex-1 items-center gap-3">
              <ProfileDot />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{session.displayName}</span>
                <span className="block truncate text-xs text-muted">@{session.handle}</span>
              </span>
            </Link>
          )}
          <ThemeToggle withLabel className="shrink-0" />
        </div>
      </div>
    </dialog>
  );
}

function TopBar() {
  const [menu, setMenu] = useState(false);
  const { unreadCount } = useThreads();
  return (
    <header className="glass sticky top-0 z-30 flex items-center gap-1 border-b border-line px-3 py-2 pt-safe md:hidden">
      <Link href="/home" aria-label="Money Machine home" className="flex items-center gap-2 pl-1">
        <LogoMark className="h-7 w-7" />
        <span className="font-display whitespace-nowrap text-[20px] max-[360px]:text-[17px]">Money Machine</span>
      </Link>
      <div className="flex-1" />
      <ThemeToggle />
      <Link href="/notifications" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-elevated" aria-label="Notifications" title="Notifications">
        <Bell className={`h-[21px] w-[21px] ${unreadCount > 0 ? "ring-bell" : ""}`} strokeWidth={1.8} />
        {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-signal ring-2 ring-canvas" aria-hidden="true" />}
      </Link>
      <button onClick={() => setMenu(true)} className="press ml-1 inline-flex h-10 items-center gap-2.5 rounded-full border border-line pl-4 pr-3.5 text-[14px] font-semibold hover:border-ink" aria-haspopup="dialog" aria-expanded={menu} aria-label="Menu">
        Menu <MenuGlyph open={menu} />
      </button>
      <MenuOverlay open={menu} onClose={() => setMenu(false)} />
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useThreads();
  const { session } = useStore();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5 rounded-[22px] bg-ink px-1 text-canvas shadow-[0_16px_40px_-16px_rgb(0_0_0/0.5)]">
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
                className={`press relative flex h-[62px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${active ? "text-canvas" : "text-canvas/60"}`}
              >
                <span className={`relative grid h-8 w-12 place-items-center rounded-full ${create ? "bg-signal text-on-signal" : ""}`}>
                  {active && !create && <motion.span layoutId="bottom-nav" className="absolute inset-x-3 -bottom-1 h-[3px] rounded-full bg-signal" aria-hidden="true" />}
                  <Icon className="relative h-[21px] w-[21px]" strokeWidth={active || create ? 2.2 : 1.7} />
                </span>
                {label}
                {href === "/inbox" && unreadCount > 0 && (
                  <span className="absolute right-[calc(50%-22px)] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-signal px-1 text-[10px] font-bold text-on-signal">{unreadCount}</span>
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
    <div className="glass sticky top-0 z-20 hidden items-center gap-3 border-b border-line px-6 py-3 md:flex">
      <form action="/explore" className="relative flex-1" role="search">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <label className="sr-only" htmlFor="global-search">{session?.role === "business" ? "Search creators" : "Search brands"}</label>
        <input
          id="global-search"
          name="q"
          placeholder={session?.role === "business" ? "Search creators: skincare, @handle, a city…" : "Search brands: skincare, @handle, a city…"}
          className="h-11 w-full max-w-md rounded-full border border-line bg-surface/70 pl-10 pr-4 text-sm outline-none transition hover:border-muted/60 focus:border-ink focus:bg-surface"
        />
      </form>
      <ThemeToggle className="lg:hidden" />
      <Link href="/notifications" className="press flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium hover:bg-elevated" title="Notifications">
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
      <a href="#main" className="sr-only z-50 rounded-full bg-signal px-4 py-2 text-on-signal focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Sidebar />
      <Rail />
      <div className="min-w-0 flex-1">
        <TopBar />
        <DesktopHeader />
        <InstallBanner />
        {!saveOk && (
          <p role="alert" className="mx-4 mt-3 rounded-lg border border-danger/40 px-4 py-2.5 text-sm text-danger md:mx-6">
            This device&apos;s storage is full, so your latest changes can&apos;t be saved. Try removing a photo post.
          </p>
        )}
        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-32 pt-5 md:px-8 md:pb-12 md:pt-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
