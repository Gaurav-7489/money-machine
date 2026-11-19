import { LogoMark } from "@/components/logo";

export const metadata = { title: "Offline" };

export default function Offline() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <LogoMark className="mx-auto h-12 w-12" />
        <h1 className="mt-6 text-[clamp(2.6rem,8vw,4rem)] leading-[0.9]">You’re offline</h1>
        <p className="mt-1 text-sm text-muted">Check your connection and try again.</p>
        <a href="/home" className="mt-5 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-canvas">
          Retry
        </a>
      </div>
    </main>
  );
}
