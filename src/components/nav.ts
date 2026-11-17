import { Archive, Bell, Bookmark, Compass, Home, Inbox, Link2, MessageCircle, PlusSquare, Search, Send, Star, Trash2, User, Users, Wallet } from "lucide-react";

/** Mobile bottom bar: the five things people do most. Always shown with text labels. */
export const PRIMARY_NAV = [
  { href: "/home", label: "Feed", icon: Home },
  { href: "/explore", label: "Search", icon: Search },
  { href: "/create", label: "Create", icon: PlusSquare },
  { href: "/inbox", label: "Messages", short: "DMs", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
] as const;

/** People & saved things. */
export const SOCIAL_NAV = [
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/notifications", label: "Notifications", icon: Bell },
] as const;

/** Message folders, shown under Messages in the sidebar and as tabs in the inbox. */
export const MESSAGE_FOLDERS = [
  { href: "/inbox", folder: "inbox", label: "Inbox", icon: Inbox },
  { href: "/inbox?folder=sent", folder: "sent", label: "Sent", icon: Send },
  { href: "/inbox?folder=starred", folder: "starred", label: "Starred", icon: Star },
  { href: "/inbox?folder=trash", folder: "trash", label: "Trash", icon: Trash2 },
] as const;

export const TOOLS_NAV = [
  { href: "/affiliates", label: "Affiliates", icon: Link2 },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/badges", label: "Badges", icon: Star },
] as const;

export { Archive, Bell, Compass };

export function isActive(pathname: string, href: string) {
  const path = href.split("?")[0]!;
  return pathname === path || pathname.startsWith(path + "/");
}
