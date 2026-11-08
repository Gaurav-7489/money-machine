import Link from "next/link";
import { Logo } from "@/components/logo";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{SITE.shortDescription}</p>
        </div>
        <nav aria-label="Product" className="text-sm">
          <p className="mb-3 font-semibold">Product</p>
          <ul className="space-y-2 text-muted">
            <li><Link className="hover:text-ink" href="/for-creators">For creators</Link></li>
            <li><Link className="hover:text-ink" href="/for-brands">For brands</Link></li>
            <li><Link className="hover:text-ink" href="/#faq">FAQ</Link></li>
          </ul>
        </nav>
        <nav aria-label="Get started" className="text-sm">
          <p className="mb-3 font-semibold">Get started</p>
          <ul className="space-y-2 text-muted">
            <li><Link className="hover:text-ink" href="/onboarding">Create an account</Link></li>
            <li><a className="hover:text-ink" href={SITE.waitlist} rel="noopener">Join the waitlist</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-muted">
          © {new Date().getFullYear()} {SITE.name}. Founded by {SITE.founder}. Built by {SITE.developer}.
        </p>
      </div>
    </footer>
  );
}
