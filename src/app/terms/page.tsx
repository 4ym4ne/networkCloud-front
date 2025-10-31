import Link from "next/link";
import { Metadata } from "next";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
    title: "Terms of Service | Network Cloud",
    description: "Review the service terms, acceptable use, and customer responsibilities for the Network Cloud network intelligence platform.",
};

const terms = [
    {
        title: "1. Agreement to Terms",
        description:
            "By accessing Network Cloud you agree to these Terms of Service and any customer order forms or data processing agreements executed with Network Cloud.",
    },
    {
        title: "2. Customer Responsibilities",
        bullets: [
            "Provide accurate account information and maintain the confidentiality of user credentials.",
            "Ensure uploaded packet captures and telemetry are collected in accordance with applicable laws and enterprise policies.",
            "Configure retention schedules appropriate for your regulatory environment.",
        ],
    },
    {
        title: "3. Acceptable Use",
        bullets: [
            "Do not attempt to disrupt or probe Network Cloud infrastructure outside approved APIs.",
            "Do not upload malicious code outside of authorized analysis workflows.",
            "Respect intellectual property rights and avoid storing unrelated personal data.",
        ],
    },
    {
        title: "4. Service Commitments",
        bullets: [
            "Network Cloud will provide access to packet analysis, notification streaming, and collaboration tooling as described in your subscription.",
            "We maintain industry-standard security controls, including encryption in transit and at rest, privileged access management, and formal incident response processes.",
            "Planned maintenance or significant changes will be communicated to workspace administrators in advance whenever possible.",
        ],
    },
    {
        title: "5. Data Protection",
        bullets: [
            "Network Cloud processes customer-supplied data solely to deliver contracted services.",
            "We sign data processing agreements and support regional compliance requirements (e.g., GDPR, CCPA).",
            "Customers may export or delete their data at any time by contacting support.",
        ],
    },
    {
        title: "6. Suspension & Termination",
        bullets: [
            "Network Cloud may suspend access if security threats, unpaid invoices, or policy violations are detected.",
            "Either party may terminate the agreement for material breach if the breach is not cured within 30 days of written notice.",
            "Upon termination, Network Cloud will purge retained data in line with the configured retention policy unless legally prohibited.",
        ],
    },
    {
        title: "7. Liability",
        description:
            "Liability caps and indemnification obligations are defined in the master services agreement. Network Cloud is not responsible for damages caused by misuse of the platform or unauthorized access resulting from customer negligence.",
    },
    {
        title: "8. Contact",
        description:
            "Questions about these terms can be sent to legal@networkcloud.example. We will provide written notice of updates at least 30 days before they take effect.",
    },
];

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <Header />
            <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 sm:py-24">
                <header className="space-y-3 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Terms</p>
                    <h1 className="text-4xl font-bold text-foreground sm:text-5xl">Network Cloud Terms of Service</h1>
                    <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
                        These terms govern your access to and use of Network Cloud&apos;s network intelligence platform.
                        If you represent an organization, you confirm that you have authority to bind it to these terms.
                    </p>
                </header>

                <section className="space-y-6">
                    {terms.map((term) => (
                        <Card key={term.title} className="border border-border/60">
                            <CardHeader>
                                <CardTitle className="text-xl">{term.title}</CardTitle>
                                {"description" in term && term.description ? (
                                    <CardDescription>{term.description}</CardDescription>
                                ) : null}
                            </CardHeader>
                            {"bullets" in term ? (
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {term.bullets?.map((item) => (
                                            <li key={item} className="flex items-start gap-2">
                                                <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            ) : null}
                        </Card>
                    ))}
                </section>

                <footer className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        For contractual questions please contact{" "}
                        <Link href="mailto:legal@networkcloud.example" className="text-primary hover:underline">
                            legal@networkcloud.example
                        </Link>.
                    </p>
                    <p>Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
                </footer>
            </main>
        </div>
    );
}
