import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <LogoMark className="mx-auto h-12 w-12" />
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Page not found</h1>
        <Link href="/home" className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-semibold text-on-primary">Go home</Link>
      </div>
    </main>
  );
}
