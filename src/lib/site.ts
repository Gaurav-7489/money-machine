/** Central site facts used by metadata, JSON-LD, sitemap and llms.txt. Keep claims factual. */
export const SITE = {
  name: "Money Machine",
  tagline: "Collaborate. Create. Earn.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://money-machine-app.vercel.app").replace(/\/$/, ""),
  description:
    "Money Machine is a social platform where content creators and brands connect for collaborations, affiliate programs, UGC and paid promotions — with built-in income tracking and achievement badges.",
  shortDescription: "The social platform where creators and brands collaborate, run affiliate programs and track earnings.",
  locale: "en_IN",
  founder: "Jannat Shaikh",
  developer: "VandLabs Studio",
  waitlist: "https://waitlist.jannatshaikh.com/",
  keywords: [
    "creator brand collaboration platform",
    "influencer marketing India",
    "affiliate program for creators",
    "brand deals for influencers",
    "UGC creators",
    "creator income tracker",
    "find influencers for brand",
    "creator marketplace",
    "Money Machine app",
  ],
} as const;

export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is Money Machine?",
    a: "Money Machine is a social platform that connects content creators with brands. Creators share their work, discover brand deals and affiliate programs, and track their income. Businesses find creators, run affiliate programs and track what they spend on creator marketing.",
  },
  {
    q: "Who is Money Machine for?",
    a: "It is built for two kinds of accounts: creators (influencers, UGC creators, vloggers and other content makers) and businesses (brands and companies that want to work with creators).",
  },
  {
    q: "How do affiliate programs work on Money Machine?",
    a: "A business creates a program with a commission percentage and terms. Creators apply, the business approves them, and commissions are recorded only when the business confirms a sale. Money Machine never estimates or invents affiliate earnings.",
  },
  {
    q: "Can I track my creator income?",
    a: "Yes. Creators can log brand deals, affiliate payouts, UGC and campaign income and see monthly trends. Businesses can track their spending the same way. Records you enter are marked self-reported; platform-confirmed payments are marked verified.",
  },
  {
    q: "What are Money Machine badges?",
    a: "Badges are achievements awarded automatically from your activity — for example recording your first earnings, completing five brand collaborations, or launching your first affiliate program.",
  },
  {
    q: "Is there a Money Machine app?",
    a: "Money Machine is a Progressive Web App. On iPhone, open it in Safari and tap Share → Add to Home Screen. On Android or desktop Chrome, use the Install option. It then opens full screen like a native app.",
  },
  {
    q: "Is Money Machine free?",
    a: "The preview is free to try. Pricing for premium features has not been announced yet.",
  },
];

export const AUDIENCES = {
  creators: {
    path: "/for-creators",
    title: "For Creators — Get brand deals and affiliate income",
    h1: "Turn your content into income",
    lead: "Money Machine helps creators get discovered by brands, join affiliate programs and keep every rupee they earn in one clear place.",
    points: [
      ["Get discovered", "Show your niche, style and work in a profile brands can actually browse."],
      ["Join affiliate programs", "Apply to programs from brands that fit your audience and see each application's status."],
      ["Track your income", "Log brand deals, UGC and affiliate payouts. See your monthly growth at a glance."],
      ["Earn badges", "Hit milestones like Collab Pro and Affiliate Ace as you grow."],
    ],
  },
  brands: {
    path: "/for-brands",
    title: "For Brands — Find creators and run affiliate programs",
    h1: "Grow your brand with creators",
    lead: "Money Machine helps businesses find the right creators, launch affiliate programs with clear terms, and keep creator spending organised.",
    points: [
      ["Find creators", "Explore creators by niche and content style, then connect directly."],
      ["Launch affiliate programs", "Set commission and terms, review applications and approve the creators you want."],
      ["Track spending", "Record creator payments, commissions and campaign costs in one private ledger."],
      ["Build trust", "Earn badges like Program Launcher and Affiliate Builder as your program grows."],
    ],
  },
} as const;
