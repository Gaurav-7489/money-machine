import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Welcome } from "@/components/welcome";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icons/icon-512.png`,
    slogan: SITE.tagline,
    founder: { "@type": "Person", name: SITE.founder },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en-IN",
    publisher: { "@id": `${SITE.url}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.name,
    url: SITE.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any (web, iOS, Android via PWA)",
    browserRequirements: "Requires a modern browser with JavaScript",
    description: SITE.description,
    featureList: ["Social feed", "Creator and brand discovery", "Affiliate programs", "Income and spending tracking", "Achievement badges", "Direct messaging", "Add to Home Screen (PWA)"],
    publisher: { "@id": `${SITE.url}/#organization` },
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={structuredData} />
      <Welcome />
    </>
  );
}
