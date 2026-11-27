import type { Side } from "@/lib/plans";

/** Words and features for each side of the landing page. Every checklist line is something the app does today. */
export const CONTENT: Record<
  Side,
  { label: string; pitch: string; whatIs: string; steps: [string, string][]; checklist: string[]; video: string }
> = {
  creator: {
    label: "Content creator",
    pitch: "Land brand deals, earn from affiliate programs and keep every payment in one place.",
    whatIs: "You build a profile, get matched with brands in your niche, chat and send deal offers, join affiliate programs and track what you earn.",
    steps: [
      ["Set up your profile", "Your niches, your prices and your social handles, in a few taps."],
      ["Meet the right brands", "Browse brands by niche, city and budget, then say hi."],
      ["Make deals, get paid", "Agree on a deal in chat, join affiliate programs and log your income."],
    ],
    checklist: [
      "Your own creator profile with niches, prices and social links",
      "Browse and filter brands by niche, city and budget",
      "Direct messages with built-in deal offers (accept, counter or decline)",
      "Join brand affiliate programs and earn per sale",
      "Income tracker for brand deals, affiliate payouts and UGC",
      "Show your monthly views by connecting your social media",
      "Achievement badges as you grow",
      "A social feed to share your work, save posts and make friends",
    ],
    video: "/videos/creator.mp4",
  },
  business: {
    label: "Business owner",
    pitch: "Find creators who fit your brand, run affiliate programs and see what your campaigns return.",
    whatIs: "You build a brand profile, find creators by niche, city and budget, send deal offers, run affiliate programs and track what you spend and make back.",
    steps: [
      ["Set up your brand", "What you sell, the creators you want and how you like to work."],
      ["Find your creators", "Search creators by niche, city and price, then start a chat."],
      ["Run campaigns, see results", "Send deal offers, launch affiliate programs and track spend and profit."],
    ],
    checklist: [
      "A brand profile that shows what you do and who you're looking for",
      "Search and filter creators by niche, city and price",
      "Direct messages with built-in deal offers: budget and deliverables",
      "Launch affiliate programs with a price per sale and approve who joins",
      "Spending and profit tracker for every campaign",
      "Connect your payment gateway so sales are tracked",
      "Achievement badges as you grow",
      "A social feed to show off your brand and save creators you like",
    ],
    video: "/videos/business.mp4",
  },
};
