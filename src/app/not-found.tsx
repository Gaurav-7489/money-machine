import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <LogoMark className="mx-auto h-12 w-12" />
        <h1 className="mt-6 text-[clamp(2.6rem,8vw,4rem)] leading-[0.9]">Page not found</h1>
        <Link href="/home" className="mt-5 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-canvas">Go home</Link>
      </div>
    </main>
  );
}
