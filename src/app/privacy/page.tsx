import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { Shield, Database, Share2, Cookie, Lock, UserCheck, History, RefreshCw, Home, ChevronRight, Link2 } from "lucide-react";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: "Privacy Policy | Betting Platform",
  description: "Learn how we collect, use, and protect your personal data on our betting platform.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-24">
        {/* Page Header */}
        <div className="mb-12 text-center">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground transition-colors"><Home className="size-3.5" /> Home</Link>
            <ChevronRight className="size-3.5 opacity-60" />
            <span className="text-foreground/80">Privacy Policy</span>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy matters to us. Learn how we protect and manage your data.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <Card className="sticky top-16 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Navigation</CardTitle>
                <CardDescription>Jump to section</CardDescription>
              </CardHeader>
              <CardContent>
                <nav className="space-y-1">
                  <a href="#collect" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Database className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>1. Data Collection</span>
                  </a>
                  <a href="#use" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Shield className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>2. How We Use Data</span>
                  </a>
                  <a href="#sharing" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Share2 className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>3. Data Sharing</span>
                  </a>
                  <a href="#cookies" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Cookie className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>4. Cookies & Sessions</span>
                  </a>
                  <a href="#security" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Lock className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>5. Data Security</span>
                  </a>
                  <a href="#rights" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <UserCheck className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>6. Your Rights</span>
                  </a>
                  <a href="#retention" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <History className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>7. Data Retention</span>
                  </a>
                  <a href="#updates" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <RefreshCw className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>8. Policy Updates</span>
                  </a>
                </nav>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-6 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Last updated:</strong> October 17, 2025
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/terms">Terms of Service</Link>
                </Button>
                <Button size="sm" variant="ghost" asChild className="w-full">
                  <Link href="/">Back to Home</Link>
                </Button>
              </CardFooter>
            </Card>
          </aside>

          <main className="lg:col-span-3">
            <div className="space-y-6">
              {/* Introduction */}
              <Card id="intro" className="border-l-2 border-l-primary/50 shadow-sm scroll-mt-28">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground leading-relaxed">
                    We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains
                    how we collect, use, disclose, and safeguard your information when you use our betting platform.
                    Please read this policy carefully to understand our practices regarding your personal data.
                  </p>
                </CardContent>
              </Card>

              {/* Section 1 */}
              <Card id="collect" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">1. Data We Collect</CardTitle>
                      <CardDescription>Types of information we process</CardDescription>
                    </div>
                    <a href="#collect" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Personal Information</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      When you create an account or use our services, we collect:
                    </p>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                      <li>Full name, email address, and date of birth</li>
                      <li>Username and encrypted password</li>
                      <li>Phone number for account verification</li>
                      <li>Identity verification documents (as required by regulations)</li>
                      <li>Payment information and transaction history</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Automatically Collected Data</h4>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                      <li>IP address, browser type, and device information</li>
                      <li>Session metadata and authentication tokens</li>
                      <li>Betting patterns and platform usage statistics</li>
                      <li>Geolocation data (to comply with jurisdictional restrictions)</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Voluntary Information</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Information you choose to provide, such as profile pictures, communication with support,
                      responsible gambling settings, and feedback or survey responses.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section 2 */}
              <Card id="use" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">2. How We Use Your Data</CardTitle>
                      <CardDescription>Purpose and lawful basis for processing</CardDescription>
                    </div>
                    <a href="#use" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We process your personal data for the following purposes:
                  </p>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Service Provision</h4>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                      <li>Create and manage your account</li>
                      <li>Process bets, deposits, and withdrawals</li>
                      <li>Provide customer support and respond to inquiries</li>
                      <li>Maintain platform security and prevent fraud</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Legal Compliance</h4>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                      <li>Verify your identity (KYC - Know Your Customer)</li>
                      <li>Comply with anti-money laundering (AML) regulations</li>
                      <li>Enforce responsible gambling policies</li>
                      <li>Respond to legal requests from authorities</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Platform Improvement</h4>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                      <li>Analyze usage patterns to improve features</li>
                      <li>Personalize your experience and recommendations</li>
                      <li>Conduct research and statistical analysis</li>
                      <li>Send important updates and promotional communications (with your consent)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3 */}
              <Card id="sharing" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">3. Data Sharing and Disclosure</CardTitle>
                      <CardDescription>When and with whom we share your information</CardDescription>
                    </div>
                    <a href="#sharing" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    We do not sell your personal data to third parties. However, we may share your information with:
                  </p>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Service Providers</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Trusted third-party vendors who help us operate our platform (payment processors, hosting providers,
                      identity verification services, customer support tools). These providers are bound by strict
                      confidentiality agreements.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Legal Obligations</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      When required by law, court order, or government regulation, or to protect our legal rights,
                      prevent fraud, or ensure platform security.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Business Transfers</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      In the event of a merger, acquisition, or sale of assets, your data may be transferred to the
                      new entity, subject to this Privacy Policy.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section 4 */}
              <Card id="cookies" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">4. Cookies & Session Management</CardTitle>
                      <CardDescription>How we use cookies and similar technologies</CardDescription>
                    </div>
                    <a href="#cookies" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Essential Cookies</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We use session cookies to maintain your authentication state and ensure secure access to your account.
                      These cookies are essential for the platform to function and cannot be disabled.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Session Storage</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Authentication is handled by NextAuth. We issue HTTP-only cookies that contain encrypted session claims,
                      and refresh access tokens automatically to keep your account secure without persisting sensitive payloads
                      in our database.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Analytics & Performance</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We may use analytics cookies to understand how users interact with our platform, helping us
                      improve performance and user experience. You can manage these preferences in your account settings.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section 5 */}
              <Card id="security" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">5. Data Security</CardTitle>
                      <CardDescription>How we protect your information</CardDescription>
                    </div>
                    <a href="#security" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    We implement industry-standard security measures to protect your personal data:
                  </p>
                  <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                    <li>End-to-end encryption for data transmission (TLS/SSL)</li>
                    <li>Encrypted storage of sensitive data at rest</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Multi-factor authentication options</li>
                    <li>Access controls and employee data handling policies</li>
                    <li>Continuous monitoring for suspicious activity</li>
                    <li>Regular backups and disaster recovery procedures</li>
                  </ul>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    However, no method of transmission over the Internet is 100% secure. We encourage you to use
                    strong passwords and enable two-factor authentication.
                  </p>
                </CardContent>
              </Card>

              {/* Section 6 */}
              <Card id="rights" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">6. Your Privacy Rights</CardTitle>
                      <CardDescription>Access, control, and manage your data</CardDescription>
                    </div>
                    <a href="#rights" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Depending on your location, you may have the following rights regarding your personal data:
                  </p>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Access & Portability</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Request a copy of your personal data in a structured, machine-readable format.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Correction</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Update or correct inaccurate or incomplete personal information through your account settings.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Deletion</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Request deletion of your personal data, subject to legal retention requirements and outstanding
                      obligations (e.g., unresolved disputes, regulatory compliance).
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Restriction & Objection</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Limit how we process your data or object to certain processing activities, such as marketing
                      communications.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Withdraw Consent</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Where processing is based on consent, you can withdraw it at any time without affecting the
                      lawfulness of processing based on consent before withdrawal.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4 p-3 bg-muted/50 rounded-lg">
                    <strong>To exercise your rights:</strong> Contact our support team or access the data management
                    section in your account settings. We will respond to your request within 30 days.
                  </p>
                </CardContent>
              </Card>

              {/* Section 7 */}
              <Card id="retention" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">7. Data Retention</CardTitle>
                      <CardDescription>How long we keep your information</CardDescription>
                    </div>
                    <a href="#retention" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We retain your personal data only for as long as necessary to fulfill the purposes outlined in this
                    Privacy Policy, unless a longer retention period is required or permitted by law.
                  </p>
                  <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                    <li><strong>Active accounts:</strong> Data retained while your account is active and for a reasonable
                    period afterward</li>
                    <li><strong>Transaction records:</strong> Retained for 7 years to comply with financial regulations</li>
                    <li><strong>Identity verification:</strong> Retained as required by KYC/AML regulations</li>
                    <li><strong>Session data:</strong> Automatically deleted after expiration (typically 24 hours of inactivity)</li>
                    <li><strong>Marketing data:</strong> Retained until you withdraw consent or unsubscribe</li>
                  </ul>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    After the retention period, we securely delete or anonymize your personal data.
                  </p>
                </CardContent>
              </Card>

              {/* Section 8 */}
              <Card id="updates" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">8. Policy Updates</CardTitle>
                      <CardDescription>Changes to this privacy policy</CardDescription>
                    </div>
                    <a href="#updates" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    We may update this Privacy Policy from time to time to reflect changes in our practices, technology,
                    legal requirements, or other factors. When we make material changes, we will:
                  </p>
                  <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                    <li>Update the "Last Updated" date at the top of this page</li>
                    <li>Notify you via email or prominent notice on the platform</li>
                    <li>In some cases, request your renewed consent</li>
                  </ul>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    We encourage you to review this Privacy Policy periodically to stay informed about how we protect
                    your information.
                  </p>
                </CardContent>
              </Card>

              {/* Contact Section */}
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3">Questions About Your Privacy?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have questions about this Privacy Policy, want to exercise your rights, or have concerns
                    about how we handle your data, please don't hesitate to contact us. We're committed to protecting
                    your privacy and addressing your concerns promptly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <Link href="/settings">Manage Your Data</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/terms">View Terms of Service</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
