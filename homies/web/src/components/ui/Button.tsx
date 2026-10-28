import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

const variants: Record<Variant, string> = {
  primary: "bg-crimson text-white shadow-crimson hover:bg-crimson-dark disabled:opacity-50",
  secondary: "border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.1] disabled:opacity-50",
  ghost: "text-zinc-300 hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
};

export function Button({ className, variant = "primary", type = "button", ...props }: Props) {
  return <button type={type} className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed", variants[variant], className)} {...props} />;
}
