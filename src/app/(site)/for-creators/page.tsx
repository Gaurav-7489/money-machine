import type { Metadata } from "next";
import { AudiencePage } from "@/components/site/audience-page";
import { AUDIENCES } from "@/lib/site";

const a = AUDIENCES.creators;

export const metadata: Metadata = {
  title: a.title,
  description: a.lead,
  alternates: { canonical: a.path },
  openGraph: { title: a.title, description: a.lead, url: a.path },
};

export default function ForCreators() {
  return <AudiencePage path={a.path} eyebrow="For creators" h1={a.h1} lead={a.lead} points={a.points} faqIndexes={[2, 3, 4, 5]} other={{ href: AUDIENCES.brands.path, label: "Money Machine for brands" }} />;
}
