import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started — Create your creator or brand account",
  description: "Choose a creator or business account on Money Machine and set up your profile in under a minute.",
  alternates: { canonical: "/onboarding" },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
