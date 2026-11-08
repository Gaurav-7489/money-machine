import type { Metadata } from "next";
import { AudiencePage } from "@/components/site/audience-page";
import { AUDIENCES } from "@/lib/site";

const a = AUDIENCES.brands;

export const metadata: Metadata = {
  title: a.title,
  description: a.lead,
  alternates: { canonical: a.path },
  openGraph: { title: a.title, description: a.lead, url: a.path },
};

export default function ForBrands() {
  return <AudiencePage path={a.path} eyebrow="For brands" h1={a.h1} lead={a.lead} points={a.points} faqIndexes={[1, 2, 3, 0]} other={{ href: AUDIENCES.creators.path, label: "Money Machine for creators" }} />;
}
