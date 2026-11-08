import { AUDIENCES, FAQ, SITE } from "@/lib/site";

export const dynamic = "force-static";

/** llms.txt — a plain-language summary for AI assistants and answer engines. */
export function GET() {
  const body = `# ${SITE.name}

> ${SITE.description}

${SITE.name} (${SITE.tagline}) was founded by ${SITE.founder} and is built by ${SITE.developer}. It is an installable web app (PWA) that works on phones, tablets and desktops.

## Pages
- [Home](${SITE.url}/): Overview, how it works and FAQ
- [For creators](${SITE.url}${AUDIENCES.creators.path}): ${AUDIENCES.creators.lead}
- [For brands](${SITE.url}${AUDIENCES.brands.path}): ${AUDIENCES.brands.lead}
- [Get started](${SITE.url}/onboarding): Choose a creator or business account

## Key features
- Social feed and discovery of creators and brands
- Affiliate programs: businesses create programs with commission and terms; creators apply; commissions are recorded only when the business confirms a sale
- Income tracking for creators and spending tracking for businesses, with self-reported and verified records kept separate
- Achievement badges awarded from real activity
- Direct messaging between creators and brands
- Add to Home Screen (Progressive Web App)

## FAQ
${FAQ.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
