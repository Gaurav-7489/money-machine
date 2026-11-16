import { redirect } from "next/navigation";

/** /search is a friendly alias for the Search page (which lives at /explore). */
export default async function SearchAlias({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") qs.set(k, v);
  redirect(`/explore${qs.size ? `?${qs}` : ""}`);
}
