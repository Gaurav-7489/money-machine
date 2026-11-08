import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { FAQ, SITE } from "@/lib/site";

interface Props {
  path: string;
  eyebrow: string;
  h1: string;
  lead: string;
  points: readonly (readonly [string, string])[];
  faqIndexes: number[];
  other: { href: string; label: string };
}

export function AudiencePage({ path, eyebrow, h1, lead, points, faqIndexes, other }: Props) {
  const faqs = faqIndexes.map((i) => FAQ[i]!);
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: SITE.name, item: SITE.url },
              { "@type": "ListItem", position: 2, name: eyebrow, item: `${SITE.url}${path}` },
            ],
          },
          { "@context": "https://schema.org", "@type": "WebPage", name: h1, description: lead, url: `${SITE.url}${path}`, isPartOf: { "@id": `${SITE.url}/#website` } },
          { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ]}
      />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(45,227,200,0.15),transparent_70%)]" />
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-12 text-center md:pt-20">
          <nav aria-label="Breadcrumb" className="animate-fade-up text-xs text-muted">
            <Link href="/" className="hover:text-ink">Home</Link> <span className="mx-1">/</span> <span className="text-ink">{eyebrow}</span>
          </nav>
          <h1 className="animate-fade-up mt-5 text-4xl font-bold leading-[1.08] tracking-[-0.03em] [animation-delay:80ms] md:text-6xl">
            <span className="text-gradient">{h1}</span>
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted [animation-delay:160ms]">{lead}</p>
          <div className="animate-fade-up mt-8 [animation-delay:240ms]">
            <Link href="/onboarding" className="press group inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-7 font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700">
              Get started <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-20" aria-label="What you get">
        <ul className="mx-auto grid max-w-5xl gap-4 px-5 sm:grid-cols-2">
          {points.map(([t, b], i) => (
            <li key={t} data-reveal style={{ ["--d" as string]: `${(i % 2) * 100}ms` }} className="card lift p-7">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Check className="h-4 w-4" strokeWidth={2.6} />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{t}</h2>
              <p className="mt-1.5 leading-relaxed text-muted">{b}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-20" aria-labelledby="aud-faq">
        <div className="mx-auto max-w-3xl px-5">
          <h2 id="aud-faq" data-reveal className="text-3xl font-bold tracking-tight">Common questions</h2>
          <dl className="mt-8 space-y-8">
            {faqs.map((f, i) => (
              <div key={f.q} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }}>
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-2 leading-relaxed text-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p data-reveal className="mt-12 text-sm text-muted">
            Looking for the other side?{" "}
            <Link href={other.href} className="font-semibold text-brand-700 hover:underline">{other.label} →</Link>
          </p>
        </div>
      </section>
    </>
  );
}
