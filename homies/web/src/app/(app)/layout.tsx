import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GrokOrb } from "@/components/GrokOrb";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen lg:flex">
    <Sidebar />
    <main className="min-w-0 flex-1 pb-24 lg:pb-8"><div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div></main>
    <MobileNav />
    <GrokOrb />
  </div>;
}
