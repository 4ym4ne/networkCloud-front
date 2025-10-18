"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    CreditCard,
    Landmark,
    Smartphone,
    Globe,
    Mail,
    MapPin,
    Phone,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Github,
} from "lucide-react"
import Link from "next/link"

export default function Footer() {
    return (
        <footer className="w-full border-t bg-muted/40">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Column 1 — Brand & Description */}
                    <div className="space-y-4 lg:col-span-1">
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                BetPlatform
                            </h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Your trusted platform for sports betting and predictions.
                                Experience the thrill of winning with cutting-edge technology
                                and secure transactions.
                            </p>
                        </div>

                        {/* Social Links */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-foreground">Follow Us</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                                    <Facebook className="h-3 w-3 mr-1" />
                                    Facebook
                                </Badge>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                                    <Twitter className="h-3 w-3 mr-1" />
                                    Twitter
                                </Badge>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                                    <Instagram className="h-3 w-3 mr-1" />
                                    Instagram
                                </Badge>
                                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                                    <Linkedin className="h-3 w-3 mr-1" />
                                    LinkedIn
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Column 2 — Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            Quick Links
                        </h3>
                        <nav className="flex flex-col space-y-3">
                            <FooterLink href="/dashboard">Dashboard</FooterLink>
                            <FooterLink href="/markets">Markets</FooterLink>
                            <FooterLink href="/bets">My Bets</FooterLink>
                            <FooterLink href="/wallet">Wallet</FooterLink>
                            <FooterLink href="/settings">Settings</FooterLink>
                        </nav>
                    </div>

                    {/* Column 3 — Support & Legal */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            Support & Legal
                        </h3>
                        <nav className="flex flex-col space-y-3">
                            <FooterLink href="#">Help Center</FooterLink>
                            <FooterLink href="#">FAQ</FooterLink>
                            <FooterLink href="#">Responsible Gaming</FooterLink>
                            <FooterLink href="/privacy">Privacy Policy</FooterLink>
                            <FooterLink href="/terms">Terms of Service</FooterLink>
                        </nav>
                    </div>

                    {/* Column 4 — Newsletter */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                            Stay Updated
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Get the latest updates on odds, promotions, and exclusive offers.
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Enter your email"
                                    type="email"
                                    className="pl-10"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" size="sm">
                                Subscribe Now
                            </Button>
                        </form>
                        <p className="text-xs text-muted-foreground">
                            By subscribing, you agree to our Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Payment Methods Section */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">Secure Payments:</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                                <CreditCard className="h-3.5 w-3.5" />
                                Card
                            </Badge>
                            <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                                <Landmark className="h-3.5 w-3.5" />
                                Bank
                            </Badge>
                            <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                                <Smartphone className="h-3.5 w-3.5" />
                                Mobile
                            </Badge>
                            <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                                <Globe className="h-3.5 w-3.5" />
                                Crypto
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1.5">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                            </svg>
                            SSL Secured
                        </Badge>
                        <Badge variant="secondary" className="gap-1.5">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            Verified
                        </Badge>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p className="text-center md:text-left">
                        © {new Date().getFullYear()} BetPlatform. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">
                            Terms
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors">
                            Cookies
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors">
                            Accessibility
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

/* ----------------- Subcomponents ----------------- */

function FooterLink({
    href,
    children,
}: {
    href: string
    children: React.ReactNode
}) {
    return (
        <Link
            href={href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 inline-flex items-center group"
        >
            <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                {children}
            </span>
        </Link>
    )
}