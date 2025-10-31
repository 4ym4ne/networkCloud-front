import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Network Cloud</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upload packet captures, review automated analysis, and stay notified from a single secure workspace.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FooterSection
            title="Product"
            links={[
              { label: "PCAP upload", href: "/dashboard/pcap-upload" },
              { label: "Analysis history", href: "/dashboard/history" },
              { label: "Notifications", href: "/dashboard/notifications" },
            ]}
          />
          <FooterSection
            title="Company"
            links={[
              { label: "Contact support", href: "mailto:support@networkcloud.example" },
              { label: "Privacy policy", href: "/privacy" },
              { label: "Terms of service", href: "/terms" },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/70 px-5 py-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Need to send a large capture?</p>
          <p className="mt-1">
            Stream segmented uploads with the Network Cloud CLI. Full instructions are available after you sign in.
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Network Cloud. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="mailto:security@networkcloud.example">Security</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
      <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <FooterLink key={link.href} href={link.href}>
            {link.label}
          </FooterLink>
        ))}
      </div>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
    >
      {children}
    </Link>
  );
}
