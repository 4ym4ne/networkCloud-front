import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Sidebar({ className }: { className?: string }) {
  const items = [
    { label: 'Overview', href: '/dashboard' },
    { label: 'Markets', href: '/markets' },
    { label: 'Bets', href: '/bets' },
    { label: 'Wallet', href: '/wallet' },
    { label: 'Settings', href: '/settings' },
  ];

  return (
    <aside className={cn('w-64 shrink-0 border-r bg-background p-4', className)}>
      <div className="mb-6 px-1">
        <Link href="/" className="text-lg font-bold text-primary">BetSmash</Link>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
            {it.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">Pro tip: Check live odds for in-play value bets.</div>
    </aside>
  );
}

