import { Archive, Bell, Bookmark, Compass, Home, Inbox, Link2, MessageCircle, Rocket, Search, Send, Star, Trash2, TrendingUp, User, Users, Wallet } from "lucide-react";
import type { Role } from "@/lib/types";

type Item = { href: string; label: string; icon: typeof Home };

/** Mobile bottom bar: the four things people do most (posting lives on the Feed). Labels differ for creators and businesses. */
export function primaryNav(role: Role | undefined): Item[] {
  return [
    { href: "/home", label: "Feed", icon: Home },
    { href: "/explore", label: role === "business" ? "Creators" : "Brands", icon: Search },
    { href: "/inbox", label: "DMs", icon: MessageCircle },
    { href: "/profile", label: "Profile", icon: User },
  ];
}

/** Kept for older imports; creator labels. */
export const PRIMARY_NAV = primaryNav("creator");

/** People & saved things. */
export const SOCIAL_NAV: Item[] = [
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

/** Message boxes, shown under DMs in the sidebar. */
export const MESSAGE_FOLDERS = [
  { href: "/inbox", folder: "all", label: "All", icon: Inbox },
  { href: "/inbox?box=sent", folder: "sent", label: "Sent", icon: Send },
  { href: "/inbox?box=friends", folder: "friends", label: "Friends", icon: Users },
  { href: "/inbox?box=starred", folder: "starred", label: "Starred", icon: Star },
  { href: "/inbox?box=trash", folder: "trash", label: "Trash", icon: Trash2 },
] as const;

/** Tools differ by role: creators see real earnings, businesses see growth & scaling. */
export function toolsNav(role: Role | undefined): Item[] {
  return role === "business"
    ? [
        { href: "/money", label: "Grow & Scale", icon: Rocket },
        { href: "/affiliates", label: "Programs", icon: Link2 },
        { href: "/badges", label: "Badges", icon: Star },
      ]
    : [
        { href: "/money", label: "Earnings", icon: Wallet },
        { href: "/affiliates", label: "Affiliate deals", icon: Link2 },
        { href: "/badges", label: "Badges", icon: Star },
      ];
}

export const TOOLS_NAV = toolsNav("creator");

export { Archive, Bell, Compass, TrendingUp };

export function isActive(pathname: string, href: string) {
  const path = href.split("?")[0]!;
  return pathname === path || pathname.startsWith(path + "/");
}
