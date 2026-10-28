"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MessageCircle, UsersRound, UserRound, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/explore", label: "Explore", Icon: Compass },
  { href: "/chat", label: "Chat", Icon: MessageCircle },
  { href: "/circles", label: "Circles", Icon: UsersRound },
  { href: "/profile", label: "Profile", Icon: UserRound },
  { href: "/grok", label: "Grok", Icon: Sparkles }
];

export function MobileNav() {
  const pathname = usePathname();
  return <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-white/10 bg-charcoal/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur lg:hidden">
    {links.map(({ href, label, Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={cn("flex flex-col items-center gap-1 rounded-lg py-2 text-[10px]", pathname === href ? "text-rose-300" : "text-zinc-500")}><Icon size={19} aria-hidden="true" /><span>{label}</span></Link>)}
  </nav>;
}
