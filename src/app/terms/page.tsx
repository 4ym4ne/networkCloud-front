import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { Home, ChevronRight, Link2, CheckCircle2, User, Trophy, CreditCard, Copyright, ShieldAlert, Power, RefreshCw } from "lucide-react";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: "Terms of Service | Betting Platform",
  description: "Read our terms of service to understand your rights and responsibilities when using our betting platform.",
};

export default function TermsPage() {
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
            <span className="text-foreground/80">Terms of Service</span>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using our betting platform
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
                  <a href="#acceptance" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <CheckCircle2 className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>1. Acceptance</span>
                  </a>
                  <a href="#accounts" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <User className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>2. User Accounts</span>
                  </a>
                  <a href="#betting" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Trophy className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>3. Betting Rules</span>
                  </a>
                  <a href="#payments" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <CreditCard className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>4. Payments & Withdrawals</span>
                  </a>
                  <a href="#ip" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Copyright className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>5. Intellectual Property</span>
                  </a>
                  <a href="#liability" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <ShieldAlert className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>6. Liability</span>
                  </a>
                  <a href="#termination" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <Power className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>7. Termination</span>
                  </a>
                  <a href="#changes" className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
                    <RefreshCw className="size-3.5 text-muted-foreground group-hover:text-accent-foreground" />
                    <span>8. Changes to Terms</span>
                  </a>
                </nav>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-6 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Last updated:</strong> October 17, 2025
                </p>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/privacy">Privacy Policy</Link>
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
                    Welcome to our betting platform. These Terms of Service ("Terms") govern your access to and use of our services.
                    By accessing or using our platform, you agree to be bound by these Terms. If you do not agree to these Terms,
                    please do not use our services.
                  </p>
                </CardContent>
              </Card>

              {/* Section 1 */}
              <Card id="acceptance" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">1. Acceptance of Terms</CardTitle>
                      <CardDescription>By using our service, you agree to these terms</CardDescription>
                    </div>
                    <a href="#acceptance" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    By accessing or using our betting platform, you confirm that you:
                  </p>
                  <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                    <li>Are at least 18 years old or the legal gambling age in your jurisdiction</li>
                    <li>Have the legal capacity to enter into a binding agreement</li>
                    <li>Are not located in a jurisdiction where online betting is prohibited</li>
                    <li>Will not use the service for any unlawful or fraudulent activities</li>
                    <li>Accept full responsibility for all activities under your account</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Section 2 */}
              <Card id="accounts" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">2. User Accounts</CardTitle>
                      <CardDescription>Account creation and security responsibilities</CardDescription>
                    </div>
                    <a href="#accounts" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Account Registration</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You must provide accurate, current, and complete information during registration.
                      False or misleading information may result in immediate account termination.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Account Security</h4>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                      <li>Keep your login credentials confidential and secure</li>
                      <li>Notify us immediately of any unauthorized access or security breach</li>
                      <li>Do not share your account with others or allow others to use it</li>
                      <li>Use strong passwords and enable two-factor authentication when available</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Account Restrictions</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We reserve the right to suspend or terminate accounts that violate these terms,
                      engage in fraudulent activity, or exhibit suspicious betting patterns.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section 3 - Betting Rules */}
              <Card id="betting" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">3. Betting Rules</CardTitle>
                      <CardDescription>Guidelines for placing and managing bets</CardDescription>
                    </div>
                    <a href="#betting" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Placing Bets</h4>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                      <li>All bets are final once confirmed and cannot be cancelled</li>
                      <li>You are responsible for ensuring bet details are correct before confirmation</li>
                      <li>Minimum and maximum bet limits apply and may vary by market</li>
                      <li>We reserve the right to refuse or limit any bet at our discretion</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Bet Settlement</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Bets are settled based on official results. In case of disputes, our decision is final.
                      Settlement times may vary depending on the market and event type.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Responsible Gambling</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We encourage responsible gambling. You can set deposit limits, betting limits, and self-exclusion
                      periods in your account settings. Gambling should be for entertainment purposes only.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section 4 - Payments */}
              <Card id="payments" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">4. Payments & Withdrawals</CardTitle>
                      <CardDescription>Financial transactions and processing</CardDescription>
                    </div>
                    <a href="#payments" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Deposits</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Deposits are processed immediately or within a short timeframe. You are responsible for any
                      fees charged by your payment provider. All deposits must be from legitimate sources in your name.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Withdrawals</h4>
                    <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                      <li>Withdrawals require identity verification in accordance with KYC regulations</li>
                      <li>Processing times vary by payment method (typically 1-5 business days)</li>
                      <li>Minimum and maximum withdrawal limits apply</li>
                      <li>Withdrawals must be made to accounts in your name</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Fees</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We do not charge fees for standard deposits or withdrawals. However, payment providers
                      may impose their own fees. Excessive withdrawal requests may incur processing fees.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Section 5 */}
              <Card id="ip" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">5. Intellectual Property</CardTitle>
                      <CardDescription>Rights and licenses</CardDescription>
                    </div>
                    <a href="#ip" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    All content, features, and functionality on our platform, including but not limited to text, graphics,
                    logos, icons, images, audio clips, software, and data compilations, are the exclusive property of our
                    company or our licensors and are protected by international copyright, trademark, and other intellectual
                    property laws.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You may not copy, reproduce, distribute, modify, create derivative works from, publicly display, or
                    exploit any content from our platform without our express written permission.
                  </p>
                </CardContent>
              </Card>

              {/* Section 6 */}
              <Card id="liability" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">6. Limitation of Liability</CardTitle>
                      <CardDescription>Disclaimers and liability limitations</CardDescription>
                    </div>
                    <a href="#liability" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    To the fullest extent permitted by applicable law, we disclaim all warranties, express or implied,
                    including warranties of merchantability, fitness for a particular purpose, and non-infringement.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                    including but not limited to loss of profits, data, or other intangible losses arising from:
                  </p>
                  <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                    <li>Your use or inability to use our services</li>
                    <li>Technical failures, errors, or interruptions in service</li>
                    <li>Unauthorized access to or alteration of your data</li>
                    <li>Actions or content of third parties on the platform</li>
                    <li>Any betting losses or financial decisions made using our platform</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Section 7 */}
              <Card id="termination" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">7. Account Termination</CardTitle>
                      <CardDescription>Suspension and termination policies</CardDescription>
                    </div>
                    <a href="#termination" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We reserve the right to suspend or terminate your account and access to our services at any time,
                    with or without notice, for any reason, including but not limited to:
                  </p>
                  <ul className="ml-6 space-y-2 text-sm text-muted-foreground list-disc">
                    <li>Violation of these Terms of Service</li>
                    <li>Fraudulent, abusive, or suspicious activity</li>
                    <li>Failure to complete identity verification</li>
                    <li>Request from law enforcement or regulatory authorities</li>
                    <li>Extended period of account inactivity</li>
                  </ul>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Upon termination, your right to use the platform ceases immediately. Any remaining account balance
                    (subject to verification and compliance) will be returned to you via your registered payment method.
                  </p>
                </CardContent>
              </Card>

              {/* Section 8 */}
              <Card id="changes" className="hover:shadow-md transition-shadow scroll-mt-28">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">8. Changes to Terms</CardTitle>
                      <CardDescription>How we update these terms</CardDescription>
                    </div>
                    <a href="#changes" aria-label="Copy link to section" className="text-muted-foreground/70 hover:text-foreground transition-colors">
                      <Link2 className="size-4" />
                    </a>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    We reserve the right to modify or update these Terms at any time. When we make changes, we will
                    update the "Last Updated" date at the top of this page and, for significant changes, provide
                    additional notice (such as via email or a prominent notice on our platform).
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your continued use of our services after any changes constitutes acceptance of the updated Terms.
                    We encourage you to review these Terms periodically to stay informed about your rights and obligations.
                  </p>
                </CardContent>
              </Card>

              {/* Contact Section */}
              <Card className="bg-gradient-to-br from-primary/5 to-transparent border">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3">Questions or Concerns?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have any questions about these Terms of Service, please contact our support team.
                    We're here to help you understand your rights and responsibilities.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1">
                      <Link href="/login">Access Your Account</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/privacy">View Privacy Policy</Link>
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
