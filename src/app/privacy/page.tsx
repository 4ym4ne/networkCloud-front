import Link from "next/link";
import { Metadata } from "next";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
    title: "Privacy Policy | Network Cloud",
    description: "Understand how Network Cloud collects, protects, and uses information within the network intelligence platform.",
};

const sections = [
    {
        id: "overview",
        title: "1. Overview",
        description: "Network Cloud processes network telemetry and customer account information to deliver packet analysis, threat detection, and collaboration workflows.",
        bullets: [
            "We operate as a data processor for customer-supplied packet captures and derived telemetry.",
            "Personally identifiable information (PII) is limited to account and access management records.",
            "We never sell customer data and only use it to provide contracted services.",
        ],
    },
    {
        id: "data-collection",
        title: "2. Data We Collect",
        description: "Data collection focuses on securing access and operating packet analysis pipelines.",
        bullets: [
            "Authentication details from your identity provider (name, email, roles, audit events).",
            "Packet capture metadata (file names, hash values, analyzer outputs) required to process uploads.",
            "Operational telemetry such as API usage, error logs, and notification delivery status.",
        ],
    },
    {
        id: "usage",
        title: "3. How We Use Data",
        description: "Data is used to operate, improve, and secure the Network Cloud platform.",
        bullets: [
            "Processing PCAP files, running analysis jobs, and providing investigation reports.",
            "Enforcing access controls, auditing session activity, and detecting abuse.",
            "Improving detection quality by aggregating anonymized performance metrics.",
        ],
    },
    {
        id: "retention",
        title: "4. Retention & Deletion",
        description: "Customers control how long analysis artifacts should persist.",
        bullets: [
            "Uploads and derived reports follow the retention policy configured per workspace.",
            "Authentication and audit logs are retained for the duration required to satisfy compliance obligations.",
            "Customers may request deletion of stored data at any time via the support channel.",
        ],
    },
    {
        id: "security",
        title: "5. Security",
        description: "Network Cloud applies layered security controls to protect customer data.",
        bullets: [
            "Role-based access enforced through your identity provider and in-app authorization policies.",
            "Encryption in transit (TLS 1.2+) and at rest using customer-dedicated storage vaults.",
            "Continuous monitoring, vulnerability management, and incident response runbooks for the platform.",
        ],
    },
    {
        id: "rights",
        title: "6. Your Choices",
        description: "We support privacy requests in line with regional regulations.",
        bullets: [
            "Access, correction, export, or deletion requests can be submitted to privacy@networkcloud.example.",
            "Data processing agreements are available for customers operating under GDPR, CCPA, or similar frameworks.",
            "We notify administrators within 72 hours of any incident involving their workspace data.",
        ],
    },
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <Header />
            <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16 sm:py-24">
                <div className="space-y-3 text-center">
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Privacy</p>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Network Cloud Privacy Policy</h1>
                    <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
                        This notice describes how Network Cloud handles personal information and packet telemetry submitted through the platform.
                        It applies to all SaaS deployments and managed environments operated by Network Cloud.
                    </p>
                </div>

                <nav className="grid gap-2 rounded-2xl border border-border/60 bg-card/60 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sections.map((section) => (
                        <Link
                            key={section.id}
                            href={`#${section.id}`}
                            className="group rounded-xl border border-transparent px-4 py-3 text-left text-sm transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                        >
                            <span className="block text-xs uppercase tracking-[0.25em] text-muted-foreground group-hover:text-primary">
                                Section {section.title.split(".")[0]}
                            </span>
                            <span className="mt-1 block text-base font-semibold text-foreground group-hover:text-primary">
                                {section.title.replace(/^\d+\.\s*/, "")}
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="space-y-8">
                    {sections.map((section) => (
                        <Card key={section.id} id={section.id} className="scroll-mt-28 border border-border/60">
                            <CardHeader>
                                <CardTitle className="text-xl">{section.title}</CardTitle>
                                <CardDescription>{section.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {section.bullets.map((item) => (
                                        <li key={item} className="flex items-start gap-2">
                                            <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Separator />

                <footer className="space-y-4 text-sm text-muted-foreground">
                    <p>
                        For questions about this policy or to submit a privacy request, email{" "}
                        <Link href="mailto:privacy@networkcloud.example" className="text-primary hover:underline">
                            privacy@networkcloud.example
                        </Link>.
                    </p>
                    <p>
                        Last updated: {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </footer>
            </div>
        </div>
    );
}
