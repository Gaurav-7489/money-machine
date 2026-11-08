import { Bell, Compass, Home, Link2, MessageCircle, PlusSquare, Search, Star, User, Wallet } from "lucide-react";

export const PRIMARY_NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Search },
  { href: "/create", label: "Create", icon: PlusSquare },
  { href: "/inbox", label: "Inbox", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export const TOOLS_NAV = [
  { href: "/affiliates", label: "Affiliates", icon: Link2 },
  { href: "/money", label: "Money", icon: Wallet },
  { href: "/badges", label: "Badges", icon: Star },
] as const;

export { Bell, Compass };

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
